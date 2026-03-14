package sync //nolint:revive,nolintlint // package path is stable API surface; nolintlint cannot infer revive hit location

import (
	"context"
	"os"
	"path/filepath"
	"syscall"
	"testing"
	"time"

	"github.com/darkliquid/tilbo/internal/index"
	ipcv1 "github.com/darkliquid/tilbo/internal/ipc/gen/tilbo/ipc/v1"
	"github.com/darkliquid/tilbo/internal/xattr"
)

const (
	syncTestTimeout          = 30 * time.Second
	syncTestDeadlineHeadroom = time.Second
)

func newTestContext(t *testing.T) (context.Context, context.CancelFunc) {
	t.Helper()

	deadline := time.Now().Add(syncTestTimeout)
	if testDeadline, ok := t.Deadline(); ok {
		candidate := testDeadline.Add(-syncTestDeadlineHeadroom)
		if candidate.Before(deadline) {
			deadline = candidate
		}
	}

	if !deadline.After(time.Now()) {
		deadline = time.Now().Add(time.Second)
	}

	return context.WithDeadline(context.Background(), deadline)
}

func TestSyncerRun(t *testing.T) {
	ctx, cancel := newTestContext(t)
	defer cancel()

	// 1. Setup a temp directory structure
	tmpDir := t.TempDir()

	// Create some dummy files
	file1 := filepath.Join(tmpDir, "file1.txt")
	if err := os.WriteFile(file1, []byte("hello"), 0o644); err != nil {
		t.Fatal(err)
	}

	file2 := filepath.Join(tmpDir, "file2.txt")
	if err := os.WriteFile(file2, []byte("world"), 0o644); err != nil {
		t.Fatal(err)
	}

	svc := xattr.New(nil)

	// Setup some xattrs using the xattr package
	if err := svc.WriteTags(ctx, file1, []string{"foo", "bar"}); err != nil {
		t.Logf("WriteTags might not be supported on tempdir: %v", err)
		// It's possible tmpfs doesn't support user svcs in some environments.
		// We'll proceed anyway, the DB should just get zero tags.
	}
	_ = svc.WriteMeta(ctx, file1, "author", "alice")

	// 2. Setup SQLite index
	dbPath := filepath.Join(tmpDir, "index.db")
	idx, err := index.Open(ctx, dbPath)
	if err != nil {
		t.Fatal(err)
	}
	defer idx.Close()

	// 3. Run Syncer
	s := New(idx, svc, tmpDir, true, nil)

	if s.State().State != ipcv1.DaemonState_DAEMON_STATE_IDLE {
		t.Errorf("Expected IDLE state initially")
	}

	if err := s.Run(ctx); err != nil {
		t.Fatalf("Syncer.Run failed: %v", err)
	}

	// 4. Verify results
	state := s.State()
	if state.State != ipcv1.DaemonState_DAEMON_STATE_READY {
		t.Errorf("Expected READY state, got %v", state.State)
	}

	// We expect file1, file2, and maybe index.db (if it's in the same dir) to be indexed
	if state.FilesIndexed < 2 {
		t.Errorf("Expected at least 2 files indexed, got %d", state.FilesIndexed)
	}
}

func TestSyncFile(t *testing.T) {
	ctx, cancel := newTestContext(t)
	defer cancel()

	tmpDir := t.TempDir()
	file1 := filepath.Join(tmpDir, "file1.txt")
	if err := os.WriteFile(file1, []byte("test"), 0o644); err != nil {
		t.Fatal(err)
	}

	svc := xattr.New(nil)

	_ = svc.WriteTags(ctx, file1, []string{"sync-test"})

	dbPath := filepath.Join(tmpDir, "index.db")
	idx, err := index.Open(ctx, dbPath)
	if err != nil {
		t.Fatal(err)
	}
	defer idx.Close()

	s := New(idx, svc, tmpDir, true, nil)

	info, err := os.Stat(file1)
	if err != nil {
		t.Fatal(err)
	}
	sysStat := info.Sys().(*syscall.Stat_t)

	if _, err := s.SyncFile(ctx, file1, sysStat); err != nil {
		t.Fatalf("SyncFile failed: %v", err)
	}

	if s.filesIndexed.Load() != 1 {
		t.Errorf("Expected filesIndexed=1, got %d", s.filesIndexed.Load())
	}
}

