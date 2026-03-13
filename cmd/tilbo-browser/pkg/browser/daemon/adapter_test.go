package daemon_test

import (
	"context"
	"errors"
	"testing"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/daemon"
	ipcv1 "github.com/darkliquid/tilbo/internal/ipc/gen/tilbo/ipc/v1"
)

type fakeCaller struct {
	req  *ipcv1.Request
	resp *ipcv1.Response
	err  error
}

func (f *fakeCaller) Call(_ context.Context, req *ipcv1.Request) (*ipcv1.Response, error) {
	f.req = req
	if f.err != nil {
		return nil, f.err
	}

	return f.resp, nil
}

func TestDaemonAdapterSearchBuildsRequestAndMapsResponse(t *testing.T) {
	t.Parallel()

	caller := &fakeCaller{
		resp: &ipcv1.Response{
			Kind: &ipcv1.Response_Search{
				Search: &ipcv1.SearchResponse{
					Files: []*ipcv1.FileResult{{
						Path:      "/tmp/a",
						Tags:      []string{"x"},
						Mtime:     12,
						SizeBytes: 34,
					}},
				},
			},
		},
	}

	adapter := daemon.NewAdapter(caller)
	files, err := adapter.Search(context.Background(), []string{"tag1", "glob:/tmp/*", "mime:text/plain"}, 25)
	if err != nil {
		t.Fatalf("search failed: %v", err)
	}
	if len(files) != 1 || files[0].Path != "/tmp/a" {
		t.Fatalf("unexpected mapped files: %#v", files)
	}

	searchReq := caller.req.GetSearch()
	if searchReq == nil {
		t.Fatal("expected search request")
	}
	if searchReq.GetLimit() != 25 {
		t.Fatalf("expected limit 25, got %d", searchReq.GetLimit())
	}
	if len(searchReq.GetTags()) != 1 || searchReq.GetTags()[0] != "tag1" {
		t.Fatalf("unexpected tag parsing: %#v", searchReq.GetTags())
	}
	if v := searchReq.GetMetaFilters()["mime"]; v != "text/plain" {
		t.Fatalf("expected mime meta filter, got %q", v)
	}
}

func TestDaemonAdapterHydrateTags(t *testing.T) {
	t.Parallel()

	caller := &fakeCaller{
		resp: &ipcv1.Response{
			Kind: &ipcv1.Response_HydrateTags{
				HydrateTags: &ipcv1.HydrateTagsResponse{Entries: []*ipcv1.HydratedPathTags{{
					Path: "/tmp/a",
					Tags: []string{"one", "two"},
				}}},
			},
		},
	}

	adapter := daemon.NewAdapter(caller)
	tagMap, err := adapter.HydrateTags(context.Background(), []string{"/tmp/a"})
	if err != nil {
		t.Fatalf("hydrate tags failed: %v", err)
	}
	if len(tagMap) != 1 {
		t.Fatalf("expected 1 hydrated path, got %d", len(tagMap))
	}
	if len(tagMap["/tmp/a"]) != 2 {
		t.Fatalf("unexpected tags: %#v", tagMap["/tmp/a"])
	}

	req := caller.req.GetHydrateTags()
	if req == nil {
		t.Fatal("expected hydrate_tags request")
	}
	if len(req.GetPaths()) != 1 || req.GetPaths()[0] != "/tmp/a" {
		t.Fatalf("unexpected hydration paths: %#v", req.GetPaths())
	}
}

func TestDaemonAdapterSearchPropagatesCallerError(t *testing.T) {
	t.Parallel()

	adapter := daemon.NewAdapter(&fakeCaller{err: errors.New("boom")})
	_, err := adapter.Search(context.Background(), []string{"tag"}, 1)
	if err == nil {
		t.Fatal("expected error")
	}
}

