package main

import (
	"context"
	"fmt"
	"log/slog"
	"os"

	"github.com/darkliquid/tilbo/internal/ipc"
	ipcv1 "github.com/darkliquid/tilbo/internal/ipc/gen/tilbo/ipc/v1"
)

// DaemonClient handles asynchronous communication via the custom Unix socket IPC protocol.
type DaemonClient struct {
	client *ipc.Client
}

func ConnectDaemon() (*DaemonClient, error) {
	userId := os.Getuid()
	sockPath := fmt.Sprintf("/run/user/%d/tilbo.sock", userId)

	c, err := ipc.NewClient(context.Background(), sockPath)
	if err != nil {
		return nil, fmt.Errorf("connect to daemon socket %s: %w", sockPath, err)
	}

	return &DaemonClient{
		client: c,
	}, nil
}

func (c *DaemonClient) Close() error {
	return c.client.Close()
}

// SearchAsync issues an IPC search request and pushes the response back to the main thread channel.
// b.mainThreadCh is passed so the callback executes on the Qt main thread.
func (c *DaemonClient) SearchAsync(ctx context.Context, req *ipcv1.SearchRequest, mainThreadCh chan<- func(), callback func(*ipcv1.SearchResponse, error)) {
	go func() {
		resp, err := c.client.Call(ctx, &ipcv1.Request{
			Kind: &ipcv1.Request_Search{
				Search: req,
			},
		})

		var searchResp *ipcv1.SearchResponse
		var callErr error

		if err != nil {
			callErr = err
		} else if errKind, ok := resp.Kind.(*ipcv1.Response_Error); ok {
			callErr = fmt.Errorf("daemon: %s (code %d)", errKind.Error.GetMessage(), errKind.Error.GetCode())
		} else if s, ok := resp.Kind.(*ipcv1.Response_Search); ok {
			searchResp = s.Search
		} else {
			callErr = fmt.Errorf("unexpected response type")
		}

		slog.Debug("Async search completed", "resp", searchResp, "err", callErr)
		mainThreadCh <- func() {
			callback(searchResp, callErr)
		}
	}()
}

// RelatedAsync issues an IPC related request and pushes the response back to the main thread channel.
func (c *DaemonClient) RelatedAsync(ctx context.Context, req *ipcv1.RelatedRequest, mainThreadCh chan<- func(), callback func(*ipcv1.RelatedResponse, error)) {
	go func() {
		resp, err := c.client.Call(ctx, &ipcv1.Request{
			Kind: &ipcv1.Request_Related{
				Related: req,
			},
		})

		var relatedResp *ipcv1.RelatedResponse
		var callErr error

		if err != nil {
			callErr = err
		} else if errKind, ok := resp.Kind.(*ipcv1.Response_Error); ok {
			callErr = fmt.Errorf("daemon: %s (code %d)", errKind.Error.GetMessage(), errKind.Error.GetCode())
		} else if r, ok := resp.Kind.(*ipcv1.Response_Related); ok {
			relatedResp = r.Related
		} else {
			callErr = fmt.Errorf("unexpected response type")
		}

		mainThreadCh <- func() {
			callback(relatedResp, callErr)
		}
	}()
}
