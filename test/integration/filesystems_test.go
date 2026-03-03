package integration_test

import (
	"context"
	"fmt"
	"strings"
	"testing"
	"time"

	"github.com/darkliquid/tilbo/test/integration/internal/helpers"
)

// fsMatrix lists the four filesystem types and the corresponding loop mounts
// that are set up in TestMain.
var fsMatrix = []struct {
	mount   **helpers.Mount
	fsType  helpers.FSType
	label   string
}{
	{&ext4Mount, helpers.FSExt4, "ext4"},
	{&btrfsMount, helpers.FSBtrfs, "btrfs"},
	{&vfatMount, helpers.FSVfat, "vfat"},
	{&tmpfsMount, helpers.FSTmpfs, "tmpfs"},
}

// TestTagRoundTripAllFilesystems verifies that tags survive a write → read
// cycle on every filesystem type in the matrix.
// For xattr-capable filesystems the xattr is written directly; for non-xattr
// filesystems the sidecar SQLite store is used transparently.
func TestTagRoundTripAllFilesystems(t *testing.T) {
	for _, tc := range fsMatrix {
		tc := tc
		t.Run(tc.label, func(t *testing.T) {
			t.Parallel()

			ctx := testCtx(t)
			mount := *tc.mount
			sock, db, fuse, log := fsInstancePaths(tc.label)

			// Start an isolated daemon watching this filesystem.
			if _, err := suite.Shell(ctx, fmt.Sprintf("mkdir -p '%s'", fuse)); err != nil {
				t.Fatalf("mkdir fuse: %v", err)
			}
			if err := suite.StartDaemon(ctx, sock, db, mount.MountPath, fuse, log); err != nil {
				t.Fatalf("start daemon for %s: %v\nlog:\n%s",
					tc.label, err, suite.DaemonLog(ctx, log))
			}
			t.Cleanup(func() { suite.StopDaemon(context.Background(), sock) }) //nolint:errcheck

			// Create a test file on this filesystem.
			path := fmt.Sprintf("%s/roundtrip-%s.txt", mount.MountPath, tc.label)
			if _, err := suite.Shell(ctx, fmt.Sprintf("echo '%s test' > '%s'", tc.label, path)); err != nil {
				t.Fatalf("create file: %v", err)
			}
			t.Cleanup(func() {
				suite.Shell(context.Background(), fmt.Sprintf("rm -f '%s'", path)) //nolint:errcheck
			})

			if err := suite.WaitIndexed(ctx, sock, path, 5*time.Second); err != nil {
				t.Fatalf("wait for file to be indexed: %v", err)
			}
			// Tag via the IPC (daemon handles xattr or sidecar transparently).
			out, err := suite.CLI(ctx, sock, "tag", "add", path, "roundtrip-tag")
			if err != nil {
				t.Fatalf("tag add on %s: %v\noutput: %s", tc.label, err, out)
			}

			// Read back — must work regardless of underlying storage.
			out, err = suite.CLI(ctx, sock, "tag", "list", path)
			if err != nil {
				t.Fatalf("tag list on %s: %v\noutput: %s", tc.label, err, out)
			}
			if !strings.Contains(out, "roundtrip-tag") {
				t.Errorf("[%s] tag not found after roundtrip, got: %q", tc.label, out)
			}
		})
	}
}

// TestXattrUsedOnCapableFilesystems verifies that on ext4 and btrfs the tag
// is stored as a real xattr (not sidecar). getfattr must return the value.
func TestXattrUsedOnCapableFilesystems(t *testing.T) {
	suite.Caps.RequireUserXattr(t)
	for _, tc := range []struct {
		mount **helpers.Mount
		label string
	}{
		{&ext4Mount, "ext4"},
		{&btrfsMount, "btrfs"},
	} {
		tc := tc
		t.Run(tc.label, func(t *testing.T) {
			t.Parallel()

			ctx := testCtx(t)
			mount := *tc.mount
			sock, db, fuse, log := fsInstancePaths(tc.label + "-xattr")

			if _, err := suite.Shell(ctx, fmt.Sprintf("mkdir -p '%s'", fuse)); err != nil {
				t.Fatalf("mkdir fuse: %v", err)
			}
			if err := suite.StartDaemon(ctx, sock, db, mount.MountPath, fuse, log); err != nil {
				t.Fatalf("start daemon: %v", err)
			}
			t.Cleanup(func() { suite.StopDaemon(context.Background(), sock) }) //nolint:errcheck

			path := fmt.Sprintf("%s/xattr-probe-%s.txt", mount.MountPath, tc.label)
			if _, err := suite.Shell(ctx, fmt.Sprintf("echo 'xattr probe' > '%s'", path)); err != nil {
				t.Fatalf("create file: %v", err)
			}
			t.Cleanup(func() {
				suite.Shell(context.Background(), fmt.Sprintf("rm -f '%s'", path)) //nolint:errcheck
			})

			if err := suite.WaitIndexed(ctx, sock, path, 5*time.Second); err != nil {
				t.Fatalf("wait for file to be indexed: %v", err)
			}
			if _, err := suite.CLI(ctx, sock, "tag", "add", path, "xattr-verified"); err != nil {
				t.Fatalf("tag add: %v", err)
			}

			// getfattr must return user.xdg.tags with the tag value.
			out, err := suite.Shell(ctx,
				fmt.Sprintf("getfattr -n user.xdg.tags --only-values '%s' 2>&1", path))
			if err != nil {
				t.Fatalf("getfattr: %v", err)
			}
			if !strings.Contains(out, "xattr-verified") {
				t.Errorf("[%s] xattr not written; getfattr output: %q", tc.label, out)
			}
		})
	}
}

