package ipc

import (
	"bufio"
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net"
	"os"
	"sync"
	"sync/atomic"

	"google.golang.org/protobuf/encoding/protojson"

	ipcv1 "github.com/darkliquid/tilbo/internal/ipc/gen/tilbo/ipc/v1"
)

// Handler handles an incoming request and returns a response.
// If an error is returned, it is mapped to an ErrorResponse.
type Handler func(ctx context.Context, req *ipcv1.Request) (*ipcv1.Response, error)

// Server is a Unix socket server for the tilbo IPC protocol.
// It accepts multiple concurrent client connections and dispatches incoming
// requests to the registered [Handler]. Server also supports broadcasting
// events to all connected clients for real-time UI updates.
type Server struct {
	path    string
	handler Handler
	closing atomic.Bool
	wg      sync.WaitGroup         // tracks serve loop + per-connection goroutines
	ln      net.Listener
	mu      sync.Mutex             // protects conns map
	conns   map[net.Conn]*connWriter // active client connections
}

// connWriter wraps a connection with a mutex to serialise writes. Each
// connection gets its own writer so that broadcasting events to one slow
// client doesn't block responses to other clients.
type connWriter struct {
	conn net.Conn
	mu   sync.Mutex
}

func (cw *connWriter) writeEnv(env *ipcv1.Envelope) error {
	cw.mu.Lock()
	defer cw.mu.Unlock()
	return WriteEnvelope(cw.conn, env)
}

// genericErrorCode maps to the "invalid" error code in the IPC protocol
// (ErrorResponse.code: 1=not_found, 2=permission, 3=invalid, 4=daemon_unavailable).
const genericErrorCode = 3

// NewServer creates a new IPC Server listening on path.
func NewServer(path string, handler Handler) *Server {
	return &Server{
		path:    path,
		handler: handler,
		conns:   make(map[net.Conn]*connWriter),
	}
}

// Start opens the listener and starts accepting connections in the background.
func (s *Server) Start(ctx context.Context) error {
	// Clean up stale socket if present
	if err := os.Remove(s.path); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("remove stale socket: %w", err)
	}

	ln, err := (&net.ListenConfig{}).Listen(ctx, "unix", s.path)
	if err != nil {
		return fmt.Errorf("listen %q: %w", s.path, err)
	}
	s.ln = ln

	// Match uisocket permission behavior
	if err := os.Chmod(s.path, 0o600); err != nil {
		_ = ln.Close()
		return fmt.Errorf("chmod %s: %w", s.path, err)
	}

	s.wg.Add(1)
	go s.serve(ctx)
	return nil
}

// Stop gracefully shuts down the server.
func (s *Server) Stop() {
	if s.closing.CompareAndSwap(false, true) {
		if s.ln != nil {
			if err := s.ln.Close(); err != nil {
				slog.Debug("ipc server close listener", "err", err)
			}
		}
		s.closeActiveConnections()
		s.wg.Wait()
		if err := os.Remove(s.path); err != nil && !os.IsNotExist(err) {
			slog.Debug("ipc server remove socket", "path", s.path, "err", err)
		}
	}
}

func (s *Server) closeActiveConnections() {
	s.mu.Lock()
	defer s.mu.Unlock()

	for conn := range s.conns {
		if err := conn.Close(); err != nil && !errors.Is(err, net.ErrClosed) {
			slog.Debug("ipc server close connection", "err", err)
		}
	}
}

func (s *Server) trackConn(conn net.Conn) *connWriter {
	s.mu.Lock()
	defer s.mu.Unlock()
	cw := &connWriter{conn: conn}
	s.conns[conn] = cw
	return cw
}

func (s *Server) untrackConn(conn net.Conn) {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.conns, conn)
}

// BroadcastEvent pushes an event to all connected clients.
func (s *Server) BroadcastEvent(event *ipcv1.Event) {
	s.mu.Lock()
	writers := make([]*connWriter, 0, len(s.conns))
	for _, cw := range s.conns {
		writers = append(writers, cw)
	}
	s.mu.Unlock()

	env := &ipcv1.Envelope{
		Payload: &ipcv1.Envelope_Event{
			Event: event,
		},
	}

	for _, cw := range writers {
		if err := cw.writeEnv(env); err != nil {
			slog.Debug("ipc server broadcast write frame error", "err", err)
		}
	}
}

// serve is the main accept loop. It runs in a background goroutine started
// by Start and exits when the listener is closed during Stop.
func (s *Server) serve(ctx context.Context) {
	defer s.wg.Done()
	for {
		conn, err := s.ln.Accept()
		if err != nil {
			if s.closing.Load() {
				return
			}
			slog.ErrorContext(ctx, "ipc server accept", "err", err)
			continue
		}

		cw := s.trackConn(conn)
		s.wg.Add(1)
		go s.handleConn(ctx, conn, cw)
	}
}

// handleConn reads newline-delimited JSON envelopes from a single client
// connection and dispatches each request to processEnvelope in its own goroutine,
// allowing concurrent request handling per connection.
func (s *Server) handleConn(ctx context.Context, conn net.Conn, cw *connWriter) {
	defer s.wg.Done()
	defer s.untrackConn(conn)
	defer conn.Close()

	scanner := bufio.NewScanner(conn)
	scanner.Buffer(make([]byte, maxFrameSize), maxFrameSize)

	for scanner.Scan() {
		if s.closing.Load() {
			return
		}

		line := scanner.Bytes()
		if len(line) == 0 {
			continue
		}

		env := &ipcv1.Envelope{}
		if err := (protojson.UnmarshalOptions{DiscardUnknown: true}).Unmarshal(line, env); err != nil {
			if s.closing.Load() {
				return
			}
			slog.DebugContext(ctx, "ipc server unmarshal error", "err", err)
			continue
		}

		go s.processEnvelope(ctx, cw, env)
	}
	if err := scanner.Err(); err != nil {
		slog.DebugContext(ctx, "ipc server scanner error", "err", err)
	}
}

// processEnvelope extracts the request from an envelope, invokes the handler,
// and writes the response back to the client. Handler errors are wrapped into
// ErrorResponse messages so the client always receives a valid response.
func (s *Server) processEnvelope(ctx context.Context, cw *connWriter, env *ipcv1.Envelope) {
	req := env.GetRequest()
	if req == nil {
		slog.WarnContext(ctx, "ipc server received non-request envelope", "req_id", env.GetRequestId())
		return
	}

	resp, err := s.handler(ctx, req)
	if err != nil {
		resp = &ipcv1.Response{
			Kind: &ipcv1.Response_Error{
				Error: &ipcv1.ErrorResponse{
					Code:    genericErrorCode,
					Message: err.Error(),
				},
			},
		}
	} else if resp == nil {
		resp = &ipcv1.Response{
			Kind: &ipcv1.Response_Error{
				Error: &ipcv1.ErrorResponse{
					Code:    genericErrorCode,
					Message: "internal error: nil response",
				},
			},
		}
	}

	outEnv := &ipcv1.Envelope{
		RequestId: env.GetRequestId(),
		Payload: &ipcv1.Envelope_Response{
			Response: resp,
		},
	}

	if err := cw.writeEnv(outEnv); err != nil {
		slog.DebugContext(ctx, "ipc server write frame", "err", err)
	}
}
