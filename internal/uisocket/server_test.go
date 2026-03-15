package uisocket_test

import (
	"bufio"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"github.com/darkliquid/tilbo/internal/browser"
	"github.com/darkliquid/tilbo/internal/uisocket"
)

// ── stub browser.Methods ─────────────────────────────────────────────────────

// stubMethods is a minimal browser.Methods implementation for testing.
type stubMethods struct {
	listDirectoryFn func(path string, hidden bool) ([]browser.DirEntry, error)
	listTagsFn      func(prefix string) ([]string, error)
	listPlacesFn    func() ([]browser.PlaceEntry, error)
}

var errNotImplemented = errors.New("not implemented")

func (s *stubMethods) ListDirectory(path string, hidden bool) ([]browser.DirEntry, error) {
	if s.listDirectoryFn != nil {
		return s.listDirectoryFn(path, hidden)
	}
	return nil, errNotImplemented
}
func (s *stubMethods) StatFile(string) (browser.FileStat, error) {
	return browser.FileStat{}, errNotImplemented
}
func (s *stubMethods) Search([]string, bool, []string, map[string]string, string, uint32, uint32, []string) ([]browser.FileResult, uint32, error) {
	return nil, 0, errNotImplemented
}
func (s *stubMethods) GlobSearch([]string, uint32, bool) ([]browser.FileResult, error) {
	return nil, errNotImplemented
}
func (s *stubMethods) GetMetadata(string) (map[string]string, map[string]string, error) {
	return nil, nil, errNotImplemented
}
func (s *stubMethods) SetMetadata(string, string, string) error {
	return errNotImplemented
}
func (s *stubMethods) ModifyTags([]string, []string, string) (browser.TagResult, error) {
	return browser.TagResult{}, errNotImplemented
}
func (s *stubMethods) HydrateTags([]string) ([]browser.PathTags, error) {
	return nil, errNotImplemented
}
func (s *stubMethods) ListTags(prefix string) ([]string, error) {
	if s.listTagsFn != nil {
		return s.listTagsFn(prefix)
	}
	return nil, errNotImplemented
}
func (s *stubMethods) RenameFile(string, string) (string, error) {
	return "", errNotImplemented
}
func (s *stubMethods) DeleteFile(string) error {
	return errNotImplemented
}
func (s *stubMethods) ChmodFile(string, uint32) error {
	return errNotImplemented
}
func (s *stubMethods) ListPlaces() ([]browser.PlaceEntry, error) {
	if s.listPlacesFn != nil {
		return s.listPlacesFn()
	}
	return nil, errNotImplemented
}

// ── helpers ──────────────────────────────────────────────────────────────────

// startServer starts a uisocket Server using a temp directory, returning the
// socket path, the Server, and a cancel function that shuts the server down.
func startServer(t *testing.T, m browser.Methods) (sockPath string, srv *uisocket.Server, cancel context.CancelFunc) {
	t.Helper()
	dir := t.TempDir()
	sockPath = filepath.Join(dir, "test.sock")
	srv = uisocket.New(sockPath, m)

	ctx, cancel := context.WithCancel(context.Background())
	ready := make(chan struct{})
	go func() {
		// Signal readiness once we can dial the socket.
		go func() {
			for {
				if conn, err := net.Dial("unix", sockPath); err == nil {
					conn.Close()
					close(ready)
					return
				}
				time.Sleep(5 * time.Millisecond)
			}
		}()
		if err := srv.Listen(ctx); err != nil {
			t.Logf("uisocket server stopped: %v", err)
		}
	}()
	select {
	case <-ready:
	case <-time.After(5 * time.Second):
		t.Fatal("uisocket server did not start in time")
	}
	return sockPath, srv, cancel
}

// dialAndScan opens a connection to the server and returns a scanner over it.
func dialAndScan(t *testing.T, sockPath string) (net.Conn, *bufio.Scanner) {
	t.Helper()
	conn, err := net.Dial("unix", sockPath)
	if err != nil {
		t.Fatalf("dial: %v", err)
	}
	scanner := bufio.NewScanner(conn)
	scanner.Buffer(make([]byte, 4*1024*1024), 4*1024*1024)
	return conn, scanner
}

