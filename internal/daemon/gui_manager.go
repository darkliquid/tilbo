package daemon

import (
	"errors"
	"fmt"
	"log/slog"
	"os"
	"os/exec"
	"path/filepath"
	"sync"
	"syscall"

	"github.com/darkliquid/tilbo/internal/icontheme"
	ipcv1 "github.com/darkliquid/tilbo/internal/ipc/gen/tilbo/ipc/v1"
)

// guiManager tracks and manages the Quickshell GUI process.
type guiManager struct {
	mu        sync.Mutex
	cmd       *exec.Cmd
	shellPath string // path to shell.qml
	broadcast func(*ipcv1.Event)
}

// newGUIManager creates a GUI manager. shellPath is the path to the Quickshell
// shell.qml entry point. If empty, it is resolved relative to the daemon
// binary or from well-known install paths.
func newGUIManager(shellPath string, broadcast func(*ipcv1.Event)) *guiManager {
	if shellPath == "" {
		shellPath = resolveShellQML()
	}
	return &guiManager{
		shellPath: shellPath,
		broadcast: broadcast,
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

// resolveShellQML tries to find shell.qml from well-known locations.
func resolveShellQML() string {
	// 1. Relative to the daemon binary (development layout).
	if exe, err := os.Executable(); err == nil {
		exe, _ = filepath.EvalSymlinks(exe)
		devPath := filepath.Join(filepath.Dir(exe), "..", "tilbo-quickshell", "shell.qml")
		if _, err := os.Stat(devPath); err == nil {
			abs, _ := filepath.Abs(devPath)
			return abs
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

	// 3. XDG data home.
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

	return ""
}
