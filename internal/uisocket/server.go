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
	ID     int64       `json:"id"`
	Result interface{} `json:"result,omitempty"`
	Error  string      `json:"error,omitempty"`
}

// pushEvent is a server → client push frame (no id; client never acks).
type pushEvent struct {
	Event string      `json:"event"`
	Args  interface{} `json:"args"`
}

// Server listens on a Unix socket, dispatches JSON calls to BrowserMethods,
// and broadcasts push events to all connected clients.
type Server struct {
	path    string
	methods browser.Methods

	mu      sync.Mutex
	clients map[net.Conn]struct{}
}

// New returns a Server that will bind to socketPath and delegate calls to m.
func New(socketPath string, m browser.Methods) *Server {
	return &Server{
		path:    socketPath,
		methods: m,
		clients: make(map[net.Conn]struct{}),
	}
}

// Listen binds the Unix socket and accepts connections until ctx is cancelled.
// The socket file is removed before binding so a stale socket from a previous
// run does not block startup.
func (s *Server) Listen(ctx context.Context) error {
	_ = os.Remove(s.path)
	if err := os.MkdirAll(filepath.Dir(s.path), 0o700); err != nil {
		return fmt.Errorf("uisocket: mkdir: %w", err)
	}
	ln, err := net.Listen("unix", s.path)
	if err != nil {
		return fmt.Errorf("uisocket: listen %s: %w", s.path, err)
	}
	defer ln.Close()

	go func() {
		<-ctx.Done()
		ln.Close()
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
	s.broadcast("FileTagged", map[string]interface{}{
		"path":    path,
		"added":   added,
		"removed": removed,
	})
}

// BroadcastIndexUpdated pushes an IndexUpdated event to all clients.
func (s *Server) BroadcastIndexUpdated(filesTotal, tagsTotal uint64) {
	s.broadcast("IndexUpdated", map[string]interface{}{
		"filesTotal": filesTotal,
		"tagsTotal":  tagsTotal,
	})
}

// BroadcastDaemonStateChanged pushes a DaemonStateChanged event to all clients.
func (s *Server) BroadcastDaemonStateChanged(state string) {
	s.broadcast("DaemonStateChanged", map[string]interface{}{
		"state": state,
	})
}

func (s *Server) broadcast(eventName string, args interface{}) {
	data, err := json.Marshal(pushEvent{Event: eventName, Args: args})
	if err != nil {
		slog.Debug("uisocket: broadcast marshal error", "event", eventName, "err", err)
		return
	}
	data = append(data, '\n')

	s.mu.Lock()
	defer s.mu.Unlock()
	for conn := range s.clients {
		_, _ = conn.Write(data)
	}
}

func (s *Server) handleConn(ctx context.Context, conn net.Conn) {
	s.mu.Lock()
	s.clients[conn] = struct{}{}
	s.mu.Unlock()

	defer func() {
		s.mu.Lock()
		delete(s.clients, conn)
		s.mu.Unlock()
		conn.Close()
	}()

	// Close conn when ctx is cancelled so the scanner loop exits.
	go func() {
		<-ctx.Done()
		conn.Close()
	}()

	scanner := bufio.NewScanner(conn)
	for scanner.Scan() {
		line := scanner.Bytes()
		if len(line) == 0 {
			continue
		}
		var req request
		if err := json.Unmarshal(line, &req); err != nil {
			slog.Debug("uisocket: bad request", "err", err)
			continue
		}
		// Dispatch in a goroutine so slow calls don't block the read loop.
		go s.dispatch(ctx, conn, req)
	}
}

func (s *Server) dispatch(ctx context.Context, conn net.Conn, req request) {
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
		slog.Debug("uisocket: marshal response error", "method", req.Method, "err", err)
		return
	}
	data = append(data, '\n')
	_, _ = conn.Write(data)
}

