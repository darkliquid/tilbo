package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"os"
	"os/exec"
	"syscall"
	"time"

	"github.com/darkliquid/tilbo/internal/ipc"
	ipcv1 "github.com/darkliquid/tilbo/internal/ipc/gen/tilbo/ipc/v1"
)

// DaemonClient handles asynchronous communication via the custom Unix socket IPC protocol.
type DaemonClient struct {
	client *ipc.Client
}

var (
	newIPCClient       = ipc.NewClient
	spawnDaemonProcess = spawnDaemon
	nowFn              = time.Now
	sleepFn            = time.Sleep
)

const (
	daemonConnectTimeout = 2 * time.Second
	daemonRetryBackoff   = 150 * time.Millisecond
	asyncCallTimeout     = 5 * time.Second
)

func ConnectDaemon(ctx context.Context) (*DaemonClient, error) {
	userID := os.Getuid()
	sockPath := fmt.Sprintf("/run/user/%d/tilbo.sock", userID)

	c, err := newIPCClient(ctx, sockPath)
	if err == nil {
		return &DaemonClient{client: c}, nil
	}

	slog.InfoContext(ctx, "Failed to connect to daemon, attempting background spawn", "sockPath", sockPath, "err", err)

	if spawnErr := spawnDaemonProcess(); spawnErr != nil {
		return nil, fmt.Errorf("connect to daemon socket %s: %w (spawn daemon: %w)", sockPath, err, spawnErr)
	}

	deadline := nowFn().Add(daemonConnectTimeout)
	for nowFn().Before(deadline) {
		c, err = newIPCClient(ctx, sockPath)
		if err == nil {
			slog.InfoContext(ctx, "Connected to daemon after spawn", "sockPath", sockPath)
			return &DaemonClient{client: c}, nil
		}
		sleepFn(daemonRetryBackoff)
	}

	return nil, fmt.Errorf("connect to daemon socket %s after spawn: %w", sockPath, err)
}

func spawnDaemon() error {
	cmd := exec.CommandContext(context.Background(), "tilbo-daemon")
	cmd.SysProcAttr = &syscall.SysProcAttr{Setsid: true}

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("spawn daemon: %w", err)
	}

	// Release process handle so the browser does not keep child process resources.
	_ = cmd.Process.Release()
	return nil
}

func (c *DaemonClient) Close() error {
	return c.client.Close()
}

// Call performs a raw IPC request, allowing adapter-style integration layers.
func (c *DaemonClient) Call(ctx context.Context, req *ipcv1.Request) (*ipcv1.Response, error) {
	if c == nil || c.client == nil {
		return nil, errors.New("daemon client is not connected")
	}

	return c.client.Call(ctx, req)
}

// Status fetches daemon status, including capability warnings.
func (c *DaemonClient) Status(ctx context.Context) (*ipcv1.StatusResponse, error) {
	resp, err := c.client.Call(ctx, &ipcv1.Request{
		Kind: &ipcv1.Request_Status{Status: &ipcv1.StatusRequest{}},
	})
	if err != nil {
		return nil, err
	}
	if errKind, ok := resp.GetKind().(*ipcv1.Response_Error); ok {
		return nil, fmt.Errorf("daemon: %s (code %d)", errKind.Error.GetMessage(), errKind.Error.GetCode())
	}
	status, ok := resp.GetKind().(*ipcv1.Response_Status)
	if !ok || status.Status == nil {
		return nil, errors.New("unexpected response type")
	}
	return status.Status, nil
}

// SearchAsync issues an IPC search request and pushes the response back to the main thread channel.
// b.mainThreadCh is passed so the callback executes on the Qt main thread.
func (c *DaemonClient) SearchAsync(
	ctx context.Context,
	req *ipcv1.SearchRequest,
	mainThreadCh chan<- func(),
	callback func(*ipcv1.SearchResponse, error),
) {
	asyncCall(c,
		ctx,
		&ipcv1.Request{Kind: &ipcv1.Request_Search{Search: req}},
		mainThreadCh,
		func(resp *ipcv1.Response) (*ipcv1.SearchResponse, error) {
			if s, ok := resp.GetKind().(*ipcv1.Response_Search); ok {
				return s.Search, nil
			}
			return nil, errors.New("unexpected response type")
		},
		func(searchResp *ipcv1.SearchResponse, callErr error) {
			slog.Debug("Async search completed", "resp", searchResp, "err", callErr)
			callback(searchResp, callErr)
		},
	)
}

// RelatedAsync issues an IPC related request and pushes the response back to the main thread channel.
func (c *DaemonClient) RelatedAsync(
	ctx context.Context,
	req *ipcv1.RelatedRequest,
	mainThreadCh chan<- func(),
	callback func(*ipcv1.RelatedResponse, error),
) {
	asyncCall(c,
		ctx,
		&ipcv1.Request{Kind: &ipcv1.Request_Related{Related: req}},
		mainThreadCh,
		func(resp *ipcv1.Response) (*ipcv1.RelatedResponse, error) {
			if r, ok := resp.GetKind().(*ipcv1.Response_Related); ok {
				return r.Related, nil
			}
			return nil, errors.New("unexpected response type")
		},
		callback,
	)
}

// ListTagsAsync issues an IPC list_tags request to fetch autocomplete suggestions.
func (c *DaemonClient) ListTagsAsync(
	ctx context.Context,
	req *ipcv1.ListTagsRequest,
	mainThreadCh chan<- func(),
	callback func(*ipcv1.ListTagsResponse, error),
) {
	asyncCall(c,
		ctx,
		&ipcv1.Request{Kind: &ipcv1.Request_ListTags{ListTags: req}},
		mainThreadCh,
		func(resp *ipcv1.Response) (*ipcv1.ListTagsResponse, error) {
			if r, ok := resp.GetKind().(*ipcv1.Response_ListTags); ok {
				return r.ListTags, nil
			}
			return nil, errors.New("unexpected response type")
		},
		callback,
	)
}

//nolint:revive // context-as-argument: Qt callback pattern justifies deviation
func asyncCall[T any](
	c *DaemonClient,
	ctx context.Context,
	req *ipcv1.Request,
	mainThreadCh chan<- func(),
	decode func(*ipcv1.Response) (*T, error),
	callback func(*T, error),
) {
	callCtx := ctx
	var cancel context.CancelFunc
	if callCtx == nil {
		callCtx = context.Background()
	}
	if _, hasDeadline := callCtx.Deadline(); !hasDeadline {
		callCtx, cancel = context.WithTimeout(callCtx, asyncCallTimeout)
	}

	go func(callCtx context.Context) {
		if cancel != nil {
			defer cancel()
		}
		resp, err := c.client.Call(callCtx, req)

		var out *T
		var callErr error

		if err != nil {
			callErr = err
		} else if errKind, ok := resp.GetKind().(*ipcv1.Response_Error); ok {
			callErr = fmt.Errorf("daemon: %s (code %d)", errKind.Error.GetMessage(), errKind.Error.GetCode())
		} else {
			out, callErr = decode(resp)
		}

		select {
		case <-callCtx.Done():
			return
		case mainThreadCh <- func() {
			callback(out, callErr)
		}:
		}
	}(callCtx)
}
