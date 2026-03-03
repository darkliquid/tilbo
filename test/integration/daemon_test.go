package integration_test

import (
	"context"
	"fmt"
	"strings"
	"testing"
	"time"
)

// TestDaemonStartsAndResponds verifies that the primary daemon is running and
// responds to a status IPC request via the CLI.
func TestDaemonStartsAndResponds(t *testing.T) {
	ctx := testCtx(t)
	out, err := suite.CLI(ctx, mainSock, "daemon", "status")
	if err != nil {
		t.Fatalf("daemon status: %v\noutput: %s\ndaemon log:\n%s",
			err, out, suite.DaemonLog(ctx, mainLog))
	}
	if !strings.Contains(out, "state:") {
		t.Errorf("expected 'state:' in status output, got: %q", out)
	}
}

// TestDaemonFUSEMountVisible verifies that the FUSE virtual directory is
// accessible inside the container after daemon startup.
func TestDaemonFUSEMountVisible(t *testing.T) {
	suite.Caps.RequireFuse(t)
	ctx := testCtx(t)
	out, code, err := suite.Exec(ctx, "test", "-d", mainFuse)
	if err != nil {
		t.Fatalf("test -d fuse mount: %v", err)
	}
	if code != 0 {
		t.Errorf("FUSE mount %s is not a directory (exit %d)\ndaemon log:\n%s",
			mainFuse, code, suite.DaemonLog(ctx, mainLog))
		_ = out
	}
}

// TestDaemonSIGHUP verifies that sending SIGHUP does not crash the daemon:
// it should stay alive and continue responding to IPC after reload.
func TestDaemonSIGHUP(t *testing.T) {
	ctx := testCtx(t)
	pidFile := mainSock + ".pid"

	// Send SIGHUP.
	if _, err := suite.Shell(ctx, fmt.Sprintf("kill -HUP $(cat '%s')", pidFile)); err != nil {
		t.Fatalf("send SIGHUP: %v", err)
	}
	// Give it a moment to process the reload.
	time.Sleep(300 * time.Millisecond)

	// Daemon must still respond.
	out, err := suite.CLI(ctx, mainSock, "daemon", "status")
	if err != nil {
		t.Fatalf("daemon status after SIGHUP: %v\noutput: %s\ndaemon log:\n%s",
			err, out, suite.DaemonLog(ctx, mainLog))
	}
	if !strings.Contains(out, "state:") {
		t.Errorf("expected 'state:' after SIGHUP, got: %q", out)
	}
}

// TestDaemonReloadRulesCLI verifies the reload-rules IPC pathway.
func TestDaemonReloadRulesCLI(t *testing.T) {
	ctx := testCtx(t)
	out, err := suite.CLI(ctx, mainSock, "daemon", "reload-rules")
	if err != nil {
		t.Fatalf("reload-rules: %v\noutput: %s", err, out)
	}
	if !strings.Contains(out, "reloaded") {
		t.Errorf("expected 'reloaded' in output, got: %q", out)
	}
}

// TestDaemonRestartRetainsIndex stops and restarts the daemon and verifies
// that previously indexed files and tags survive the restart (SQLite is durable).
func TestDaemonRestartRetainsIndex(t *testing.T) {
	ctx := testCtx(t)

	// Create a file and tag it.
	path := mainWatch + "/restart-retain-test.txt"
	if _, err := suite.Shell(ctx, fmt.Sprintf("echo hello > '%s'", path)); err != nil {
		t.Fatalf("create file: %v", err)
	}
	t.Cleanup(func() { suite.Shell(context.Background(), fmt.Sprintf("rm -f '%s'", path)) }) //nolint:errcheck

	if err := suite.WaitIndexed(ctx, mainSock, path, 5*time.Second); err != nil {
		t.Fatalf("wait for file to be indexed: %v", err)
	}
	if _, err := suite.CLI(ctx, mainSock, "tag", "add", path, "retain-test"); err != nil {
		t.Fatalf("tag add: %v", err)
	}

	// Stop daemon.
	if err := suite.StopDaemon(ctx, mainSock); err != nil {
		t.Fatalf("stop daemon: %v", err)
	}
	// Re-start daemon (same socket, db, watch, fuse paths).
	if err := suite.StartDaemon(ctx, mainSock, mainDB, mainWatch, mainFuse, mainLog); err != nil {
		t.Fatalf("restart daemon: %v\ndaemon log:\n%s", err, suite.DaemonLog(ctx, mainLog))
	}

	// Query tags — must survive restart.
	out, err := suite.CLI(ctx, mainSock, "tag", "list", path)
	if err != nil {
		t.Fatalf("tag list after restart: %v", err)
	}
	if !strings.Contains(out, "retain-test") {
		t.Errorf("expected tag 'retain-test' after restart, got: %q", out)
	}
}

// testCtx returns a context with a per-test deadline that also respects the
// parent context from TestMain.
func testCtx(t *testing.T) context.Context {
	t.Helper()
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	t.Cleanup(cancel)
	return ctx
}
