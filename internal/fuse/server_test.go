package fuse

import (
	"context"
	"os"
	"path/filepath"
	"syscall"
	"testing"

	"github.com/hanwen/go-fuse/v2/fs"
	"github.com/hanwen/go-fuse/v2/fuse"

	"github.com/darkliquid/tilbo/internal/graph"
	"github.com/darkliquid/tilbo/internal/index"
)

func setupTestDB(t *testing.T) (*index.DB, string) {
	t.Helper()
	ctx := context.Background()
	dir := t.TempDir()
	dbPath := filepath.Join(dir, "test.db")
	db, err := index.Open(ctx, dbPath)
	if err != nil {
		t.Fatalf("failed to open test db: %v", err)
	}
	if err := db.Migrate(ctx); err != nil {
		t.Fatalf("failed to migrate test db: %v", err)
	}
	return db, dir
}

func TestRoot_Readdir(t *testing.T) {
	ctx := context.Background()
	db, _ := setupTestDB(t)
	defer db.Close()
	g := graph.New()

	// Add some tags to the DB
	_, _ = db.UpsertTag(ctx, "tag1")
	_, _ = db.UpsertTag(ctx, "tag2")

	root := NewRoot(db, g)
	stream, errno := root.Readdir(ctx)
	if errno != 0 {
		t.Fatalf("Readdir failed: %v", errno)
	}

	var names []string
	for stream.HasNext() {
		entry, errno := stream.Next()
		if errno != 0 {
			t.Fatalf("Next failed: %v", errno)
		}
		names = append(names, entry.Name)
	}

	expected := map[string]bool{
		"tag1":      true,
		"tag2":      true,
		"@recent":   true,
		"@untagged": true,
		"@browse":   true,
	}

	if len(names) != len(expected) {
		t.Errorf("expected %d entries, got %d: %v", len(expected), len(names), names)
	}
	for _, name := range names {
		if !expected[name] {
			t.Errorf("unexpected entry: %s", name)
		}
	}
}

func TestRoot_Lookup(t *testing.T) {
	ctx := context.Background()
	db, _ := setupTestDB(t)
	defer db.Close()
	g := graph.New()

	root := NewRoot(db, g)
	mountPoint := t.TempDir()
	server, err := fs.Mount(mountPoint, root, nil)
	if err != nil {
		t.Fatalf("Mount failed: %v", err)
	}
	defer server.Unmount()

	t.Run("special @browse", func(t *testing.T) {
		var out fuse.EntryOut
		node, errno := root.Lookup(ctx, "@browse", &out)
		if errno != 0 {
			t.Fatalf("Lookup(@browse) failed: %v", errno)
		}
		if _, ok := node.Operations().(*BrowseDir); !ok {
			t.Errorf("expected BrowseDir, got %T", node.Operations())
		}
	})

	t.Run("tag expression", func(t *testing.T) {
		var out fuse.EntryOut
		node, errno := root.Lookup(ctx, "tag1+tag2", &out)
		if errno != 0 {
			t.Fatalf("Lookup(tag1+tag2) failed: %v", errno)
		}
		td, ok := node.Operations().(*TagDir)
		if !ok {
			t.Errorf("expected TagDir, got %T", node.Operations())
		} else if td.name != "tag1+tag2" {
			t.Errorf("expected name tag1+tag2, got %s", td.name)
		}
	})

	t.Run("invalid expression", func(t *testing.T) {
		var out fuse.EntryOut
		_, errno := root.Lookup(ctx, "a+b,c", &out)
		if errno != syscall.ENOENT {
			t.Errorf("expected ENOENT for invalid expr, got %v", errno)
		}
	})
}

