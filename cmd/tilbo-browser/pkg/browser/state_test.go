package browser_test

import (
	"testing"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser"
)

func TestStateStoreVersionIncrementsOnMutate(t *testing.T) {
	t.Parallel()

	store := browser.NewStateStore()
	_, v0 := store.Snapshot()

	v1 := store.Mutate(func(s *browser.State) {
		s.CurrentPath = "/tmp"
	})
	if v1 <= v0 {
		t.Fatalf("expected version to increase, got %d -> %d", v0, v1)
	}

	snap, v2 := store.Snapshot()
	if v2 != v1 {
		t.Fatalf("snapshot version mismatch: got %d want %d", v2, v1)
	}
	if snap.CurrentPath != "/tmp" {
		t.Fatalf("expected current path to be updated, got %q", snap.CurrentPath)
	}
}

func TestStateStoreSnapshotIsDetached(t *testing.T) {
	t.Parallel()

	store := browser.NewStateStore()
	store.Mutate(func(s *browser.State) {
		s.SearchChips = []string{"a", "b"}
	})

	snap, _ := store.Snapshot()
	snap.SearchChips[0] = "mutated"

	next, _ := store.Snapshot()
	if next.SearchChips[0] != "a" {
		t.Fatalf("expected store snapshot to remain unchanged, got %q", next.SearchChips[0])
	}
}
