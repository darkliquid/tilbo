package main

import (
	"bufio"
	"context"
	"errors"
	"fmt"
	"log/slog"
	"maps"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/darkliquid/tilbo/internal/browser"
	"github.com/darkliquid/tilbo/internal/graph"
	"github.com/darkliquid/tilbo/internal/index"
	ipcv1 "github.com/darkliquid/tilbo/internal/ipc/gen/tilbo/ipc/v1"
	"github.com/darkliquid/tilbo/internal/xattr"
)

const (
	mountsMinFields       = 3
	defaultGlobLimit      = 1000
	defaultPlacesCapacity = 6
)

// daemonBrowserMethods implements browser.Methods for the daemon process.
// Its methods are exposed via the uisocket JSON RPC server so the Quickshell
// frontend can drive all file-manager operations without a separate browser
// runtime.
type daemonBrowserMethods struct {
	idx          *index.DB
	tags         *xattr.Service
	g            *graph.Graph
	fuseMount    string
	onFileTagged func(path string, added, removed []string)
}

// validatePath cleans and validates a filesystem path for use in uisocket RPC
// handlers.  It returns the cleaned absolute path or an error.
func validatePath(path string) (string, error) {
	if path == "" {
		return "", errors.New("path must not be empty")
	}
	if strings.ContainsRune(path, 0) {
		return "", errors.New("path must not contain null bytes")
	}
	clean := filepath.Clean(path)
	if !filepath.IsAbs(clean) {
		return "", fmt.Errorf("path must be absolute: %q", path)
	}
	return clean, nil
}

// validateNewName checks that a filename component is safe to use for rename.
func validateNewName(name string) error {
	if name == "" {
		return errors.New("name must not be empty")
	}
	if strings.ContainsRune(name, 0) {
		return errors.New("name must not contain null bytes")
	}
	if strings.ContainsRune(name, '/') {
		return errors.New("name must not contain path separator")
	}
	return nil
}

// ListDirectory lists path, optionally including hidden (dot-prefixed) entries.
// Stat is called per entry via DirEntry.Info() so Size, MTime, and Mode are
// populated in one pass without a separate syscall per file.
func (h *daemonBrowserMethods) ListDirectory(path string, hidden bool) ([]browser.DirEntry, error) {
	clean, err := validatePath(path)
	if err != nil {
		return nil, err
	}

	des, err := os.ReadDir(clean)
	if err != nil {
		return nil, err
	}

	entries := make([]browser.DirEntry, 0, len(des))
	for _, de := range des {
		name := de.Name()
		isHidden := name != "" && name[0] == '.'
		if !hidden && isHidden {
			continue
		}

		var size, mtime int64
		var mode uint32
		if info, statErr := de.Info(); statErr == nil {
			size = info.Size()
			mtime = info.ModTime().Unix()
			mode = uint32(info.Mode().Perm())
		}

		entries = append(entries, browser.DirEntry{
			Name:   name,
			Path:   filepath.Join(clean, name),
			IsDir:  de.IsDir(),
			Size:   size,
			MTime:  mtime,
			Mode:   mode,
			Hidden: isHidden,
		})
	}
	return entries, nil
}

// StatFile returns size, mtime, and permission bits for a single path.
func (h *daemonBrowserMethods) StatFile(path string) (browser.FileStat, error) {
	clean, err := validatePath(path)
	if err != nil {
		return browser.FileStat{}, err
	}
	info, err := os.Stat(clean)
	if err != nil {
		return browser.FileStat{}, err
	}
	return browser.FileStat{
		Size:  info.Size(),
		MTime: info.ModTime().Unix(),
		Mode:  uint32(info.Mode().Perm()),
	}, nil
}

