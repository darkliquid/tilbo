package ipc

import (
	"bufio"
	"bytes"
	"context"
	"errors"
	"fmt"
	"net"
	"strings"
	"sync"
	"testing"
	"time"

	"google.golang.org/protobuf/encoding/protojson"

	ipcv1 "github.com/darkliquid/tilbo/internal/ipc/gen/tilbo/ipc/v1"
)

// --- Framing edge cases ---

func TestFraming_OversizedFrame(t *testing.T) {
	// Build a SearchRequest whose FtsQuery field pushes the marshaled JSON
	// over the maxFrameSize limit.
	bigQuery := strings.Repeat("x", maxFrameSize+1)
	env := &ipcv1.Envelope{
		RequestId: 1,
		Payload: &ipcv1.Envelope_Request{
			Request: &ipcv1.Request{
				Kind: &ipcv1.Request_Search{
					Search: &ipcv1.SearchRequest{FtsQuery: bigQuery},
				},
			},
		},
	}
	var buf bytes.Buffer
	err := WriteEnvelope(&buf, env)
	if !errors.Is(err, ErrFrameTooLarge) {
		t.Fatalf("expected ErrFrameTooLarge, got %v", err)
	}
}

func TestFraming_EmptyPayload(t *testing.T) {
	env := &ipcv1.Envelope{RequestId: 1}
	var buf bytes.Buffer
	if err := WriteEnvelope(&buf, env); err != nil {
		t.Fatalf("WriteEnvelope: %v", err)
	}

	scanner := bufio.NewScanner(&buf)
	if !scanner.Scan() {
		t.Fatal("expected one line")
	}

	got := &ipcv1.Envelope{}
	if err := protojson.Unmarshal(scanner.Bytes(), got); err != nil {
		t.Fatalf("Unmarshal: %v", err)
	}
	if got.GetRequestId() != 1 {
		t.Errorf("RequestId: got %d, want 1", got.GetRequestId())
	}
}

func TestFraming_CorruptProtobuf(t *testing.T) {
	// Write invalid JSON data
	garbage := []byte("not valid json data at all!!!\n")
	var buf bytes.Buffer
	buf.Write(garbage)

	scanner := bufio.NewScanner(&buf)
	if !scanner.Scan() {
		t.Fatal("expected one line")
	}

	got := &ipcv1.Envelope{}
	err := protojson.Unmarshal(scanner.Bytes(), got)
	if err == nil {
		t.Fatal("expected error for corrupt json")
	}
}

func TestFraming_MultipleEnvelopes(t *testing.T) {
	var buf bytes.Buffer
	for i := uint64(1); i <= 5; i++ {
		env := &ipcv1.Envelope{RequestId: i}
		if err := WriteEnvelope(&buf, env); err != nil {
			t.Fatalf("WriteEnvelope %d: %v", i, err)
		}
	}

	scanner := bufio.NewScanner(&buf)
	for i := uint64(1); i <= 5; i++ {
		if !scanner.Scan() {
			t.Fatalf("expected envelope %d", i)
		}
		got := &ipcv1.Envelope{}
		if err := protojson.Unmarshal(scanner.Bytes(), got); err != nil {
			t.Fatalf("Unmarshal %d: %v", i, err)
		}
		if got.GetRequestId() != i {
			t.Errorf("envelope %d: got id %d", i, got.GetRequestId())
		}
	}
}

// --- Server tests ---

func startTestServer(
	t *testing.T,
	handler func(context.Context, *ipcv1.Request) (*ipcv1.Response, error),
) string {
	t.Helper()
	sockPath := t.TempDir() + "/test.sock"
	ctx := context.Background()
	srv := NewServer(sockPath, handler)
	if err := srv.Start(ctx); err != nil {
		t.Fatalf("srv.Start: %v", err)
	}
	t.Cleanup(srv.Stop)
	time.Sleep(20 * time.Millisecond) // allow socket to be created
	return sockPath
}

