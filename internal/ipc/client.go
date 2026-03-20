package ipc

import (
	"bufio"
	"context"
	"errors"
	"fmt"
	"net"
	"sync"
	"sync/atomic"
	"time"

	"google.golang.org/protobuf/encoding/protojson"

	ipcv1 "github.com/darkliquid/tilbo/internal/ipc/gen/tilbo/ipc/v1"
)

const dialTimeout = 5 * time.Second

// Client is a thread-safe client for the tilbo IPC protocol.
// It maintains a single persistent connection to the daemon's Unix socket and
// multiplexes concurrent requests using monotonically increasing request IDs.
type Client struct {
	path    string
	conn    net.Conn
	mu      sync.Mutex   // protects reqs map and nextID
	writeMu sync.Mutex   // serialises writes to conn (separate from mu to avoid blocking reads)

	nextID uint64 // monotonically increasing request ID counter

	reqs   map[uint64]chan *ipcv1.Response // pending requests keyed by request ID
	closed atomic.Bool
	wg     sync.WaitGroup // tracks readLoop goroutine for graceful shutdown
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

// readLoop runs in a background goroutine, reading newline-delimited JSON
// envelopes from the connection and dispatching responses to waiting Call()
// callers via their registered channel. On connection close, drainReqs
// unblocks all outstanding callers.
func (c *Client) readLoop() {
	defer c.wg.Done()
	defer c.conn.Close()
	defer c.drainReqs()

	scanner := bufio.NewScanner(c.conn)
	scanner.Buffer(make([]byte, maxFrameSize), maxFrameSize)

	for scanner.Scan() {
		if c.closed.Load() {
			return
		}

		line := scanner.Bytes()
		if len(line) == 0 {
			continue
		}

		env := &ipcv1.Envelope{}
		// DiscardUnknown allows forward-compatible evolution of the proto schema:
		// newer daemons can add fields without breaking older clients.
		if err := (protojson.UnmarshalOptions{DiscardUnknown: true}).Unmarshal(line, env); err != nil {
			if c.closed.Load() {
				return
			}
			continue
		}

		resp := env.GetResponse()
		if resp == nil {
			continue // ignore non-responses (e.g. server-push events)
		}

		// Match response to pending request by ID and deliver via buffered channel.
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

// drainReqs closes all outstanding request channels so Call() callers unblock
// when the connection drops unexpectedly.
func (c *Client) drainReqs() {
	c.mu.Lock()
	defer c.mu.Unlock()
	for id, ch := range c.reqs {
		close(ch)
		delete(c.reqs, id)
	}
}

// Call sends a request and waits for the matching response. It is safe for
// concurrent use — multiple goroutines may call Call simultaneously. Each
// request gets a unique ID and a dedicated response channel.
func (c *Client) Call(ctx context.Context, req *ipcv1.Request) (*ipcv1.Response, error) {
	if c.closed.Load() {
		return nil, errors.New("ipc client closed")
	}
	if err := ctx.Err(); err != nil {
		return nil, err
	}

	// Allocate a unique request ID and register a response channel.
	c.mu.Lock()
	id := c.nextID
	c.nextID++
	ch := make(chan *ipcv1.Response, 1)
	c.reqs[id] = ch
	c.mu.Unlock()

	// Double-check context between registration and write to avoid sending
	// a request that will never be read.
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
	case resp, ok := <-ch:
		if !ok {
			return nil, errors.New("ipc: connection closed")
		}
		if errResp := resp.GetError(); errResp != nil {
			return nil, fmt.Errorf("remote error: %s (code %d)", errResp.GetMessage(), errResp.GetCode())
		}
		return resp, nil
	}
}
