package daemon

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"io/fs"
	"log/slog"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"sync"
	"syscall"
	"time"

	"github.com/darkliquid/tilbo/internal/icontheme"
	ipcv1 "github.com/darkliquid/tilbo/internal/ipc/gen/tilbo/ipc/v1"
	"github.com/darkliquid/tilbo/internal/quickshell"
)

// guiManager tracks and manages the Quickshell GUI process.
type guiManager struct {
	mu        sync.Mutex
	cmd       *exec.Cmd
	shellPath string // path to shell.qml
	broadcast func(*ipcv1.Event)
}

// newGUIManager creates a GUI manager. shellPath is the path to the Quickshell
// shell.qml entry point. If empty, the XDG data-home copy is updated from the
// embedded bundle when the content has changed, then resolved from well-known
// locations.
func newGUIManager(shellPath string, broadcast func(*ipcv1.Event)) *guiManager {
	gm := &guiManager{broadcast: broadcast}
	if shellPath == "" {
		// Always attempt to sync the embedded bundle to the XDG data dir so
		// that the on-disk copy stays up to date with the compiled-in version.
		// The manager is created first so stopForUpdate can stop a tracked GUI.
		if extracted, err := gm.syncEmbeddedQuickshell(); err != nil {
			slog.Warn("failed to sync embedded quickshell", "err", err)
		} else if extracted != "" {
			shellPath = extracted
		}
	}
	if shellPath == "" {
		shellPath = resolveShellQML()
	}
	gm.shellPath = shellPath
	return gm
}

const guiStopTimeout = 2 * time.Second

// stopForUpdate stops the tracked GUI process to allow safe file replacement.
// It sends SIGTERM and waits up to guiStopTimeout for a clean exit before
// force-killing. Must NOT be called with gm.mu held.
func (gm *guiManager) stopForUpdate() {
	gm.mu.Lock()
	cmd := gm.cmd
	gm.cmd = nil
	gm.mu.Unlock()

	if cmd == nil || cmd.Process == nil {
		return
	}

	slog.Info("stopping GUI for quickshell update")
	_ = cmd.Process.Signal(syscall.SIGTERM)

	done := make(chan struct{})
	go func() {
		_ = cmd.Wait()
		close(done)
	}()

	select {
	case <-done:
	case <-time.After(guiStopTimeout):
		_ = cmd.Process.Kill()
	}
}

// Launch starts the Quickshell GUI or asks an already-running instance to show
// a window. Returns (alreadyRunning, error).
func (gm *guiManager) Launch(path string) (bool, error) {
	gm.mu.Lock()
	defer gm.mu.Unlock()

	if gm.isRunning() {
		// GUI is already running — broadcast a ShowWindow event so it
		// raises/navigates to the requested path.
		if gm.broadcast != nil {
			gm.broadcast(&ipcv1.Event{
				Kind: &ipcv1.Event_ShowWindow{
					ShowWindow: &ipcv1.ShowWindowEvent{Path: path},
				},
			})
		}
		return true, nil
	}

	if gm.shellPath == "" {
		return false, errors.New("cannot find shell.qml; set [daemon] gui_shell_path in config")
	}

	iconTheme := icontheme.Detect()
	slog.Info("launching GUI", "shell", gm.shellPath, "icon_theme", iconTheme, "path", path)

	//nolint:gosec,noctx // path is from user config and daemon starts independently
	cmd := exec.Command(
		"quickshell",
		"-p",
		gm.shellPath,
	)
	cmd.Stdin = nil
	cmd.Stdout = nil
	cmd.Stderr = nil

	// Inherit the current environment and set QS_ICON_THEME.
	cmd.Env = append(os.Environ(), "QS_ICON_THEME="+iconTheme)

	if err := cmd.Start(); err != nil {
		return false, fmt.Errorf("start quickshell: %w", err)
	}

	gm.cmd = cmd

	// Reap the process in the background so we notice when it exits.
	go func() {
		if err := cmd.Wait(); err != nil {
			slog.Debug("quickshell exited", "err", err)
		} else {
			slog.Debug("quickshell exited cleanly")
		}
		gm.mu.Lock()
		if gm.cmd == cmd {
			gm.cmd = nil
		}
		gm.mu.Unlock()
	}()

	// If a path was requested, broadcast ShowWindow so the GUI navigates
	// once it connects.
	if path != "" && gm.broadcast != nil {
		gm.broadcast(&ipcv1.Event{
			Kind: &ipcv1.Event_ShowWindow{
				ShowWindow: &ipcv1.ShowWindowEvent{Path: path},
			},
		})
	}

	return false, nil
}

// isRunning reports whether the tracked process is still alive.
// Must be called with gm.mu held.
func (gm *guiManager) isRunning() bool {
	if gm.cmd == nil || gm.cmd.Process == nil {
		return false
	}
	// Signal 0 checks for process existence without sending a signal.
	return gm.cmd.Process.Signal(syscall.Signal(0)) == nil
}

const embedHashFile = ".embed-hash"

