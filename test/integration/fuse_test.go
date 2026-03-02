package integration_test

import (
	"context"
	"fmt"
	"strings"
	"testing"
	"time"

	"github.com/darkliquid/tilbo/test/integration/internal/helpers"
)

// TestFUSERootIsDirectory verifies the FUSE mount point is a directory.
func TestFUSERootIsDirectory(t *testing.T) {
	ctx := testCtx(t)
	_, code, err := suite.Exec(ctx, "test", "-d", mainFuse)
	if err != nil {
		t.Fatalf("test -d fuse: %v", err)
	}
	if code != 0 {
		t.Fatalf("FUSE mount %s is not a directory (exit %d)\ndaemon log:\n%s",
			mainFuse, code, suite.DaemonLog(ctx, mainLog))
	}
}

// TestFUSETagDirAppears verifies that tagging a file causes a virtual
// directory named after the tag to appear under the FUSE root.
func TestFUSETagDirAppears(t *testing.T) {
	ctx := testCtx(t)
	path := watchedFile(t, ctx, "fuse-tag-dir.txt", "tag dir test")

	tag := "fuse-appears-tag"
	cliMust(t, ctx, "tag", "add", path, tag)

	// Poll until the tag directory is visible in the FUSE mount.
	tagDir := fmt.Sprintf("%s/%s", mainFuse, tag)
	if err := waitForFUSEPath(ctx, suite, tagDir, 5*time.Second); err != nil {
		t.Fatalf("tag dir %s did not appear in FUSE: %v\ndaemon log:\n%s",
			tagDir, err, suite.DaemonLog(ctx, mainLog))
	}
}

// TestFUSEFileInTagDir verifies that a tagged file appears as a link inside
// the corresponding FUSE virtual directory.
func TestFUSEFileInTagDir(t *testing.T) {
	ctx := testCtx(t)
	path := watchedFile(t, ctx, "fuse-file-in-dir.txt", "file in dir test")

	tag := "fuse-indir-tag"
	cliMust(t, ctx, "tag", "add", path, tag)

	tagDir := fmt.Sprintf("%s/%s", mainFuse, tag)
	if err := waitForFUSEPath(ctx, suite, tagDir, 5*time.Second); err != nil {
		t.Fatalf("tag dir %s not found: %v", tagDir, err)
	}

	// The file should appear in the tag directory listing.
	out, err := suite.Shell(ctx, fmt.Sprintf("ls '%s'", tagDir))
	if err != nil {
		t.Fatalf("ls tag dir: %v", err)
	}
	if !strings.Contains(out, "fuse-file-in-dir.txt") {
		t.Errorf("expected file in FUSE tag dir, ls output: %q", out)
	}
}

// TestFUSEFileReadable verifies that a file's content is readable through
// the FUSE virtual directory.
func TestFUSEFileReadable(t *testing.T) {
	ctx := testCtx(t)
	content := "readable content through fuse"
	path := watchedFile(t, ctx, "fuse-readable.txt", content)

	tag := "fuse-readable-tag"
	cliMust(t, ctx, "tag", "add", path, tag)

	tagDir := fmt.Sprintf("%s/%s", mainFuse, tag)
	if err := waitForFUSEPath(ctx, suite, tagDir, 5*time.Second); err != nil {
		t.Fatalf("tag dir not found: %v", err)
	}

	fuseFile := fmt.Sprintf("%s/fuse-readable.txt", tagDir)
	out, err := suite.Shell(ctx, fmt.Sprintf("cat '%s'", fuseFile))
	if err != nil {
		t.Fatalf("cat via FUSE: %v", err)
	}
	if !strings.Contains(out, content) {
		t.Errorf("expected content %q via FUSE, got: %q", content, out)
	}
}

// TestFUSEFileWritable verifies that writing through the FUSE path updates
// the real file on disk.
func TestFUSEFileWritable(t *testing.T) {
	ctx := testCtx(t)
	path := watchedFile(t, ctx, "fuse-writable.txt", "original")

	tag := "fuse-writable-tag"
	cliMust(t, ctx, "tag", "add", path, tag)

	tagDir := fmt.Sprintf("%s/%s", mainFuse, tag)
	if err := waitForFUSEPath(ctx, suite, tagDir, 5*time.Second); err != nil {
		t.Fatalf("tag dir not found: %v", err)
	}

	fuseFile := fmt.Sprintf("%s/fuse-writable.txt", tagDir)
	if _, err := suite.Shell(ctx, fmt.Sprintf("echo 'updated' > '%s'", fuseFile)); err != nil {
		t.Fatalf("write via FUSE: %v", err)
	}

	// Read back via the real path (not FUSE) to confirm the write went through.
	out, err := suite.Shell(ctx, fmt.Sprintf("cat '%s'", path))
	if err != nil {
		t.Fatalf("cat real path: %v", err)
	}
	if !strings.Contains(out, "updated") {
		t.Errorf("FUSE write did not update real file, content: %q", out)
	}
}

