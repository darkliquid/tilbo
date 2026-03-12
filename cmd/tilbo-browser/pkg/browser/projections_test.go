package browser_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser"
)

func TestProjectionStateSnapshotDetached(t *testing.T) {
	t.Parallel()

	ps := browser.NewProjectionState(browser.State{
		CurrentPath: "/tmp",
		SearchChips: []string{"a"},
		DirectoryEntries: []browser.DirectoryEntry{{
			Path: "/tmp/a",
		}},
	})

	s1, _ := ps.Snapshot()
	s1.CurrentPath = "/other"
	s1.SearchChips[0] = "mut"
	s1.DirectoryEntries[0].Path = "/mut"

	s2, _ := ps.Snapshot()
	if s2.CurrentPath != "/tmp" {
		t.Fatalf("unexpected current path %q", s2.CurrentPath)
	}
	if s2.SearchChips[0] != "a" {
		t.Fatalf("unexpected chip %q", s2.SearchChips[0])
	}
	if s2.DirectoryEntries[0].Path != "/tmp/a" {
		t.Fatalf("unexpected entry path %q", s2.DirectoryEntries[0].Path)
	}
}

func TestDirectoryProjectionConsumesEvent(t *testing.T) {
	t.Parallel()

	sub, ps := browser.NewDirectoryProjection()
	now := time.Now()
	sub(context.Background(), browser.DirectoryLoadedEvent{
		EventBase: browser.EventBase{At: now, OpID: "d1"},
		Path:      "/tmp",
		Entries:   []browser.DirectoryEntry{{Path: "/tmp/x"}},
	})

	s, v := ps.Snapshot()
	if v != 1 {
		t.Fatalf("expected version 1, got %d", v)
	}
	if s.CurrentPath != "/tmp" || len(s.DirectoryEntries) != 1 {
		t.Fatalf("unexpected directory projection state: %#v", s)
	}
}

func TestSearchProjectionConsumesEvent(t *testing.T) {
	t.Parallel()

	sub, ps := browser.NewSearchProjection()
	now := time.Now()
	sub(context.Background(), browser.SearchCompletedEvent{
		EventBase: browser.EventBase{At: now, OpID: "s1"},
		Chips:     []string{"tag:a"},
		Files:     []browser.SearchFile{{Path: "/tmp/a"}},
	})

	s, v := ps.Snapshot()
	if v != 1 {
		t.Fatalf("expected version 1, got %d", v)
	}
	if !s.IsSearchMode || len(s.SearchResults) != 1 || s.SearchChips[0] != "tag:a" {
		t.Fatalf("unexpected search projection state: %#v", s)
	}
}

func TestPlacesProjectionConsumesEvent(t *testing.T) {
	t.Parallel()

	sub, ps := browser.NewPlacesProjection()
	now := time.Now()
	sub(context.Background(), browser.PlacesRefreshedEvent{
		EventBase: browser.EventBase{At: now, OpID: "p1"},
		Places:    []browser.PlaceEntry{{Name: "Home", Path: "/home/u"}},
	})

	s, v := ps.Snapshot()
	if v != 1 {
		t.Fatalf("expected version 1, got %d", v)
	}
	if len(s.Places) != 1 || s.Places[0].Name != "Home" {
		t.Fatalf("unexpected places projection state: %#v", s)
	}
}

func TestAutocompleteProjectionConsumesEvent(t *testing.T) {
	t.Parallel()

	sub, ps := browser.NewAutocompleteProjection()
	sub(context.Background(), browser.AutocompleteUpdatedEvent{
		EventBase: browser.EventBase{At: time.Now(), OpID: "ac1"},
		Items:     []string{"tag:a", "tag:b"},
	})

	s, v := ps.Snapshot()
	if v != 1 {
		t.Fatalf("expected version 1, got %d", v)
	}
	if len(s.Autocomplete) != 2 || s.Autocomplete[0] != "tag:a" {
		t.Fatalf("unexpected autocomplete projection state: %#v", s)
	}
}

func TestPortalProjectionConsumesEvents(t *testing.T) {
	t.Parallel()

	sub, ps := browser.NewPortalProjection()
	sub(context.Background(), browser.PortalOpenedEvent{
		EventBase: browser.EventBase{At: time.Now(), OpID: "po1"},
		Mode:      "portal",
	})
	sub(context.Background(), browser.PortalClosedEvent{
		EventBase:     browser.EventBase{At: time.Now(), OpID: "pc1"},
		SelectedFiles: []string{"/tmp/a"},
	})

	s, v := ps.Snapshot()
	if v != 2 {
		t.Fatalf("expected version 2, got %d", v)
	}
	if s.WindowMode != "browser" {
		t.Fatalf("expected window mode browser, got %q", s.WindowMode)
	}
	if len(s.PortalSelection) != 1 || s.PortalSelection[0] != "/tmp/a" {
		t.Fatalf("expected portal selection to be projected, got %#v", s.PortalSelection)
	}
}

func TestFailureProjectionConsumesOperationFailed(t *testing.T) {
	t.Parallel()

	sub, ps := browser.NewFailureProjection()
	sub(context.Background(), browser.OperationFailedEvent{
		EventBase: browser.EventBase{At: time.Now(), OpID: "f1"},
		Command:   browser.CommandSearch,
		Err:       errors.New("boom"),
	})

	s, v := ps.Snapshot()
	if v != 1 {
		t.Fatalf("expected version 1, got %d", v)
	}
	if s.LastError != "boom" {
		t.Fatalf("expected last error boom, got %q", s.LastError)
	}
}

func TestProjectionSetWiresDistinctStates(t *testing.T) {
	t.Parallel()

	subs, ps := browser.NewProjectionSet()
	subs.Directory(context.Background(), browser.DirectoryLoadedEvent{
		EventBase: browser.EventBase{At: time.Now(), OpID: "a"},
		Path:      "/tmp",
		Entries:   []browser.DirectoryEntry{{Path: "/tmp/one"}},
	})
	subs.Search(context.Background(), browser.SearchCompletedEvent{
		EventBase: browser.EventBase{At: time.Now(), OpID: "b"},
		Chips:     []string{"tag:b"},
		Files:     []browser.SearchFile{{Path: "/tmp/two"}},
	})
	subs.Auto(context.Background(), browser.AutocompleteUpdatedEvent{
		EventBase: browser.EventBase{At: time.Now(), OpID: "c"},
		Items:     []string{"tag:c"},
	})
	subs.Portal(context.Background(), browser.PortalOpenedEvent{
		EventBase: browser.EventBase{At: time.Now(), OpID: "d"},
		Mode:      "portal",
	})

	dirState, _ := ps.Directory.Snapshot()
	searchState, _ := ps.Search.Snapshot()
	autoState, _ := ps.Auto.Snapshot()
	portalState, _ := ps.Portal.Snapshot()
	if len(dirState.DirectoryEntries) != 1 {
		t.Fatalf("expected directory projection update")
	}
	if len(searchState.SearchResults) != 1 {
		t.Fatalf("expected search projection update")
	}
	if len(autoState.Autocomplete) != 1 || autoState.Autocomplete[0] != "tag:c" {
		t.Fatalf("expected autocomplete projection update")
	}
	if portalState.WindowMode != "portal" {
		t.Fatalf("expected portal projection update")
	}
	if len(dirState.SearchResults) != 0 {
		t.Fatalf("expected distinct projection domains")
	}
}
