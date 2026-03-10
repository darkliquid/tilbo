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

	"github.com/hanwen/go-fuse/v2/fs"
	"github.com/hanwen/go-fuse/v2/fuse"

	"github.com/darkliquid/tilbo/internal/graph"
	"github.com/darkliquid/tilbo/internal/index"
)

// stableInode returns a stable inode number for a real file path using FNV-64a.
// Collision handling is done by the inodeMap in Root.
func stableInode(realPath string) uint64 {
	h := fnv.New64a()
	h.Write([]byte(realPath))
	ino := h.Sum64()
	if ino == 0 {
		ino = 1
	}
	return ino
}

// ─── Root ────────────────────────────────────────────────────────────────────

// Root is the FUSE root node mounted at ~/tags.
// It lists all known tags as virtual subdirectories.
type Root struct {
	fs.Inode

	idx *index.DB
	g   *graph.Graph

	// inodeMap resolves stable inode collisions: realPath → inode.
	mu       sync.Mutex
	inoMap   map[string]uint64
	inoUsed  map[uint64]string
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
	probe := realPath
	for {
		if existing, conflict := r.inoUsed[ino]; !conflict || existing == realPath {
			break
		}
		probe += "\x00"
		h := fnv.New64a()
		h.Write([]byte(probe))
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
	tags, err := r.idx.ListAllTags(ctx)
	if err != nil {
		slog.WarnContext(ctx, "fuse: readdir root: list tags failed", "err", err)
		return nil, syscall.EIO
	}
	entries := make([]fuse.DirEntry, 0, len(tags)+4)
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
	return fs.NewListDirStream(entries), 0
}

// Unlink returns EROFS: virtual tag directories cannot be removed via the filesystem.
func (r *Root) Unlink(_ context.Context, _ string) syscall.Errno { return syscall.EROFS }

// Rmdir returns EROFS: virtual tag directories cannot be removed via the filesystem.
func (r *Root) Rmdir(_ context.Context, _ string) syscall.Errno { return syscall.EROFS }

// Lookup resolves a name to a node. "@browse" returns the incremental tag
// browser; everything else is parsed as a tag expression and returns a TagDir.
func (r *Root) Lookup(ctx context.Context, name string, out *fuse.EntryOut) (*fs.Inode, syscall.Errno) {
	if name == "@browse" {
		out.SetAttrTimeout(30)
		out.SetEntryTimeout(2)
		out.Attr.Mode = syscall.S_IFDIR | 0o555
		child := r.NewPersistentInode(ctx, &BrowseDir{root: r},
			fs.StableAttr{Mode: syscall.S_IFDIR})
		return child, 0
	}

	expr, err := ParseExpr(name)
	if err != nil {
		slog.DebugContext(ctx, "fuse: lookup: invalid expr", "name", name, "err", err)
		return nil, syscall.ENOENT
	}

	out.SetAttrTimeout(30)
	out.SetEntryTimeout(2)
	out.Attr.Mode = syscall.S_IFDIR | 0o555

	child := r.NewPersistentInode(ctx, &TagDir{
		root: r,
		expr: expr,
		name: name,
	}, fs.StableAttr{Mode: syscall.S_IFDIR})
	return child, 0
}

// Getattr returns attributes for the root directory.
func (r *Root) Getattr(_ context.Context, _ fs.FileHandle, out *fuse.AttrOut) syscall.Errno {
	out.Mode = syscall.S_IFDIR | 0o555
	out.SetTimeout(30)
	return 0
}

// ─── TagDir ───────────────────────────────────────────────────────────────────

// TagDir is a virtual directory node for one tag expression (e.g., "python+work").
// Its children are FileLink symlink nodes for each matching file.
type TagDir struct {
	fs.Inode

	root *Root
	expr *Expr
	name string // original path component (for rename semantics)
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
		results := d.root.g.Related(ctx, d.expr.SeedPath, 3, 100, 1.0, 0.4)
		return graphToSearchResults(results), nil
	}

	params, err := d.expr.ToSearchParams(10_000)
	if err != nil {
		return nil, err
	}
	results, _, err := d.root.idx.Search(ctx, params)
	return results, err
}

