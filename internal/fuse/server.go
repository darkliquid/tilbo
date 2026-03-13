package fuse

import (
	"context"
	"hash/fnv"
	"log/slog"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/hanwen/go-fuse/v2/fs"
	"github.com/hanwen/go-fuse/v2/fuse"

	"github.com/darkliquid/tilbo/internal/graph"
	"github.com/darkliquid/tilbo/internal/index"
)

const (
	rootSpecialDirCount = 4

	// attrTimeoutLong is the kernel attribute/entry cache TTL for stable
	// virtual directory nodes (root, tag dirs, file symlinks). A long timeout
	// avoids repeated kernel LOOKUPs for the same path.
	attrTimeoutLong = 30 * time.Second

	// attrTimeoutFast is the entry TTL for ephemeral browse nodes (BrowseDir,
	// BrowseFilesDir). Shorter than attrTimeoutLong so newly added tags appear
	// promptly when navigating the @browse tree.
	attrTimeoutFast = 2 * time.Second

	// attrTimeoutEntry is the entry TTL for individual file symlinks within
	// virtual directories. One second allows quick re-validation without
	// hammering the daemon with constant LOOKUPs during directory traversal.
	attrTimeoutEntry = 1 * time.Second

	browseRelatedHops  = 3
	browseRelatedLimit = 100
	browseVecWeight    = 0.4

	searchLimitLarge = 10_000

	dirReadOnlyMode = 0o555
	symlinkMode     = 0o777

	// queryCacheTTL is how long Readdir/Lookup cache their database results.
	// Repeated kernel LOOKUP calls (e.g. from enrichMetadata's concurrent
	// Lstat workers) share a single query result instead of each re-querying.
	queryCacheTTL = 30 * time.Second
)

// stableInode returns a stable inode number for a real file path using FNV-64a.
// Collision handling is done by the inodeMap in Root.
func stableInode(realPath string) uint64 {
	h := fnv.New64a()
	_, _ = h.Write([]byte(realPath))
	ino := h.Sum64()
	if ino == 0 {
		ino = 1
	}
	return ino
}

// ─── tagCache ─────────────────────────────────────────────────────────────────

// tagCacheEntry is one cached result from a virtual directory query.
type tagCacheEntry struct {
	name     string // virtual entry name (deduplicated)
	realPath string // absolute path to the real file
	ino      uint64 // stable inode number
}

// tagCache caches directory query results so that concurrent Lookup calls
// (triggered by enrichMetadata's Lstat workers) share a single DB query
// instead of issuing one per entry.
type tagCache struct {
	mu      sync.RWMutex
	entries []tagCacheEntry
	byName  map[string]int // entry name → index in entries (O(1) Lookup)
	expiry  time.Time
}

// valid reports whether the cache holds fresh data.
// Must be called with mu held (at least read-locked).
func (c *tagCache) valid() bool {
	return c.byName != nil && time.Now().Before(c.expiry)
}

// fill populates the cache from raw query results.
// Must be called with mu write-locked.
func (c *tagCache) fill(results []index.SearchResult, allocIno func(string) uint64) {
	nameCounts := make(map[string]int, len(results))
	for _, r := range results {
		nameCounts[filepath.Base(r.Path)]++
	}
	seenCount := make(map[string]int, len(results))

	entries := make([]tagCacheEntry, 0, len(results))
	byName := make(map[string]int, len(results))
	for _, r := range results {
		n := entryName(r.Path, nameCounts, seenCount)
		idx := len(entries)
		entries = append(entries, tagCacheEntry{
			name:     n,
			realPath: r.Path,
			ino:      allocIno(r.Path),
		})
		byName[n] = idx
	}
	c.entries = entries
	c.byName = byName
	c.expiry = time.Now().Add(queryCacheTTL)
}

// invalidate clears the cache (e.g. after a mutation such as Rename).
func (c *tagCache) invalidate() {
	c.mu.Lock()
	c.byName = nil
	c.mu.Unlock()
}

// ─── Root ────────────────────────────────────────────────────────────────────

// Root is the FUSE root node mounted at ~/tags.
// It lists all known tags as virtual subdirectories.
type Root struct {
	fs.Inode

	idx *index.DB
	g   *graph.Graph

	// inodeMap resolves stable inode collisions: realPath → inode.
	mu      sync.Mutex
	inoMap  map[string]uint64
	inoUsed map[uint64]string
}

