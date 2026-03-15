// Package uisocket implements a newline-delimited JSON socket server for the
// Quickshell frontend.  It exposes every BrowserMethods call as a named RPC
// and supports push-style event delivery to all connected clients.
//
// Wire protocol
// ─────────────
// Each frame is one UTF-8 JSON line (terminated by '\n').
//
// Client → server (call):
//
//	{"id":1,"method":"ListDirectory","args":["/home/alice",false]}
//
// Server → client (reply, success):
//
//	{"id":1,"result":<value>}
//
// Server → client (reply, error):
//
//	{"id":1,"error":"no such file"}
//
// Server → client (push event, no id):
//
//	{"event":"FileTagged","args":{"path":"/home/alice/foo.jpg","added":["work"],"removed":[]}}
//	{"event":"IndexUpdated","args":{"filesTotal":1234,"tagsTotal":56}}
//	{"event":"DaemonStateChanged","args":{"state":"ready"}}
package uisocket

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net"
	"os"
	"path/filepath"
	"sync"

	"github.com/darkliquid/tilbo/internal/browser"
)

// request is a client → server call frame.
type request struct {
	ID     int64             `json:"id"`
	Method string            `json:"method"`
	Args   []json.RawMessage `json:"args"`
}

// response is a server → client reply frame.
type response struct {
	ID     int64  `json:"id"`
	Result any    `json:"result,omitempty"`
	Error  string `json:"error,omitempty"`
}

// pushEvent is a server → client push frame (no id; client never acks).
type pushEvent struct {
	Event string `json:"event"`
	Args  any    `json:"args"`
}

// connWriter wraps a [net.Conn] with a per-connection write mutex so that
// concurrent dispatch goroutines and broadcast calls cannot interleave bytes.
type connWriter struct {
	conn net.Conn
	mu   sync.Mutex
}

// write serialises the data to the connection under the per-conn mutex.
func (cw *connWriter) write(data []byte) {
	cw.mu.Lock()
	defer cw.mu.Unlock()
	_, _ = cw.conn.Write(data)
}

// Server listens on a Unix socket, dispatches JSON calls to BrowserMethods,
// and broadcasts push events to all connected clients.
type Server struct {
	path     string
	methods  browser.Methods
	handlers map[string]func([]json.RawMessage) (any, error)

	mu      sync.Mutex
	clients map[net.Conn]*connWriter
}

// New returns a Server that will bind to socketPath and delegate calls to m.
func New(socketPath string, m browser.Methods) *Server {
	s := &Server{
		path:    socketPath,
		methods: m,
		clients: make(map[net.Conn]*connWriter),
	}
	s.handlers = map[string]func([]json.RawMessage) (any, error){
		"ListDirectory": s.callListDirectory,
		"StatFile":      s.callStatFile,
		"Search":        s.callSearch,
		"GlobSearch":    s.callGlobSearch,
		"GetMetadata":   s.callGetMetadata,
		"SetMetadata":   s.callSetMetadata,
		"ModifyTags":    s.callModifyTags,
		"HydrateTags":   s.callHydrateTags,
		"ListTags":      s.callListTags,
		"RenameFile":    s.callRenameFile,
		"DeleteFile":    s.callDeleteFile,
		"ChmodFile":     s.callChmodFile,
		"ListPlaces":    func(_ []json.RawMessage) (any, error) { return s.methods.ListPlaces() },
	}
	return s
}

// Listen binds the Unix socket and accepts connections until ctx is cancelled.
// The socket file is removed before binding so a stale socket from a previous
// run does not block startup.
func (s *Server) Listen(ctx context.Context) error {
	_ = os.Remove(s.path)
	if err := os.MkdirAll(filepath.Dir(s.path), 0o700); err != nil {
		return fmt.Errorf("uisocket: mkdir: %w", err)
	}
	lc := &net.ListenConfig{}
	ln, err := lc.Listen(ctx, "unix", s.path)
	if err != nil {
		return fmt.Errorf("uisocket: listen %s: %w", s.path, err)
	}
	// Restrict socket to the owner only so other users on the system cannot
	// connect and invoke file operations as this daemon user.
	if err := os.Chmod(s.path, 0o600); err != nil {
		_ = ln.Close()
		return fmt.Errorf("uisocket: chmod %s: %w", s.path, err)
	}
	defer ln.Close()

	go func() {
		<-ctx.Done()
		_ = ln.Close()
	}()

	slog.InfoContext(ctx, "uisocket: listening", "path", s.path)
	for {
		conn, err := ln.Accept()
		if err != nil {
			if ctx.Err() != nil {
				return nil
			}
			return fmt.Errorf("uisocket: accept: %w", err)
		}
		go s.handleConn(ctx, conn)
	}
}