func TestServer_ErrorResponse(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	sockPath := startTestServer(t, func(_ context.Context, _ *ipcv1.Request) (*ipcv1.Response, error) {
		return &ipcv1.Response{
			Kind: &ipcv1.Response_Error{
				Error: &ipcv1.ErrorResponse{Code: 3, Message: "invalid request"},
			},
		}, nil
	})

	cli, err := NewClient(ctx, sockPath)
	if err != nil {
		t.Fatalf("NewClient: %v", err)
	}
	defer cli.Close()

	// The client translates ErrorResponse into a Go error.
	_, err = cli.Call(ctx, &ipcv1.Request{Kind: &ipcv1.Request_Status{Status: &ipcv1.StatusRequest{}}})
	if err == nil {
		t.Fatal("expected error from Call when server returns ErrorResponse, got nil")
	}
	if !strings.Contains(err.Error(), "invalid request") {
		t.Errorf("expected 'invalid request' in error message, got: %v", err)
	}
}

func TestServer_ConcurrentClients(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var mu sync.Mutex
	callCount := 0

	sockPath := startTestServer(t, func(_ context.Context, _ *ipcv1.Request) (*ipcv1.Response, error) {
		mu.Lock()
		callCount++
		mu.Unlock()
		return &ipcv1.Response{Kind: &ipcv1.Response_Status{Status: &ipcv1.StatusResponse{UptimeSeconds: 1}}}, nil
	})

	const numClients = 10
	var wg sync.WaitGroup
	errs := make([]error, numClients)

	for i := range numClients {
		wg.Add(1)
		go func(idx int) {
			defer wg.Done()
			cli, err := NewClient(ctx, sockPath)
			if err != nil {
				errs[idx] = fmt.Errorf("NewClient: %w", err)
				return
			}
			defer cli.Close()
			_, err = cli.Call(ctx, &ipcv1.Request{Kind: &ipcv1.Request_Status{Status: &ipcv1.StatusRequest{}}})
			if err != nil {
				errs[idx] = fmt.Errorf("Call: %w", err)
			}
		}(i)
	}
	wg.Wait()

	for i, err := range errs {
		if err != nil {
			t.Errorf("client %d: %v", i, err)
		}
	}
	mu.Lock()
	if callCount != numClients {
		t.Errorf("expected %d calls, got %d", numClients, callCount)
	}
	mu.Unlock()
}

func TestServer_ContextCancelBeforeCall(t *testing.T) {
	sockPath := startTestServer(t, func(_ context.Context, _ *ipcv1.Request) (*ipcv1.Response, error) {
		return &ipcv1.Response{Kind: &ipcv1.Response_Status{Status: &ipcv1.StatusResponse{}}}, nil
	})

	ctx, cancel := context.WithCancel(context.Background())
	cli, err := NewClient(ctx, sockPath)
	if err != nil {
		t.Fatalf("NewClient: %v", err)
	}
	defer cli.Close()

	cancel() // cancel before the call

	_, err = cli.Call(ctx, &ipcv1.Request{Kind: &ipcv1.Request_Status{Status: &ipcv1.StatusRequest{}}})
	if err == nil {
		t.Error("expected error when context is already canceled")
	}
}

// dialUnixWithRetry repeatedly attempts to dial the Unix socket until it
// succeeds or the context is done.
func dialUnixWithRetry(ctx context.Context, sockPath string) (net.Conn, error) {
	var lastErr error

	for {
		select {
		case <-ctx.Done():
			if lastErr == nil {
				lastErr = ctx.Err()
			}
			return nil, fmt.Errorf("dialUnixWithRetry: %w", lastErr)
		default:
		}

		conn, err := dialUnix(sockPath)
		if err == nil {
			return conn, nil
		}

		lastErr = err
		time.Sleep(10 * time.Millisecond)
	}
}