// NewRoot creates the root node for the FUSE filesystem.
func NewRoot(idx *index.DB, g *graph.Graph) *Root {
	return &Root{
		idx:     idx,
		g:       g,
		inoMap:  make(map[string]uint64),
		inoUsed: make(map[uint64]string),
	}
}

// allocInode returns a stable (collision-free) inode for realPath.
func (r *Root) allocInode(realPath string) uint64 {
	r.mu.Lock()
	defer r.mu.Unlock()
	if ino, ok := r.inoMap[realPath]; ok {
		return ino
	}
	ino := stableInode(realPath)
	// Linear probe on collision.
	var probe strings.Builder
	probe.WriteString(realPath)
	for {
		if existing, conflict := r.inoUsed[ino]; !conflict || existing == realPath {
			break
		}
		probe.WriteString("\x00")
		h := fnv.New64a()
		_, _ = h.Write([]byte(probe.String()))
		ino = h.Sum64()
		if ino == 0 {
			ino = 1
		}
	}
	r.inoMap[realPath] = ino
	r.inoUsed[ino] = realPath
	return ino
}

var _ fs.NodeReaddirer = (*Root)(nil)
var _ fs.NodeLookuper = (*Root)(nil)
var _ fs.NodeGetattrer = (*Root)(nil)
var _ fs.NodeUnlinker = (*Root)(nil)
var _ fs.NodeRmdirer = (*Root)(nil)

// Readdir lists all tag names from the index as virtual directory entries.
// Tag names containing +, comma, !, or % are percent-encoded so the kernel
// does not confuse them with path-grammar operators on lookup.
func (r *Root) Readdir(ctx context.Context) (fs.DirStream, syscall.Errno) {
	slog.DebugContext(ctx, "fuse: root.readdir: start")
	t0 := time.Now()
	tags, err := r.idx.ListAllTags(ctx)
	if err != nil {
		slog.WarnContext(ctx, "fuse: root.readdir: list tags failed", "err", err, "dur", time.Since(t0))
		return nil, syscall.EIO
	}
	entries := make([]fuse.DirEntry, 0, len(tags)+rootSpecialDirCount)
	for _, tag := range tags {
		entries = append(entries, fuse.DirEntry{
			Name: percentEncode(tag),
			Mode: syscall.S_IFDIR,
		})
	}
	// Built-in special directories.
	for _, name := range []string{"@recent", "@untagged", "@browse"} {
		entries = append(entries, fuse.DirEntry{Name: name, Mode: syscall.S_IFDIR})
	}
	slog.DebugContext(ctx, "fuse: root.readdir: done", "tags", len(tags), "dur", time.Since(t0))
	return fs.NewListDirStream(entries), 0
}

// Unlink returns EROFS: virtual tag directories cannot be removed via the filesystem.
func (r *Root) Unlink(_ context.Context, _ string) syscall.Errno { return syscall.EROFS }

// Rmdir returns EROFS: virtual tag directories cannot be removed via the filesystem.
func (r *Root) Rmdir(_ context.Context, _ string) syscall.Errno { return syscall.EROFS }

// Lookup resolves a name to a node. "@browse" returns the incremental tag
// browser; everything else is parsed as a tag expression and returns a TagDir.
func (r *Root) Lookup(ctx context.Context, name string, out *fuse.EntryOut) (*fs.Inode, syscall.Errno) {
	slog.DebugContext(ctx, "fuse: root.lookup: start", "name", name)
	if name == "@browse" {
		out.SetAttrTimeout(attrTimeoutLong)
		out.SetEntryTimeout(attrTimeoutFast)
		out.Mode = syscall.S_IFDIR | dirReadOnlyMode
		child := r.NewPersistentInode(ctx, &BrowseDir{root: r},
			fs.StableAttr{Mode: syscall.S_IFDIR})
		slog.DebugContext(ctx, "fuse: root.lookup: done (browse)", "name", name)
		return child, 0
	}

	expr, err := ParseExpr(name)
	if err != nil {
		slog.DebugContext(ctx, "fuse: root.lookup: invalid expr", "name", name, "err", err)
		return nil, syscall.ENOENT
	}

	out.SetAttrTimeout(attrTimeoutLong)
	out.SetEntryTimeout(attrTimeoutFast)
	out.Mode = syscall.S_IFDIR | dirReadOnlyMode

	child := r.NewPersistentInode(ctx, &TagDir{
		root: r,
		expr: expr,
		name: name,
	}, fs.StableAttr{Mode: syscall.S_IFDIR})
	slog.DebugContext(ctx, "fuse: root.lookup: done", "name", name)
	return child, 0
}