// BroadcastFileTagged pushes a FileTagged event to all clients.
func (s *Server) BroadcastFileTagged(path string, added, removed []string) {
	s.broadcast("FileTagged", map[string]any{
		"path":    path,
		"added":   added,
		"removed": removed,
	})
}

// BroadcastIndexUpdated pushes an IndexUpdated event to all clients.
func (s *Server) BroadcastIndexUpdated(filesTotal, tagsTotal uint64) {
	s.broadcast("IndexUpdated", map[string]any{
		"filesTotal": filesTotal,
		"tagsTotal":  tagsTotal,
	})
}

// BroadcastDaemonStateChanged pushes a DaemonStateChanged event to all clients.
func (s *Server) BroadcastDaemonStateChanged(state string) {
	s.broadcast("DaemonStateChanged", map[string]any{
		"state": state,
	})
}

func (s *Server) broadcast(eventName string, args any) {
	data, err := json.Marshal(pushEvent{Event: eventName, Args: args})
	if err != nil {
		slog.Debug("uisocket: broadcast marshal error", "event", eventName, "err", err)
		return
	}
	data = append(data, '\n')

	// Snapshot clients under the lock, then release before writing so that a
	// slow or stuck client cannot block other goroutines from adding/removing
	// connections or from calling broadcast again.
	s.mu.Lock()
	writers := make([]*connWriter, 0, len(s.clients))
	for _, cw := range s.clients {
		writers = append(writers, cw)
	}
	s.mu.Unlock()

	for _, cw := range writers {
		cw.write(data)
	}
}

func (s *Server) handleConn(ctx context.Context, conn net.Conn) {
	cw := &connWriter{conn: conn}
	s.mu.Lock()
	s.clients[conn] = cw
	s.mu.Unlock()

	defer func() {
		s.mu.Lock()
		delete(s.clients, conn)
		s.mu.Unlock()
		_ = conn.Close()
	}()

	// Close conn when ctx is cancelled so the scanner loop exits.
	go func() {
		<-ctx.Done()
		_ = conn.Close()
	}()

	// Use a 4 MiB scan buffer to handle large directory listings / search
	// responses that exceed the default 64 KiB token limit.
	const maxTokenSize = 4 * 1024 * 1024
	scanner := bufio.NewScanner(conn)
	scanner.Buffer(make([]byte, maxTokenSize), maxTokenSize)
	for scanner.Scan() {
		line := scanner.Bytes()
		if len(line) == 0 {
			continue
		}
		var req request
		if err := json.Unmarshal(line, &req); err != nil {
			slog.DebugContext(ctx, "uisocket: bad request", "err", err)
			continue
		}
		// Dispatch in a goroutine so slow calls don't block the read loop.
		go s.dispatch(ctx, cw, req)
	}
	if err := scanner.Err(); err != nil {
		slog.DebugContext(ctx, "uisocket: scanner error", "err", err)
	}
}

func (s *Server) dispatch(ctx context.Context, cw *connWriter, req request) {
	result, callErr := s.call(ctx, req.Method, req.Args)

	var resp response
	resp.ID = req.ID
	if callErr != nil {
		resp.Error = callErr.Error()
	} else {
		resp.Result = result
	}

	data, err := json.Marshal(resp)
	if err != nil {
		slog.DebugContext(ctx, "uisocket: marshal response error", "method", req.Method, "err", err)
		return
	}
	data = append(data, '\n')
	cw.write(data)
}

// argIdx2 is the positional index of the third argument in an RPC args slice.
const argIdx2 = 2

// unmarshal is a helper that unmarshals args[idx] into v.
func unmarshal(args []json.RawMessage, idx int, v any) error {
	if idx >= len(args) {
		return fmt.Errorf("missing arg at index %d", idx)
	}
	return json.Unmarshal(args[idx], v)
}

// call dispatches method with args to the registered handler.
func (s *Server) call(_ context.Context, method string, args []json.RawMessage) (any, error) {
	h, ok := s.handlers[method]
	if !ok {
		return nil, fmt.Errorf("unknown method %q", method)
	}
	return h(args)
}