func TestBroadcastEvent_Delivery(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	sockPath := t.TempDir() + "/broadcast.sock"
	srv := NewServer(sockPath, func(_ context.Context, _ *ipcv1.Request) (*ipcv1.Response, error) {
		return &ipcv1.Response{Kind: &ipcv1.Response_Status{Status: &ipcv1.StatusResponse{}}}, nil
	})
	if err := srv.Start(ctx); err != nil {
		t.Fatalf("srv.Start: %v", err)
	}
	defer srv.Stop()

	// Connect a raw net.Conn so we can read frames directly.
	rawConn, err := dialUnixWithRetry(ctx, sockPath)
	if err != nil {
		t.Fatalf("dial: %v", err)
	}
	defer rawConn.Close()

	// Wait until the server has tracked the connection before broadcasting,
	// otherwise the event is sent to an empty set of connections.
	ticker := time.NewTicker(5 * time.Millisecond)
	defer ticker.Stop()
	for {
		srv.mu.Lock()
		tracked := len(srv.conns)
		srv.mu.Unlock()
		if tracked > 0 {
			break
		}
		select {
		case <-ctx.Done():
			t.Fatal("timed out waiting for server to track connection")
		case <-ticker.C:
		}
	}

	// Broadcast an event.
	srv.BroadcastEvent(&ipcv1.Event{
		Kind: &ipcv1.Event_IndexUpdated{IndexUpdated: &ipcv1.IndexUpdatedEvent{}},
	})

	// Read the event frame.
	scanner := bufio.NewScanner(rawConn)
	scanner.Buffer(make([]byte, maxFrameSize), maxFrameSize)

	done := make(chan struct{})
	var gotErr error
	var gotEnv *ipcv1.Envelope
	go func() {
		defer close(done)
		if !scanner.Scan() {
			if err := scanner.Err(); err != nil {
				gotErr = err
			} else {
				gotErr = errors.New("scanner stopped before reading broadcast event frame")
			}
			return
		}
		env := &ipcv1.Envelope{}
		if err := (protojson.UnmarshalOptions{DiscardUnknown: true}).Unmarshal(scanner.Bytes(), env); err != nil {
			gotErr = err
			return
		}
		gotEnv = env
	}()

	select {
	case <-done:
	case <-ctx.Done():
		t.Fatal("timed out waiting for broadcast event")
	}

	if gotErr != nil {
		t.Fatalf("unmarshal broadcast event: %v", gotErr)
	}
	if gotEnv == nil {
		t.Fatal("expected broadcast event envelope, got nil")
	}
	if gotEnv.GetEvent() == nil {
		t.Fatalf("expected event payload, got %T", gotEnv.GetPayload())
	}
}

func TestBroadcastEvent_NoInterleave(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Server that blocks inside the handler, letting us race a broadcast against a response write.
	started := make(chan struct{})
	proceed := make(chan struct{})

	sockPath := t.TempDir() + "/nointerleave.sock"
	srv := NewServer(sockPath, func(_ context.Context, _ *ipcv1.Request) (*ipcv1.Response, error) {
		close(started)
		<-proceed
		return &ipcv1.Response{Kind: &ipcv1.Response_Status{Status: &ipcv1.StatusResponse{UptimeSeconds: 7}}}, nil
	})
	if err := srv.Start(ctx); err != nil {
		t.Fatalf("srv.Start: %v", err)
	}
	defer srv.Stop()
	time.Sleep(20 * time.Millisecond)

	cli, err := NewClient(ctx, sockPath)
	if err != nil {
		t.Fatalf("NewClient: %v", err)
	}
	defer cli.Close()

	// Start a call (server will block until proceed is closed).
	callDone := make(chan error, 1)
	go func() {
		_, err := cli.Call(ctx, &ipcv1.Request{Kind: &ipcv1.Request_Status{Status: &ipcv1.StatusRequest{}}})
		callDone <- err
	}()

	// Wait for handler to start processing.
	select {
	case <-started:
	case <-ctx.Done():
		t.Fatal("timed out waiting for handler to start")
	}

	// Broadcast while the handler is blocked (so it races with the response write).
	srv.BroadcastEvent(&ipcv1.Event{Kind: &ipcv1.Event_IndexUpdated{IndexUpdated: &ipcv1.IndexUpdatedEvent{}}})

	// Unblock the handler.
	close(proceed)

	// Call should succeed without error.
	select {
	case err := <-callDone:
		if err != nil {
			t.Errorf("Call after concurrent broadcast: %v", err)
		}
	case <-ctx.Done():
		t.Fatal("timed out waiting for Call to complete")
	}
}