// Getattr returns attributes for the root directory.
func (r *Root) Getattr(_ context.Context, _ fs.FileHandle, out *fuse.AttrOut) syscall.Errno {
	out.Mode = syscall.S_IFDIR | dirReadOnlyMode
	out.SetTimeout(attrTimeoutLong)
	return 0
}

// ─── TagDir ───────────────────────────────────────────────────────────────────

// TagDir is a virtual directory node for one tag expression (e.g., "python+work").
// Its children are FileLink symlink nodes for each matching file.
type TagDir struct {
	fs.Inode

	root  *Root
	expr  *Expr
	name  string // original path component (for rename semantics)
	cache tagCache
}

var _ fs.NodeReaddirer = (*TagDir)(nil)
var _ fs.NodeLookuper = (*TagDir)(nil)
var _ fs.NodeGetattrer = (*TagDir)(nil)
var _ fs.NodeRenamer = (*TagDir)(nil)
var _ fs.NodeSetxattrer = (*TagDir)(nil)
var _ fs.NodeUnlinker = (*TagDir)(nil)
var _ fs.NodeRmdirer = (*TagDir)(nil)

// query executes the tag expression against the index and returns results.
func (d *TagDir) query(ctx context.Context) ([]index.SearchResult, error) {
	if d.expr.IsSimilar() {
		results := d.root.g.Related(ctx, d.expr.SeedPath, browseRelatedHops, browseRelatedLimit, 1.0, browseVecWeight)
		return graphToSearchResults(results), nil
	}

	params, err := d.expr.ToSearchParams(searchLimitLarge)
	if err != nil {
		return nil, err
	}
	results, _, err := d.root.idx.Search(ctx, params)
	return results, err
}

// warmCache ensures the query result cache is populated.
// It runs the database query at most once per queryCacheTTL window, regardless
// of how many concurrent Lookup calls arrive simultaneously.
func (d *TagDir) warmCache(ctx context.Context) error {
	d.cache.mu.RLock()
	valid := d.cache.valid()
	d.cache.mu.RUnlock()
	if valid {
		slog.DebugContext(ctx, "fuse: tagdir.warmCache: cache hit", "expr", d.name)
		return nil
	}

	slog.DebugContext(ctx, "fuse: tagdir.warmCache: cache miss, acquiring write lock", "expr", d.name)
	d.cache.mu.Lock()
	defer d.cache.mu.Unlock()
	if d.cache.valid() { // another goroutine won the race
		slog.DebugContext(ctx, "fuse: tagdir.warmCache: cache filled by other goroutine", "expr", d.name)
		return nil
	}

	slog.DebugContext(ctx, "fuse: tagdir.warmCache: querying db", "expr", d.name)
	t0 := time.Now()
	results, err := d.query(ctx)
	if err != nil {
		slog.WarnContext(ctx, "fuse: tagdir.warmCache: query failed", "expr", d.name, "err", err, "dur", time.Since(t0))
		return err
	}
	slog.DebugContext(
		ctx,
		"fuse: tagdir.warmCache: query done",
		"expr",
		d.name,
		"n",
		len(results),
		"dur",
		time.Since(t0),
	)
	d.cache.fill(results, d.root.allocInode)
	return nil
}

// Readdir returns the file entries for this virtual directory.
func (d *TagDir) Readdir(ctx context.Context) (fs.DirStream, syscall.Errno) {
	slog.DebugContext(ctx, "fuse: tagdir.readdir: start", "expr", d.name)
	t0 := time.Now()
	if err := d.warmCache(ctx); err != nil {
		slog.WarnContext(
			ctx,
			"fuse: tagdir.readdir: warmCache failed",
			"expr",
			d.name,
			"err",
			err,
			"dur",
			time.Since(t0),
		)
		return nil, syscall.EIO
	}

	d.cache.mu.RLock()
	defer d.cache.mu.RUnlock()
	entries := make([]fuse.DirEntry, 0, len(d.cache.entries))
	for _, e := range d.cache.entries {
		entries = append(entries, fuse.DirEntry{
			Name: e.name,
			Mode: syscall.S_IFLNK,
			Ino:  e.ino,
		})
	}
	slog.DebugContext(ctx, "fuse: tagdir.readdir: done", "expr", d.name, "n", len(entries), "dur", time.Since(t0))
	return fs.NewListDirStream(entries), 0
}