// embeddedQuickshellHash returns a hex SHA-256 digest over all files in the
// embedded FS, walked in deterministic (sorted) order.  The digest covers each
// file's relative path and its full content so any addition, removal, rename,
// or content change is detected.
func embeddedQuickshellHash() (string, error) {
	var paths []string
	if err := fs.WalkDir(quickshell.Files, ".", func(p string, d fs.DirEntry, err error) error {
		if err != nil || d.IsDir() {
			return err
		}
		paths = append(paths, p)
		return nil
	}); err != nil {
		return "", err
	}
	sort.Strings(paths)

	h := sha256.New()
	for _, p := range paths {
		data, err := fs.ReadFile(quickshell.Files, p)
		if err != nil {
			return "", err
		}
		fmt.Fprintf(h, "%s\x00", p)
		h.Write(data)
	}
	return hex.EncodeToString(h.Sum(nil)), nil
}

// syncEmbeddedQuickshell writes the bundled QML files to the user's XDG data
// directory only when the content has changed since the last extraction (or the
// directory doesn't exist yet).  It returns the path to shell.qml on success.
//
// When an update is needed it first stops any tracked GUI process (SIGTERM +
// 2 s timeout) and then removes the entire target directory before writing the
// new files.  Deleting before writing ensures no running Quickshell instance —
// including orphaned processes from a previous daemon session — can observe a
// partially-updated file tree or hot-reload stale QML.
func (gm *guiManager) syncEmbeddedQuickshell() (string, error) {
	dataHome := os.Getenv("XDG_DATA_HOME")
	if dataHome == "" {
		home, err := os.UserHomeDir()
		if err != nil {
			return "", fmt.Errorf("resolve home dir: %w", err)
		}
		dataHome = filepath.Join(home, ".local", "share")
	}
	targetDir := filepath.Join(dataHome, "tilbo", "quickshell")

	currentHash, err := embeddedQuickshellHash()
	if err != nil {
		return "", fmt.Errorf("hash embedded quickshell: %w", err)
	}

	// Compare against the stored hash to decide whether extraction is needed.
	hashFile := filepath.Join(targetDir, embedHashFile)
	storedHash, _ := os.ReadFile(hashFile) //nolint:gosec // targetDir is under XDG_DATA_HOME / user home
	if string(storedHash) == currentHash {
		// On-disk copy is up to date.
		return filepath.Join(targetDir, "shell.qml"), nil
	}

	// Stop any GUI process this manager is tracking before touching files.
	gm.stopForUpdate()

	// Remove the old tree entirely so no running Quickshell (including
	// orphans from a previous daemon session) can read a half-updated tree
	// or trigger a hot-reload mid-replacement.
	if err := os.RemoveAll(targetDir); err != nil { //nolint:gosec // targetDir is under XDG_DATA_HOME / user home
		return "", fmt.Errorf("remove old quickshell dir: %w", err)
	}

	// Extract fresh files.
	if err := fs.WalkDir(quickshell.Files, ".", func(path string, d fs.DirEntry, walkErr error) error {
		if walkErr != nil {
			return walkErr
		}
		dest := filepath.Join(targetDir, path)
		if d.IsDir() {
			return os.MkdirAll(dest, 0o750) //nolint:gosec // dest is under user data dir
		}
		data, readErr := fs.ReadFile(quickshell.Files, path)
		if readErr != nil {
			return readErr
		}
		return os.WriteFile(dest, data, 0o640) //nolint:gosec // dest is under user data dir
	}); err != nil {
		return "", fmt.Errorf("extract quickshell: %w", err)
	}

	// Persist the new hash so the next start skips extraction.
	if writeErr := os.WriteFile( //nolint:gosec // hashFile is under XDG_DATA_HOME / user home
		hashFile, []byte(currentHash), 0o600,
	); writeErr != nil {
		slog.Warn("could not write embed hash", "err", writeErr)
	}

	if string(storedHash) == "" {
		slog.Info("extracted embedded quickshell", "dir", targetDir) //nolint:gosec // user-controlled data home
	} else {
		slog.Info("updated embedded quickshell", "dir", targetDir) //nolint:gosec // user-controlled data home
	}
	return filepath.Join(targetDir, "shell.qml"), nil
}

// resolveShellQML tries to find shell.qml from well-known locations.
func resolveShellQML() string {
	// 1. XDG data home.
	dataHome := os.Getenv("XDG_DATA_HOME")
	if dataHome == "" {
		if home, err := os.UserHomeDir(); err == nil {
			dataHome = filepath.Join(home, ".local", "share")
		}
	}
	if dataHome != "" {
		p := filepath.Join(dataHome, "tilbo", "quickshell", "shell.qml")
		if _, err := os.Stat(p); err == nil { //nolint:gosec // constructed from environment
			return p
		}
	}

	// 2. Standard install paths.
	for _, dir := range []string{
		"/usr/share/tilbo/quickshell",
		"/usr/local/share/tilbo/quickshell",
	} {
		p := filepath.Join(dir, "shell.qml")
		if _, err := os.Stat(p); err == nil {
			return p
		}
	}

	// 3. Relative to the daemon binary (development layout).
	if exe, err := os.Executable(); err == nil {
		exe, _ = filepath.EvalSymlinks(exe)
		devPath := filepath.Join(filepath.Dir(exe), "..", "tilbo-quickshell", "shell.qml")
		if _, err := os.Stat(devPath); err == nil {
			abs, _ := filepath.Abs(devPath)
			return abs
		}
	}

	return ""
}
