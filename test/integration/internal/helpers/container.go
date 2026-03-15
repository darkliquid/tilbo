package helpers

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/docker/docker/pkg/stdcopy"
	tc "github.com/testcontainers/testcontainers-go"
)

// Suite holds the running test container and the paths that are shared between
// the host and the container via a bind mount at /tilbo.
type Suite struct {
	Container tc.Container

	// HostStateDir is the host-side directory bind-mounted to /tilbo.
	HostStateDir string

	// Caps holds capabilities detected after the primary daemon starts.
	// Populated by calling helpers.Probe.
	Caps Caps
}

// containerStateDir is the fixed container-side mount point for shared state.
const containerStateDir = "/tilbo"

// NewSuite starts a privileged test container with the pre-built tilbo binaries
// bind-mounted at /usr/local/bin and a shared state directory at /tilbo.
//
// stateDir is a host-side directory created by the caller (typically via
// os.MkdirTemp) that is bind-mounted read-write into the container.
// binDir is the directory produced by Build(), bind-mounted read-only.
func NewSuite(ctx context.Context, binDir, stateDir string) (*Suite, error) {
	contextDir := filepath.Join(filepath.Dir(binDir))
	// Locate the Dockerfile relative to the module root.
	root, err := RepoRoot()
	if err != nil {
		return nil, fmt.Errorf("find repo root: %w", err)
	}
	contextDir = filepath.Join(root, "test", "integration")

	// Pre-create the socks subdirectory inside stateDir before the container
	// starts so that it exists as a valid bind-mount target. We then shadow it
	// with an in-container tmpfs (after start) so Unix domain sockets can be
	// created even when the bind-mount source is on a filesystem that forbids
	// AF_UNIX (e.g. virtiofs used by Colima/Lima on Linux).
	if err := os.MkdirAll(filepath.Join(stateDir, "socks"), 0o755); err != nil {
		return nil, fmt.Errorf("create socks dir: %w", err)
	}

	req := tc.ContainerRequest{
		FromDockerfile: tc.FromDockerfile{
			Context:    contextDir,
			Dockerfile: "Dockerfile",
			KeepImage:  false,
		},
		// Privileged is required for: loopback devices, fanotify mark, FUSE mount.
		Privileged: true,
		Mounts: tc.ContainerMounts{
			// Binaries: read-only so tests can't accidentally overwrite them.
			tc.BindMount(binDir, "/usr/local/bin"),
			// Shared state: read-write for socket, db, logs, FUSE mount, etc.
			tc.BindMount(stateDir, containerStateDir),
		},
		// Keep container alive; we exec commands individually.
		Cmd: []string{"sleep", "infinity"},
	}

	ctr, err := tc.GenericContainer(ctx, tc.GenericContainerRequest{
		ContainerRequest: req,
		Started:          true,
	})
	if err != nil {
		return nil, fmt.Errorf("start container: %w", err)
	}

	// Shadow /tilbo/socks with a container-local tmpfs so that Unix domain
	// sockets can be created regardless of the underlying bind-mount filesystem.
	// The host never needs to read the socket files directly; all socket
	// monitoring is done via container.Exec, so losing host visibility here is
	// not a problem.
	if code, _, err := ctr.Exec(
		ctx,
		[]string{"mount", "-t", "tmpfs", "tmpfs", "/tilbo/socks"},
	); err != nil ||
		code != 0 {
		_ = ctr.Terminate(ctx)
		if err != nil {
			return nil, fmt.Errorf("mount socks tmpfs: %w", err)
		}
		return nil, fmt.Errorf("mount socks tmpfs: exit code %d", code)
	}

	return &Suite{
		Container:    ctr,
		HostStateDir: stateDir,
	}, nil
}

// Close terminates the container. Safe to call more than once.
func (s *Suite) Close(ctx context.Context) {
	if s.Container != nil {
		_ = s.Container.Terminate(ctx)
	}
}