// Lookup finds a file by name within this virtual directory.
// Results are served from the shared cache to avoid a full DB query per call.
func (d *TagDir) Lookup(ctx context.Context, name string, out *fuse.EntryOut) (*fs.Inode, syscall.Errno) {
	slog.DebugContext(ctx, "fuse: tagdir.lookup: start", "expr", d.name, "name", name)
	t0 := time.Now()
	if err := d.warmCache(ctx); err != nil {
		slog.WarnContext(
			ctx,
			"fuse: tagdir.lookup: warmCache failed",
			"expr",
			d.name,
			"name",
			name,
			"err",
			err,
			"dur",
			time.Since(t0),
		)
		return nil, syscall.EIO
	}

	d.cache.mu.RLock()
	idx, ok := d.cache.byName[name]
	var entry tagCacheEntry
	if ok {
		entry = d.cache.entries[idx]
	}
	d.cache.mu.RUnlock()

	if !ok {
		slog.DebugContext(
			ctx,
			"fuse: tagdir.lookup: not found in cache",
			"expr",
			d.name,
			"name",
			name,
			"dur",
			time.Since(t0),
		)
		return nil, syscall.ENOENT
	}

	// Verify real file still exists.
	if _, err := os.Lstat(entry.realPath); err != nil {
		slog.DebugContext(
			ctx,
			"fuse: tagdir.lookup: real file missing",
			"expr",
			d.name,
			"name",
			name,
			"realPath",
			entry.realPath,
			"err",
			err,
		)
		return nil, syscall.ENOENT
	}

	out.Ino = entry.ino
	out.SetAttrTimeout(attrTimeoutLong)
	out.SetEntryTimeout(attrTimeoutEntry)
	out.Mode = syscall.S_IFLNK | symlinkMode

	child := d.NewPersistentInode(ctx, &FileLink{
		realPath: entry.realPath,
	}, fs.StableAttr{
		Mode: syscall.S_IFLNK,
		Ino:  entry.ino,
	})
	slog.DebugContext(
		ctx,
		"fuse: tagdir.lookup: done",
		"expr",
		d.name,
		"name",
		name,
		"realPath",
		entry.realPath,
		"dur",
		time.Since(t0),
	)
	return child, 0
}

// Getattr returns directory attributes.
func (d *TagDir) Getattr(_ context.Context, _ fs.FileHandle, out *fuse.AttrOut) syscall.Errno {
	out.Mode = syscall.S_IFDIR | dirReadOnlyMode
	out.SetTimeout(attrTimeoutFast)
	return 0
}

// Rename handles cross-directory moves: retag semantics.
// Source and destination must both be TagDir nodes; file is retagged accordingly.
func (d *TagDir) Rename(
	ctx context.Context,
	name string,
	newParent fs.InodeEmbedder,
	newName string,
	_ uint32,
) syscall.Errno {
	dest, ok := newParent.(*TagDir)
	if !ok {
		// Moving out of the FUSE mount — not supported.
		return syscall.EXDEV
	}

	// Find the real path for the source entry via the cache or a fresh query.
	if err := d.warmCache(ctx); err != nil {
		return syscall.EIO
	}

	d.cache.mu.RLock()
	idx, ok := d.cache.byName[name]
	var realPath string
	if ok {
		realPath = d.cache.entries[idx].realPath
	}
	d.cache.mu.RUnlock()

	if realPath == "" {
		return syscall.ENOENT
	}

	// Same directory: no-op per design.
	if d.name == dest.name {
		_ = newName // suppress unused warning
		return 0
	}

	// Source expr must be a simple tag expression (not a special dir).
	srcTags := simpleTagsFromExpr(d.expr)
	dstTags := simpleTagsFromExpr(dest.expr)
	if srcTags == nil || dstTags == nil {
		// Can't determine retag semantics for special expressions.
		return syscall.EPERM
	}

	idxDB := d.root.idx
	for _, t := range srcTags {
		if err := idxDB.ModifyFileTags(ctx, realPath, []string{t}, "remove"); err != nil {
			slog.WarnContext(ctx, "fuse: rename: remove tag failed", "path", realPath, "tag", t, "err", err)
		}
	}
	for _, t := range dstTags {
		if err := idxDB.ModifyFileTags(ctx, realPath, []string{t}, "add"); err != nil {
			slog.WarnContext(ctx, "fuse: rename: add tag failed", "path", realPath, "tag", t, "err", err)
		}
	}

	// Invalidate both caches so Readdir reflects the retag immediately.
	d.cache.invalidate()
	dest.cache.invalidate()

	return 0
}

