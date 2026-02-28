package ipc

import (
	"context"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net"
	"os"
	"sync"
	"sync/atomic"

	ipcv1 "github.com/darkliquid/tilbo/internal/ipc/gen/tilbo/ipc/v1"
)

// Handler handles an incoming request and returns a response.
// If an error is returned, it is mapped to an ErrorResponse.
type Handler func(ctx context.Context, req *ipcv1.Request) (*ipcv1.Response, error)

// Server is a Unix socket server for the tilbo IPC protocol.
type Server struct {
	path    string
	handler Handler
	closing atomic.Bool
	wg      sync.WaitGroup
	ln      net.Listener
}

// NewServer creates a new IPC Server listening on path.
func NewServer(path string, handler Handler) *Server {
	return &Server{
		path:    path,
		handler: handler,
	}
}

// Start opens the listener and starts accepting connections in the background.
func (s *Server) Start(ctx context.Context) error {
	// Clean up stale socket if present
	if err := os.Remove(s.path); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("remove stale socket: %w", err)
	}

	ln, err := net.Listen("unix", s.path)
	if err != nil {
		return fmt.Errorf("listen %q: %w", s.path, err)
	}
	s.ln = ln

	s.wg.Add(1)
	go s.serve(ctx)
	return nil
}

// Stop gracefully shuts down the server.
func (s *Server) Stop() {
	if s.closing.CompareAndSwap(false, true) {
		if s.ln != nil {
			s.ln.Close()
		}
		s.wg.Wait()
		os.Remove(s.path)
	}
}

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

		s.wg.Add(1)
		go s.handleConn(ctx, conn)
	}
}

func (s *Server) handleConn(ctx context.Context, conn net.Conn) {
	defer s.wg.Done()
	defer conn.Close()

	for {
		if s.closing.Load() {
			return
		}

		env, err := ReadEnvelope(conn)
		if err != nil {
			if errors.Is(err, io.EOF) || errors.Is(err, io.ErrUnexpectedEOF) {
				return
			}
			if s.closing.Load() {
				return
			}
			slog.DebugContext(ctx, "ipc server read frame", "err", err)
			return
		}

		s.processEnvelope(ctx, conn, env)
	}
}

func (s *Server) processEnvelope(ctx context.Context, conn net.Conn, env *ipcv1.Envelope) {
	req := env.GetRequest()
	if req == nil {
		slog.WarnContext(ctx, "ipc server received non-request envelope", "req_id", env.RequestId)
		return
	}

	resp, err := s.handler(ctx, req)
	if err != nil {
		resp = &ipcv1.Response{
			Kind: &ipcv1.Response_Error{
				Error: &ipcv1.ErrorResponse{
					Code:    3, // generic invalid/internal error code
					Message: err.Error(),
				},
			},
		}
	} else if resp == nil {
		resp = &ipcv1.Response{
			Kind: &ipcv1.Response_Error{
				Error: &ipcv1.ErrorResponse{
					Code:    3,
					Message: "internal error: nil response",
				},
			},
		}
	}

	outEnv := &ipcv1.Envelope{
		RequestId: env.RequestId,
		Payload: &ipcv1.Envelope_Response{
			Response: resp,
		},
	}

	if err := WriteEnvelope(conn, outEnv); err != nil {
		slog.DebugContext(ctx, "ipc server write frame", "err", err)
	}
}