// Readdir returns the file entries for this virtual directory.
func (d *TagDir) Readdir(ctx context.Context) (fs.DirStream, syscall.Errno) {
	results, err := d.query(ctx)
	if err != nil {
		slog.WarnContext(ctx, "fuse: readdir tagdir failed", "expr", d.name, "err", err)
		return nil, syscall.EIO
	}

	// Deduplicate by basename; when two files share a name, append an index.
	nameCounts := make(map[string]int, len(results))
	for _, r := range results {
		base := filepath.Base(r.Path)
		nameCounts[base]++
	}
	seenCount := make(map[string]int, len(results))

	entries := make([]fuse.DirEntry, 0, len(results))
	for _, r := range results {
		entryName := entryName(r.Path, nameCounts, seenCount)
		entries = append(entries, fuse.DirEntry{
			Name: entryName,
			Mode: syscall.S_IFLNK,
			Ino:  d.root.allocInode(r.Path),
		})
	}
	return fs.NewListDirStream(entries), 0
}

// Lookup finds a file by name within this virtual directory.
func (d *TagDir) Lookup(ctx context.Context, name string, out *fuse.EntryOut) (*fs.Inode, syscall.Errno) {
	results, err := d.query(ctx)
	if err != nil {
		return nil, syscall.EIO
	}

	nameCounts := make(map[string]int, len(results))
	for _, r := range results {
		nameCounts[filepath.Base(r.Path)]++
	}
	seenCount := make(map[string]int, len(results))

	for _, r := range results {
		ename := entryName(r.Path, nameCounts, seenCount)
		if ename != name {
			continue
		}
		// Verify real file still exists.
		if _, err := os.Lstat(r.Path); err != nil {
			return nil, syscall.ENOENT
		}

		ino := d.root.allocInode(r.Path)
		out.Attr.Ino = ino
		out.SetAttrTimeout(30)
		out.SetEntryTimeout(1)
		out.Attr.Mode = syscall.S_IFLNK | 0o777

		child := d.NewPersistentInode(ctx, &FileLink{
			realPath: r.Path,
		}, fs.StableAttr{
			Mode: syscall.S_IFLNK,
			Ino:  ino,
		})
		return child, 0
	}
	return nil, syscall.ENOENT
}

// Getattr returns directory attributes.
func (d *TagDir) Getattr(_ context.Context, _ fs.FileHandle, out *fuse.AttrOut) syscall.Errno {
	out.Mode = syscall.S_IFDIR | 0o555
	out.SetTimeout(2)
	return 0
}