// Unlink returns EROFS: removing entries from a virtual tag directory is not supported.
// Without this explicit implementation the FUSE default would silently succeed
// (removing the inode from the kernel cache) while leaving the real file and index
// untouched, causing the entry to reappear on the next readdir.
func (d *TagDir) Unlink(_ context.Context, _ string) syscall.Errno { return syscall.EROFS }

// Rmdir returns EROFS for the same reason as Unlink.
func (d *TagDir) Rmdir(_ context.Context, _ string) syscall.Errno { return syscall.EROFS }

// Setxattr forwards an xattr write to the real file of a named child.
// This is called when the kernel writes an xattr on a path inside this directory.
func (d *TagDir) Setxattr(ctx context.Context, attr string, data []byte, flags uint32) syscall.Errno {
	_ = ctx
	_ = attr
	_ = data
	_ = flags
	// Setxattr on a directory itself is not meaningful here.
	return syscall.EPERM
}

// ─── FileLink ─────────────────────────────────────────────────────────────────

// FileLink is a symlink node pointing to a real file path.
type FileLink struct {
	fs.Inode

	realPath string
}

var _ fs.NodeReadlinker = (*FileLink)(nil)
var _ fs.NodeGetattrer = (*FileLink)(nil)
var _ fs.NodeSetxattrer = (*FileLink)(nil)

// Readlink returns the real absolute path this symlink points to.
func (l *FileLink) Readlink(_ context.Context) ([]byte, syscall.Errno) {
	return []byte(l.realPath), 0
}

// Getattr returns symlink attributes, stat-ing the real file for size and mtime.
func (l *FileLink) Getattr(ctx context.Context, _ fs.FileHandle, out *fuse.AttrOut) syscall.Errno {
	slog.DebugContext(ctx, "fuse: filelink.getattr: start", "realPath", l.realPath)
	t0 := time.Now()
	st, err := os.Lstat(l.realPath)
	if err != nil {
		slog.DebugContext(
			ctx,
			"fuse: filelink.getattr: lstat failed",
			"realPath",
			l.realPath,
			"err",
			err,
			"dur",
			time.Since(t0),
		)
		return syscall.ENOENT
	}
	out.Mode = syscall.S_IFLNK | symlinkMode
	if st.Size() > 0 {
		// #nosec G115 -- negative values are rejected by the guard above.
		out.Size = uint64(st.Size())
	}
	mt := st.ModTime()
	// #nosec G115 -- Unix() is non-negative for any real file; Nanosecond() is 0–999999999.
	out.Mtime = uint64(mt.Unix())
	ns := mt.Nanosecond()
	ns = max(ns, 0)
	ns = min(ns, int(time.Second/time.Nanosecond)-1)
	// #nosec G115 -- mt.Nanosecond() is clamped to the valid 0..999999999 range.
	out.Mtimensec = uint32(ns)
	out.SetTimeout(attrTimeoutLong)
	slog.DebugContext(
		ctx,
		"fuse: filelink.getattr: done",
		"realPath",
		l.realPath,
		"size",
		out.Size,
		"dur",
		time.Since(t0),
	)
	return 0
}

// Setxattr writes an extended attribute to the real file.
func (l *FileLink) Setxattr(_ context.Context, attr string, data []byte, flags uint32) syscall.Errno {
	// Use raw syscall to write xattr to the real file.
	// flags: 1=XATTR_CREATE (fail if exists), 2=XATTR_REPLACE (fail if not exists), 0=upsert.
	if err := syscall.Setxattr(l.realPath, attr, data, int(flags)); err != nil {
		return fs.ToErrno(err)
	}
	return 0
}