// unmarshal is a helper that unmarshals args[idx] into v.
func unmarshal(args []json.RawMessage, idx int, v interface{}) error {
	if idx >= len(args) {
		return fmt.Errorf("missing arg at index %d", idx)
	}
	return json.Unmarshal(args[idx], v)
}

// call dispatches req.Method with req.Args to BrowserMethods.
//
//nolint:cyclop,gocyclo // flat switch for RPC dispatch is intentional
func (s *Server) call(ctx context.Context, method string, args []json.RawMessage) (interface{}, error) {
	_ = ctx // reserved for future cancellation propagation

	switch method {
	case "ListDirectory":
		var path string
		var hidden bool
		if err := unmarshal(args, 0, &path); err != nil {
			return nil, err
		}
		if err := unmarshal(args, 1, &hidden); err != nil {
			return nil, err
		}
		return s.methods.ListDirectory(path, hidden)

	case "StatFile":
		var path string
		if err := unmarshal(args, 0, &path); err != nil {
			return nil, err
		}
		return s.methods.StatFile(path)

	case "Search":
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
		for i, dst := range []interface{}{
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
		return map[string]interface{}{"files": files, "total": total}, nil

	case "GlobSearch":
		var patterns []string
		var limit uint32
		var allowHidden bool
		if err := unmarshal(args, 0, &patterns); err != nil {
			return nil, err
		}
		if err := unmarshal(args, 1, &limit); err != nil {
			return nil, err
		}
		if err := unmarshal(args, 2, &allowHidden); err != nil {
			return nil, err
		}
		return s.methods.GlobSearch(patterns, limit, allowHidden)

	case "GetMetadata":
		var path string
		if err := unmarshal(args, 0, &path); err != nil {
			return nil, err
		}
		vals, sources, err := s.methods.GetMetadata(path)
		if err != nil {
			return nil, err
		}
		return map[string]interface{}{"metadata": vals, "sources": sources}, nil

	case "SetMetadata":
		var path, key, value string
		if err := unmarshal(args, 0, &path); err != nil {
			return nil, err
		}
		if err := unmarshal(args, 1, &key); err != nil {
			return nil, err
		}
		if err := unmarshal(args, 2, &value); err != nil {
			return nil, err
		}
		return nil, s.methods.SetMetadata(path, key, value)

	case "ModifyTags":
		var paths, tags []string
		var operation string
		if err := unmarshal(args, 0, &paths); err != nil {
			return nil, err
		}
		if err := unmarshal(args, 1, &tags); err != nil {
			return nil, err
		}
		if err := unmarshal(args, 2, &operation); err != nil {
			return nil, err
		}
		return s.methods.ModifyTags(paths, tags, operation)

	case "HydrateTags":
		var paths []string
		if err := unmarshal(args, 0, &paths); err != nil {
			return nil, err
		}
		return s.methods.HydrateTags(paths)

	case "ListTags":
		var prefix string
		if err := unmarshal(args, 0, &prefix); err != nil {
			return nil, err
		}
		return s.methods.ListTags(prefix)

	case "RenameFile":
		var path, newName string
		if err := unmarshal(args, 0, &path); err != nil {
			return nil, err
		}
		if err := unmarshal(args, 1, &newName); err != nil {
			return nil, err
		}
		return s.methods.RenameFile(path, newName)

	case "DeleteFile":
		var path string
		if err := unmarshal(args, 0, &path); err != nil {
			return nil, err
		}
		return nil, s.methods.DeleteFile(path)

	case "ChmodFile":
		var path string
		var mode uint32
		if err := unmarshal(args, 0, &path); err != nil {
			return nil, err
		}
		if err := unmarshal(args, 1, &mode); err != nil {
			return nil, err
		}
		return nil, s.methods.ChmodFile(path, mode)

	case "ListPlaces":
		return s.methods.ListPlaces()

	default:
		return nil, fmt.Errorf("unknown method %q", method)
	}
}
