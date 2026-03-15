package main

import (
	"context"
	"fmt"
	"log/slog"
	"maps"
	"math"

	"github.com/darkliquid/tilbo/internal/graph"
	"github.com/darkliquid/tilbo/internal/index"
	ipcv1 "github.com/darkliquid/tilbo/internal/ipc/gen/tilbo/ipc/v1"
	"github.com/darkliquid/tilbo/internal/vectorize"
	"github.com/darkliquid/tilbo/internal/xattr"
)

const daemonInternalErrCode = 3

// errResponse wraps an error as an IPC ErrorResponse.
func errResponse(code uint32, msg string) *ipcv1.Response {
	return &ipcv1.Response{Kind: &ipcv1.Response_Error{
		Error: &ipcv1.ErrorResponse{Code: code, Message: msg},
	}}
}

// handleSearch executes a Search IPC request against the index.
func handleSearch(
	ctx context.Context,
	req *ipcv1.SearchRequest,
	idx *index.DB,
	embedder *vectorize.ONNXEmbedder,
) (*ipcv1.Response, error) {
	params := index.SearchParams{
		Tags:        req.GetTags(),
		TagsAny:     req.GetTagsAny(),
		TagExclude:  req.GetTagExclude(),
		MetaFilters: req.GetMetaFilters(),
		FTSQuery:    req.GetFtsQuery(),
		Limit:       req.GetLimit(),
		Offset:      req.GetOffset(),
		SortBy:      req.GetSortBy(),
	}

	if req.GetVectorQuery() != "" {
		if embedder == nil {
			return errResponse(daemonInternalErrCode, "semantic search requested but embedding model is disabled"), nil
		}
		vec, err := embedder.EmbedText(ctx, req.GetVectorQuery())
		if err != nil {
			return errResponse(daemonInternalErrCode, fmt.Sprintf("failed to generate query embedding: %v", err)), nil
		}
		params.VectorQuery = vec
	}

	results, total, err := idx.Search(ctx, params)
	if err != nil {
		return errResponse(daemonInternalErrCode, fmt.Sprintf("search failed: %v", err)), nil
	}

	files := make([]*ipcv1.FileResult, 0, len(results))
	for _, r := range results {
		meta := make(map[string]string, len(r.Metadata))
		maps.Copy(meta, r.Metadata)
		files = append(files, &ipcv1.FileResult{
			Path:      r.Path,
			Tags:      r.Tags,
			Metadata:  meta,
			Mtime:     r.Mtime,
			SizeBytes: r.SizeBytes,
			Score:     r.Score,
		})
	}

	return &ipcv1.Response{Kind: &ipcv1.Response_Search{
		Search: &ipcv1.SearchResponse{
			Files: files,
			Total: saturatingUint32FromInt(total),
		},
	}}, nil
}

func saturatingUint32FromInt(v int) uint32 {
	if v <= 0 {
		return 0
	}
	if v > math.MaxUint32 {
		return math.MaxUint32
	}
	return uint32(v)
}