// ─── BrowseDir ────────────────────────────────────────────────────────────────

// BrowseDir is a virtual directory for incremental tag-AND browsing, rooted at
// ~/tags/@browse/. Each subdirectory appends one tag (or !tag) to the
// accumulated query. A fixed "@files" child shows the matching files.
//
// Navigating deeper never requires knowing the full query in advance —
// each level lists only tags that co-occur with the current accumulated set.
type BrowseDir struct {
	fs.Inode

	root        *Root
	includeTags []string // tags all matching files must have
	excludeTags []string // tags all matching files must NOT have
}

var _ fs.NodeReaddirer = (*BrowseDir)(nil)
var _ fs.NodeLookuper = (*BrowseDir)(nil)
var _ fs.NodeGetattrer = (*BrowseDir)(nil)
var _ fs.NodeUnlinker = (*BrowseDir)(nil)
var _ fs.NodeRmdirer = (*BrowseDir)(nil)

// Readdir lists co-occurring tags as subdirectories and "@files" as a fixed entry.
func (d *BrowseDir) Readdir(ctx context.Context) (fs.DirStream, syscall.Errno) {
	slog.DebugContext(ctx, "fuse: browsedir.readdir: start", "include", d.includeTags, "exclude", d.excludeTags)
	t0 := time.Now()
	tags, err := d.root.idx.ListCooccurringTags(ctx, d.includeTags, d.excludeTags)
	if err != nil {
		slog.WarnContext(ctx, "fuse: browsedir.readdir: failed", "err", err, "dur", time.Since(t0))
		return nil, syscall.EIO
	}

	entries := make([]fuse.DirEntry, 0, len(tags)+1)
	entries = append(entries, fuse.DirEntry{Name: "@files", Mode: syscall.S_IFDIR})
	for _, tag := range tags {
		entries = append(entries, fuse.DirEntry{
			Name: percentEncode(tag),
			Mode: syscall.S_IFDIR,
		})
	}
	slog.DebugContext(
		ctx,
		"fuse: browsedir.readdir: done",
		"include",
		d.includeTags,
		"exclude",
		d.excludeTags,
		"tags",
		len(tags),
		"dur",
		time.Since(t0),
	)
	return fs.NewListDirStream(entries), 0
}

// Lookup handles three name forms:
//   - "@files"  → BrowseFilesDir listing matching files
//   - "!<tag>"  → new BrowseDir with <tag> added to excludeTags
//   - "<tag>"   → new BrowseDir with <tag> added to includeTags
func (d *BrowseDir) Lookup(ctx context.Context, name string, out *fuse.EntryOut) (*fs.Inode, syscall.Errno) {
	slog.DebugContext(
		ctx,
		"fuse: browsedir.lookup: start",
		"name",
		name,
		"include",
		d.includeTags,
		"exclude",
		d.excludeTags,
	)
	out.SetAttrTimeout(attrTimeoutFast)
	out.SetEntryTimeout(attrTimeoutFast)
	out.Mode = syscall.S_IFDIR | dirReadOnlyMode

	if name == "@files" {
		child := d.NewPersistentInode(ctx, &BrowseFilesDir{
			root:        d.root,
			includeTags: d.includeTags,
			excludeTags: d.excludeTags,
		}, fs.StableAttr{Mode: syscall.S_IFDIR})
		slog.DebugContext(ctx, "fuse: browsedir.lookup: done (@files)", "include", d.includeTags)
		return child, 0
	}

	isNot := strings.HasPrefix(name, "!")
	raw := name
	if isNot {
		raw = name[1:]
	}
	decoded, err := percentDecode(raw)
	if err != nil || decoded == "" {
		return nil, syscall.ENOENT
	}

	var next *BrowseDir
	if isNot {
		next = &BrowseDir{
			root:        d.root,
			includeTags: d.includeTags,
			excludeTags: appendClone(d.excludeTags, decoded),
		}
	} else {
		next = &BrowseDir{
			root:        d.root,
			includeTags: appendClone(d.includeTags, decoded),
			excludeTags: d.excludeTags,
		}
	}
	child := d.NewPersistentInode(ctx, next, fs.StableAttr{Mode: syscall.S_IFDIR})
	slog.DebugContext(ctx, "fuse: browsedir.lookup: done", "name", name, "isNot", isNot, "decoded", decoded)
	return child, 0
}

