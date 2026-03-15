package ipc

import (
	"bufio"
	"bytes"
	"context"
	"fmt"
	"strings"
	"sync"
	"testing"
	"time"

	"google.golang.org/protobuf/encoding/protojson"

	ipcv1 "github.com/darkliquid/tilbo/internal/ipc/gen/tilbo/ipc/v1"
)

// --- Framing edge cases ---

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
