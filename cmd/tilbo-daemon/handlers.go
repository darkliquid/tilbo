package main

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/darkliquid/tilbo/internal/graph"
	"github.com/darkliquid/tilbo/internal/index"
	ipcv1 "github.com/darkliquid/tilbo/internal/ipc/gen/tilbo/ipc/v1"
	"github.com/darkliquid/tilbo/internal/xattr"
)

// errResponse wraps an error as an IPC ErrorResponse.
func errResponse(code uint32, msg string) *ipcv1.Response {
	return &ipcv1.Response{Kind: &ipcv1.Response_Error{
		Error: &ipcv1.ErrorResponse{Code: code, Message: msg},
	}}
}

// handleSearch executes a Search IPC request against the index.
func handleSearch(ctx context.Context, req *ipcv1.SearchRequest, idx *index.DB) (*ipcv1.Response, error) {
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

	results, total, err := idx.Search(ctx, params)
	if err != nil {
		return errResponse(3, fmt.Sprintf("search failed: %v", err)), nil
	}

	files := make([]*ipcv1.FileResult, 0, len(results))
	for _, r := range results {
		meta := make(map[string]string, len(r.Metadata))
		for k, v := range r.Metadata {
			meta[k] = v
		}
		files = append(files, &ipcv1.FileResult{
			Path:      r.Path,
			Tags:      r.Tags,
			Metadata:  meta,
			Mtime:     r.Mtime,
			SizeBytes: r.SizeBytes,
		})
	}

	return &ipcv1.Response{Kind: &ipcv1.Response_Search{
		Search: &ipcv1.SearchResponse{
			Files: files,
			Total: uint32(total),
		},
	}}, nil
}

// handleTag executes an Add/Remove/Set tag IPC request.
func handleTag(
	ctx context.Context,
	req *ipcv1.TagRequest,
	idx *index.DB,
	tags *xattr.Service,
	g *graph.Graph,
) (*ipcv1.Response, error) {
	opStr := map[ipcv1.TagOperation]string{
		ipcv1.TagOperation_TAG_OPERATION_ADD:    "add",
		ipcv1.TagOperation_TAG_OPERATION_REMOVE: "remove",
		ipcv1.TagOperation_TAG_OPERATION_SET:    "set",
	}[req.GetOperation()]
	if opStr == "" {
		return errResponse(3, "invalid tag operation"), nil
	}

	pathsOK := make([]string, 0)
	pathsErr := make([]string, 0)
	errs := make(map[string]string)

	for _, path := range req.GetPaths() {
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
		return errResponse(3, fmt.Sprintf("metadata query failed: %v", err)), nil
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
	fileID, err := idx.GetFileIDByPath(ctx, req.GetPath())
	if err != nil {
		return errResponse(1, fmt.Sprintf("file not in index: %s", req.GetPath())), nil
	}

	if req.GetValue() == "" {
		if err := idx.DeleteMeta(ctx, req.GetPath(), req.GetKey()); err != nil {
			return errResponse(3, fmt.Sprintf("delete meta failed: %v", err)), nil
		}
	} else {
		if err := idx.UpsertMeta(ctx, fileID, req.GetKey(), req.GetValue(), "user"); err != nil {
			return errResponse(3, fmt.Sprintf("set meta failed: %v", err)), nil
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
		return errResponse(3, fmt.Sprintf("list tags failed: %v", err)), nil
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