// Getattr returns directory attributes.
func (d *BrowseDir) Getattr(_ context.Context, _ fs.FileHandle, out *fuse.AttrOut) syscall.Errno {
	out.Mode = syscall.S_IFDIR | dirReadOnlyMode
	out.SetTimeout(attrTimeoutFast)
	return 0
}

func (d *BrowseDir) Unlink(_ context.Context, _ string) syscall.Errno { return syscall.EROFS }
func (d *BrowseDir) Rmdir(_ context.Context, _ string) syscall.Errno  { return syscall.EROFS }

// ─── BrowseFilesDir ───────────────────────────────────────────────────────────

// BrowseFilesDir is the leaf node of a @browse path. It lists the files
// matching the accumulated includeTags AND NOT excludeTags as symlinks.
type BrowseFilesDir struct {
	fs.Inode

	root        *Root
	includeTags []string
	excludeTags []string
	cache       tagCache
}

var _ fs.NodeReaddirer = (*BrowseFilesDir)(nil)
var _ fs.NodeLookuper = (*BrowseFilesDir)(nil)
var _ fs.NodeGetattrer = (*BrowseFilesDir)(nil)
var _ fs.NodeUnlinker = (*BrowseFilesDir)(nil)

func (f *BrowseFilesDir) browseQuery(ctx context.Context) ([]index.SearchResult, error) {
	results, _, err := f.root.idx.Search(ctx, index.SearchParams{
		Tags:       f.includeTags,
		TagExclude: f.excludeTags,
		Limit:      searchLimitLarge,
		SortBy:     []string{"mtime:desc"},
	})
	return results, err
}

// warmCache ensures the query result cache is populated.
func (f *BrowseFilesDir) warmCache(ctx context.Context) error {
	f.cache.mu.RLock()
	valid := f.cache.valid()
	f.cache.mu.RUnlock()
	if valid {
		slog.DebugContext(
			ctx,
			"fuse: browsefilesdir.warmCache: cache hit",
			"include",
			f.includeTags,
			"exclude",
			f.excludeTags,
		)
		return nil
	}

	slog.DebugContext(
		ctx,
		"fuse: browsefilesdir.warmCache: cache miss, acquiring write lock",
		"include",
		f.includeTags,
		"exclude",
		f.excludeTags,
	)
	f.cache.mu.Lock()
	defer f.cache.mu.Unlock()
	if f.cache.valid() {
		slog.DebugContext(
			ctx,
			"fuse: browsefilesdir.warmCache: cache filled by other goroutine",
			"include",
			f.includeTags,
		)
		return nil
	}

	slog.DebugContext(
		ctx,
		"fuse: browsefilesdir.warmCache: querying db",
		"include",
		f.includeTags,
		"exclude",
		f.excludeTags,
	)
	t0 := time.Now()
	results, err := f.browseQuery(ctx)
	if err != nil {
		slog.WarnContext(ctx, "fuse: browsefilesdir.warmCache: query failed", "err", err, "dur", time.Since(t0))
		return err
	}
	slog.DebugContext(
		ctx,
		"fuse: browsefilesdir.warmCache: query done",
		"include",
		f.includeTags,
		"n",
		len(results),
		"dur",
		time.Since(t0),
	)
	f.cache.fill(results, f.root.allocInode)
	return nil
}

// Readdir returns matching files as symlink entries.
func (f *BrowseFilesDir) Readdir(ctx context.Context) (fs.DirStream, syscall.Errno) {
	slog.DebugContext(ctx, "fuse: browsefilesdir.readdir: start", "include", f.includeTags, "exclude", f.excludeTags)
	t0 := time.Now()
	if err := f.warmCache(ctx); err != nil {
		slog.WarnContext(ctx, "fuse: browsefilesdir.readdir: warmCache failed", "err", err, "dur", time.Since(t0))
		return nil, syscall.EIO
	}

	f.cache.mu.RLock()
	defer f.cache.mu.RUnlock()
	entries := make([]fuse.DirEntry, 0, len(f.cache.entries))
	for _, e := range f.cache.entries {
		entries = append(entries, fuse.DirEntry{
			Name: e.name,
			Mode: syscall.S_IFLNK,
			Ino:  e.ino,
		})
	}
	slog.DebugContext(
		ctx,
		"fuse: browsefilesdir.readdir: done",
		"include",
		f.includeTags,
		"n",
		len(entries),
		"dur",
		time.Since(t0),
	)
	return fs.NewListDirStream(entries), 0
}