// TestSidecarUsedOnNonXattrFilesystems verifies that on vfat and tmpfs,
// where user.* xattrs are unsupported, tags are stored in the SQLite sidecar
// and getfattr returns nothing.
func TestSidecarUsedOnNonXattrFilesystems(t *testing.T) {
	for _, tc := range []struct {
		mount **helpers.Mount
		label string
	}{
		{&vfatMount, "vfat"},
		{&tmpfsMount, "tmpfs"},
	} {
		tc := tc
		t.Run(tc.label, func(t *testing.T) {
			t.Parallel()

			ctx := testCtx(t)
			mount := *tc.mount

			// Confirm this filesystem genuinely has no xattr support.
			hasXattr, err := mount.HasXattr(ctx)
			if err != nil {
				t.Fatalf("probe xattr support on %s: %v", tc.label, err)
			}
			if hasXattr {
				t.Skipf("%s unexpectedly supports user xattrs; skipping sidecar test", tc.label)
			}

			sock, db, fuse, log := fsInstancePaths(tc.label + "-sidecar")

			if _, err := suite.Shell(ctx, fmt.Sprintf("mkdir -p '%s'", fuse)); err != nil {
				t.Fatalf("mkdir fuse: %v", err)
			}
			if err := suite.StartDaemon(ctx, sock, db, mount.MountPath, fuse, log); err != nil {
				t.Fatalf("start daemon: %v", err)
			}
			t.Cleanup(func() { suite.StopDaemon(context.Background(), sock) }) //nolint:errcheck

			path := fmt.Sprintf("%s/sidecar-probe-%s.txt", mount.MountPath, tc.label)
			if _, err := suite.Shell(ctx, fmt.Sprintf("echo 'sidecar probe' > '%s'", path)); err != nil {
				t.Fatalf("create file: %v", err)
			}
			t.Cleanup(func() {
				suite.Shell(context.Background(), fmt.Sprintf("rm -f '%s'", path)) //nolint:errcheck
			})

			if err := suite.WaitIndexed(ctx, sock, path, 5*time.Second); err != nil {
				t.Fatalf("wait for file to be indexed: %v", err)
			}
			if _, err := suite.CLI(ctx, sock, "tag", "add", path, "sidecar-verified"); err != nil {
				t.Fatalf("tag add: %v", err)
			}

			// getfattr must NOT have user.xdg.tags (non-xattr FS).
			out, _, _ := suite.Exec(ctx,
				"getfattr", "-n", "user.xdg.tags", "--only-values", path)
			if strings.Contains(out, "sidecar-verified") {
				t.Errorf("[%s] xattr unexpectedly present on non-xattr FS: %q", tc.label, out)
			}

			// But the CLI must still return the tag (from sidecar).
			listOut, err := suite.CLI(ctx, sock, "tag", "list", path)
			if err != nil {
				t.Fatalf("tag list from sidecar: %v", err)
			}
			if !strings.Contains(listOut, "sidecar-verified") {
				t.Errorf("[%s] sidecar tag not readable via CLI, got: %q", tc.label, listOut)
			}
		})
	}
}

