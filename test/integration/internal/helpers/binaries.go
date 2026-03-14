// Package helpers provides shared utilities for the tilbo integration tests.
package helpers

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
)

// RepoRoot returns the absolute path to the tilbo repository root by walking
// up from this file's location until go.mod is found.
func RepoRoot() (string, error) {
	_, file, _, ok := runtime.Caller(0)
	if !ok {
		return "", fmt.Errorf("runtime.Caller failed")
	}
	// file is .../test/integration/internal/helpers/binaries.go
	// walk up four levels: helpers → internal → integration → test → repo root
	dir := filepath.Dir(file)
	for i := 0; i < 4; i++ {
		dir = filepath.Dir(dir)
	}
	if _, err := os.Stat(filepath.Join(dir, "go.mod")); err != nil {
		return "", fmt.Errorf("could not locate repo root from %s: %w", file, err)
	}
	return dir, nil
}

// TempBase returns the base directory to use for integration-test temp dirs.
// It respects the TILBO_TEST_TMPDIR environment variable so that users whose
// Docker daemon runs inside a VM (e.g. Colima/Lima on Linux) can point it at a
// path that is shared into the VM (typically $HOME or /tmp/lima).
// When the variable is unset the standard os.TempDir() is used.
func TempBase() string {
	if v := os.Getenv("TILBO_TEST_TMPDIR"); v != "" {
		return v
	}
	return os.TempDir()
}

// Build compiles tilbo-daemon and tilbo-cli into a temporary directory and
// returns the directory path. The caller must remove the directory when done.
//
// Both binaries are built for linux/amd64 with CGO_ENABLED=0 so they can be
// injected into the test container regardless of the host platform.
func Build() (binDir string, err error) {
	root, err := RepoRoot()
	if err != nil {
		return "", fmt.Errorf("find repo root: %w", err)
	}

	binDir, err = os.MkdirTemp(TempBase(), "tilbo-integration-bins-*")
	if err != nil {
		return "", fmt.Errorf("create bin tmpdir: %w", err)
	}

	for _, cmd := range []string{"tilbo-daemon", "tilbo-cli"} {
		out := filepath.Join(binDir, cmd)
		c := exec.Command("go", "build", "-o", out, "./cmd/"+cmd)
		c.Dir = root
		c.Env = append(os.Environ(),
			"GOOS=linux",
			"GOARCH=amd64",
			"CGO_ENABLED=0",
		)
		if b, err := c.CombinedOutput(); err != nil {
			os.RemoveAll(binDir)
			return "", fmt.Errorf("build %s: %w\n%s", cmd, err, b)
		}
		// Make the binary executable.
		if err := os.Chmod(out, 0o755); err != nil {
			os.RemoveAll(binDir)
			return "", fmt.Errorf("chmod %s: %w", cmd, err)
		}
	}

	return binDir, nil
}
