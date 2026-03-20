package main

import (
	"bufio"
	"context"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"maps"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/google/uuid"

	"github.com/darkliquid/tilbo/internal/browser"
	"github.com/darkliquid/tilbo/internal/config"
	"github.com/darkliquid/tilbo/internal/desktopfile"
	"github.com/darkliquid/tilbo/internal/extension"
	"github.com/darkliquid/tilbo/internal/graph"
	"github.com/darkliquid/tilbo/internal/index"
	ipcv1 "github.com/darkliquid/tilbo/internal/ipc/gen/tilbo/ipc/v1"
	"github.com/darkliquid/tilbo/internal/thumbnail"
	"github.com/darkliquid/tilbo/internal/trash"
	"github.com/darkliquid/tilbo/internal/xattr"
)

const (
	// mountsMinFields is the minimum number of whitespace-delimited fields
	// expected per line in /proc/mounts (device, mountpoint, fstype).
	mountsMinFields = 3
	// defaultGlobLimit caps the number of results returned by GlobSearch when
	// the caller does not specify a limit, preventing unbounded memory usage
	// on broad patterns.
	defaultGlobLimit = 1000
	// defaultPlacesCapacity is the initial slice capacity for ListPlaces,
	// sized for the three standard XDG dirs plus a few extras.
	defaultPlacesCapacity = 6
)

// mimeToIconName maps a MIME type string to an XDG icon theme name suitable
// for display in the Quickshell GUI. The mapping follows freedesktop.org icon
// naming conventions, falling back to broad category icons (e.g. "image-x-generic")
// when no exact match exists.
func mimeToIconName(mime string) string {
	switch {
	case mime == "inode/directory":
		return "inode-directory"
	case strings.HasPrefix(mime, "image/"):
		return "image-x-generic"
	case strings.HasPrefix(mime, "video/"):
		return "video-x-generic"
	case strings.HasPrefix(mime, "audio/"):
		return "audio-x-generic"
	case strings.HasPrefix(mime, "text/"):
		return "text-x-generic"
	case mime == "application/pdf":
		return "application-pdf"
	case mime == "application/zip" || mime == "application/x-tar" || mime == "application/x-gzip" || mime == "application/x-bzip2" || mime == "application/x-xz":
		return "application-x-archive"
	case strings.HasPrefix(mime, "application/"):
		return "application-x-executable"
	default:
		return "application-x-generic"
	}
}

// daemonBrowserMethods implements browser.Methods for the daemon process.
// Its methods are exposed via the uisocket JSON-RPC server so the Quickshell
// frontend can drive all file-manager operations without a separate browser
// runtime. Each method validates its inputs, delegates to the appropriate
// subsystem, and returns GUI-friendly result types from the browser package.
type daemonBrowserMethods struct {
	idx          *index.DB        // SQLite full-text search index for file metadata and tags
	tags         *xattr.Service   // xattr-based tag storage (primary tag persistence layer)
	g            *graph.Graph     // tag relationship/dependency graph for hierarchical tags
	fuseMount    string           // path to the tilbo FUSE virtual mount, empty if inactive
	onFileTagged func(path string, added, removed []string) // broadcast callback for tag-change events to GUI clients
	cfg          *config.Config   // daemon configuration (browser prefs, pinned places, etc.)
	cfgPath      string           // filesystem path to the config file, used for persisting changes
	extRegistry  *extension.Registry // plugin registry providing badges and context-menu actions
	thumbGen     *thumbnail.Generator // on-demand thumbnail generator for file previews

	// clipboardPaths and clipboardIsMove implement an in-process clipboard for
	// copy/cut/paste operations. The clipboard lives in daemon memory rather than
	// the system clipboard because operations may involve index updates and trash
	// handling that require daemon coordination.
	clipboardPaths  []string
	clipboardIsMove bool
}