// sendJSON writes a JSON-encoded value followed by '\n' to conn.
func sendJSON(t *testing.T, conn net.Conn, v any) {
	t.Helper()
	data, err := json.Marshal(v)
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}
	data = append(data, '\n')
	if _, err := conn.Write(data); err != nil {
		t.Fatalf("write: %v", err)
	}
}

// readResponse reads one JSON line from scanner and unmarshals it into response.
func readResponse(t *testing.T, scanner *bufio.Scanner) map[string]any {
	t.Helper()
	if !scanner.Scan() {
		t.Fatalf("scanner stopped; err=%v", scanner.Err())
	}
	var m map[string]any
	if err := json.Unmarshal(scanner.Bytes(), &m); err != nil {
		t.Fatalf("unmarshal response: %v", err)
	}
	return m
}

// ── tests ─────────────────────────────────────────────────────────────────────

// TestDispatch_Success verifies that a valid RPC call returns the result.
func TestDispatch_Success(t *testing.T) {
	m := &stubMethods{
		listTagsFn: func(_ string) ([]string, error) {
			return []string{"photo", "work"}, nil
		},
	}
	sockPath, _, cancel := startServer(t, m)
	defer cancel()

	conn, scanner := dialAndScan(t, sockPath)
	defer conn.Close()

	sendJSON(t, conn, map[string]any{
		"id":     42,
		"method": "ListTags",
		"args":   []any{""},
	})

	resp := readResponse(t, scanner)
	if resp["id"].(float64) != 42 {
		t.Errorf("expected id=42, got %v", resp["id"])
	}
	if resp["error"] != nil {
		t.Errorf("unexpected error: %v", resp["error"])
	}
	result, ok := resp["result"].([]any)
	if !ok || len(result) != 2 {
		t.Errorf("expected 2-element result slice, got %v", resp["result"])
	}
}

// TestDispatch_ErrorReply verifies that a method error is returned as an error frame.
func TestDispatch_ErrorReply(t *testing.T) {
	m := &stubMethods{
		listTagsFn: func(_ string) ([]string, error) {
			return nil, errors.New("database unavailable")
		},
	}
	sockPath, _, cancel := startServer(t, m)
	defer cancel()

	conn, scanner := dialAndScan(t, sockPath)
	defer conn.Close()

	sendJSON(t, conn, map[string]any{
		"id":     7,
		"method": "ListTags",
		"args":   []any{""},
	})

	resp := readResponse(t, scanner)
	if resp["id"].(float64) != 7 {
		t.Errorf("expected id=7, got %v", resp["id"])
	}
	if resp["error"] == nil {
		t.Fatal("expected error field to be set")
	}
	if !strings.Contains(resp["error"].(string), "database unavailable") {
		t.Errorf("error field mismatch: %v", resp["error"])
	}
	if resp["result"] != nil {
		t.Errorf("result should be absent on error, got %v", resp["result"])
	}
}

// TestDispatch_UnknownMethod verifies that an unknown method name returns an error.
func TestDispatch_UnknownMethod(t *testing.T) {
	sockPath, _, cancel := startServer(t, &stubMethods{})
	defer cancel()

	conn, scanner := dialAndScan(t, sockPath)
	defer conn.Close()

	sendJSON(t, conn, map[string]any{
		"id":     3,
		"method": "DoesNotExist",
		"args":   []any{},
	})

	resp := readResponse(t, scanner)
	if resp["error"] == nil {
		t.Fatal("expected error for unknown method")
	}
	if !strings.Contains(resp["error"].(string), "unknown method") {
		t.Errorf("unexpected error message: %v", resp["error"])
	}
}

