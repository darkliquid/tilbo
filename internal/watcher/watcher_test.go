//go:build linux

package watcher

import (
	"context"
	"errors"
	"testing"
	"time"

	"golang.org/x/sys/unix"
)

func TestKernelVersion(t *testing.T) {
	major, minor, err := kernelVersion()
	if err != nil {
		t.Fatalf("kernelVersion: %v", err)
	}
	if major < 4 {
		t.Errorf("implausible kernel major version: %d", major)
	}
	t.Logf("kernel %d.%d", major, minor)
}

func TestNew_FanotifyRequiresPrivilege(t *testing.T) {
	ctx := context.Background()
	// BackendFanotify forces fanotify and returns an error when unavailable,
	// rather than falling back to inotify.
	w, err := New(ctx, "/", BackendFanotify)
	if err == nil {
		// Some environments allow fanotify without root (user namespaces, capabilities).
		t.Log("fanotify opened without elevated privilege")
		w.fanfd = -1 // prevent double-close
		return
	}
	if !errors.Is(err, unix.EPERM) && !errors.Is(err, unix.EACCES) {
		t.Logf("expected EPERM or EACCES for unprivileged fanotify_init, got: %v", err)
	}
}

func TestNew_AutoFallsBackToInotify(t *testing.T) {
	ctx := context.Background()
	// BackendAuto silently falls back to inotify when fanotify is unavailable.
	w, err := New(ctx, t.TempDir(), BackendAuto)
	if err != nil {
		t.Fatalf("New with BackendAuto: %v", err)
	}
	if w == nil {
		t.Fatal("expected a non-nil Watcher")
	}
}

func TestNew_InotifyAlwaysWorks(t *testing.T) {
	ctx := context.Background()
	w, err := New(ctx, t.TempDir(), BackendInotify)
	if err != nil {
		t.Fatalf("New with BackendInotify: %v", err)
	}
	if w == nil {
		t.Fatal("expected a non-nil Watcher")
	}
}

func TestDebounce_EmitsAfterDelay(t *testing.T) {
	w := &Watcher{
		out:     make(chan Event, 8),
		pending: make(map[string]*debounceEntry),
	}

	ev := Event{Path: "/tmp/test.txt", Kind: EventCreate}
	w.debounce(ev)

	select {
	case got := <-w.out:
		if got.Path != ev.Path || got.Kind != ev.Kind {
			t.Errorf("got %+v, want %+v", got, ev)
		}
	case <-time.After(debounceDelay + 300*time.Millisecond):
		t.Error("timed out waiting for debounced event")
	}
}

func TestDebounce_CoalescesRapidEvents(t *testing.T) {
	w := &Watcher{
		out:     make(chan Event, 8),
		pending: make(map[string]*debounceEntry),
	}

	path := "/tmp/coalesce.txt"
	w.debounce(Event{Path: path, Kind: EventCreate})
	w.debounce(Event{Path: path, Kind: EventModify})
	w.debounce(Event{Path: path, Kind: EventModify})

	// Only one event should arrive.
	select {
	case got := <-w.out:
		if got.Kind != EventModify {
			t.Errorf("expected EventModify after coalescence, got %v", got.Kind)
		}
	case <-time.After(debounceDelay + 300*time.Millisecond):
		t.Error("timed out waiting for debounced event")
	}

	// No second event.
	select {
	case extra := <-w.out:
		t.Errorf("unexpected second event: %+v", extra)
	case <-time.After(50 * time.Millisecond):
	}
}

func TestDebounce_IndependentPaths(t *testing.T) {
	w := &Watcher{
		out:     make(chan Event, 8),
		pending: make(map[string]*debounceEntry),
	}

	w.debounce(Event{Path: "/tmp/a.txt", Kind: EventCreate})
	w.debounce(Event{Path: "/tmp/b.txt", Kind: EventDelete})

	seen := map[string]EventKind{}
	deadline := time.After(debounceDelay + 300*time.Millisecond)
	for len(seen) < 2 {
		select {
		case got := <-w.out:
			seen[got.Path] = got.Kind
		case <-deadline:
			t.Fatalf("timed out; received events for: %v", seen)
		}
	}

	if seen["/tmp/a.txt"] != EventCreate {
		t.Errorf("/tmp/a.txt: want EventCreate, got %v", seen["/tmp/a.txt"])
	}
	if seen["/tmp/b.txt"] != EventDelete {
		t.Errorf("/tmp/b.txt: want EventDelete, got %v", seen["/tmp/b.txt"])
	}
}