// handleTag executes an Add/Remove/Set tag IPC request.
//
//nolint:gocognit // preserves explicit operation semantics and D-Bus diff emission in one flow
func handleTag(
	ctx context.Context,
	req *ipcv1.TagRequest,
	idx *index.DB,
	tags *xattr.Service,
	g *graph.Graph,
	onFileTagged func(path string, added, removed []string),
) (*ipcv1.Response, error) {
	opStr := map[ipcv1.TagOperation]string{
		ipcv1.TagOperation_TAG_OPERATION_UNSPECIFIED: "",
		ipcv1.TagOperation_TAG_OPERATION_ADD:         "add",
		ipcv1.TagOperation_TAG_OPERATION_REMOVE:      "remove",
		ipcv1.TagOperation_TAG_OPERATION_SET:         "set",
	}[req.GetOperation()]
	if opStr == "" {
		return errResponse(daemonInternalErrCode, "invalid tag operation"), nil
	}

	pathsOK := make([]string, 0)
	pathsErr := make([]string, 0)
	errs := make(map[string]string)

	for _, path := range req.GetPaths() {
		// Calculate differences to emit D-Bus signal
		var added, removed []string
		if onFileTagged != nil {
			oldTags, _ := idx.GetFileTags(ctx, path)
			// At this point we already modified the index... wait, no we haven't?
			// The index modification is below, so GetFileTags here gets the *old* tags!
			oldSet := make(map[string]bool)
			for _, t := range oldTags {
				oldSet[t] = true
			}
			newSet := make(map[string]bool)
			switch req.GetOperation() {
			case ipcv1.TagOperation_TAG_OPERATION_UNSPECIFIED:
				for t := range oldSet {
					newSet[t] = true
				}
			case ipcv1.TagOperation_TAG_OPERATION_ADD:
				for t := range oldSet {
					newSet[t] = true
				}
				for _, t := range req.GetTags() {
					newSet[t] = true
				}
			case ipcv1.TagOperation_TAG_OPERATION_REMOVE:
				for t := range oldSet {
					newSet[t] = true
				}
				for _, t := range req.GetTags() {
					delete(newSet, t)
				}
			case ipcv1.TagOperation_TAG_OPERATION_SET:
				for _, t := range req.GetTags() {
					newSet[t] = true
				}
			}
			for t := range newSet {
				if !oldSet[t] {
					added = append(added, t)
				}
			}
			for t := range oldSet {
				if !newSet[t] {
					removed = append(removed, t)
				}
			}
		}

		// Apply to xattr first (best-effort; non-xattr filesystems may fail).
		if err := applyTagsXattr(ctx, path, req.GetTags(), opStr, tags); err != nil {
			slog.WarnContext(ctx, "tag xattr failed", "path", path, "err", err)
		}
		// Then update the index.
		if err := idx.ModifyFileTags(ctx, path, req.GetTags(), opStr); err != nil {
			pathsErr = append(pathsErr, path)
			errs[path] = err.Error()
			continue
		}
		// Keep the in-memory graph in sync with the index.
		if updated, err := idx.GetFileTags(ctx, path); err == nil {
			g.SetFileTags(path, updated)
		}
		pathsOK = append(pathsOK, path)

		if onFileTagged != nil && (len(added) > 0 || len(removed) > 0) {
			onFileTagged(path, added, removed)
		}
	}

	return &ipcv1.Response{Kind: &ipcv1.Response_Tag{
		Tag: &ipcv1.TagResponse{
			PathsOk:    pathsOK,
			PathsError: pathsErr,
			Errors:     errs,
		},
	}}, nil
}

// handleMetadata returns all metadata for a file.
func handleMetadata(ctx context.Context, req *ipcv1.MetadataRequest, idx *index.DB) (*ipcv1.Response, error) {
	vals, sources, err := idx.GetFileMeta(ctx, req.GetPath())
	if err != nil {
		return errResponse(daemonInternalErrCode, fmt.Sprintf("metadata query failed: %v", err)), nil
	}
	if vals == nil {
		return errResponse(1, fmt.Sprintf("file not found: %s", req.GetPath())), nil
	}

	return &ipcv1.Response{Kind: &ipcv1.Response_Metadata{
		Metadata: &ipcv1.MetadataResponse{
			Path:     req.GetPath(),
			Metadata: vals,
			Sources:  sources,
		},
	}}, nil
}

// handleMetadataSet sets or deletes a single metadata key for a file.
func handleMetadataSet(ctx context.Context, req *ipcv1.MetadataSetRequest, idx *index.DB) (*ipcv1.Response, error) {
	fileID, lookupErr := idx.GetFileIDByPath(ctx, req.GetPath())
	if lookupErr != nil {
		//nolint:nilerr // handler reports domain errors via response payload
		return errResponse(1, fmt.Sprintf("file not in index: %s", req.GetPath())), nil
	}

	if req.GetValue() == "" {
		if err := idx.DeleteMeta(ctx, req.GetPath(), req.GetKey()); err != nil {
			return errResponse(daemonInternalErrCode, fmt.Sprintf("delete meta failed: %v", err)), nil
		}
	} else {
		if err := idx.UpsertMeta(ctx, fileID, req.GetKey(), req.GetValue(), "user"); err != nil {
			return errResponse(daemonInternalErrCode, fmt.Sprintf("set meta failed: %v", err)), nil
		}
	}

	return &ipcv1.Response{Kind: &ipcv1.Response_Metadata{
		Metadata: &ipcv1.MetadataResponse{Path: req.GetPath()},
	}}, nil
}