func TestClient_ConnectionDrop(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Use a blocking handler so the call is always pending when we drop the conn.
	block := make(chan struct{})
	started := make(chan struct{})
	sockPath := startTestServer(t, func(_ context.Context, _ *ipcv1.Request) (*ipcv1.Response, error) {
		// Signal that the server has received the request and is about to block.
		close(started)
		<-block
		return &ipcv1.Response{Kind: &ipcv1.Response_Status{Status: &ipcv1.StatusResponse{}}}, nil
	})

	cli, err := NewClient(ctx, sockPath)
	if err != nil {
		t.Fatalf("NewClient: %v", err)
	}

	// Register a pending call.
	callDone := make(chan error, 1)
	go func() {
		_, callErr := cli.Call(ctx, &ipcv1.Request{Kind: &ipcv1.Request_Status{Status: &ipcv1.StatusRequest{}}})
		callDone <- callErr
	}()

	// Wait deterministically until the server has received the request and is blocking.
	select {
	case <-started:
		// proceed
	case <-ctx.Done():
		t.Fatalf("timed out waiting for call to start: %v", ctx.Err())
	}

	// Forcibly close the underlying connection to simulate a drop.
	cli.conn.Close()

	select {
	case err := <-callDone:
		if err == nil {
			t.Error("expected error when connection drops, got nil")
		}
	case <-ctx.Done():
		t.Fatal("timed out: Call did not unblock after connection drop")
	}
}

// dialUnix is a test helper that opens a raw [net.Conn] to a Unix socket.
func dialUnix(path string) (net.Conn, error) {
	return net.Dial("unix", path)
}

func TestServer_AllRequestTypes(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Echo back a search response regardless of request type, just to verify routing.
	sockPath := startTestServer(t, func(_ context.Context, req *ipcv1.Request) (*ipcv1.Response, error) {
		switch req.GetKind().(type) {
		case *ipcv1.Request_Search:
			return &ipcv1.Response{Kind: &ipcv1.Response_Search{Search: &ipcv1.SearchResponse{Total: 42}}}, nil
		case *ipcv1.Request_ListTags:
			return &ipcv1.Response{Kind: &ipcv1.Response_ListTags{
				ListTags: &ipcv1.ListTagsResponse{Tags: []string{"alpha", "beta"}},
			}}, nil
		case *ipcv1.Request_HydrateTags:
			return &ipcv1.Response{Kind: &ipcv1.Response_HydrateTags{
				HydrateTags: &ipcv1.HydrateTagsResponse{Entries: []*ipcv1.HydratedPathTags{{
					Path: "/tmp/a",
					Tags: []string{"one"},
				}}},
			}}, nil
		default:
			return &ipcv1.Response{Kind: &ipcv1.Response_Error{
				Error: &ipcv1.ErrorResponse{Code: 3, Message: "unhandled"},
			}}, nil
		}
	})

	cli, err := NewClient(ctx, sockPath)
	if err != nil {
		t.Fatalf("NewClient: %v", err)
	}
	defer cli.Close()

	// Search request.
	resp, err := cli.Call(ctx, &ipcv1.Request{Kind: &ipcv1.Request_Search{Search: &ipcv1.SearchRequest{}}})
	if err != nil {
		t.Fatalf("Search call: %v", err)
	}
	if resp.GetSearch().GetTotal() != 42 {
		t.Errorf("search total: got %d, want 42", resp.GetSearch().GetTotal())
	}

	// ListTags request.
	resp2, err := cli.Call(ctx, &ipcv1.Request{Kind: &ipcv1.Request_ListTags{
		ListTags: &ipcv1.ListTagsRequest{Prefix: "a"},
	}})
	if err != nil {
		t.Fatalf("ListTags call: %v", err)
	}
	tags := resp2.GetListTags().GetTags()
	if len(tags) != 2 || tags[0] != "alpha" {
		t.Errorf("list tags: got %v", tags)
	}
}
