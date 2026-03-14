package integration_test

import (
	"context"
	"fmt"
	"strings"
	"testing"
	"time"

	"github.com/darkliquid/tilbo/test/integration/internal/helpers"
)

// startInotifyDaemon starts an isolated tilbo-daemon with the inotify backend
// forced (-watcher inotify). It creates a private subdirectory under tmpfs as
// the watch root and registers t.Cleanup to stop the daemon.
//
// Returns the socket path and the watch directory path.
func startInotifyDaemon(t *testing.T, ctx context.Context) (sockPath, watchDir string) {
	t.Helper()

	name := "inotify-" + strings.ReplaceAll(t.Name(), "/", "-")
	sock := helpers.SocketPath(name)
	db := helpers.DBPath(name)
	fuse := helpers.FusePath(name)
	log := helpers.LogPath(name)
	watchDir = fmt.Sprintf("%s/%s", tmpfsMount.MountPath, name)

	if _, err := suite.Shell(ctx, fmt.Sprintf("mkdir -p '%s' '%s'", watchDir, fuse)); err != nil {
		t.Fatalf("inotify daemon setup mkdir: %v", err)
	}

	if err := suite.StartDaemon(ctx, sock, db, watchDir, fuse, log, "--watcher", "inotify"); err != nil {
		t.Fatalf("start inotify daemon: %v\nlog:\n%s", err, suite.DaemonLog(ctx, log))
	}
	t.Cleanup(func() { suite.StopDaemon(context.Background(), sock) }) //nolint:errcheck

	return sock, watchDir
}

// TestInotifyCreateFileAppearsInIndex verifies that creating a file inside a
// directory watched with the inotify backend causes it to land in the index.
func TestInotifyCreateFileAppearsInIndex(t *testing.T) {
	ctx := testCtx(t)
	sock, watchDir := startInotifyDaemon(t, ctx)

	path := fmt.Sprintf("%s/inotify-create-%d.txt", watchDir, time.Now().UnixNano())
	if _, err := suite.Shell(ctx, fmt.Sprintf("echo 'created' > '%s'", path)); err != nil {
		t.Fatalf("create file: %v", err)
	}
	t.Cleanup(func() { suite.Shell(context.Background(), fmt.Sprintf("rm -f '%s'", path)) }) //nolint:errcheck

	if err := suite.WaitIndexed(ctx, sock, path, 5*time.Second); err != nil {
		t.Errorf("file not indexed after create (inotify): %v", err)
	}
}

// TestInotifyModifyFileUpdatesIndex verifies that modifying an already-indexed
// file triggers a re-index via inotify.
func TestInotifyModifyFileUpdatesIndex(t *testing.T) {
	ctx := testCtx(t)
	sock, watchDir := startInotifyDaemon(t, ctx)

	path := fmt.Sprintf("%s/inotify-modify.txt", watchDir)
	if _, err := suite.Shell(ctx, fmt.Sprintf("echo 'original' > '%s'", path)); err != nil {
		t.Fatalf("create file: %v", err)
	}
	t.Cleanup(func() { suite.Shell(context.Background(), fmt.Sprintf("rm -f '%s'", path)) }) //nolint:errcheck

	if err := suite.WaitIndexed(ctx, sock, path, 5*time.Second); err != nil {
		t.Fatalf("file not indexed initially: %v", err)
	}

	initial := inotifySearchJSON(t, ctx, sock, path)

	if _, err := suite.Shell(ctx, fmt.Sprintf("echo 'appended line' >> '%s'", path)); err != nil {
		t.Fatalf("modify file: %v", err)
	}

	deadline := time.Now().Add(5 * time.Second)
	for time.Now().Before(deadline) {
		out := inotifySearchJSON(t, ctx, sock, path)
		if out != initial {
			return // index updated
		}
		select {
		case <-ctx.Done():
			t.Fatal("context cancelled waiting for modify re-index")
		case <-time.After(200 * time.Millisecond):
		}
	}
	t.Error("index was not updated after file modification within deadline (inotify)")
}

// TestInotifyDeleteFileRemovedFromIndex verifies that deleting a file causes it
// to disappear from the index via inotify.
func TestInotifyDeleteFileRemovedFromIndex(t *testing.T) {
	ctx := testCtx(t)
	sock, watchDir := startInotifyDaemon(t, ctx)

	path := fmt.Sprintf("%s/inotify-delete.txt", watchDir)
	if _, err := suite.Shell(ctx, fmt.Sprintf("echo 'to be deleted' > '%s'", path)); err != nil {
		t.Fatalf("create file: %v", err)
	}

	if err := suite.WaitIndexed(ctx, sock, path, 5*time.Second); err != nil {
		t.Fatalf("file not indexed initially: %v", err)
	}

	if _, err := suite.Shell(ctx, fmt.Sprintf("rm -f '%s'", path)); err != nil {
		t.Fatalf("delete file: %v", err)
	}

	if err := suite.WaitRemoved(ctx, sock, path, 5*time.Second); err != nil {
		t.Errorf("file still in index after delete (inotify): %v", err)
	}
}

// TestInotifySubdirectoryWatched verifies that inotify recursively watches
// subdirectories created after startup.
func TestInotifySubdirectoryWatched(t *testing.T) {
	ctx := testCtx(t)
	sock, watchDir := startInotifyDaemon(t, ctx)

	subdir := fmt.Sprintf("%s/subdir-%d", watchDir, time.Now().UnixNano())
	if _, err := suite.Shell(ctx, fmt.Sprintf("mkdir -p '%s'", subdir)); err != nil {
		t.Fatalf("mkdir subdir: %v", err)
	}
	t.Cleanup(func() { suite.Shell(context.Background(), fmt.Sprintf("rm -rf '%s'", subdir)) }) //nolint:errcheck

	path := fmt.Sprintf("%s/file-in-subdir.txt", subdir)
	if _, err := suite.Shell(ctx, fmt.Sprintf("echo 'subdir file' > '%s'", path)); err != nil {
		t.Fatalf("create file in subdir: %v", err)
	}

	if err := suite.WaitIndexed(ctx, sock, path, 5*time.Second); err != nil {
		t.Errorf("file in new subdir not indexed (inotify): %v", err)
	}
}

// TestInotifyRapidCreatesAllIndexed creates 20 files in rapid succession and
// verifies that all land in the index under the inotify backend.
func TestInotifyRapidCreatesAllIndexed(t *testing.T) {
	ctx := testCtx(t)
	sock, watchDir := startInotifyDaemon(t, ctx)

	const n = 20
	paths := make([]string, n)
	for i := range n {
		p := fmt.Sprintf("%s/rapid-%02d.txt", watchDir, i)
		paths[i] = p
		if _, err := suite.Shell(ctx, fmt.Sprintf("echo '%d' > '%s'", i, p)); err != nil {
			t.Fatalf("create rapid file %d: %v", i, err)
		}
	}
	t.Cleanup(func() {
		for _, p := range paths {
			suite.Shell(context.Background(), fmt.Sprintf("rm -f '%s'", p)) //nolint:errcheck
		}
	})

	for _, p := range paths {
		if err := suite.WaitIndexed(ctx, sock, p, 10*time.Second); err != nil {
			t.Errorf("rapid file %s not indexed (inotify): %v", p, err)
		}
	}
}

// --- helpers -----------------------------------------------------------------

func inotifySearchJSON(t *testing.T, ctx context.Context, sock, path string) string {
	t.Helper()
	out, _, _ := suite.Exec(ctx,
		"tilbo-cli", "--socket", sock,
		"search", "--meta", "__path__=eq:"+path, "--format", "json",
	)
	return out
}