// Exec runs a command inside the container and returns its combined stdout+stderr
// and exit code. An error is returned only if the exec mechanism itself fails;
// a non-zero exit code is NOT returned as an error (check exitCode instead).
func (s *Suite) Exec(ctx context.Context, cmd ...string) (output string, exitCode int, err error) {
	code, reader, err := s.Container.Exec(ctx, cmd)
	if err != nil {
		return "", -1, fmt.Errorf("exec %v: %w", cmd, err)
	}

	var stdout, stderr bytes.Buffer
	if _, err := stdcopy.StdCopy(&stdout, &stderr, reader); err != nil {
		// Fall back to a raw read if demultiplexing fails (e.g., older Docker).
		if rb, rerr := io.ReadAll(reader); rerr == nil {
			stdout.Write(rb)
		}
	}

	combined := stdout.String() + stderr.String()
	return combined, code, nil
}

// ExecOK is like Exec but also returns an error if the exit code is non-zero.
func (s *Suite) ExecOK(ctx context.Context, cmd ...string) (string, error) {
	out, code, err := s.Exec(ctx, cmd...)
	if err != nil {
		return out, err
	}
	if code != 0 {
		return out, fmt.Errorf("command %v exited %d: %s", cmd, code, strings.TrimSpace(out))
	}
	return out, nil
}

// Shell runs a shell snippet inside the container via sh -c and returns stdout+stderr.
func (s *Suite) Shell(ctx context.Context, script string) (string, error) {
	return s.ExecOK(ctx, "sh", "-c", script)
}

// CLI runs tilbo-cli inside the container with the given socket and arguments.
func (s *Suite) CLI(ctx context.Context, sockPath string, args ...string) (string, error) {
	cmd := append([]string{"tilbo-cli", "--socket", sockPath}, args...)
	return s.ExecOK(ctx, cmd...)
}

// StartDaemon launches tilbo-daemon in the background inside the container.
// It returns after the daemon's IPC socket appears (up to 10s) so callers can
// immediately issue CLI commands.
//
// Parameters:
//   - sockPath: container-side Unix socket path (e.g. /tilbo/socks/main.sock)
//   - dbPath: container-side SQLite path (e.g. /tilbo/dbs/main.db)
//   - watchPath: container-side directory to watch
//   - fuseMount: container-side FUSE mount point (empty to disable FUSE)
//   - logPath: container-side path where daemon stdout+stderr is written
//   - extraArgs: additional flags forwarded verbatim to tilbo-daemon
//     (e.g. "--watcher", "inotify")
func (s *Suite) StartDaemon(
	ctx context.Context,
	sockPath, dbPath, watchPath, fuseMount, logPath string,
	extraArgs ...string,
) error {
	hasEmbedFlag := false
	for i := 0; i < len(extraArgs); i++ {
		switch extraArgs[i] {
		case "--embed-disabled", "--embed-model", "--embed-model-name":
			hasEmbedFlag = true
		}
	}
	if !hasEmbedFlag {
		extraArgs = append(extraArgs, "--embed-disabled")
	}

	if backend := strings.TrimSpace(os.Getenv("TILBO_TEST_WATCHER")); backend != "" {
		hasWatcherArg := false
		for i := 0; i < len(extraArgs); i++ {
			if extraArgs[i] == "--watcher" {
				hasWatcherArg = true
				break
			}
		}
		if !hasWatcherArg {
			extraArgs = append(extraArgs, "--watcher", backend)
		}
	}

	cmd := fmt.Sprintf(
		"tilbo-daemon --socket '%s' --db '%s' --watch '%s' --fuse-mount '%s' --log-format json",
		sockPath, dbPath, watchPath, fuseMount,
	)
	if len(extraArgs) > 0 {
		cmd += " " + strings.Join(extraArgs, " ")
	}

	script := fmt.Sprintf("nohup %s > '%s' 2>&1 &\necho $! > '%s.pid'", cmd, logPath, sockPath)
	if _, err := s.Shell(ctx, script); err != nil {
		return fmt.Errorf("start daemon: %w", err)
	}

	return s.WaitForSocket(ctx, sockPath, 10*time.Second)
}

// StopDaemon sends SIGTERM to the daemon started by StartDaemon and waits up
// to 5 seconds for it to exit. The daemon's PID is read from <sockPath>.pid.
func (s *Suite) StopDaemon(ctx context.Context, sockPath string) error {
	pidFile := sockPath + ".pid"
	if _, err := s.Shell(ctx, fmt.Sprintf(
		`pid=$(cat '%s' 2>/dev/null) && [ -n "$pid" ] && kill "$pid" && timeout 5 sh -c 'while kill -0 "$pid" 2>/dev/null; do sleep 0.1; done'`,
		pidFile,
	)); err != nil {
		return err
	}

	if err := s.waitForSocketGone(ctx, sockPath, 5*time.Second); err != nil {
		return err
	}

	_, _, _ = s.Exec(ctx, "rm", "-f", pidFile)
	return nil
}

