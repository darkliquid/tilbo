package ipc

import (
	"bytes"
	"context"
	"testing"
	"time"

	ipcv1 "github.com/darkliquid/tilbo/internal/ipc/gen/tilbo/ipc/v1"
)

func TestFramingRoundTrip(t *testing.T) {
	var buf bytes.Buffer
	env := &ipcv1.Envelope{
		RequestId: 42,
		Payload: &ipcv1.Envelope_Request{
			Request: &ipcv1.Request{
				Kind: &ipcv1.Request_Status{
					Status: &ipcv1.StatusRequest{},
				},
			},
		},
	}

	if err := WriteEnvelope(&buf, env); err != nil {
		t.Fatalf("WriteEnvelope: %v", err)
	}

	got, err := ReadEnvelope(&buf)
	if err != nil {
		t.Fatalf("ReadEnvelope: %v", err)
	}

	if got.RequestId != 42 {
		t.Errorf("got req id %d, want 42", got.RequestId)
	}
}

func TestServerClientRoundTrip(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	sockPath := t.TempDir() + "/test.sock"

	handler := func(ctx context.Context, req *ipcv1.Request) (*ipcv1.Response, error) {
		return &ipcv1.Response{
			Kind: &ipcv1.Response_Status{
				Status: &ipcv1.StatusResponse{
					UptimeSeconds: 123,
				},
			},
		}, nil
	}

	srv := NewServer(sockPath, handler)
	if err := srv.Start(ctx); err != nil {
		t.Fatalf("srv.Start: %v", err)
	}
	defer srv.Stop()

	// Wait for socket to be created
	time.Sleep(100 * time.Millisecond)

	cli, err := NewClient(ctx, sockPath)
	if err != nil {
		t.Fatalf("NewClient: %v", err)
	}
	defer cli.Close()

	req := &ipcv1.Request{
		Kind: &ipcv1.Request_Status{
			Status: &ipcv1.StatusRequest{},
		},
	}
	resp, err := cli.Call(ctx, req)
	if err != nil {
		t.Fatalf("Call: %v", err)
	}

	status := resp.GetStatus()
	if status == nil {
		t.Fatalf("expected status response, got %T", resp.Kind)
	}
	if status.UptimeSeconds != 123 {
		t.Errorf("got uptime %d, want 123", status.UptimeSeconds)
	}
}