// Lookup finds a file by its virtual name within this directory.
// Results are served from the shared cache to avoid a full DB query per call.
func (f *BrowseFilesDir) Lookup(ctx context.Context, name string, out *fuse.EntryOut) (*fs.Inode, syscall.Errno) {
	slog.DebugContext(ctx, "fuse: browsefilesdir.lookup: start", "name", name, "include", f.includeTags)
	t0 := time.Now()
	if err := f.warmCache(ctx); err != nil {
		slog.WarnContext(
			ctx,
			"fuse: browsefilesdir.lookup: warmCache failed",
			"name",
			name,
			"err",
			err,
			"dur",
			time.Since(t0),
		)
		return nil, syscall.EIO
	}

	f.cache.mu.RLock()
	idx, ok := f.cache.byName[name]
	var entry tagCacheEntry
	if ok {
		entry = f.cache.entries[idx]
	}
	f.cache.mu.RUnlock()

	if !ok {
		slog.DebugContext(ctx, "fuse: browsefilesdir.lookup: not found in cache", "name", name, "dur", time.Since(t0))
		return nil, syscall.ENOENT
	}

	if _, err := os.Lstat(entry.realPath); err != nil {
		slog.DebugContext(
			ctx,
			"fuse: browsefilesdir.lookup: real file missing",
			"name",
			name,
			"realPath",
			entry.realPath,
			"err",
			err,
		)
		return nil, syscall.ENOENT
	}

	out.Ino = entry.ino
	out.SetAttrTimeout(attrTimeoutLong)
	out.SetEntryTimeout(attrTimeoutEntry)
	out.Mode = syscall.S_IFLNK | symlinkMode
	child := f.NewPersistentInode(ctx, &FileLink{realPath: entry.realPath},
		fs.StableAttr{Mode: syscall.S_IFLNK, Ino: entry.ino})
	slog.DebugContext(
		ctx,
		"fuse: browsefilesdir.lookup: done",
		"name",
		name,
		"realPath",
		entry.realPath,
		"dur",
		time.Since(t0),
	)
	return child, 0
}

// Getattr returns directory attributes.
func (f *BrowseFilesDir) Getattr(_ context.Context, _ fs.FileHandle, out *fuse.AttrOut) syscall.Errno {
	out.Mode = syscall.S_IFDIR | dirReadOnlyMode
	out.SetTimeout(attrTimeoutFast)
	return 0
}

func (f *BrowseFilesDir) Unlink(_ context.Context, _ string) syscall.Errno { return syscall.EROFS }

// ─── Helpers ──────────────────────────────────────────────────────────────────

// entryName returns the virtual entry name for a file, appending a counter
// when multiple files share the same basename.
func entryName(realPath string, counts, seen map[string]int) string {
	base := filepath.Base(realPath)
	seen[base]++
	if counts[base] <= 1 {
		return base
	}
	ext := filepath.Ext(base)
	stem := strings.TrimSuffix(base, ext)
	return stem + "_" + intStr(seen[base]-1) + ext
}

func intStr(n int) string {
	if n == 0 {
		return "0"
	}
	buf := [20]byte{}
	pos := len(buf)
	for n > 0 {
		pos--
		buf[pos] = byte('0' + n%10)
		n /= 10
	}
	return string(buf[pos:])
}

// simpleTagsFromExpr returns the tags from a pure-tag expression (AND, no special).
// Returns nil if the expression is special or OR-based.
func simpleTagsFromExpr(e *Expr) []string {
	if e.kind != exprTag || e.TagsAny {
		return nil
	}
	return e.Tags
}

// appendClone returns a new slice with elem appended, never mutating src.
func appendClone(src []string, elem string) []string {
	out := make([]string, len(src)+1)
	copy(out, src)
	out[len(src)] = elem
	return out
}

// graphToSearchResults converts graph.RelatedFile slice to index.SearchResult.
func graphToSearchResults(results []graph.RelatedFile) []index.SearchResult {
	out := make([]index.SearchResult, 0, len(results))
	for _, r := range results {
		out = append(out, index.SearchResult{
			Path: r.Path,
		})
	}
	return out
}