func TestTagDir_Readdir(t *testing.T) {
	ctx := context.Background()
	db, dir := setupTestDB(t)
	defer db.Close()
	g := graph.New()

	// Create some dummy files
	f1 := filepath.Join(dir, "file1.txt")
	f2 := filepath.Join(dir, "file2.txt")
	_ = os.WriteFile(f1, []byte("content1"), 0644)
	_ = os.WriteFile(f2, []byte("content2"), 0644)

	// Add files to DB and tag them
	fid1, _ := db.UpsertFile(ctx, f1, 1, 1, 100, 8)
	fid2, _ := db.UpsertFile(ctx, f2, 2, 2, 200, 8)
	_ = db.SetFileTags(ctx, fid1, []string{"work"})
	_ = db.SetFileTags(ctx, fid2, []string{"work", "urgent"})

	root := NewRoot(db, g)
	mountPoint := t.TempDir()
	server, err := fs.Mount(mountPoint, root, nil)
	if err != nil {
		t.Fatalf("Mount failed: %v", err)
	}
	defer server.Unmount()

	var out fuse.EntryOut
	node, errno := root.Lookup(ctx, "work", &out)
	if errno != 0 {
		t.Fatalf("Lookup(work) failed: %v", errno)
	}
	td := node.Operations().(*TagDir)

	stream, errno := td.Readdir(ctx)
	if errno != 0 {
		t.Fatalf("Readdir failed: %v", errno)
	}

	var names []string
	for stream.HasNext() {
		entry, errno := stream.Next()
		if errno != 0 {
			t.Fatalf("Next failed: %v", errno)
		}
		names = append(names, entry.Name)
	}

	if len(names) != 2 {
		t.Errorf("expected 2 entries, got %d: %v", len(names), names)
	}
}

func TestTagDir_Lookup(t *testing.T) {
	ctx := context.Background()
	db, dir := setupTestDB(t)
	defer db.Close()
	g := graph.New()

	f1 := filepath.Join(dir, "file1.txt")
	_ = os.WriteFile(f1, []byte("content1"), 0644)
	fid1, _ := db.UpsertFile(ctx, f1, 1, 1, 100, 8)
	_ = db.SetFileTags(ctx, fid1, []string{"work"})

	root := NewRoot(db, g)
	mountPoint := t.TempDir()
	server, err := fs.Mount(mountPoint, root, nil)
	if err != nil {
		t.Fatalf("Mount failed: %v", err)
	}
	defer server.Unmount()

	var out fuse.EntryOut
	node, errno := root.Lookup(ctx, "work", &out)
	if errno != 0 {
		t.Fatalf("Lookup(work) failed: %v", errno)
	}
	td := node.Operations().(*TagDir)

	t.Run("found", func(t *testing.T) {
		var out fuse.EntryOut
		node, errno := td.Lookup(ctx, "file1.txt", &out)
		if errno != 0 {
			t.Fatalf("Lookup failed: %v", errno)
		}
		fl, ok := node.Operations().(*FileLink)
		if !ok {
			t.Errorf("expected FileLink, got %T", node.Operations())
		} else if fl.realPath != f1 {
			t.Errorf("expected path %s, got %s", f1, fl.realPath)
		}
	})

	t.Run("not found", func(t *testing.T) {
		var out fuse.EntryOut
		_, errno := td.Lookup(ctx, "missing.txt", &out)
		if errno != syscall.ENOENT {
			t.Errorf("expected ENOENT, got %v", errno)
		}
	})
}

func TestFileLink_Readlink(t *testing.T) {
	ctx := context.Background()
	fl := &FileLink{realPath: "/tmp/foo"}
	target, errno := fl.Readlink(ctx)
	if errno != 0 {
		t.Fatalf("Readlink failed: %v", errno)
	}
	if string(target) != "/tmp/foo" {
		t.Errorf("expected /tmp/foo, got %s", string(target))
	}
}

func TestFileLink_Getattr(t *testing.T) {
	ctx := context.Background()
	dir := t.TempDir()
	f1 := filepath.Join(dir, "file1.txt")
	content := "hello world"
	_ = os.WriteFile(f1, []byte(content), 0644)

	fl := &FileLink{realPath: f1}
	var out fuse.AttrOut
	errno := fl.Getattr(ctx, nil, &out)
	if errno != 0 {
		t.Fatalf("Getattr failed: %v", errno)
	}

	if out.Size != uint64(len(content)) {
		t.Errorf("expected size %d, got %d", len(content), out.Size)
	}
	if out.Mode&syscall.S_IFLNK == 0 {
		t.Errorf("expected symlink mode bit set, got %o", out.Mode)
	}
}

