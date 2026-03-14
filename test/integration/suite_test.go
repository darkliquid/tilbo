// Package integration_test contains end-to-end integration tests for tilbo.
// They run inside a privileged Docker container to obtain real fanotify,
// FUSE, and loopback-device capabilities.
//
// Requirements:
//   - Docker or Podman daemon accessible to the test runner
//   - go binary on PATH (used to build tilbo-daemon and tilbo-cli)
//   - Linux host (fanotify/FUSE tests are Linux-only)
//
// Run with:
//
//	cd test/integration && go test ./... -v -timeout 15m
package integration_test

import (
	"context"
	"fmt"
	"os"
	"testing"
	"time"

	"github.com/darkliquid/tilbo/test/integration/internal/helpers"
)

// suite is the global container + state shared across all test files.
// Initialised by TestMain; individual test files must not create their own.
var suite *helpers.Suite

// mainSock, mainDB, mainFuse, mainWatch are the paths used by the primary
// daemon instance started in TestMain. All tests that don't need an isolated
// daemon should use these.
var (
	mainSock  = helpers.SocketPath("main")
	mainDB    = helpers.DBPath("main")
	mainFuse  = helpers.FusePath("main")
	mainWatch = "/mnt/ext4"
	mainLog   = helpers.LogPath("main")
)

// ext4Mount, btrfsMount, vfatMount, tmpfsMount are the loop-mounted volumes
// created at suite startup and used by filesystem-matrix tests.
var (
	ext4Mount  *helpers.Mount
	btrfsMount *helpers.Mount
	vfatMount  *helpers.Mount
	tmpfsMount *helpers.Mount
)

func TestMain(m *testing.M) {
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Minute)
	defer cancel()

	code, err := runSuite(ctx, m)
	if err != nil {
		fmt.Fprintf(os.Stderr, "integration suite setup failed: %v\n", err)
		os.Exit(2)
	}
	os.Exit(code)
}

func runSuite(ctx context.Context, m *testing.M) (int, error) {
	// Step 1: build the tilbo binaries for linux/amd64.
	fmt.Println("integration: building tilbo binaries...")
	binDir, err := helpers.Build()
	if err != nil {
		return 1, fmt.Errorf("build binaries: %w", err)
	}
	defer os.RemoveAll(binDir)

	// Step 2: shared state directory (socket, db, logs, FUSE mounts, images).
	stateDir, err := os.MkdirTemp(helpers.TempBase(), "tilbo-integration-state-*")
	if err != nil {
		return 1, fmt.Errorf("create state dir: %w", err)
	}
	defer os.RemoveAll(stateDir)

	// Step 3: start container.
	fmt.Println("integration: starting container...")
	s, err := helpers.NewSuite(ctx, binDir, stateDir)
	if err != nil {
		return 1, fmt.Errorf("start suite: %w", err)
	}
	defer s.Close(context.Background())
	suite = s

	// Step 4: create sub-directories inside the container.
	if _, err := s.Shell(ctx, "mkdir -p /tilbo/socks /tilbo/dbs /tilbo/fuse /tilbo/images"); err != nil {
		return 1, fmt.Errorf("create container dirs: %w", err)
	}

	// Step 5: loop-mount the four filesystem types.
	fmt.Println("integration: mounting filesystems...")
	ext4Mount, err = helpers.NewMount(ctx, s, helpers.FSExt4, "/mnt/ext4")
	if err != nil {
		return 1, fmt.Errorf("mount ext4: %w", err)
	}
	defer ext4Mount.Cleanup(context.Background()) //nolint:errcheck

	btrfsMount, err = helpers.NewMount(ctx, s, helpers.FSBtrfs, "/mnt/btrfs")
	if err != nil {
		return 1, fmt.Errorf("mount btrfs: %w", err)
	}
	defer btrfsMount.Cleanup(context.Background()) //nolint:errcheck

	vfatMount, err = helpers.NewMount(ctx, s, helpers.FSVfat, "/mnt/vfat")
	if err != nil {
		return 1, fmt.Errorf("mount vfat: %w", err)
	}
	defer vfatMount.Cleanup(context.Background()) //nolint:errcheck

	tmpfsMount, err = helpers.NewMount(ctx, s, helpers.FSTmpfs, "/mnt/tmpfs")
	if err != nil {
		return 1, fmt.Errorf("mount tmpfs: %w", err)
	}
	defer tmpfsMount.Cleanup(context.Background()) //nolint:errcheck

	// Step 6: create the FUSE mount directory and start the primary daemon.
	fmt.Println("integration: starting primary daemon...")
	if _, err := s.Shell(ctx, "mkdir -p "+mainFuse); err != nil {
		return 1, fmt.Errorf("mkdir fuse: %w", err)
	}
	if err := s.StartDaemon(ctx, mainSock, mainDB, mainWatch, mainFuse, mainLog); err != nil {
		fmt.Fprintf(os.Stderr, "daemon log:\n%s\n", s.DaemonLog(context.Background(), mainLog))
		return 1, fmt.Errorf("start daemon: %w", err)
	}
	defer s.StopDaemon(context.Background(), mainSock) //nolint:errcheck

	// Step 7: probe available capabilities and store them on the suite.
	s.Caps = helpers.Probe(ctx, s, mainLog, ext4Mount)
	fmt.Printf("integration: capabilities: fanotify=%v fuse=%v user_xattr=%v\n",
		s.Caps.Fanotify, s.Caps.Fuse, s.Caps.UserXattr)

	fmt.Println("integration: suite ready; running tests")
	return m.Run(), nil
}
