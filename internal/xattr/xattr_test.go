package xattr_test

import (
	"context"
	"os"
	"sort"
	"testing"

	pkgxattr "github.com/pkg/xattr"

	"github.com/darkliquid/tilbo/internal/xattr"
)

// newFile creates a temporary file and returns its path.
// It also skips the test if xattr is not supported on the temp filesystem.
func newFile(t *testing.T) string {
	t.Helper()
	dir := t.TempDir()
	f, err := os.CreateTemp(dir, "xattr-test-*")
	if err != nil {
		t.Fatal(err)
	}
	f.Close()
	path := f.Name()

	// Check xattr support by attempting a set.
	if err := pkgxattr.Set(path, "user.tilbo_probe", []byte("1")); err != nil {
		t.Skipf("xattr not supported on this filesystem: %v", err)
	}
	// Clean up probe attr.
	_ = pkgxattr.Remove(path, "user.tilbo_probe")

	t.Cleanup(func() { os.Remove(path) })
	return path
}

func TestReadWriteTags(t *testing.T) {
	ctx := context.Background()
	path := newFile(t)

	svc := xattr.New(nil)

	// No tags set yet.
	tags, err := svc.ReadTags(ctx, path)
	if err != nil {
		t.Fatalf("ReadTags: %v", err)
	}
	if len(tags) != 0 {
		t.Errorf("expected empty tags, got %v", tags)
	}

	// Write tags.
	want := []string{"work", "go", "important"}
	if writeErr := svc.WriteTags(ctx, path, want); writeErr != nil {
		t.Fatalf("WriteTags: %v", writeErr)
	}

	// Read back.
	got, err := svc.ReadTags(ctx, path)
	if err != nil {
		t.Fatalf("ReadTags after write: %v", err)
	}
	sort.Strings(got)
	sort.Strings(want)
	if len(got) != len(want) {
		t.Fatalf("tag count mismatch: got %v, want %v", got, want)
	}
	for i := range got {
		if got[i] != want[i] {
			t.Errorf("tag[%d]: got %q, want %q", i, got[i], want[i])
		}
	}
}

func TestWriteTagsEmptyList(t *testing.T) {
	ctx := context.Background()
	path := newFile(t)

	svc := xattr.New(nil)

	if err := svc.WriteTags(ctx, path, []string{"a", "b"}); err != nil {
		t.Fatal(err)
	}
	if err := svc.WriteTags(ctx, path, []string{}); err != nil {
		t.Fatal(err)
	}
	tags, err := svc.ReadTags(ctx, path)
	if err != nil {
		t.Fatal(err)
	}
	if len(tags) != 0 {
		t.Errorf("expected no tags after clearing, got %v", tags)
	}
}

func TestWriteTagsWithCommaRoundTrips(t *testing.T) {
	ctx := context.Background()
	path := newFile(t)

	svc := xattr.New(nil)

	want := []string{"tag,with,commas", "normal"}
	if err := svc.WriteTags(ctx, path, want); err != nil {
		t.Fatalf("WriteTags: %v", err)
	}
	got, err := svc.ReadTags(ctx, path)
	if err != nil {
		t.Fatalf("ReadTags: %v", err)
	}
	if len(got) != len(want) {
		t.Fatalf("tag count: got %d, want %d (%v)", len(got), len(want), got)
	}
	for i := range want {
		if got[i] != want[i] {
			t.Errorf("tag[%d]: got %q, want %q", i, got[i], want[i])
		}
	}
}

func TestReadWriteMeta(t *testing.T) {
	ctx := context.Background()
	path := newFile(t)

	svc := xattr.New(nil)

	// Non-existent key returns "".
	val, err := svc.ReadMeta(ctx, path, "codec")
	if err != nil {
		t.Fatalf("ReadMeta missing key: %v", err)
	}
	if val != "" {
		t.Errorf("expected empty string for missing key, got %q", val)
	}

	// Write and read back.
	if writeErr := svc.WriteMeta(ctx, path, "codec", "h265"); writeErr != nil {
		t.Fatalf("WriteMeta: %v", writeErr)
	}
	val, err = svc.ReadMeta(ctx, path, "codec")
	if err != nil {
		t.Fatalf("ReadMeta: %v", err)
	}
	if val != "h265" {
		t.Errorf("ReadMeta: got %q, want %q", val, "h265")
	}
}

