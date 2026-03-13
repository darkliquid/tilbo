package ipc

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net"
	"sync"
	"sync/atomic"
	"time"

	ipcv1 "github.com/darkliquid/tilbo/internal/ipc/gen/tilbo/ipc/v1"
)

const dialTimeout = 5 * time.Second

// Client is a thread-safe client for the tilbo IPC protocol.
type Client struct {
	path    string
	conn    net.Conn
	mu      sync.Mutex
	writeMu sync.Mutex

	nextID uint64

	reqs   map[uint64]chan *ipcv1.Response
	closed atomic.Bool
	wg     sync.WaitGroup
}

// NewClient creates a new connected IPC Client.
func NewClient(ctx context.Context, path string) (*Client, error) {
	dialer := &net.Dialer{Timeout: dialTimeout}
	conn, err := dialer.DialContext(ctx, "unix", path)
	if err != nil {
		return nil, fmt.Errorf("dial ipc socket: %w", err)
	}

	c := &Client{
		path:   path,
		conn:   conn,
		reqs:   make(map[uint64]chan *ipcv1.Response),
		nextID: 1,
	}

	c.wg.Add(1)
	go c.readLoop()

	return c, nil
}

// Close gracefully closes the client connection.
func (c *Client) Close() error {
	if c.closed.CompareAndSwap(false, true) {
		err := c.conn.Close()
		c.wg.Wait()
		return err
	}
	return nil
}

func (c *Client) readLoop() {
	defer c.wg.Done()
	defer c.conn.Close()

	for {
		if c.closed.Load() {
			return
		}

		env, err := ReadEnvelope(c.conn)
		if err != nil {
			if errors.Is(err, io.EOF) || errors.Is(err, io.ErrUnexpectedEOF) || c.closed.Load() {
				return
			}
			continue
		}

		resp := env.GetResponse()
		if resp == nil {
			continue // ignore non-responses
		}

		c.mu.Lock()
		ch, ok := c.reqs[env.GetRequestId()]
		if ok {
			delete(c.reqs, env.GetRequestId())
		}
		c.mu.Unlock()

		if ok {
			ch <- resp
			close(ch)
		}
	}
}

// Call sends a request and waits for the response.
func (c *Client) Call(ctx context.Context, req *ipcv1.Request) (*ipcv1.Response, error) {
	if c.closed.Load() {
		return nil, errors.New("ipc client closed")
	}
	if err := ctx.Err(); err != nil {
		return nil, err
	}

	c.mu.Lock()
	id := c.nextID
	c.nextID++
	ch := make(chan *ipcv1.Response, 1)
	c.reqs[id] = ch
	c.mu.Unlock()

	if err := ctx.Err(); err != nil {
		c.mu.Lock()
		delete(c.reqs, id)
		c.mu.Unlock()
		return nil, err
	}

	env := &ipcv1.Envelope{
		RequestId: id,
		Payload: &ipcv1.Envelope_Request{
			Request: req,
		},
	}

	// Write the envelope
	c.writeMu.Lock()
	err := WriteEnvelope(c.conn, env)
	c.writeMu.Unlock()
	if err != nil {
		c.mu.Lock()

		delete(c.reqs, id)
		c.mu.Unlock()
		return nil, fmt.Errorf("write request: %w", err)
	}

	select {
	case <-ctx.Done():
		c.mu.Lock()
		delete(c.reqs, id)
		c.mu.Unlock()
		return nil, ctx.Err()
	case resp := <-ch:
		if errResp := resp.GetError(); errResp != nil {
			return nil, fmt.Errorf("remote error: %s (code %d)", errResp.GetMessage(), errResp.GetCode())
		}
		return resp, nil
	}
}