func (s *Server) callListDirectory(args []json.RawMessage) (any, error) {
	var path string
	var hidden bool
	if err := unmarshal(args, 0, &path); err != nil {
		return nil, err
	}
	if err := unmarshal(args, 1, &hidden); err != nil {
		return nil, err
	}
	return s.methods.ListDirectory(path, hidden)
}

func (s *Server) callStatFile(args []json.RawMessage) (any, error) {
	var path string
	if err := unmarshal(args, 0, &path); err != nil {
		return nil, err
	}
	return s.methods.StatFile(path)
}

func (s *Server) callSearch(args []json.RawMessage) (any, error) {
	var (
		tags        []string
		tagsAny     bool
		tagExclude  []string
		metaFilters map[string]string
		ftsQuery    string
		limit       uint32
		offset      uint32
		sortBy      []string
	)
	for i, dst := range []any{
		&tags, &tagsAny, &tagExclude, &metaFilters,
		&ftsQuery, &limit, &offset, &sortBy,
	} {
		if err := unmarshal(args, i, dst); err != nil {
			return nil, err
		}
	}
	files, total, err := s.methods.Search(tags, tagsAny, tagExclude, metaFilters, ftsQuery, limit, offset, sortBy)
	if err != nil {
		return nil, err
	}
	return map[string]any{"files": files, "total": total}, nil
}

func (s *Server) callGlobSearch(args []json.RawMessage) (any, error) {
	var patterns []string
	var limit uint32
	var allowHidden bool
	if err := unmarshal(args, 0, &patterns); err != nil {
		return nil, err
	}
	if err := unmarshal(args, 1, &limit); err != nil {
		return nil, err
	}
	if err := unmarshal(args, argIdx2, &allowHidden); err != nil {
		return nil, err
	}
	return s.methods.GlobSearch(patterns, limit, allowHidden)
}

func (s *Server) callGetMetadata(args []json.RawMessage) (any, error) {
	var path string
	if err := unmarshal(args, 0, &path); err != nil {
		return nil, err
	}
	vals, sources, err := s.methods.GetMetadata(path)
	if err != nil {
		return nil, err
	}
	return map[string]any{"metadata": vals, "sources": sources}, nil
}

func (s *Server) callSetMetadata(args []json.RawMessage) (any, error) {
	var path, key, value string
	if err := unmarshal(args, 0, &path); err != nil {
		return nil, err
	}
	if err := unmarshal(args, 1, &key); err != nil {
		return nil, err
	}
	if err := unmarshal(args, argIdx2, &value); err != nil {
		return nil, err
	}
	return nil, s.methods.SetMetadata(path, key, value)
}

func (s *Server) callModifyTags(args []json.RawMessage) (any, error) {
	var paths, tags []string
	var operation string
	if err := unmarshal(args, 0, &paths); err != nil {
		return nil, err
	}
	if err := unmarshal(args, 1, &tags); err != nil {
		return nil, err
	}
	if err := unmarshal(args, argIdx2, &operation); err != nil {
		return nil, err
	}
	return s.methods.ModifyTags(paths, tags, operation)
}

func (s *Server) callHydrateTags(args []json.RawMessage) (any, error) {
	var paths []string
	if err := unmarshal(args, 0, &paths); err != nil {
		return nil, err
	}
	return s.methods.HydrateTags(paths)
}

func (s *Server) callListTags(args []json.RawMessage) (any, error) {
	var prefix string
	if err := unmarshal(args, 0, &prefix); err != nil {
		return nil, err
	}
	return s.methods.ListTags(prefix)
}

func (s *Server) callRenameFile(args []json.RawMessage) (any, error) {
	var path, newName string
	if err := unmarshal(args, 0, &path); err != nil {
		return nil, err
	}
	if err := unmarshal(args, 1, &newName); err != nil {
		return nil, err
	}
	return s.methods.RenameFile(path, newName)
}

func (s *Server) callDeleteFile(args []json.RawMessage) (any, error) {
	var path string
	if err := unmarshal(args, 0, &path); err != nil {
		return nil, err
	}
	return nil, s.methods.DeleteFile(path)
}

func (s *Server) callChmodFile(args []json.RawMessage) (any, error) {
	var path string
	var mode uint32
	if err := unmarshal(args, 0, &path); err != nil {
		return nil, err
	}
	if err := unmarshal(args, 1, &mode); err != nil {
		return nil, err
	}
	return nil, s.methods.ChmodFile(path, mode)
}