// handleListTags returns all tags whose names start with the given prefix.
func handleListTags(ctx context.Context, req *ipcv1.ListTagsRequest, idx *index.DB) (*ipcv1.Response, error) {
	all, err := idx.ListAllTags(ctx)
	if err != nil {
		return errResponse(daemonInternalErrCode, fmt.Sprintf("list tags failed: %v", err)), nil
	}
	prefix := req.GetPrefix()
	tags := all
	if prefix != "" {
		tags = tags[:0]
		for _, t := range all {
			if len(t) >= len(prefix) && t[:len(prefix)] == prefix {
				tags = append(tags, t)
			}
		}
	}
	return &ipcv1.Response{Kind: &ipcv1.Response_ListTags{
		ListTags: &ipcv1.ListTagsResponse{Tags: tags},
	}}, nil
}

// handleHydrateTags returns tag lists for each requested filesystem path.
func handleHydrateTags(ctx context.Context, req *ipcv1.HydrateTagsRequest, idx *index.DB) (*ipcv1.Response, error) {
	paths := req.GetPaths()
	if len(paths) == 0 {
		return &ipcv1.Response{Kind: &ipcv1.Response_HydrateTags{
			HydrateTags: &ipcv1.HydrateTagsResponse{Entries: []*ipcv1.HydratedPathTags{}},
		}}, nil
	}

	tagMap, err := idx.GetFileTagsBatch(ctx, paths)
	if err != nil {
		return errResponse(daemonInternalErrCode, fmt.Sprintf("hydrate tags failed: %v", err)), nil
	}

	entries := make([]*ipcv1.HydratedPathTags, 0, len(paths))
	for _, path := range paths {
		entries = append(entries, &ipcv1.HydratedPathTags{
			Path: path,
			Tags: append([]string(nil), tagMap[path]...),
		})
	}

	return &ipcv1.Response{Kind: &ipcv1.Response_HydrateTags{
		HydrateTags: &ipcv1.HydrateTagsResponse{Entries: entries},
	}}, nil
}

// applyTagsXattr applies tag modifications to the file's xattrs.
func applyTagsXattr(ctx context.Context, path string, tagNames []string, op string, store *xattr.Service) error {
	existing, err := store.ReadTags(ctx, path)
	if err != nil {
		existing = nil
	}

	tagSet := make(map[string]struct{}, len(existing))
	for _, t := range existing {
		tagSet[t] = struct{}{}
	}

	switch op {
	case "add":
		for _, t := range tagNames {
			tagSet[t] = struct{}{}
		}
	case "remove":
		for _, t := range tagNames {
			delete(tagSet, t)
		}
	case "set":
		tagSet = make(map[string]struct{}, len(tagNames))
		for _, t := range tagNames {
			tagSet[t] = struct{}{}
		}
	}

	merged := make([]string, 0, len(tagSet))
	for t := range tagSet {
		merged = append(merged, t)
	}
	return store.WriteTags(ctx, path, merged)
}

func handleListDirectory(req *ipcv1.ListDirectoryRequest, browser *daemonBrowserMethods) (*ipcv1.Response, error) {
	entries, err := browser.ListDirectory(req.GetPath(), req.GetHidden())
	if err != nil {
		return errResponse(daemonInternalErrCode, err.Error()), nil
	}
	resEntries := make([]*ipcv1.DirEntry, len(entries))
	for i, e := range entries {
		resEntries[i] = &ipcv1.DirEntry{
			Name:      e.Name,
			Path:      e.Path,
			IsDir:     e.IsDir,
			SizeBytes: e.Size,
			Mtime:     e.MTime,
			Mode:      e.Mode,
			Hidden:    e.Hidden,
		}
	}
	return &ipcv1.Response{Kind: &ipcv1.Response_ListDirectory{
		ListDirectory: &ipcv1.ListDirectoryResponse{Entries: resEntries},
	}}, nil
}