func TestReadAllMeta(t *testing.T) {
	ctx := context.Background()
	path := newFile(t)

	svc := xattr.New(nil)

	if writeErr := svc.WriteMeta(ctx, path, "codec", "h265"); writeErr != nil {
		t.Fatal(writeErr)
	}
	if err := svc.WriteMeta(ctx, path, "width", "1920"); err != nil {
		t.Fatal(err)
	}
	// Also write a non-meta attr to ensure it is excluded.
	if err := svc.WriteTags(ctx, path, []string{"video"}); err != nil {
		t.Fatal(err)
	}

	meta, err := svc.ReadAllMeta(ctx, path)
	if err != nil {
		t.Fatalf("ReadAllMeta: %v", err)
	}
	if meta["codec"] != "h265" {
		t.Errorf("codec: got %q, want %q", meta["codec"], "h265")
	}
	if meta["width"] != "1920" {
		t.Errorf("width: got %q, want %q", meta["width"], "1920")
	}
	// tags key must not appear in meta.
	if _, ok := meta["tags"]; ok {
		t.Error("ReadAllMeta should not include user.xdg.tags")
	}
}

func TestReadWriteSource(t *testing.T) {
	ctx := context.Background()
	path := newFile(t)

	svc := xattr.New(nil)

	// No source set yet.
	src, err := svc.ReadSource(ctx, path)
	if err != nil {
		t.Fatalf("ReadSource: %v", err)
	}
	if len(src) != 0 {
		t.Errorf("expected empty source, got %v", src)
	}

	want := map[string]string{
		"video": "rule:hd-video",
		"work":  "manual",
	}
	if writeErr := svc.WriteSource(ctx, path, want); writeErr != nil {
		t.Fatalf("WriteSource: %v", writeErr)
	}

	got, err := svc.ReadSource(ctx, path)
	if err != nil {
		t.Fatalf("ReadSource after write: %v", err)
	}
	for k, v := range want {
		if got[k] != v {
			t.Errorf("source[%q]: got %q, want %q", k, got[k], v)
		}
	}
}

func TestBatchReadTags(t *testing.T) {
	ctx := context.Background()
	dir := t.TempDir()

	paths := make([]string, 3)
	for i := range paths {
		f, err := os.CreateTemp(dir, "batch-*")
		if err != nil {
			t.Fatal(err)
		}
		f.Close()
		paths[i] = f.Name()
	}

	// Check xattr support.
	if err := pkgxattr.Set(paths[0], "user.tilbo_probe", []byte("1")); err != nil {
		t.Skipf("xattr not supported: %v", err)
	}
	_ = pkgxattr.Remove(paths[0], "user.tilbo_probe")

	svc := xattr.New(nil)

	// Tag two of the three files.
	if err := svc.WriteTags(ctx, paths[0], []string{"a", "b"}); err != nil {
		t.Fatal(err)
	}
	if err := svc.WriteTags(ctx, paths[1], []string{"c"}); err != nil {
		t.Fatal(err)
	}
	// paths[2] has no tags.

	result, err := svc.BatchReadTags(ctx, paths)
	if err != nil {
		t.Fatalf("BatchReadTags: %v", err)
	}
	if len(result) != 3 {
		t.Errorf("expected 3 entries, got %d", len(result))
	}
	if len(result[paths[2]]) != 0 {
		t.Errorf("expected empty tags for untagged file, got %v", result[paths[2]])
	}
}

func TestContextCancellation(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	cancel() // cancel immediately
	svc := xattr.New(nil)

	path := newFile(t)
	if _, err := svc.ReadTags(ctx, path); err == nil {
		t.Error("expected error from cancelled context, got nil")
	}
}