func (s *Suite) waitForSocketGone(ctx context.Context, sockPath string, timeout time.Duration) error {
	deadline := time.Now().Add(timeout)
	for time.Now().Before(deadline) {
		_, code, err := s.Exec(ctx, "test", "-S", sockPath)
		if err != nil {
			return fmt.Errorf("wait for socket removal: %w", err)
		}
		if code != 0 {
			return nil
		}
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-time.After(100 * time.Millisecond):
		}
	}
	return fmt.Errorf("timed out waiting for socket %s to be removed", sockPath)
}

// WaitForSocket polls for the existence of sockPath inside the container until
// it appears or deadline is exceeded.
func (s *Suite) WaitForSocket(ctx context.Context, sockPath string, timeout time.Duration) error {
	deadline := time.Now().Add(timeout)
	for time.Now().Before(deadline) {
		out, code, err := s.Exec(ctx, "test", "-S", sockPath)
		if err != nil {
			return fmt.Errorf("wait for socket: %w", err)
		}
		if code == 0 {
			return nil
		}
		_ = out
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-time.After(100 * time.Millisecond):
		}
	}
	return fmt.Errorf("timed out waiting for socket %s to appear", sockPath)
}

// WaitIndexed polls tilbo-cli search until path appears in the index, or times out.
// It is used after file-creation/modification events to account for the 200ms debounce.
func (s *Suite) WaitIndexed(ctx context.Context, sockPath, path string, timeout time.Duration) error {
	deadline := time.Now().Add(timeout)
	for time.Now().Before(deadline) {
		out, code, err := s.Exec(ctx,
			"tilbo-cli", "--socket", sockPath,
			"search", "--meta", "__path__=eq:"+path, "--format", "json",
		)
		if err != nil {
			return err
		}
		// A JSON array with at least one entry means the file is indexed.
		if code == 0 && strings.Contains(out, `"path"`) {
			return nil
		}
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-time.After(150 * time.Millisecond):
		}
	}
	return fmt.Errorf("timed out waiting for %s to appear in index", path)
}

// WaitRemoved polls tilbo-cli search until path is absent from the index, or times out.
func (s *Suite) WaitRemoved(ctx context.Context, sockPath, path string, timeout time.Duration) error {
	deadline := time.Now().Add(timeout)
	for time.Now().Before(deadline) {
		out, code, err := s.Exec(ctx,
			"tilbo-cli", "--socket", sockPath,
			"search", "--meta", "__path__=eq:"+path, "--format", "json",
		)
		if err != nil {
			return err
		}
		if code == 0 && !strings.Contains(out, `"path"`) {
			return nil
		}
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-time.After(150 * time.Millisecond):
		}
	}
	return fmt.Errorf("timed out waiting for %s to be removed from index", path)
}

// DaemonLog returns the contents of the daemon log file at logPath inside the container.
func (s *Suite) DaemonLog(ctx context.Context, logPath string) string {
	out, _, _ := s.Exec(ctx, "cat", logPath)
	return out
}

// SocketPath returns the container-side socket path for a named daemon instance.
// E.g. SocketPath("main") → "/tilbo/socks/main.sock"
func SocketPath(name string) string {
	return fmt.Sprintf("%s/socks/%s.sock", containerStateDir, name)
}

// DBPath returns the container-side SQLite db path for a named daemon instance.
func DBPath(name string) string {
	return fmt.Sprintf("%s/dbs/%s.db", containerStateDir, name)
}

// FusePath returns the container-side FUSE mount path for a named daemon instance.
func FusePath(name string) string {
	return fmt.Sprintf("%s/fuse/%s", containerStateDir, name)
}

// LogPath returns the container-side daemon log path for a named daemon instance.
func LogPath(name string) string {
	return fmt.Sprintf("%s/%s-daemon.log", containerStateDir, name)
}
