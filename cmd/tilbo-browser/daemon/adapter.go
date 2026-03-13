// Package daemon provides browser-side adapters for daemon IPC requests.
package daemon

import (
	"context"
	"errors"
	"strings"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/core"
	ipcv1 "github.com/darkliquid/tilbo/internal/ipc/gen/tilbo/ipc/v1"
)

// requestCaller is implemented by ipc.Client and test doubles.
type requestCaller interface {
	Call(ctx context.Context, req *ipcv1.Request) (*ipcv1.Response, error)
}

// Adapter translates controller search/tag hydration requests to daemon IPC.
type Adapter struct {
	caller requestCaller
}

// NewAdapter constructs a daemon adapter from a request caller.
func NewAdapter(caller requestCaller) *Adapter {
	if caller == nil {
		return nil
	}

	return &Adapter{caller: caller}
}

// Search executes daemon search for non-local chips.
func (a *Adapter) Search(ctx context.Context, chips []string, limit uint32) ([]core.SearchFile, error) {
	if a == nil || a.caller == nil {
		return nil, errors.New("daemon adapter not configured")
	}

	req := SearchRequestFromChips(chips, limit)
	resp, err := a.caller.Call(ctx, &ipcv1.Request{Kind: &ipcv1.Request_Search{Search: req}})
	if err != nil {
		return nil, err
	}

	searchResp, ok := resp.GetKind().(*ipcv1.Response_Search)
	if !ok || searchResp.Search == nil {
		return nil, errors.New("unexpected daemon search response")
	}

	return SearchFilesFromIPC(searchResp.Search.GetFiles()), nil
}

// HydrateTags fetches tags for the provided paths.
func (a *Adapter) HydrateTags(ctx context.Context, paths []string) (map[string][]string, error) {
	if a == nil || a.caller == nil {
		return nil, errors.New("daemon adapter not configured")
	}

	if len(paths) == 0 {
		return map[string][]string{}, nil
	}

	resp, err := a.caller.Call(ctx, &ipcv1.Request{
		Kind: &ipcv1.Request_HydrateTags{HydrateTags: &ipcv1.HydrateTagsRequest{Paths: paths}},
	})
	if err != nil {
		return nil, err
	}

	hydrateResp, ok := resp.GetKind().(*ipcv1.Response_HydrateTags)
	if !ok || hydrateResp.HydrateTags == nil {
		return nil, errors.New("unexpected daemon hydration response")
	}

	tagMap := make(map[string][]string, len(paths))
	for _, entry := range hydrateResp.HydrateTags.GetEntries() {
		tagMap[entry.GetPath()] = append([]string(nil), entry.GetTags()...)
	}

	return tagMap, nil
}

// Autocomplete fetches daemon tag suggestions for a prefix.
func (a *Adapter) Autocomplete(ctx context.Context, prefix string) ([]string, error) {
	if a == nil || a.caller == nil {
		return nil, errors.New("daemon adapter not configured")
	}

	resp, err := a.caller.Call(ctx, &ipcv1.Request{
		Kind: &ipcv1.Request_ListTags{ListTags: &ipcv1.ListTagsRequest{Prefix: prefix}},
	})
	if err != nil {
		return nil, err
	}

	tagsResp, ok := resp.GetKind().(*ipcv1.Response_ListTags)
	if !ok || tagsResp.ListTags == nil {
		return nil, errors.New("unexpected daemon autocomplete response")
	}

	return append([]string(nil), tagsResp.ListTags.GetTags()...), nil
}

// SearchRequestFromChips builds an IPC search request from browser chips.
func SearchRequestFromChips(chips []string, limit uint32) *ipcv1.SearchRequest {
	if limit == 0 {
		limit = core.DefaultSearchLimit
	}

	req := &ipcv1.SearchRequest{
		Limit:       limit,
		MetaFilters: make(map[string]string),
	}

	for _, chip := range chips {
		if strings.HasPrefix(chip, "glob:") || strings.HasPrefix(chip, "hidden:") {
			continue
		}
		if strings.Contains(chip, ":") {
			parts := strings.SplitN(chip, ":", splitPartsLimit)
			if len(parts) == 2 && parts[0] != "" {
				req.MetaFilters[parts[0]] = parts[1]
			}
			continue
		}
		req.Tags = append(req.Tags, chip)
	}

	if len(req.GetTags()) == 0 && len(req.GetMetaFilters()) == 0 {
		req.FtsQuery = strings.Join(chips, " ")
	}

	return req
}

// SearchFilesFromIPC maps daemon file results to runtime commandcore.SearchFile values.
func SearchFilesFromIPC(files []*ipcv1.FileResult) []core.SearchFile {
	if len(files) == 0 {
		return []core.SearchFile{}
	}

	out := make([]core.SearchFile, 0, len(files))
	for _, f := range files {
		out = append(out, core.SearchFile{
			Path:  f.GetPath(),
			Tags:  append([]string(nil), f.GetTags()...),
			Size:  f.GetSizeBytes(),
			MTime: f.GetMtime(),
		})
	}

	return out
}

const (
	splitPartsLimit = 2
)

// SearchAllowHidden reports whether hidden files should be included in search.
func SearchAllowHidden(chips []string, current bool) bool {
	return core.SearchAllowHidden(chips, current)
}