func handleStatFile(req *ipcv1.StatFileRequest, browser *daemonBrowserMethods) (*ipcv1.Response, error) {
	stat, err := browser.StatFile(req.GetPath())
	if err != nil {
		return errResponse(daemonInternalErrCode, err.Error()), nil
	}
	return &ipcv1.Response{Kind: &ipcv1.Response_StatFile{
		StatFile: &ipcv1.StatFileResponse{
			Stat: &ipcv1.FileStat{
				SizeBytes: stat.Size,
				Mtime:     stat.MTime,
				Mode:      stat.Mode,
			},
		},
	}}, nil
}

func handleGlobSearch(req *ipcv1.GlobSearchRequest, browser *daemonBrowserMethods) (*ipcv1.Response, error) {
	files, err := browser.GlobSearch(req.GetPatterns(), req.GetLimit(), req.GetAllowHidden())
	if err != nil {
		return errResponse(daemonInternalErrCode, err.Error()), nil
	}
	resFiles := make([]*ipcv1.FileResult, len(files))
	for i, f := range files {
		resFiles[i] = &ipcv1.FileResult{
			Path:      f.Path,
			Tags:      f.Tags,
			Metadata:  f.Metadata,
			Score:     f.Score,
			Mtime:     f.MTime,
			SizeBytes: f.Size,
		}
	}
	return &ipcv1.Response{Kind: &ipcv1.Response_GlobSearch{
		GlobSearch: &ipcv1.GlobSearchResponse{Files: resFiles},
	}}, nil
}

func handleRenameFile(req *ipcv1.RenameFileRequest, browser *daemonBrowserMethods) (*ipcv1.Response, error) {
	newPath, err := browser.RenameFile(req.GetPath(), req.GetNewName())
	if err != nil {
		return errResponse(daemonInternalErrCode, err.Error()), nil
	}
	return &ipcv1.Response{Kind: &ipcv1.Response_RenameFile{
		RenameFile: &ipcv1.RenameFileResponse{NewPath: newPath},
	}}, nil
}

func handleDeleteFile(req *ipcv1.DeleteFileRequest, browser *daemonBrowserMethods) (*ipcv1.Response, error) {
	if err := browser.DeleteFile(req.GetPath()); err != nil {
		return errResponse(daemonInternalErrCode, err.Error()), nil
	}
	return &ipcv1.Response{Kind: &ipcv1.Response_DeleteFile{
		DeleteFile: &ipcv1.DeleteFileResponse{},
	}}, nil
}

func handleChmodFile(req *ipcv1.ChmodFileRequest, browser *daemonBrowserMethods) (*ipcv1.Response, error) {
	if err := browser.ChmodFile(req.GetPath(), req.GetMode()); err != nil {
		return errResponse(daemonInternalErrCode, err.Error()), nil
	}
	return &ipcv1.Response{Kind: &ipcv1.Response_ChmodFile{
		ChmodFile: &ipcv1.ChmodFileResponse{},
	}}, nil
}

func handleListPlaces(_ *ipcv1.ListPlacesRequest, browser *daemonBrowserMethods) (*ipcv1.Response, error) {
	places, err := browser.ListPlaces()
	if err != nil {
		return errResponse(daemonInternalErrCode, err.Error()), nil
	}
	resPlaces := make([]*ipcv1.PlaceEntry, len(places))
	for i, p := range places {
		resPlaces[i] = &ipcv1.PlaceEntry{
			Name: p.Name,
			Path: p.Path,
		}
	}
	return &ipcv1.Response{Kind: &ipcv1.Response_ListPlaces{
		ListPlaces: &ipcv1.ListPlacesResponse{Places: resPlaces},
	}}, nil
}