// Rename handles cross-directory moves: retag semantics.
// Source and destination must both be TagDir nodes; file is retagged accordingly.
func (d *TagDir) Rename(ctx context.Context, name string, newParent fs.InodeEmbedder, newName string, flags uint32) syscall.Errno {
	dest, ok := newParent.(*TagDir)
	if !ok {
		// Moving out of the FUSE mount — not supported.
		return syscall.EXDEV
	}

	// Find the real path for the source entry.
	results, err := d.query(ctx)
	if err != nil {
		return syscall.EIO
	}
	nameCounts := make(map[string]int, len(results))
	for _, r := range results {
		nameCounts[filepath.Base(r.Path)]++
	}
	seenCount := make(map[string]int, len(results))

	var realPath string
	for _, r := range results {
		if entryName(r.Path, nameCounts, seenCount) == name {
			realPath = r.Path
			break
		}
	}
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

	idx := d.root.idx
	for _, t := range srcTags {
		if err := idx.ModifyFileTags(ctx, realPath, []string{t}, "remove"); err != nil {
			slog.WarnContext(ctx, "fuse: rename: remove tag failed", "path", realPath, "tag", t, "err", err)
		}
	}
	for _, t := range dstTags {
		if err := idx.ModifyFileTags(ctx, realPath, []string{t}, "add"); err != nil {
			slog.WarnContext(ctx, "fuse: rename: add tag failed", "path", realPath, "tag", t, "err", err)
		}
	}
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

// Getattr returns symlink attributes, stat-ing the real file for size/mtime.
func (l *FileLink) Getattr(_ context.Context, _ fs.FileHandle, out *fuse.AttrOut) syscall.Errno {
	st, err := os.Lstat(l.realPath)
	if err != nil {
		return syscall.ENOENT
	}
	out.Mode = syscall.S_IFLNK | 0o777
	out.Size = uint64(st.Size())
	out.SetTimeout(30)
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
	tags, err := d.root.idx.ListCooccurringTags(ctx, d.includeTags, d.excludeTags)
	if err != nil {
		slog.WarnContext(ctx, "fuse: browse readdir failed", "err", err)
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
	return fs.NewListDirStream(entries), 0
}

// Lookup handles three name forms:
//   - "@files"  → BrowseFilesDir listing matching files
//   - "!<tag>"  → new BrowseDir with <tag> added to excludeTags
//   - "<tag>"   → new BrowseDir with <tag> added to includeTags
func (d *BrowseDir) Lookup(ctx context.Context, name string, out *fuse.EntryOut) (*fs.Inode, syscall.Errno) {
	out.SetAttrTimeout(2)
	out.SetEntryTimeout(2)
	out.Attr.Mode = syscall.S_IFDIR | 0o555

	if name == "@files" {
		child := d.NewPersistentInode(ctx, &BrowseFilesDir{
			root:        d.root,
			includeTags: d.includeTags,
			excludeTags: d.excludeTags,
		}, fs.StableAttr{Mode: syscall.S_IFDIR})
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
	return child, 0
}

// Getattr returns directory attributes.
func (d *BrowseDir) Getattr(_ context.Context, _ fs.FileHandle, out *fuse.AttrOut) syscall.Errno {
	out.Mode = syscall.S_IFDIR | 0o555
	out.SetTimeout(2)
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
}

var _ fs.NodeReaddirer = (*BrowseFilesDir)(nil)
var _ fs.NodeLookuper = (*BrowseFilesDir)(nil)
var _ fs.NodeGetattrer = (*BrowseFilesDir)(nil)
var _ fs.NodeUnlinker = (*BrowseFilesDir)(nil)

func (f *BrowseFilesDir) browseQuery(ctx context.Context) ([]index.SearchResult, error) {
	results, _, err := f.root.idx.Search(ctx, index.SearchParams{
		Tags:       f.includeTags,
		TagExclude: f.excludeTags,
		Limit:      10_000,
		SortBy:     []string{"mtime:desc"},
	})
	return results, err
}

// Readdir returns matching files as symlink entries.
func (f *BrowseFilesDir) Readdir(ctx context.Context) (fs.DirStream, syscall.Errno) {
	results, err := f.browseQuery(ctx)
	if err != nil {
		slog.WarnContext(ctx, "fuse: browse files readdir failed", "err", err)
		return nil, syscall.EIO
	}
	nameCounts := make(map[string]int, len(results))
	for _, r := range results {
		nameCounts[filepath.Base(r.Path)]++
	}
	seenCount := make(map[string]int, len(results))

	entries := make([]fuse.DirEntry, 0, len(results))
	for _, r := range results {
		entries = append(entries, fuse.DirEntry{
			Name: entryName(r.Path, nameCounts, seenCount),
			Mode: syscall.S_IFLNK,
			Ino:  f.root.allocInode(r.Path),
		})
	}
	return fs.NewListDirStream(entries), 0
}

// Lookup finds a file by its virtual name within this directory.
func (f *BrowseFilesDir) Lookup(ctx context.Context, name string, out *fuse.EntryOut) (*fs.Inode, syscall.Errno) {
	results, err := f.browseQuery(ctx)
	if err != nil {
		return nil, syscall.EIO
	}
	nameCounts := make(map[string]int, len(results))
	for _, r := range results {
		nameCounts[filepath.Base(r.Path)]++
	}
	seenCount := make(map[string]int, len(results))

	for _, r := range results {
		if entryName(r.Path, nameCounts, seenCount) != name {
			continue
		}
		if _, err := os.Lstat(r.Path); err != nil {
			return nil, syscall.ENOENT
		}
		ino := f.root.allocInode(r.Path)
		out.Attr.Ino = ino
		out.SetAttrTimeout(30)
		out.SetEntryTimeout(1)
		out.Attr.Mode = syscall.S_IFLNK | 0o777
		child := f.NewPersistentInode(ctx, &FileLink{realPath: r.Path},
			fs.StableAttr{Mode: syscall.S_IFLNK, Ino: ino})
		return child, 0
	}
	return nil, syscall.ENOENT
}

// Getattr returns directory attributes.
func (f *BrowseFilesDir) Getattr(_ context.Context, _ fs.FileHandle, out *fuse.AttrOut) syscall.Errno {
	out.Mode = syscall.S_IFDIR | 0o555
	out.SetTimeout(2)
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