func TestDaemonAdapterAutocompleteMapsListTagsResponse(t *testing.T) {
	t.Parallel()

	caller := &fakeCaller{
		resp: &ipcv1.Response{
			Kind: &ipcv1.Response_ListTags{
				ListTags: &ipcv1.ListTagsResponse{Tags: []string{"tag:a", "tag:b"}},
			},
		},
	}

	adapter := daemon.NewAdapter(caller)
	tags, err := adapter.Autocomplete(context.Background(), "tag:")
	if err != nil {
		t.Fatalf("autocomplete failed: %v", err)
	}
	if len(tags) != 2 || tags[0] != "tag:a" || tags[1] != "tag:b" {
		t.Fatalf("unexpected tags: %#v", tags)
	}
	if caller.req.GetListTags() == nil || caller.req.GetListTags().GetPrefix() != "tag:" {
		t.Fatalf("unexpected list_tags request: %#v", caller.req)
	}
}

func TestSearchRequestFromChipsBuildsExpectedFields(t *testing.T) {
	t.Parallel()

	req := daemon.SearchRequestFromChips(
		[]string{"tag1", "mime:text/plain", "glob:/tmp/*", "hidden:any"},
		25,
	)

	if req.GetLimit() != 25 {
		t.Fatalf("expected limit 25, got %d", req.GetLimit())
	}
	if len(req.GetTags()) != 1 || req.GetTags()[0] != "tag1" {
		t.Fatalf("unexpected tags: %#v", req.GetTags())
	}
	if req.GetMetaFilters()["mime"] != "text/plain" {
		t.Fatalf("unexpected meta filters: %#v", req.GetMetaFilters())
	}
	if req.GetFtsQuery() != "" {
		t.Fatalf("expected empty fts query, got %q", req.GetFtsQuery())
	}
}

func TestSearchRequestFromChipsFallsBackToFTS(t *testing.T) {
	t.Parallel()

	req := daemon.SearchRequestFromChips([]string{"glob:/tmp/*", "hidden:any"}, 0)
	if req.GetLimit() == 0 {
		t.Fatal("expected default limit to be set")
	}
	if req.GetFtsQuery() != "glob:/tmp/* hidden:any" {
		t.Fatalf("unexpected fts query: %q", req.GetFtsQuery())
	}
}

func TestSearchAllowHidden(t *testing.T) {
	t.Parallel()

	if daemon.SearchAllowHidden([]string{"tag:a"}, false) {
		t.Fatal("expected hidden disabled without hidden:any chip")
	}
	if !daemon.SearchAllowHidden([]string{"hidden:any"}, false) {
		t.Fatal("expected hidden enabled by hidden:any chip")
	}
	if !daemon.SearchAllowHidden([]string{"tag:a"}, true) {
		t.Fatal("expected hidden enabled when current state is true")
	}
}

func TestSearchFilesFromIPCMapsFields(t *testing.T) {
	t.Parallel()

	in := []*ipcv1.FileResult{{
		Path:      "/tmp/a",
		Tags:      []string{"x"},
		SizeBytes: 10,
		Mtime:     20,
	}}
	out := daemon.SearchFilesFromIPC(in)

	if len(out) != 1 {
		t.Fatalf("expected one mapped file, got %d", len(out))
	}
	if out[0].Path != "/tmp/a" || out[0].Size != 10 || out[0].MTime != 20 {
		t.Fatalf("unexpected mapped file: %#v", out[0])
	}
	if len(out[0].Tags) != 1 || out[0].Tags[0] != "x" {
		t.Fatalf("unexpected tags: %#v", out[0].Tags)
	}
}

func TestSearchFilesFromIPCCopiesTagsSlice(t *testing.T) {
	t.Parallel()

	in := []*ipcv1.FileResult{{Path: "/tmp/a", Tags: []string{"x"}}}
	out := daemon.SearchFilesFromIPC(in)
	out[0].Tags[0] = "mut"

	if in[0].GetTags()[0] != "x" {
		t.Fatalf("expected source tags to remain unchanged, got %#v", in[0].GetTags())
	}
}
