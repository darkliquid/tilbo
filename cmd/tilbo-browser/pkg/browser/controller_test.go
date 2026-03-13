package browser_test

import (
	"context"
	"errors"
	"os"
	"path/filepath"
	"sync/atomic"
	"testing"
	"time"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser"
	ipcv1 "github.com/darkliquid/tilbo/internal/ipc/gen/tilbo/ipc/v1"
)

type controllerFakeCaller struct {
	callFn func(context.Context, *ipcv1.Request) (*ipcv1.Response, error)
}

func (f *controllerFakeCaller) Call(ctx context.Context, req *ipcv1.Request) (*ipcv1.Response, error) {
	return f.callFn(ctx, req)
}

func TestControllerDispatchNavigate(t *testing.T) {
	t.Parallel()

	c := browser.NewController(context.Background())

	var seen atomic.Bool
	c.EventBus().Subscribe(browser.EventDirectoryLoaded, func(_ context.Context, evt browser.Event) {
		e, ok := evt.(browser.DirectoryLoadedEvent)
		if !ok {
			t.Fatalf("unexpected event type %T", evt)
		}
		if e.Path != "/tmp" {
			t.Fatalf("unexpected path %q", e.Path)
		}
		seen.Store(true)
	})

	err := c.Dispatch(browser.NavigateCommand{CommandBase: browser.CommandBase{OpID: "nav-1"}, Path: "/tmp"})
	if err != nil {
		t.Fatalf("dispatch navigate failed: %v", err)
	}

	state, _ := c.StateStore().Snapshot()
	if state.CurrentPath != "/tmp" {
		t.Fatalf("expected path to update to /tmp, got %q", state.CurrentPath)
	}

	deadline := time.Now().Add(500 * time.Millisecond)
	for !seen.Load() && time.Now().Before(deadline) {
		time.Sleep(10 * time.Millisecond)
	}
	if !seen.Load() {
		t.Fatal("expected directory loaded event")
	}
}

func TestControllerDispatchShutdownCancelsContext(t *testing.T) {
	t.Parallel()

	c := browser.NewController(context.Background())
	err := c.Dispatch(browser.ShutdownCommand{CommandBase: browser.CommandBase{OpID: "sd-1"}, Reason: "test"})
	if err != nil {
		t.Fatalf("dispatch shutdown failed: %v", err)
	}

	select {
	case <-c.Done():
	case <-time.After(500 * time.Millisecond):
		t.Fatal("expected controller context to be canceled")
	}
}

func TestControllerSearchUsesDaemonResults(t *testing.T) {
	t.Parallel()

	c := browser.NewController(context.Background())
	c.SetDaemonAdapter(browser.NewDaemonAdapter(&controllerFakeCaller{
		callFn: func(_ context.Context, req *ipcv1.Request) (*ipcv1.Response, error) {
			if req.GetSearch() == nil {
				t.Fatal("expected search request")
			}
			return &ipcv1.Response{
				Kind: &ipcv1.Response_Search{
					Search: &ipcv1.SearchResponse{
						Files: []*ipcv1.FileResult{{
							Path:      "/tmp/from-daemon",
							Tags:      []string{"daemon"},
							Mtime:     7,
							SizeBytes: 9,
						}},
					},
				},
			}, nil
		},
	}))

	var got atomic.Bool
	c.EventBus().Subscribe(browser.EventSearchCompleted, func(_ context.Context, evt browser.Event) {
		e, ok := evt.(browser.SearchCompletedEvent)
		if !ok {
			t.Fatalf("unexpected event type %T", evt)
		}
		if len(e.Files) != 1 || e.Files[0].Path != "/tmp/from-daemon" {
			t.Fatalf("unexpected daemon search results: %#v", e.Files)
		}
		got.Store(true)
	})

	err := c.Dispatch(browser.SearchCommand{
		CommandBase: browser.CommandBase{OpID: "search-1"},
		Chips:       []string{"tag:example"},
		Limit:       5,
	})
	if err != nil {
		t.Fatalf("dispatch search failed: %v", err)
	}

	deadline := time.Now().Add(500 * time.Millisecond)
	for !got.Load() && time.Now().Before(deadline) {
		time.Sleep(10 * time.Millisecond)
	}
	if !got.Load() {
		t.Fatal("expected daemon-backed search event")
	}
}

func TestControllerAutocompleteUsesDaemonResults(t *testing.T) {
	t.Parallel()

	c := browser.NewController(context.Background())
	c.SetDaemonAdapter(browser.NewDaemonAdapter(&controllerFakeCaller{
		callFn: func(_ context.Context, req *ipcv1.Request) (*ipcv1.Response, error) {
			if req.GetListTags() == nil {
				t.Fatal("expected list tags request")
			}
			return &ipcv1.Response{
				Kind: &ipcv1.Response_ListTags{ListTags: &ipcv1.ListTagsResponse{Tags: []string{"tag:a"}}},
			}, nil
		},
	}))

	var got atomic.Bool
	c.EventBus().Subscribe(browser.EventAutocompleteUpdated, func(_ context.Context, evt browser.Event) {
		e, ok := evt.(browser.AutocompleteUpdatedEvent)
		if !ok {
			t.Fatalf("unexpected event type %T", evt)
		}
		if len(e.Items) != 1 || e.Items[0] != "tag:a" {
			t.Fatalf("unexpected autocomplete items: %#v", e.Items)
		}
		got.Store(true)
	})

	err := c.Dispatch(browser.AutocompleteCommand{
		CommandBase: browser.CommandBase{OpID: "ac-1"},
		Prefix:      "tag:",
	})
	if err != nil {
		t.Fatalf("dispatch autocomplete failed: %v", err)
	}

	deadline := time.Now().Add(500 * time.Millisecond)
	for !got.Load() && time.Now().Before(deadline) {
		time.Sleep(10 * time.Millisecond)
	}
	if !got.Load() {
		t.Fatal("expected autocomplete updated event")
	}
}