func TestBrowseDir_Readdir(t *testing.T) {
	ctx := context.Background()
	db, dir := setupTestDB(t)
	defer db.Close()
	g := graph.New()

	// Setup: file1 has tag1, tag2. file2 has tag1.
	f1 := filepath.Join(dir, "file1.txt")
	f2 := filepath.Join(dir, "file2.txt")
	_ = os.WriteFile(f1, []byte("c1"), 0644)
	_ = os.WriteFile(f2, []byte("c2"), 0644)

	fid1, _ := db.UpsertFile(ctx, f1, 1, 1, 100, 2)
	fid2, _ := db.UpsertFile(ctx, f2, 2, 2, 200, 2)
	_ = db.SetFileTags(ctx, fid1, []string{"tag1", "tag2"})
	_ = db.SetFileTags(ctx, fid2, []string{"tag1"})

	root := NewRoot(db, g)
	mountPoint := t.TempDir()
	server, err := fs.Mount(mountPoint, root, nil)
	if err != nil {
		t.Fatalf("Mount failed: %v", err)
	}
	defer server.Unmount()

	var out fuse.EntryOut
	node, errno := root.Lookup(ctx, "@browse", &out)
	if errno != 0 {
		t.Fatalf("Lookup(@browse) failed: %v", errno)
	}
	bd := node.Operations().(*BrowseDir)

	t.Run("root browse", func(t *testing.T) {
		stream, errno := bd.Readdir(ctx)
		if errno != 0 {
			t.Fatalf("Readdir failed: %v", errno)
		}
		var names []string
		for stream.HasNext() {
			entry, _ := stream.Next()
			names = append(names, entry.Name)
		}
		// Expect @files, tag1, tag2
		if len(names) != 3 {
			t.Errorf("expected 3 entries, got %v", names)
		}
	})

	t.Run("nested browse", func(t *testing.T) {
		// Lookup "tag1"
		var out fuse.EntryOut
		node2, errno := bd.Lookup(ctx, "tag1", &out)
		if errno != 0 {
			t.Fatalf("Lookup(tag1) failed: %v", errno)
		}
		bd2 := node2.Operations().(*BrowseDir)
		stream, errno := bd2.Readdir(ctx)
		if errno != 0 {
			t.Fatalf("Readdir failed: %v", errno)
		}
		var names []string
		for stream.HasNext() {
			entry, _ := stream.Next()
			names = append(names, entry.Name)
		}
		// tag1 is already included, so co-occurring with tag1 is tag2.
		// Result should be @files, tag2.
		if len(names) != 2 {
			t.Errorf("expected 2 entries, got %v", names)
		}
	})
}

func TestBrowseFilesDir_Readdir(t *testing.T) {
	ctx := context.Background()
	db, dir := setupTestDB(t)
	defer db.Close()
	g := graph.New()

	f1 := filepath.Join(dir, "file1.txt")
	_ = os.WriteFile(f1, []byte("c1"), 0644)
	fid1, _ := db.UpsertFile(ctx, f1, 1, 1, 100, 2)
	_ = db.SetFileTags(ctx, fid1, []string{"tag1"})

	root := NewRoot(db, g)
	mountPoint := t.TempDir()
	server, err := fs.Mount(mountPoint, root, nil)
	if err != nil {
		t.Fatalf("Mount failed: %v", err)
	}
	defer server.Unmount()

	var out fuse.EntryOut
	bnode, _ := root.Lookup(ctx, "@browse", &out)
	t1node, _ := bnode.Operations().(*BrowseDir).Lookup(ctx, "tag1", &out)
	fnode, _ := t1node.Operations().(*BrowseDir).Lookup(ctx, "@files", &out)
	bfd := fnode.Operations().(*BrowseFilesDir)

	stream, errno := bfd.Readdir(ctx)
	if errno != 0 {
		t.Fatalf("Readdir failed: %v", errno)
	}
	var names []string
	for stream.HasNext() {
		entry, _ := stream.Next()
		names = append(names, entry.Name)
	}
	if len(names) != 1 || names[0] != "file1.txt" {
		t.Errorf("expected [file1.txt], got %v", names)
	}
}

