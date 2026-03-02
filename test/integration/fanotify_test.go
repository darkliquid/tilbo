package integration_test

import (
	"context"
	"fmt"
	"strings"
	"testing"
	"time"
)

// TestCreateFileAppearsInIndex verifies that creating a file inside the watched
// directory causes it to land in the index automatically via fanotify.
func TestCreateFileAppearsInIndex(t *testing.T) {
	ctx := testCtx(t)
	path := fmt.Sprintf("%s/fanotify-create-%d.txt", mainWatch, time.Now().UnixNano())

	if _, err := suite.Shell(ctx, fmt.Sprintf("echo 'created' > '%s'", path)); err != nil {
		t.Fatalf("create file: %v", err)
	}
	t.Cleanup(func() { suite.Shell(context.Background(), fmt.Sprintf("rm -f '%s'", path)) }) //nolint:errcheck

	if err := suite.WaitIndexed(ctx, mainSock, path, 5*time.Second); err != nil {
		t.Errorf("file not indexed after create: %v\ndaemon log:\n%s",
			err, suite.DaemonLog(ctx, mainLog))
	}
}

// TestModifyFileUpdatesIndex verifies that modifying an already-indexed file
// triggers a re-index (the mtime or size visible via search must change).
func TestModifyFileUpdatesIndex(t *testing.T) {
	ctx := testCtx(t)
	path := watchedFile(t, ctx, "fanotify-modify.txt", "original content")

	// Grab the initial size from search output.
	initialOut := searchJSON(t, ctx, path)

	// Append content to change the file's size.
	if _, err := suite.Shell(ctx, fmt.Sprintf("echo 'appended line' >> '%s'", path)); err != nil {
		t.Fatalf("modify file: %v", err)
	}

	// Poll until search output changes (daemon re-indexed the file).
	deadline := time.Now().Add(5 * time.Second)
	for time.Now().Before(deadline) {
		out := searchJSON(t, ctx, path)
		if out != initialOut {
			return // index updated
		}
		select {
		case <-ctx.Done():
			t.Fatal("context cancelled waiting for modify re-index")
		case <-time.After(200 * time.Millisecond):
		}
	}
	t.Error("index was not updated after file modification within deadline")
}

// TestDeleteFileRemovedFromIndex verifies that deleting a file causes it to
// disappear from the index.
func TestDeleteFileRemovedFromIndex(t *testing.T) {
	ctx := testCtx(t)
	path := watchedFile(t, ctx, "fanotify-delete.txt", "to be deleted")

	// Delete the file.
	if _, err := suite.Shell(ctx, fmt.Sprintf("rm -f '%s'", path)); err != nil {
		t.Fatalf("delete file: %v", err)
	}

	if err := suite.WaitRemoved(ctx, mainSock, path, 5*time.Second); err != nil {
		t.Errorf("file still in index after delete: %v\ndaemon log:\n%s",
			err, suite.DaemonLog(ctx, mainLog))
	}
}

// TestRenamePreservesTags verifies that renaming a file within the watched
// directory retains its tags. Since xattr travels with the inode, the daemon
// reads the tags from the xattr on the new path and re-indexes.
func TestRenamePreservesTags(t *testing.T) {
	ctx := testCtx(t)
	src := watchedFile(t, ctx, "fanotify-rename-src.txt", "rename me")
	dst := fmt.Sprintf("%s/fanotify-rename-dst.txt", mainWatch)

	cliMust(t, ctx, "tag", "add", src, "rename-preserved-tag")

	// Rename.
	if _, err := suite.Shell(ctx, fmt.Sprintf("mv '%s' '%s'", src, dst)); err != nil {
		t.Fatalf("rename: %v", err)
	}
	t.Cleanup(func() { suite.Shell(context.Background(), fmt.Sprintf("rm -f '%s'", dst)) }) //nolint:errcheck

	// Wait for dst to appear in index.
	if err := suite.WaitIndexed(ctx, mainSock, dst, 5*time.Second); err != nil {
		t.Fatalf("renamed file not indexed: %v", err)
	}

	// Tags must survive the rename.
	out := cliMust(t, ctx, "tag", "list", dst)
	if !strings.Contains(out, "rename-preserved-tag") {
		t.Errorf("tag not preserved after rename, got: %q\ndaemon log:\n%s",
			out, suite.DaemonLog(ctx, mainLog))
	}
}

// TestCrossDirectoryRenamePreservesTags checks rename across directories
// within the same watched mount.
func TestCrossDirectoryRenamePreservesTags(t *testing.T) {
	ctx := testCtx(t)

	subdir := fmt.Sprintf("%s/subdir-%d", mainWatch, time.Now().UnixNano())
	if _, err := suite.Shell(ctx, fmt.Sprintf("mkdir -p '%s'", subdir)); err != nil {
		t.Fatalf("mkdir subdir: %v", err)
	}
	t.Cleanup(func() { suite.Shell(context.Background(), fmt.Sprintf("rm -rf '%s'", subdir)) }) //nolint:errcheck

	src := watchedFile(t, ctx, "fanot-xdir-src.txt", "cross-dir rename")
	dst := fmt.Sprintf("%s/fanot-xdir-dst.txt", subdir)

	cliMust(t, ctx, "tag", "add", src, "xdir-rename-tag")

	if _, err := suite.Shell(ctx, fmt.Sprintf("mv '%s' '%s'", src, dst)); err != nil {
		t.Fatalf("cross-dir rename: %v", err)
	}
	t.Cleanup(func() { suite.Shell(context.Background(), fmt.Sprintf("rm -f '%s'", dst)) }) //nolint:errcheck

	if err := suite.WaitIndexed(ctx, mainSock, dst, 5*time.Second); err != nil {
		t.Fatalf("cross-dir renamed file not indexed: %v", err)
	}

	out := cliMust(t, ctx, "tag", "list", dst)
	if !strings.Contains(out, "xdir-rename-tag") {
		t.Errorf("tag not preserved after cross-dir rename, got: %q", out)
	}
}

// TestRapidCreatesAllIndexed creates 20 files in rapid succession and
// verifies that every one lands in the index (debounce coalesces per-path,
// not across paths).
func TestRapidCreatesAllIndexed(t *testing.T) {
	ctx := testCtx(t)

	const n = 20
	paths := make([]string, n)
	for i := range n {
		p := fmt.Sprintf("%s/rapid-%02d.txt", mainWatch, i)
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

	// All files must appear in the index within a generous deadline.
	for _, p := range paths {
		if err := suite.WaitIndexed(ctx, mainSock, p, 10*time.Second); err != nil {
			t.Errorf("rapid file %s not indexed: %v", p, err)
		}
	}
}

// --- helpers -----------------------------------------------------------------

// searchJSON runs a search for a specific path and returns the JSON output.
// It does not fail on empty results.
func searchJSON(t *testing.T, ctx context.Context, path string) string {
	t.Helper()
	out, _, _ := suite.Exec(ctx,
		"tilbo-cli", "--socket", mainSock,
		"search", "--meta", "__path__=eq:"+path, "--format", "json",
	)
	return out
}