// TestFUSERenameRetag verifies that moving a file from one FUSE tag directory
// to another retagges the file (not a filesystem rename).
func TestFUSERenameRetag(t *testing.T) {
	ctx := testCtx(t)
	path := watchedFile(t, ctx, "fuse-retag.txt", "retag me")

	cliMust(t, ctx, "tag", "add", path, "fuse-retag-src")

	srcDir := fmt.Sprintf("%s/fuse-retag-src", mainFuse)
	dstDir := fmt.Sprintf("%s/fuse-retag-dst", mainFuse)

	if err := waitForFUSEPath(ctx, suite, srcDir, 5*time.Second); err != nil {
		t.Fatalf("source tag dir not found: %v", err)
	}

	// Move within FUSE → retag semantics (no fs rename, just tag change).
	script := fmt.Sprintf("mkdir -p '%s' && mv '%s/fuse-retag.txt' '%s/fuse-retag.txt'",
		dstDir, srcDir, dstDir)
	if _, err := suite.Shell(ctx, script); err != nil {
		t.Fatalf("mv in FUSE: %v", err)
	}

	// File must now carry fuse-retag-dst and NOT fuse-retag-src.
	out := cliMust(t, ctx, "tag", "list", path)
	if strings.Contains(out, "fuse-retag-src") {
		t.Errorf("old tag 'fuse-retag-src' should be removed after FUSE rename, got: %q", out)
	}
	if !strings.Contains(out, "fuse-retag-dst") {
		t.Errorf("new tag 'fuse-retag-dst' should be added after FUSE rename, got: %q", out)
	}
}

// TestFUSEIntersectionDir verifies the tag+tag expression path returns only
// files that have BOTH tags.
func TestFUSEIntersectionDir(t *testing.T) {
	ctx := testCtx(t)

	both := watchedFile(t, ctx, "fuse-intersect-both.txt", "both tags")
	onlyA := watchedFile(t, ctx, "fuse-intersect-only-a.txt", "only A")

	cliMust(t, ctx, "tag", "add", both, "fuse-ix-a", "fuse-ix-b")
	cliMust(t, ctx, "tag", "add", onlyA, "fuse-ix-a")

	// FUSE intersection path: /<tagA>+<tagB>/
	intersectDir := fmt.Sprintf("%s/fuse-ix-a+fuse-ix-b", mainFuse)
	if err := waitForFUSEPath(ctx, suite, intersectDir, 5*time.Second); err != nil {
		t.Fatalf("intersection dir %s not found: %v", intersectDir, err)
	}

	out, err := suite.Shell(ctx, fmt.Sprintf("ls '%s'", intersectDir))
	if err != nil {
		t.Fatalf("ls intersection dir: %v", err)
	}
	if !strings.Contains(out, "fuse-intersect-both.txt") {
		t.Errorf("expected 'both' file in intersection dir, got: %q", out)
	}
	if strings.Contains(out, "fuse-intersect-only-a.txt") {
		t.Errorf("'onlyA' file should not appear in intersection dir, got: %q", out)
	}
}

// TestFUSEUnionDir verifies the tag,tag expression path returns files with
// EITHER tag.
func TestFUSEUnionDir(t *testing.T) {
	ctx := testCtx(t)

	fileA := watchedFile(t, ctx, "fuse-union-a.txt", "union a")
	fileB := watchedFile(t, ctx, "fuse-union-b.txt", "union b")

	cliMust(t, ctx, "tag", "add", fileA, "fuse-un-x")
	cliMust(t, ctx, "tag", "add", fileB, "fuse-un-y")

	// Union path uses comma: /<tagX>,<tagY>/
	unionDir := fmt.Sprintf("%s/fuse-un-x,fuse-un-y", mainFuse)
	if err := waitForFUSEPath(ctx, suite, unionDir, 5*time.Second); err != nil {
		t.Fatalf("union dir %s not found: %v", unionDir, err)
	}

	out, err := suite.Shell(ctx, fmt.Sprintf("ls '%s'", unionDir))
	if err != nil {
		t.Fatalf("ls union dir: %v", err)
	}
	for _, name := range []string{"fuse-union-a.txt", "fuse-union-b.txt"} {
		if !strings.Contains(out, name) {
			t.Errorf("expected %s in union dir, got: %q", name, out)
		}
	}
}