func TestTagDir_Rename(t *testing.T) {
	ctx := context.Background()
	db, dir := setupTestDB(t)
	defer db.Close()
	g := graph.New()

	f1 := filepath.Join(dir, "file1.txt")
	_ = os.WriteFile(f1, []byte("c1"), 0644)
	fid1, _ := db.UpsertFile(ctx, f1, 1, 1, 100, 2)
	_ = db.SetFileTags(ctx, fid1, []string{"tag1"})

	root := NewRoot(db, g)
	mountPoint := t.TempDir()
	server, err := fs.Mount(mountPoint, root, nil)
	if err != nil {
		t.Fatalf("Mount failed: %v", err)
	}
	defer server.Unmount()

	var out fuse.EntryOut
	t1node, _ := root.Lookup(ctx, "tag1", &out)
	t2node, _ := root.Lookup(ctx, "tag2", &out)

	t1 := t1node.Operations().(*TagDir)

	// Rename "file1.txt" from "tag1" to "tag2"
	errno := t1.Rename(ctx, "file1.txt", t2node.Operations().(*TagDir), "file1.txt", 0)
	if errno != 0 {
		t.Fatalf("Rename failed: %v", errno)
	}

	// Verify tags in DB
	summary, err := db.GetFileSummary(ctx, f1)
	if err != nil {
		t.Fatalf("GetFileSummary failed: %v", err)
	}
	found := false
	for _, tagName := range summary.Tags {
		if tagName == "tag2" {
			found = true
		}
		if tagName == "tag1" {
			t.Errorf("tag1 should have been removed")
		}
	}
	if !found {
		t.Errorf("tag2 should have been added")
	}
}

func TestEROFS(t *testing.T) {
	ctx := context.Background()
	db, _ := setupTestDB(t)
	defer db.Close()
	g := graph.New()
	root := NewRoot(db, g)

	if errno := root.Unlink(ctx, "foo"); errno != syscall.EROFS {
		t.Errorf("Root.Unlink: expected EROFS, got %v", errno)
	}
	if errno := root.Rmdir(ctx, "foo"); errno != syscall.EROFS {
		t.Errorf("Root.Rmdir: expected EROFS, got %v", errno)
	}

	td := &TagDir{root: root, name: "test"}
	if errno := td.Unlink(ctx, "foo"); errno != syscall.EROFS {
		t.Errorf("TagDir.Unlink: expected EROFS, got %v", errno)
	}
	if errno := td.Rmdir(ctx, "foo"); errno != syscall.EROFS {
		t.Errorf("TagDir.Rmdir: expected EROFS, got %v", errno)
	}
}

func TestEntryName(t *testing.T) {
	counts := map[string]int{"file.txt": 3}
	seen := map[string]int{}

	n1 := entryName("/a/file.txt", counts, seen)
	if n1 != "file_0.txt" {
		t.Errorf("expected file_0.txt, got %s", n1)
	}

	n2 := entryName("/b/file.txt", counts, seen)
	if n2 != "file_1.txt" {
		t.Errorf("expected file_1.txt, got %s", n2)
	}

	n3 := entryName("/c/file.txt", counts, seen)
	if n3 != "file_2.txt" {
		t.Errorf("expected file_2.txt, got %s", n3)
	}
}

func TestAllocInode_Collision(t *testing.T) {
	r := NewRoot(nil, nil)
	p1 := "/a/b/c"

	ino1 := r.allocInode(p1)

	// Manually force p2 to collide with p1 by pre-filling inoUsed
	// We don't know what stableInode(p2) will be, but we can force it.
	// Actually, let's just use the same path but clear it from inoMap.
	delete(r.inoMap, p1)
	r.inoUsed[ino1] = "something else"

	ino3 := r.allocInode(p1)
	if ino3 == ino1 {
		t.Errorf("expected different inode after collision")
	}
}