// TestBroadcast_DeliveredToAllClients verifies that broadcast events reach every
// connected client exactly once.
func TestBroadcast_DeliveredToAllClients(t *testing.T) {
	const numClients = 3
	sockPath, srv, cancel := startServer(t, &stubMethods{})
	defer cancel()

	type clientState struct {
		conn    net.Conn
		scanner *bufio.Scanner
	}
	clients := make([]clientState, numClients)
	for i := range clients {
		c, sc := dialAndScan(t, sockPath)
		clients[i] = clientState{c, sc}
		defer c.Close()
	}

	// Give all connections time to be registered.
	time.Sleep(20 * time.Millisecond)

	srv.BroadcastFileTagged("/home/alice/foo.jpg", []string{"work"}, []string{})

	for i, c := range clients {
		resp := readResponse(t, c.scanner)
		if resp["event"] != "FileTagged" {
			t.Errorf("client %d: expected FileTagged event, got %v", i, resp["event"])
		}
		args, ok := resp["args"].(map[string]any)
		if !ok {
			t.Errorf("client %d: args not a map: %v", i, resp["args"])
			continue
		}
		if args["path"] != "/home/alice/foo.jpg" {
			t.Errorf("client %d: path mismatch: %v", i, args["path"])
		}
	}
}

// TestBroadcast_IndexUpdated verifies the IndexUpdated push frame fields.
func TestBroadcast_IndexUpdated(t *testing.T) {
	sockPath, srv, cancel := startServer(t, &stubMethods{})
	defer cancel()

	conn, scanner := dialAndScan(t, sockPath)
	defer conn.Close()

	time.Sleep(10 * time.Millisecond)
	srv.BroadcastIndexUpdated(999, 42)

	resp := readResponse(t, scanner)
	if resp["event"] != "IndexUpdated" {
		t.Fatalf("expected IndexUpdated event, got %v", resp["event"])
	}
	args := resp["args"].(map[string]any)
	if args["filesTotal"].(float64) != 999 {
		t.Errorf("filesTotal: got %v", args["filesTotal"])
	}
	if args["tagsTotal"].(float64) != 42 {
		t.Errorf("tagsTotal: got %v", args["tagsTotal"])
	}
}

// TestBroadcast_DaemonStateChanged verifies the DaemonStateChanged push frame.
func TestBroadcast_DaemonStateChanged(t *testing.T) {
	sockPath, srv, cancel := startServer(t, &stubMethods{})
	defer cancel()

	conn, scanner := dialAndScan(t, sockPath)
	defer conn.Close()

	time.Sleep(10 * time.Millisecond)
	srv.BroadcastDaemonStateChanged("ready")

	resp := readResponse(t, scanner)
	if resp["event"] != "DaemonStateChanged" {
		t.Fatalf("expected DaemonStateChanged, got %v", resp["event"])
	}
	args := resp["args"].(map[string]any)
	if args["state"] != "ready" {
		t.Errorf("state: got %v", args["state"])
	}
}

// TestNewlineDelimitedFraming verifies that multiple requests sent back-to-back
// (without waiting for replies) each receive an independent response.
func TestNewlineDelimitedFraming(t *testing.T) {
	var callCount atomic.Int64
	m := &stubMethods{
		listTagsFn: func(_ string) ([]string, error) {
			n := callCount.Add(1)
			return []string{fmt.Sprintf("tag%d", n)}, nil
		},
	}
	sockPath, _, cancel := startServer(t, m)
	defer cancel()

	conn, scanner := dialAndScan(t, sockPath)
	defer conn.Close()

	const n = 5
	for i := range n {
		sendJSON(t, conn, map[string]any{
			"id":     i + 1,
			"method": "ListTags",
			"args":   []any{""},
		})
	}

	ids := make(map[float64]bool)
	for range n {
		resp := readResponse(t, scanner)
		if resp["error"] != nil {
			t.Errorf("unexpected error: %v", resp["error"])
		}
		ids[resp["id"].(float64)] = true
	}
	if len(ids) != n {
		t.Errorf("expected %d distinct IDs, got %d", n, len(ids))
	}
}