// Search executes an indexed search against the daemon index.
func (h *daemonBrowserMethods) Search(
	tags []string,
	tagsAny bool,
	tagExclude []string,
	metaFilters map[string]string,
	ftsQuery string,
	limit, offset uint32,
	sortBy []string,
) ([]browser.FileResult, uint32, error) {
	results, total, err := h.idx.Search(context.Background(), index.SearchParams{
		Tags:        tags,
		TagsAny:     tagsAny,
		TagExclude:  tagExclude,
		MetaFilters: metaFilters,
		FTSQuery:    ftsQuery,
		Limit:       limit,
		Offset:      offset,
		SortBy:      sortBy,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("search: %w", err)
	}

	files := make([]browser.FileResult, 0, len(results))
	for _, r := range results {
		meta := make(map[string]string, len(r.Metadata))
		maps.Copy(meta, r.Metadata)
		files = append(files, browser.FileResult{
			Path:     r.Path,
			Tags:     r.Tags,
			Metadata: meta,
			MTime:    r.Mtime,
			Size:     r.SizeBytes,
		})
	}
	return files, saturatingUint32FromInt(total), nil
}

// GlobSearch executes a local filesystem glob search (no index required).
// patterns must be standard [filepath.Glob] patterns. Hidden files are excluded
// unless allowHidden is true.
func (h *daemonBrowserMethods) GlobSearch(
	patterns []string,
	limit uint32,
	allowHidden bool,
) ([]browser.FileResult, error) {
	maxResults := int(limit)
	if maxResults <= 0 {
		maxResults = defaultGlobLimit
	}

	seen := make(map[string]struct{})
	files := make([]browser.FileResult, 0, maxResults)

	for _, pattern := range patterns {
		var err error
		files, err = globPattern(pattern, allowHidden, seen, files, maxResults)
		if err != nil {
			return nil, err
		}
		if len(files) >= maxResults {
			return files, nil
		}
	}
	return files, nil
}

// globPattern executes a single [filepath.Glob] pattern and appends matching
// results to files, stopping when maxResults is reached.
func globPattern(
	pattern string,
	allowHidden bool,
	seen map[string]struct{},
	files []browser.FileResult,
	maxResults int,
) ([]browser.FileResult, error) {
	if strings.ContainsRune(pattern, 0) {
		return nil, fmt.Errorf("pattern must not contain null bytes: %q", pattern)
	}
	matches, err := filepath.Glob(pattern)
	if err != nil {
		return nil, fmt.Errorf("glob %q: %w", pattern, err)
	}
	sort.Strings(matches)

	for _, match := range matches {
		if len(files) >= maxResults {
			return files, nil
		}
		if _, dup := seen[match]; dup {
			continue
		}
		seen[match] = struct{}{}

		base := filepath.Base(match)
		if !allowHidden && base != "" && base[0] == '.' {
			continue
		}

		info, statErr := os.Stat(match)
		if statErr != nil {
			continue
		}
		files = append(files, browser.FileResult{
			Path:  match,
			Tags:  []string{},
			MTime: info.ModTime().Unix(),
			Size:  info.Size(),
		})
	}
	return files, nil
}

// GetMetadata returns all metadata for a file (values and source map).
func (h *daemonBrowserMethods) GetMetadata(path string) (map[string]string, map[string]string, error) {
	clean, err := validatePath(path)
	if err != nil {
		return nil, nil, err
	}
	vals, sources, err := h.idx.GetFileMeta(context.Background(), clean)
	if err != nil {
		return nil, nil, fmt.Errorf("get metadata: %w", err)
	}
	if vals == nil {
		vals = map[string]string{}
	}
	if sources == nil {
		sources = map[string]string{}
	}
	return vals, sources, nil
}

// SetMetadata sets (or deletes when value is empty) a single metadata key.
func (h *daemonBrowserMethods) SetMetadata(path, key, value string) error {
	clean, err := validatePath(path)
	if err != nil {
		return err
	}
	ctx := context.Background()
	if value == "" {
		if err := h.idx.DeleteMeta(ctx, clean, key); err != nil {
			return fmt.Errorf("delete meta: %w", err)
		}
		return nil
	}
	fileID, err := h.idx.GetFileIDByPath(ctx, clean)
	if err != nil {
		return fmt.Errorf("file not in index: %s", clean)
	}
	if err := h.idx.UpsertMeta(ctx, fileID, key, value, "user"); err != nil {
		return fmt.Errorf("set meta: %w", err)
	}
	return nil
}

// ModifyTags applies an add/remove/set tag operation to one or more paths.
// Emits FileTagged events via the uisocket broadcast callback for each path
// that changes.
func (h *daemonBrowserMethods) ModifyTags(paths, tags []string, operation string) (browser.TagResult, error) {
	opEnum, ok := map[string]ipcv1.TagOperation{
		"add":    ipcv1.TagOperation_TAG_OPERATION_ADD,
		"remove": ipcv1.TagOperation_TAG_OPERATION_REMOVE,
		"set":    ipcv1.TagOperation_TAG_OPERATION_SET,
	}[operation]
	if !ok {
		return browser.TagResult{}, fmt.Errorf("invalid tag operation %q: want add, remove, or set", operation)
	}

	validPaths := make([]string, 0, len(paths))
	for _, p := range paths {
		clean, err := validatePath(p)
		if err != nil {
			return browser.TagResult{}, err
		}
		validPaths = append(validPaths, clean)
	}

	resp, err := handleTag(context.Background(), &ipcv1.TagRequest{
		Paths:     validPaths,
		Tags:      tags,
		Operation: opEnum,
	}, h.idx, h.tags, h.g, h.onFileTagged)
	if err != nil {
		return browser.TagResult{}, err
	}

	tagResp := resp.GetTag()
	return browser.TagResult{
		PathsOK:    tagResp.GetPathsOk(),
		PathsError: tagResp.GetPathsError(),
		Errors:     tagResp.GetErrors(),
	}, nil
}

// HydrateTags returns current tags for each of the given paths.
func (h *daemonBrowserMethods) HydrateTags(paths []string) ([]browser.PathTags, error) {
	validPaths := make([]string, 0, len(paths))
	for _, p := range paths {
		clean, err := validatePath(p)
		if err != nil {
			return nil, err
		}
		validPaths = append(validPaths, clean)
	}

	tagMap, err := h.idx.GetFileTagsBatch(context.Background(), validPaths)
	if err != nil {
		return nil, fmt.Errorf("hydrate tags: %w", err)
	}

	result := make([]browser.PathTags, 0, len(validPaths))
	for _, p := range validPaths {
		result = append(result, browser.PathTags{
			Path: p,
			Tags: append([]string(nil), tagMap[p]...),
		})
	}
	return result, nil
}

// ListTags returns all known tags, optionally filtered by prefix.
func (h *daemonBrowserMethods) ListTags(prefix string) ([]string, error) {
	all, err := h.idx.ListAllTags(context.Background())
	if err != nil {
		return nil, fmt.Errorf("list tags: %w", err)
	}
	if prefix == "" {
		return all, nil
	}
	filtered := make([]string, 0, len(all))
	for _, t := range all {
		if strings.HasPrefix(t, prefix) {
			filtered = append(filtered, t)
		}
	}
	return filtered, nil
}

// RenameFile renames path to a sibling with newName, returning the new absolute
// path. The daemon's filesystem watcher picks up the rename event and updates
// the index asynchronously.
func (h *daemonBrowserMethods) RenameFile(path, newName string) (string, error) {
	clean, err := validatePath(path)
	if err != nil {
		return "", err
	}
	if err := validateNewName(newName); err != nil {
		return "", err
	}

	newPath := filepath.Join(filepath.Dir(clean), newName)
	if err := os.Rename(clean, newPath); err != nil {
		return "", fmt.Errorf("rename: %w", err)
	}

	// Eagerly remove the old path from the index; the filesystem watcher will
	// sync the new path and emit signals once it picks up the rename event.
	if err := h.idx.DeleteFile(context.Background(), clean); err != nil {
		slog.Warn("browser: rename: remove old index entry", "path", clean, "err", err)
	}
	return newPath, nil
}

// DeleteFile removes path (file or directory tree). The daemon's watcher
// handles index cleanup asynchronously.
func (h *daemonBrowserMethods) DeleteFile(path string) error {
	clean, err := validatePath(path)
	if err != nil {
		return err
	}
	if err := os.RemoveAll(clean); err != nil {
		return fmt.Errorf("delete: %w", err)
	}
	// Eagerly remove from index so the UI sees the change immediately.
	if err := h.idx.DeleteFile(context.Background(), clean); err != nil {
		slog.Warn("browser: delete: remove index entry", "path", clean, "err", err)
	}
	return nil
}

// ChmodFile changes the permission bits of path.
func (h *daemonBrowserMethods) ChmodFile(path string, mode uint32) error {
	clean, err := validatePath(path)
	if err != nil {
		return err
	}
	if err := os.Chmod(clean, os.FileMode(mode)); err != nil {
		return fmt.Errorf("chmod: %w", err)
	}
	return nil
}

// ListPlaces returns the sidebar places: home, configured XDG dirs, and FUSE
// virtual dirs when the tilbo FUSE mount is active.
func (h *daemonBrowserMethods) ListPlaces() ([]browser.PlaceEntry, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return nil, fmt.Errorf("home dir: %w", err)
	}

	places := make([]browser.PlaceEntry, 0, defaultPlacesCapacity)
	for _, p := range []browser.PlaceEntry{
		{Name: "Home", Path: home},
		{Name: "Documents", Path: xdgDir("XDG_DOCUMENTS_DIR", filepath.Join(home, "Documents"))},
		{Name: "Downloads", Path: xdgDir("XDG_DOWNLOAD_DIR", filepath.Join(home, "Downloads"))},
	} {
		if _, statErr := os.Stat(p.Path); statErr == nil {
			places = append(places, p)
		}
	}

	if h.fuseMount != "" && isFUSEMounted(h.fuseMount) {
		places = append(places,
			browser.PlaceEntry{Name: "@recent", Path: h.fuseMount + "/@recent"},
			browser.PlaceEntry{Name: "@untagged", Path: h.fuseMount + "/@untagged"},
			browser.PlaceEntry{Name: "@browse", Path: h.fuseMount + "/@browse"},
		)
	}
	return places, nil
}

func xdgDir(envVar, fallback string) string {
	if v := os.Getenv(envVar); v != "" {
		return v
	}
	return fallback
}

func isFUSEMounted(mountPoint string) bool {
	f, err := os.Open("/proc/mounts")
	if err != nil {
		return false
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		fields := strings.Fields(scanner.Text())
		if len(fields) < mountsMinFields {
			continue
		}
		if fields[1] == mountPoint && strings.Contains(fields[2], "fuse.tilbo") {
			return true
		}
	}
	return false
}
