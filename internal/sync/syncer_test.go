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
	s := New(idx, svc, tmpDir)

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

	s := New(idx, svc, tmpDir)

	info, err := os.Stat(file1)
	if err != nil {
		t.Fatal(err)
	}
	sysStat := info.Sys().(*syscall.Stat_t)

	if err := s.SyncFile(ctx, file1, sysStat); err != nil {
		t.Fatalf("SyncFile failed: %v", err)
	}

	if s.filesIndexed.Load() != 1 {
		t.Errorf("Expected filesIndexed=1, got %d", s.filesIndexed.Load())
	}
}