func TestSyncerRunSkipsHiddenDescendantsWhenDisabled(t *testing.T) {
	ctx, cancel := newTestContext(t)
	defer cancel()

	watchDir := t.TempDir()
	dbDir := t.TempDir()

	visibleFile := filepath.Join(watchDir, "visible.txt")
	if err := os.WriteFile(visibleFile, []byte("visible"), 0o644); err != nil {
		t.Fatal(err)
	}

	visibleNestedDir := filepath.Join(watchDir, "docs")
	if err := os.MkdirAll(visibleNestedDir, 0o755); err != nil {
		t.Fatal(err)
	}
	visibleNestedFile := filepath.Join(visibleNestedDir, "notes.txt")
	if err := os.WriteFile(visibleNestedFile, []byte("nested"), 0o644); err != nil {
		t.Fatal(err)
	}

	hiddenFile := filepath.Join(watchDir, ".env")
	if err := os.WriteFile(hiddenFile, []byte("secret"), 0o644); err != nil {
		t.Fatal(err)
	}

	hiddenDir := filepath.Join(watchDir, ".cache")
	if err := os.MkdirAll(hiddenDir, 0o755); err != nil {
		t.Fatal(err)
	}
	hiddenDirFile := filepath.Join(hiddenDir, "entry.txt")
	if err := os.WriteFile(hiddenDirFile, []byte("hidden"), 0o644); err != nil {
		t.Fatal(err)
	}

	nestedHiddenDir := filepath.Join(visibleNestedDir, ".drafts")
	if err := os.MkdirAll(nestedHiddenDir, 0o755); err != nil {
		t.Fatal(err)
	}
	nestedHiddenFile := filepath.Join(nestedHiddenDir, "draft.txt")
	if err := os.WriteFile(nestedHiddenFile, []byte("draft"), 0o644); err != nil {
		t.Fatal(err)
	}

	idx, err := index.Open(ctx, filepath.Join(dbDir, "index.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer idx.Close()

	s := New(idx, xattr.New(nil), watchDir, false, nil)
	if err := s.Run(ctx); err != nil {
		t.Fatalf("Syncer.Run failed: %v", err)
	}

	if got := s.filesIndexed.Load(); got != 2 {
		t.Fatalf("Expected 2 visible files indexed, got %d", got)
	}

	assertIndexedPath(ctx, t, idx, visibleFile, true)
	assertIndexedPath(ctx, t, idx, visibleNestedFile, true)
	assertIndexedPath(ctx, t, idx, hiddenFile, false)
	assertIndexedPath(ctx, t, idx, hiddenDirFile, false)
	assertIndexedPath(ctx, t, idx, nestedHiddenFile, false)
}

func TestSyncerRunAllowsExplicitHiddenRootWhenDisabled(t *testing.T) {
	ctx, cancel := newTestContext(t)
	defer cancel()

	parentDir := t.TempDir()
	dbDir := t.TempDir()
	watchDir := filepath.Join(parentDir, ".config", "tilbo")
	if err := os.MkdirAll(filepath.Join(watchDir, "docs"), 0o755); err != nil {
		t.Fatal(err)
	}

	rootFile := filepath.Join(watchDir, "state.db")
	if err := os.WriteFile(rootFile, []byte("state"), 0o644); err != nil {
		t.Fatal(err)
	}

	visibleNestedFile := filepath.Join(watchDir, "docs", "config.toml")
	if err := os.WriteFile(visibleNestedFile, []byte("config"), 0o644); err != nil {
		t.Fatal(err)
	}

	hiddenDir := filepath.Join(watchDir, ".cache")
	if err := os.MkdirAll(hiddenDir, 0o755); err != nil {
		t.Fatal(err)
	}
	hiddenNestedFile := filepath.Join(hiddenDir, "entry.txt")
	if err := os.WriteFile(hiddenNestedFile, []byte("hidden"), 0o644); err != nil {
		t.Fatal(err)
	}

	idx, err := index.Open(ctx, filepath.Join(dbDir, "index.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer idx.Close()

	s := New(idx, xattr.New(nil), watchDir, false, nil)
	if err := s.Run(ctx); err != nil {
		t.Fatalf("Syncer.Run failed: %v", err)
	}

	if got := s.filesIndexed.Load(); got != 2 {
		t.Fatalf("Expected 2 files under explicit hidden root indexed, got %d", got)
	}

	assertIndexedPath(ctx, t, idx, rootFile, true)
	assertIndexedPath(ctx, t, idx, visibleNestedFile, true)
	assertIndexedPath(ctx, t, idx, hiddenNestedFile, false)
}

func assertIndexedPath(ctx context.Context, t *testing.T, idx *index.DB, path string, want bool) {
	t.Helper()

	results, total, err := idx.Search(ctx, index.SearchParams{
		MetaFilters: map[string]string{"__path__": "eq:" + path},
		Limit:       1,
	})
	if err != nil {
		t.Fatalf("Search(%q) failed: %v", path, err)
	}

	got := total > 0 && len(results) > 0
	if got != want {
		t.Fatalf("Indexed state for %q = %v, want %v", path, got, want)
	}
}