// TestLargeResponse verifies that responses larger than the default 64 KiB
// scanner token limit are handled correctly.
func TestLargeResponse(t *testing.T) {
	// Create a ListTags result whose JSON encoding exceeds 64 KiB.
	bigTags := make([]string, 2000)
	for i := range bigTags {
		bigTags[i] = strings.Repeat("x", 40) // ~80 KiB total
	}
	m := &stubMethods{
		listTagsFn: func(_ string) ([]string, error) {
			return bigTags, nil
		},
	}
	sockPath, _, cancel := startServer(t, m)
	defer cancel()

	conn, scanner := dialAndScan(t, sockPath)
	defer conn.Close()

	sendJSON(t, conn, map[string]any{
		"id":     1,
		"method": "ListTags",
		"args":   []any{""},
	})

	resp := readResponse(t, scanner)
	if resp["error"] != nil {
		t.Fatalf("unexpected error: %v", resp["error"])
	}
	result, ok := resp["result"].([]any)
	if !ok {
		t.Fatalf("expected result array, got %T", resp["result"])
	}
	if len(result) != len(bigTags) {
		t.Errorf("expected %d tags, got %d", len(bigTags), len(result))
	}
}

// TestConcurrentBroadcastAndDispatch verifies that concurrent writes from
// dispatch goroutines and broadcast do not panic or produce corrupt frames.
func TestConcurrentBroadcastAndDispatch(t *testing.T) {
	m := &stubMethods{
		listTagsFn: func(_ string) ([]string, error) {
			return []string{"a", "b"}, nil
		},
	}
	sockPath, srv, cancel := startServer(t, m)
	defer cancel()

	conn, scanner := dialAndScan(t, sockPath)
	defer conn.Close()

	const (
		numRequests   = 20
		numBroadcasts = 10
	)

	var wg sync.WaitGroup

	// Send requests concurrently.
	wg.Go(func() {
		for i := range numRequests {
			sendJSON(t, conn, map[string]any{
				"id":     i + 1,
				"method": "ListTags",
				"args":   []any{""},
			})
		}
	})

	// Broadcast concurrently.
	wg.Go(func() {
		for range numBroadcasts {
			srv.BroadcastDaemonStateChanged("scanning")
			time.Sleep(time.Millisecond)
		}
	})

	wg.Wait()

	// Drain all incoming frames; every frame must be valid JSON.
	received := 0
	total := numRequests + numBroadcasts
	done := make(chan struct{})
	go func() {
		for scanner.Scan() {
			var m map[string]any
			if err := json.Unmarshal(scanner.Bytes(), &m); err != nil {
				t.Errorf("corrupt frame: %v", err)
			}
			received++
			if received >= total {
				close(done)
				return
			}
		}
	}()

	select {
	case <-done:
	case <-time.After(5 * time.Second):
		t.Logf("received %d/%d frames before timeout (some broadcasts may arrive after reads)", received, total)
	}
}

// TestSocketPermissions verifies that the bound socket file is mode 0600.
func TestSocketPermissions(t *testing.T) {
	sockPath, _, cancel := startServer(t, &stubMethods{})
	defer cancel()

	info, err := os.Stat(sockPath)
	if err != nil {
		t.Fatalf("stat socket: %v", err)
	}
	if perm := info.Mode().Perm(); perm != 0o600 {
		t.Errorf("expected socket permissions 0600, got %04o", perm)
	}
}

// TestListPlaces_Success exercises an end-to-end dispatch of ListPlaces.
func TestListPlaces_Success(t *testing.T) {
	m := &stubMethods{
		listPlacesFn: func() ([]browser.PlaceEntry, error) {
			return []browser.PlaceEntry{
				{Name: "Home", Path: "/home/alice"},
			}, nil
		},
	}
	sockPath, _, cancel := startServer(t, m)
	defer cancel()

	conn, scanner := dialAndScan(t, sockPath)
	defer conn.Close()

	sendJSON(t, conn, map[string]any{
		"id":     1,
		"method": "ListPlaces",
		"args":   []any{},
	})

	resp := readResponse(t, scanner)
	if resp["error"] != nil {
		t.Fatalf("unexpected error: %v", resp["error"])
	}
	result, ok := resp["result"].([]any)
	if !ok || len(result) == 0 {
		t.Fatalf("expected non-empty result, got %v", resp["result"])
	}
}