func TestControllerNavigateHydratesTagsFromDaemon(t *testing.T) {
	t.Parallel()

	dir := t.TempDir()
	filePath := filepath.Join(dir, "book.txt")
	if err := os.WriteFile(filePath, []byte("hello"), 0o600); err != nil {
		t.Fatalf("write test file: %v", err)
	}

	c := browser.NewController(context.Background())
	c.SetDaemonAdapter(browser.NewDaemonAdapter(&controllerFakeCaller{
		callFn: func(_ context.Context, req *ipcv1.Request) (*ipcv1.Response, error) {
			hydrateReq := req.GetHydrateTags()
			if hydrateReq == nil {
				t.Fatal("expected hydrate_tags request")
			}
			if len(hydrateReq.GetPaths()) != 1 || hydrateReq.GetPaths()[0] != filePath {
				t.Fatalf("unexpected hydrate paths: %#v", hydrateReq.GetPaths())
			}
			return &ipcv1.Response{
				Kind: &ipcv1.Response_HydrateTags{
					HydrateTags: &ipcv1.HydrateTagsResponse{Entries: []*ipcv1.HydratedPathTags{{
							Path: filePath,
							Tags: []string{"tagged"},
						}}},
				},
			}, nil
		},
	}))

	err := c.Dispatch(browser.NavigateCommand{CommandBase: browser.CommandBase{OpID: "nav-tags"}, Path: dir})
	if err != nil {
		t.Fatalf("dispatch navigate failed: %v", err)
	}

	deadline := time.Now().Add(500 * time.Millisecond)
	for time.Now().Before(deadline) {
		state, _ := c.StateStore().Snapshot()
		for _, e := range state.DirectoryEntries {
			if e.Path == filePath {
				if len(e.Tags) != 1 || e.Tags[0] != "tagged" {
					t.Fatalf("expected hydrated tag, got %#v", e.Tags)
				}
				return
			}
		}
		time.Sleep(10 * time.Millisecond)
	}

	t.Fatal("expected directory entry with hydrated tags")
}

func TestControllerRegisterProjectionSubscribers(t *testing.T) {
	t.Parallel()

	c := browser.NewController(context.Background())
	subs, projections := browser.NewProjectionSet()
	c.RegisterProjectionSubscribers(subs)

	c.EventBus().Publish(context.Background(), browser.DirectoryLoadedEvent{
		EventBase: browser.EventBase{At: time.Now(), OpID: "proj-dir"},
		Path:      "/tmp",
		Entries:   []browser.DirectoryEntry{{Path: "/tmp/a"}},
	})
	c.EventBus().Publish(context.Background(), browser.OperationFailedEvent{
		EventBase: browser.EventBase{At: time.Now(), OpID: "proj-fail"},
		Command:   browser.CommandSearch,
		Err:       errors.New("proj-error"),
	})
	c.EventBus().Publish(context.Background(), browser.AutocompleteUpdatedEvent{
		EventBase: browser.EventBase{At: time.Now(), OpID: "proj-ac"},
		Items:     []string{"tag:x"},
	})
	c.EventBus().Publish(context.Background(), browser.PortalOpenedEvent{
		EventBase: browser.EventBase{At: time.Now(), OpID: "proj-portal-open"},
		Mode:      "portal",
	})

	dirState, _ := projections.Directory.Snapshot()
	failState, _ := projections.Failures.Snapshot()
	autoState, _ := projections.Auto.Snapshot()
	portalState, _ := projections.Portal.Snapshot()
	if len(dirState.DirectoryEntries) != 1 || dirState.CurrentPath != "/tmp" {
		t.Fatalf("unexpected projected directory state: %#v", dirState)
	}
	if failState.LastError != "proj-error" {
		t.Fatalf("unexpected projected failure state: %#v", failState)
	}
	if len(autoState.Autocomplete) != 1 || autoState.Autocomplete[0] != "tag:x" {
		t.Fatalf("unexpected projected autocomplete state: %#v", autoState)
	}
	if portalState.WindowMode != "portal" {
		t.Fatalf("unexpected projected portal state: %#v", portalState)
	}
}

func TestControllerSubmitPortalPublishesClosedEvent(t *testing.T) {
	t.Parallel()

	c := browser.NewController(context.Background())
	got := make(chan browser.PortalClosedEvent, 1)
	c.EventBus().Subscribe(browser.EventPortalClosed, func(_ context.Context, evt browser.Event) {
		e, ok := evt.(browser.PortalClosedEvent)
		if !ok {
			t.Fatalf("unexpected event type %T", evt)
		}
		got <- e
	})

	err := c.Dispatch(browser.SubmitPortalCommand{
		CommandBase:   browser.CommandBase{OpID: "portal-submit"},
		SelectedFiles: []string{"/tmp/a"},
	})
	if err != nil {
		t.Fatalf("dispatch submit portal failed: %v", err)
	}

	select {
	case e := <-got:
		if len(e.SelectedFiles) != 1 || e.SelectedFiles[0] != "/tmp/a" {
			t.Fatalf("unexpected selected files: %#v", e.SelectedFiles)
		}
	case <-time.After(500 * time.Millisecond):
		t.Fatal("expected portal closed event")
	}
}