// TestFUSENegationDir verifies the tag-tag expression excludes files with the
// second tag from the result set.
func TestFUSENegationDir(t *testing.T) {
	ctx := testCtx(t)

	keep := watchedFile(t, ctx, "fuse-neg-keep.txt", "keep")
	drop := watchedFile(t, ctx, "fuse-neg-drop.txt", "drop")

	cliMust(t, ctx, "tag", "add", keep, "fuse-neg-base")
	cliMust(t, ctx, "tag", "add", drop, "fuse-neg-base", "fuse-neg-excluded")

	// Negation path: /<base>-<excluded>/
	negDir := fmt.Sprintf("%s/fuse-neg-base-fuse-neg-excluded", mainFuse)
	if err := waitForFUSEPath(ctx, suite, negDir, 5*time.Second); err != nil {
		t.Fatalf("negation dir not found: %v", err)
	}

	out, err := suite.Shell(ctx, fmt.Sprintf("ls '%s'", negDir))
	if err != nil {
		t.Fatalf("ls negation dir: %v", err)
	}
	if !strings.Contains(out, "fuse-neg-keep.txt") {
		t.Errorf("expected keep file in negation dir, got: %q", out)
	}
	if strings.Contains(out, "fuse-neg-drop.txt") {
		t.Errorf("dropped file should not appear in negation dir, got: %q", out)
	}
}

// TestFUSERecentDir verifies that @recent contains recently modified files.
func TestFUSERecentDir(t *testing.T) {
	ctx := testCtx(t)
	path := watchedFile(t, ctx, "fuse-recent.txt", "recent file")
	_ = path

	recentDir := fmt.Sprintf("%s/@recent", mainFuse)
	if err := waitForFUSEPath(ctx, suite, recentDir, 5*time.Second); err != nil {
		t.Fatalf("@recent dir not found: %v", err)
	}

	out, err := suite.Shell(ctx, fmt.Sprintf("ls '%s'", recentDir))
	if err != nil {
		t.Fatalf("ls @recent: %v", err)
	}
	if !strings.Contains(out, "fuse-recent.txt") {
		t.Errorf("expected recent file in @recent dir, got: %q", out)
	}
}

// TestFUSESimilarDir verifies that @similar:<path> returns graph-related files.
func TestFUSESimilarDir(t *testing.T) {
	ctx := testCtx(t)

	seed := watchedFile(t, ctx, "fuse-similar-seed.txt", "seed")
	peer := watchedFile(t, ctx, "fuse-similar-peer.txt", "peer")

	cliMust(t, ctx, "tag", "add", seed, "fuse-sim-shared")
	cliMust(t, ctx, "tag", "add", peer, "fuse-sim-shared")

	// @similar:<encoded_path> — the daemon URL-encodes or otherwise derives
	// the virtual dir name from the path. Check the daemon logs if this fails.
	similarDir := fmt.Sprintf("%s/@similar:%s", mainFuse, seed)
	if err := waitForFUSEPath(ctx, suite, similarDir, 5*time.Second); err != nil {
		t.Fatalf("@similar dir not found: %v\ndaemon log:\n%s", err, suite.DaemonLog(ctx, mainLog))
	}

	out, err := suite.Shell(ctx, fmt.Sprintf("ls '%s'", similarDir))
	if err != nil {
		t.Fatalf("ls @similar: %v", err)
	}
	if !strings.Contains(out, "fuse-similar-peer.txt") {
		t.Errorf("expected peer in @similar, got: %q", out)
	}
}

// --- helpers -----------------------------------------------------------------

// waitForFUSEPath polls until path is stat-able inside the container.
func waitForFUSEPath(ctx context.Context, s *helpers.Suite, path string, timeout time.Duration) error {
	deadline := time.Now().Add(timeout)
	for time.Now().Before(deadline) {
		_, code, err := s.Exec(ctx, "test", "-e", path)
		if err != nil {
			return err
		}
		if code == 0 {
			return nil
		}
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-time.After(200 * time.Millisecond):
		}
	}
	return fmt.Errorf("timed out waiting for FUSE path %s", path)
}