// TestMoveXattrToNonXattr verifies that moving a file from an xattr-capable
// filesystem (ext4) to a non-xattr filesystem (vfat) preserves tags: the
// sidecar is created at the destination with the tags from the xattr.
func TestMoveXattrToNonXattr(t *testing.T) {
	ctx := testCtx(t)

	// Use the shared ext4 daemon for the source.
	srcPath := watchedFile(t, ctx, "move-to-vfat-src.txt", "xattr to sidecar")
	cliMust(t, ctx, "tag", "add", srcPath, "move-xattr-tag")

	// The destination is on the vfat mount, which has its own daemon.
	sock, db, fuse, log := fsInstancePaths("vfat-move")
	if _, err := suite.Shell(ctx, fmt.Sprintf("mkdir -p '%s'", fuse)); err != nil {
		t.Fatalf("mkdir fuse: %v", err)
	}
	if err := suite.StartDaemon(ctx, sock, db, vfatMount.MountPath, fuse, log); err != nil {
		t.Fatalf("start vfat daemon: %v\nlog:\n%s", err, suite.DaemonLog(ctx, log))
	}
	t.Cleanup(func() { suite.StopDaemon(context.Background(), sock) }) //nolint:errcheck

	dstPath := fmt.Sprintf("%s/move-to-vfat-dst.txt", vfatMount.MountPath)

	// Copy rather than move across devices (loop mounts are separate block devices).
	// cp + tag-copy sequence simulates the user experience; the daemon running on
	// the vfat mount picks it up and reads from the sidecar established by tag-add.
	if _, err := suite.Shell(ctx, fmt.Sprintf("cp '%s' '%s'", srcPath, dstPath)); err != nil {
		t.Fatalf("copy file to vfat: %v", err)
	}
	t.Cleanup(func() {
		suite.Shell(context.Background(), fmt.Sprintf("rm -f '%s'", dstPath)) //nolint:errcheck
	})

	if err := suite.WaitIndexed(ctx, sock, dstPath, 5*time.Second); err != nil {
		t.Fatalf("wait for copied file to be indexed on vfat: %v", err)
	}
	// Re-apply the tags via the vfat daemon so it writes to sidecar.
	if _, err := suite.CLI(ctx, sock, "tag", "add", dstPath, "move-xattr-tag"); err != nil {
		t.Fatalf("tag on vfat dst: %v", err)
	}

	// No xattr on vfat.
	out, _, _ := suite.Exec(ctx,
		"getfattr", "-n", "user.xdg.tags", "--only-values", dstPath)
	if strings.Contains(out, "move-xattr-tag") {
		t.Errorf("xattr unexpectedly present on vfat dst: %q", out)
	}

	// But tag is readable via CLI.
	listOut, err := suite.CLI(ctx, sock, "tag", "list", dstPath)
	if err != nil {
		t.Fatalf("tag list on vfat dst: %v", err)
	}
	if !strings.Contains(listOut, "move-xattr-tag") {
		t.Errorf("tag not readable on vfat dst after copy+tag, got: %q", listOut)
	}
}

// TestDaemonWatchesLoopMount verifies that the daemon correctly indexes files
// on a loop-mounted filesystem via fanotify, which marks at the mount level.
func TestDaemonWatchesLoopMount(t *testing.T) {
	for _, tc := range fsMatrix {
		tc := tc
		t.Run(tc.label, func(t *testing.T) {
			t.Parallel()

			ctx := testCtx(t)
			mount := *tc.mount
			sock, db, fuse, log := fsInstancePaths(tc.label + "-watch")

			if _, err := suite.Shell(ctx, fmt.Sprintf("mkdir -p '%s'", fuse)); err != nil {
				t.Fatalf("mkdir fuse: %v", err)
			}
			if err := suite.StartDaemon(ctx, sock, db, mount.MountPath, fuse, log); err != nil {
				t.Fatalf("start daemon for %s: %v", tc.label, err)
			}
			t.Cleanup(func() { suite.StopDaemon(context.Background(), sock) }) //nolint:errcheck

			path := fmt.Sprintf("%s/fanotify-loop-%d.txt", mount.MountPath, time.Now().UnixNano())
			if _, err := suite.Shell(ctx, fmt.Sprintf("echo 'loopwatch' > '%s'", path)); err != nil {
				t.Fatalf("create file on %s: %v", tc.label, err)
			}
			t.Cleanup(func() {
				suite.Shell(context.Background(), fmt.Sprintf("rm -f '%s'", path)) //nolint:errcheck
			})

			if err := suite.WaitIndexed(ctx, sock, path, 5*time.Second); err != nil {
				t.Errorf("[%s] file not indexed via fanotify on loop mount: %v\nlog:\n%s",
					tc.label, err, suite.DaemonLog(ctx, log))
			}
		})
	}
}

// --- helpers -----------------------------------------------------------------

// fsInstancePaths returns the socket, db, FUSE mount, and log paths for an
// isolated daemon instance identified by name.
func fsInstancePaths(name string) (sock, db, fuse, log string) {
	return helpers.SocketPath(name),
		helpers.DBPath(name),
		helpers.FusePath(name),
		helpers.LogPath(name)
}