// validatePath cleans and validates a filesystem path for use in uisocket RPC
// handlers. It rejects empty paths, null bytes (which could truncate C strings
// in syscalls), and relative paths. All browser handler methods call this before
// touching the filesystem to ensure consistent, safe path handling.
func validatePath(path string) (string, error) {
	if path == "" {
		return "", errors.New("path must not be empty")
	}
	// Null bytes in paths can cause silent truncation in C-level syscalls,
	// which could lead to operating on unintended files.
	if strings.ContainsRune(path, 0) {
		return "", errors.New("path must not contain null bytes")
	}
	clean := filepath.Clean(path)
	if !filepath.IsAbs(clean) {
		return "", fmt.Errorf("path must be absolute: %q", path)
	}
	return clean, nil
}

// validateNewName checks that a filename component is safe to use as a
// destination name in rename or create operations. It prohibits empty names,
// null bytes, and path separators to ensure the name stays within the target
// directory (preventing directory traversal via crafted names like "../foo").
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
		var isDir bool
		entryPath := filepath.Join(clean, name)

		// Check for symlinks via the DirEntry type bits (from readdir, no extra syscall).
		// If it is a symlink, resolve the target for display in the GUI.
		isLink := de.Type()&os.ModeSymlink != 0
		linkTarget := ""
		if isLink {
			if target, err := os.Readlink(entryPath); err == nil {
				linkTarget = target
			}
		}

		// Use os.Stat (which follows symlinks) so that symlinks to directories
		// are reported as directories and file sizes reflect the target.
		// If stat fails (e.g. broken symlink), fall back to DirEntry.Info()
		// which uses lstat, so we still return whatever metadata is available.
		if info, statErr := os.Stat(entryPath); statErr == nil {
			size = info.Size()
			mtime = info.ModTime().Unix()
			mode = uint32(info.Mode().Perm())
			isDir = info.IsDir()
		} else if info, lstatErr := de.Info(); lstatErr == nil {
			size = info.Size()
			mtime = info.ModTime().Unix()
			mode = uint32(info.Mode().Perm())
			isDir = info.IsDir()
		}

		// Look up the MIME type from the index (not from the filesystem) so the
		// result is consistent with search results and avoids expensive libmagic
		// calls on every directory listing.
		var mimeType, iconName string
		if isDir {
			mimeType = "inode/directory"
			iconName = "folder" //nolint:goconst // simple string is fine
		} else {
			mimeType, _ = h.idx.GetFileMime(context.Background(), entryPath)
			if mimeType != "" {
				iconName = mimeToIconName(mimeType)
			} else {
				iconName = "application-x-generic"
			}
		}

		entries = append(entries, browser.DirEntry{
			Name:       name,
			Path:       entryPath,
			IsDir:      isDir,
			IsLink:     isLink,
			LinkTarget: linkTarget,
			Size:       size,
			MTime:      mtime,
			Mode:       mode,
			Hidden:     isHidden,
			MimeType:   mimeType,
			IconName:   iconName,
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

// Search executes an indexed search against the daemon's SQLite FTS index.
// It supports tag intersection/union, tag exclusion, key-value metadata filters,
// full-text search, pagination, and multi-field sorting. Results are enriched
// with symlink information from the live filesystem before being returned.
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
		// Deep-copy the metadata map so callers cannot mutate the index's
		// internal state.
		meta := make(map[string]string, len(r.Metadata))
		maps.Copy(meta, r.Metadata)

		// Use Lstat (not Stat) here because we want to detect whether the
		// indexed path itself is a symlink, not resolve through it.
		isLink := false
		linkTarget := ""
		if linfo, lstatErr := os.Lstat(r.Path); lstatErr == nil {
			isLink = linfo.Mode()&os.ModeSymlink != 0
			if isLink {
				if target, err := os.Readlink(r.Path); err == nil {
					linkTarget = target
				}
			}
		}

		files = append(files, browser.FileResult{
			Path:       r.Path,
			Tags:       r.Tags,
			Metadata:   meta,
			MTime:      r.Mtime,
			Size:       r.SizeBytes,
			IsLink:     isLink,
			LinkTarget: linkTarget,
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
		
		isLink := false
		linkTarget := ""
		if linfo, lstatErr := os.Lstat(match); lstatErr == nil {
			isLink = linfo.Mode()&os.ModeSymlink != 0
			if isLink {
				if target, err := os.Readlink(match); err == nil {
					linkTarget = target
				}
			}
		}

		files = append(files, browser.FileResult{
			Path:       match,
			Tags:       []string{},
			MTime:      info.ModTime().Unix(),
			Size:       info.Size(),
			IsLink:     isLink,
			LinkTarget: linkTarget,
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

// DeleteFile removes path (file or directory tree). When UseTrash is true in
// config, moves to trash instead of permanent deletion. The daemon's watcher
// handles index cleanup asynchronously.
func (h *daemonBrowserMethods) DeleteFile(path string) error {
	realPath, isVirtual, err := h.resolveForDelete(path)
	if err != nil {
		return err
	}
	if isVirtual {
		return errors.New("browser: cannot delete virtual directory")
	}

	useTrash := h.cfg != nil && h.cfg.Browser.UseTrash
	if useTrash {
		if err := trash.MoveToTrash(realPath); err != nil {
			return fmt.Errorf("trash: %w", err)
		}
	} else {
		if err := os.RemoveAll(realPath); err != nil {
			return fmt.Errorf("delete: %w", err)
		}
	}
	// Eagerly remove from index so the UI sees the change immediately.
	if err := h.idx.DeleteFile(context.Background(), realPath); err != nil {
		slog.Warn("browser: delete: remove index entry", "path", realPath, "err", err)
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

// ListPlaces returns the sidebar places: home, configured XDG dirs, pinned
// places (from config), and FUSE virtual dirs when the tilbo FUSE mount is active.
func (h *daemonBrowserMethods) ListPlaces() ([]browser.PlaceEntry, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return nil, fmt.Errorf("home dir: %w", err)
	}

	places := make([]browser.PlaceEntry, 0, defaultPlacesCapacity)
	for _, p := range []browser.PlaceEntry{
		{Name: "Home", Path: home, IconName: "user-home"},
		{Name: "Documents", Path: xdgDir("XDG_DOCUMENTS_DIR", filepath.Join(home, "Documents")), IconName: "folder-documents"},
		{Name: "Downloads", Path: xdgDir("XDG_DOWNLOAD_DIR", filepath.Join(home, "Downloads")), IconName: "folder-download"},
	} {
		if _, statErr := os.Stat(p.Path); statErr == nil {
			places = append(places, p)
		}
	}

	// Pinned places from config (icon from config, fallback to "folder")
	if h.cfg != nil {
		for _, pp := range h.cfg.Browser.PinnedPlaces {
			if pp.Path != "" && pp.Name != "" {
				icon := pp.IconName
				if icon == "" {
					icon = "folder"
				}
				places = append(places, browser.PlaceEntry{
					Name:     pp.Name,
					Path:     pp.Path,
					Pinned:   true,
					IconName: icon,
				})
			}
		}
	}

	if h.fuseMount != "" && isFUSEMounted(h.fuseMount) {
		places = append(places,
			browser.PlaceEntry{Name: "@recent", Path: h.fuseMount + "/@recent", IconName: "folder-recent"},
			browser.PlaceEntry{Name: "@untagged", Path: h.fuseMount + "/@untagged", IconName: "folder"},
			browser.PlaceEntry{Name: "@browse", Path: h.fuseMount + "/@browse", IconName: "folder-tag"},
		)
	}
	return places, nil
}

// PinPlace adds a pinned place to the config and saves it.
// iconName is an XDG icon theme name; if empty, defaults to "folder".
func (h *daemonBrowserMethods) PinPlace(name, path, iconName string) error {
	if h.cfg == nil {
		return errors.New("browser: config not available")
	}
	clean, err := validatePath(path)
	if err != nil {
		return err
	}
	if iconName == "" {
		iconName = "folder"
	}
	// Avoid duplicates; update icon if already pinned.
	for i, pp := range h.cfg.Browser.PinnedPlaces {
		if pp.Path == clean {
			h.cfg.Browser.PinnedPlaces[i].IconName = iconName
			return config.Save(h.cfgPath, *h.cfg)
		}
	}
	h.cfg.Browser.PinnedPlaces = append(h.cfg.Browser.PinnedPlaces, config.PinnedPlace{
		Name:     name,
		Path:     clean,
		IconName: iconName,
	})
	return config.Save(h.cfgPath, *h.cfg)
}

// UnpinPlace removes a pinned place by path from the config and saves it.
func (h *daemonBrowserMethods) UnpinPlace(path string) error {
	if h.cfg == nil {
		return errors.New("browser: config not available")
	}
	clean, err := validatePath(path)
	if err != nil {
		return err
	}
	filtered := h.cfg.Browser.PinnedPlaces[:0]
	for _, pp := range h.cfg.Browser.PinnedPlaces {
		if pp.Path != clean {
			filtered = append(filtered, pp)
		}
	}
	h.cfg.Browser.PinnedPlaces = filtered
	return config.Save(h.cfgPath, *h.cfg)
}

// resolveForDelete resolves a path for deletion/trash, following symlinks
// inside the FUSE mount. Returns (realPath, isVirtual, err).
func (h *daemonBrowserMethods) resolveForDelete(path string) (string, bool, error) {
	clean, err := validatePath(path)
	if err != nil {
		return "", false, err
	}
	if h.fuseMount == "" {
		return clean, false, nil
	}
	if !strings.HasPrefix(clean, h.fuseMount) {
		return clean, false, nil
	}
	// Path is inside FUSE mount
	rel, err := filepath.Rel(h.fuseMount, clean)
	if err != nil {
		return "", false, err
	}
	// Virtual directories start with @
	parts := strings.SplitN(rel, string(filepath.Separator), 2) //nolint:mnd // 2 parts is obvious
	if len(parts) > 0 && strings.HasPrefix(parts[0], "@") {
		return "", true, nil
	}
	// Follow symlink to real path
	realPath, err := filepath.EvalSymlinks(clean)
	if err != nil {
		return "", true, nil //nolint:nilerr // can't resolve = treat as virtual
	}
	return realPath, false, nil
}

// TrashFile moves path to the XDG trash.
func (h *daemonBrowserMethods) TrashFile(path string) error {
	realPath, isVirtual, err := h.resolveForDelete(path)
	if err != nil {
		return err
	}
	if isVirtual {
		return errors.New("browser: cannot trash virtual directory")
	}
	if err := trash.MoveToTrash(realPath); err != nil {
		return fmt.Errorf("trash file: %w", err)
	}
	// Eagerly remove from index
	if err := h.idx.DeleteFile(context.Background(), realPath); err != nil {
		slog.Warn("browser: trash: remove index entry", "path", realPath, "err", err)
	}
	return nil
}

// ListTrash returns all entries in the home trash.
func (h *daemonBrowserMethods) ListTrash() ([]browser.TrashEntry, error) {
	entries, err := trash.ListTrash()
	if err != nil {
		return nil, err
	}
	result := make([]browser.TrashEntry, 0, len(entries))
	for _, e := range entries {
		result = append(result, browser.TrashEntry{
			Name:         e.Name,
			OriginalPath: e.OriginalPath,
			DeletionDate: e.DeletionDate,
			SizeBytes:    e.SizeBytes,
		})
	}
	return result, nil
}

// RestoreTrash moves a named trash entry back to its original location.
func (h *daemonBrowserMethods) RestoreTrash(trashName string) error {
	return trash.RestoreFromTrash(trashName)
}

// EmptyTrash permanently removes all entries from the home trash.
func (h *daemonBrowserMethods) EmptyTrash() error {
	return trash.EmptyTrash()
}

// ListAppsForFile returns installed applications that can open the file.
func (h *daemonBrowserMethods) ListAppsForFile(path string) ([]browser.AppEntry, error) {
	clean, err := validatePath(path)
	if err != nil {
		return nil, err
	}
	mime, _ := h.idx.GetFileMime(context.Background(), clean)
	if mime == "" {
		return nil, nil
	}
	apps := desktopfile.FindAppsForMime(mime)
	result := make([]browser.AppEntry, 0, len(apps))
	for _, a := range apps {
		result = append(result, browser.AppEntry{
			ID:       a.ID,
			Name:     a.Name,
			IconName: a.Icon,
		})
	}
	return result, nil
}

// OpenWithApp launches an application (by ID) to open path.
func (h *daemonBrowserMethods) OpenWithApp(path, appID string) error {
	clean, err := validatePath(path)
	if err != nil {
		return err
	}
	app := desktopfile.FindAppByID(appID)
	if app == nil {
		return fmt.Errorf("browser: app %q not found", appID)
	}
	return desktopfile.LaunchApp(*app, clean)
}

// GetBrowserConfig returns the browser configuration from daemon config.
//
//nolint:unparam // required by interface
func (h *daemonBrowserMethods) GetBrowserConfig() (browser.BrowserConfig, error) {
	if h.cfg == nil {
		return browser.BrowserConfig{UseTrash: true, Keybindings: map[string]string{}}, nil
	}
	kb := h.cfg.Browser.Keybindings
	if kb == nil {
		kb = map[string]string{}
	}
	return browser.BrowserConfig{
		Keybindings:      kb,
		UseTrash:         h.cfg.Browser.UseTrash,
		InlineThumbnails: h.cfg.Browser.InlineThumbnails,
	}, nil
}

// GetFileBadges returns badge icon names for path from registered extensions.
func (h *daemonBrowserMethods) GetFileBadges(path string) ([]string, error) {
	clean, err := validatePath(path)
	if err != nil {
		return nil, err
	}
	if h.extRegistry == nil {
		return nil, nil
	}
	mime, _ := h.idx.GetFileMime(context.Background(), clean)
	badges := h.extRegistry.BadgesFor(context.Background(), clean, mime, nil)
	return badges, nil
}

// GetFileActions returns context menu actions for path from registered extensions.
func (h *daemonBrowserMethods) GetFileActions(path string) ([]browser.FileAction, error) {
	clean, err := validatePath(path)
	if err != nil {
		return nil, err
	}
	if h.extRegistry == nil {
		return nil, nil
	}
	info, statErr := os.Stat(clean)
	isDir := statErr == nil && info.IsDir()
	extActions := h.extRegistry.ActionsFor(context.Background(), clean, isDir)
	result := make([]browser.FileAction, 0, len(extActions))
	for _, a := range extActions {
		result = append(result, browser.FileAction{ID: a.ID, Label: a.Label})
	}
	return result, nil
}

// RunFileAction executes an extension action by ID for path.
func (h *daemonBrowserMethods) RunFileAction(path, actionID string) error {
	clean, err := validatePath(path)
	if err != nil {
		return err
	}
	if h.extRegistry == nil {
		return nil
	}
	return h.extRegistry.RunAction(context.Background(), clean, actionID)
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

// GetThumbnail returns a thumbnail for the file at path.
func (h *daemonBrowserMethods) GetThumbnail(path string, size int) (browser.ThumbnailResult, error) {
	clean, err := validatePath(path)
	if err != nil {
		return browser.ThumbnailResult{}, err
	}

	if h.thumbGen == nil {
		return browser.ThumbnailResult{}, errors.New("thumbnail generation is not available")
	}

	// Determine MIME type for the file.
	mime, _ := h.idx.GetFileMime(context.Background(), clean)
	if mime == "" {
		return browser.ThumbnailResult{}, errors.New("cannot determine MIME type for file")
	}

	if !thumbnail.CanThumbnail(mime) {
		return browser.ThumbnailResult{}, fmt.Errorf("MIME type %q is not thumbnailable", mime)
	}

	sz := thumbnail.Normal
	if size == 1 {
		sz = thumbnail.Large
	}

	res, err := h.thumbGen.GetOrGenerate(context.Background(), clean, mime, sz)
	if err != nil {
		return browser.ThumbnailResult{}, fmt.Errorf("generate thumbnail: %w", err)
	}

	return browser.ThumbnailResult{
		Path:   res.Path,
		Width:  res.Width,
		Height: res.Height,
	}, nil
}

// Copy sets the current clipboard state.
func (h *daemonBrowserMethods) Copy(paths []string, isMove bool) error {
	var cleaned []string
	for _, p := range paths {
		c, err := validatePath(p)
		if err != nil {
			return err
		}
		cleaned = append(cleaned, c)
	}
	h.clipboardPaths = cleaned
	h.clipboardIsMove = isMove
	return nil
}

// Paste executes the current clipboard operation (Copy/Cut) into the destination.
func (h *daemonBrowserMethods) Paste(dest string) ([]string, error) {
	if len(h.clipboardPaths) == 0 {
		return nil, nil
	}

	cleanDest, err := validatePath(dest)
	if err != nil {
		return nil, err
	}

	var newPaths []string
	for _, src := range h.clipboardPaths {
		base := filepath.Base(src)
		dst := filepath.Join(cleanDest, base)

		if h.clipboardIsMove {
			if err := os.Rename(src, dst); err != nil {
				return newPaths, fmt.Errorf("move %q to %q: %w", src, dst, err)
			}
		} else {
			if err := copyRecursive(src, dst); err != nil {
				return newPaths, fmt.Errorf("copy %q to %q: %w", src, dst, err)
			}
		}
		newPaths = append(newPaths, dst)
	}

	if h.clipboardIsMove {
		h.clipboardPaths = nil // Clear clipboard after move
	}

	return newPaths, nil
}

func copyRecursive(src, dst string) error {
	info, err := os.Stat(src)
	if err != nil {
		return err
	}

	if info.IsDir() {
		if err := os.MkdirAll(dst, info.Mode()); err != nil {
			return err
		}
		entries, err := os.ReadDir(src)
		if err != nil {
			return err
		}
		for _, entry := range entries {
			if err := copyRecursive(filepath.Join(src, entry.Name()), filepath.Join(dst, entry.Name())); err != nil {
				return err
			}
		}
		return nil
	}

	// File copy
	s, err := os.Open(src)
	if err != nil {
		return err
	}
	defer s.Close()

	d, err := os.OpenFile(dst, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, info.Mode())
	if err != nil {
		return err
	}
	defer d.Close()

	if _, err := io.Copy(d, s); err != nil {
		return err
	}

	return nil
}

// CreateFile creates an empty file in the destination.
func (h *daemonBrowserMethods) CreateFile(dest, name string) (string, error) {
	cleanDest, err := validatePath(dest)
	if err != nil {
		return "", err
	}
	if err := validateNewName(name); err != nil {
		return "", err
	}

	path := filepath.Join(cleanDest, name)
	f, err := os.OpenFile(path, os.O_CREATE|os.O_EXCL|os.O_WRONLY, 0o600)
	if err != nil {
		return "", fmt.Errorf("create file %q: %w", path, err)
	}
	if err := f.Close(); err != nil {
		return "", fmt.Errorf("close new file %q: %w", path, err)
	}

	return path, nil
}

// CreateDirectory creates a new directory in the destination.
func (h *daemonBrowserMethods) CreateDirectory(dest, name string) (string, error) {
	cleanDest, err := validatePath(dest)
	if err != nil {
		return "", err
	}
	if err := validateNewName(name); err != nil {
		return "", err
	}

	path := filepath.Join(cleanDest, name)
	if err := os.Mkdir(path, 0o700); err != nil {
		return "", fmt.Errorf("create directory %q: %w", path, err)
	}

	return path, nil
}

// ListMounts parses /proc/mounts and returns a list of user-relevant mount points.
func (h *daemonBrowserMethods) ListMounts() ([]browser.MountEntry, error) {
	f, err := os.Open("/proc/mounts")
	if err != nil {
		return nil, fmt.Errorf("open /proc/mounts: %w", err)
	}
	defer f.Close()

	var mounts []browser.MountEntry
	scanner := bufio.NewScanner(f)
	home, _ := os.UserHomeDir()

	for scanner.Scan() {
		line := scanner.Text()
		fields := strings.Fields(line)
		if len(fields) < mountsMinFields {
			continue
		}

		// fields[0]=device, fields[1]=mountpoint, fields[2]=fstype
		mp := fields[1]

		// Filter for user-relevant mounts:
		// 1. External media (/media, /run/media)
		// 2. Custom mounts in /mnt
		// 3. User's home dir if it's a separate mount (but already in places)
		// We'll stick to /media, /run/media, and /mnt for now.
		if !strings.HasPrefix(mp, "/media/") &&
			!strings.HasPrefix(mp, "/run/media/") &&
			!strings.HasPrefix(mp, "/mnt/") {
			continue
		}

		// Skip the root of /media or /mnt if they appear
		if mp == "/media" || mp == "/mnt" || mp == "/run/media" {
			continue
		}

		label := filepath.Base(mp)
		icon := "drive-removable-media"
		if strings.HasPrefix(mp, "/mnt") {
			icon = "drive-harddisk"
		}

		mounts = append(mounts, browser.MountEntry{
			Path:     mp,
			Label:    label,
			IconName: icon,
		})
	}

	// Also include home if it's not already covered (most distros don't mount home separately)
	// but we usually have it in places anyway.

	_ = home
	return mounts, nil
}

// PinSearch adds a search query to the pinned searches in config.
func (h *daemonBrowserMethods) PinSearch(name string, chips []string, iconName string) (browser.SavedSearch, error) {
	if h.cfg == nil {
		return browser.SavedSearch{}, errors.New("configuration not loaded")
	}

	if iconName == "" {
		iconName = "folder-saved-search"
	}

	id := uuid.New().String()
	s := config.SavedSearch{
		ID:       id,
		Name:     name,
		Chips:    chips,
		IconName: iconName,
	}

	h.cfg.Browser.SavedSearches = append(h.cfg.Browser.SavedSearches, s)
	if err := config.Save(h.cfgPath, *h.cfg); err != nil {
		return browser.SavedSearch{}, fmt.Errorf("save config: %w", err)
	}

	return browser.SavedSearch{
		ID:       s.ID,
		Name:     s.Name,
		Chips:    s.Chips,
		IconName: s.IconName,
	}, nil
}

// UnpinSearch removes a search query from pinned searches by ID.
func (h *daemonBrowserMethods) UnpinSearch(id string) error {
	if h.cfg == nil {
		return errors.New("configuration not loaded")
	}

	found := false
	var next []config.SavedSearch
	for _, s := range h.cfg.Browser.SavedSearches {
		if s.ID == id {
			found = true
			continue
		}
		next = append(next, s)
	}

	if !found {
		return fmt.Errorf("saved search %q not found", id)
	}

	h.cfg.Browser.SavedSearches = next
	return config.Save(h.cfgPath, *h.cfg)
}

// ListSavedSearches returns the pinned search queries from config.
//
//nolint:unparam // required by interface
func (h *daemonBrowserMethods) ListSavedSearches() ([]browser.SavedSearch, error) {
	if h.cfg == nil {
		return nil, nil
	}

	var res []browser.SavedSearch
	for _, s := range h.cfg.Browser.SavedSearches {
		res = append(res, browser.SavedSearch{
			ID:       s.ID,
			Name:     s.Name,
			Chips:    s.Chips,
			IconName: s.IconName,
		})
	}
	return res, nil
}
