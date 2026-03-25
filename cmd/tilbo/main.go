// tilbo is the unified CLI and daemon entrypoint for the project.
package main

import (
	"context"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"syscall"
	"time"

	"github.com/charmbracelet/fang"
	"github.com/spf13/cobra"

	"github.com/darkliquid/tilbo/internal/config"
	"github.com/darkliquid/tilbo/internal/ipc"
	ipcv1 "github.com/darkliquid/tilbo/internal/ipc/gen/tilbo/ipc/v1"
)

// version, commit, and buildDate are injected at build time by goreleaser via
// -ldflags "-X main.version=... -X main.commit=... -X main.buildDate=...".
// They default to "dev" so untagged local builds still produce useful output.
var (
	version   = "dev"
	commit    = "none"
	buildDate = "unknown"
)

// sockFlag is the --socket persistent flag shared by all commands that need
// the daemon. Set from config or defaulted to /run/user/$UID/tilbo.sock.
var sockFlag string

var rootCmd = &cobra.Command{
	Use:   "tilbo",
	Short: "Tag-first file management client",
	Long:  "tilbo is the terminal client for the tilbo daemon. Manage file tags and metadata, search your filesystem by tag or content, and inspect related files.",
	PersistentPreRunE: func(cmd *cobra.Command, _ []string) error {
		// Commands that don't need the daemon skip the socket check.
		if cmd.Annotations["no_daemon"] == "true" {
			return nil
		}
		return nil
	},
}

func init() {
	rootCmd.Version = version
	rootCmd.SetVersionTemplate(fmt.Sprintf("tilbo %s (commit %s, built %s)\n", version, commit, buildDate))

	cfg, _ := config.Load(config.Path())
	sockDefault := cfg.CLI.Socket
	if sockDefault == "" {
		sockDefault = defaultSocketPath()
	}
	rootCmd.PersistentFlags().StringVar(&sockFlag, "socket", sockDefault, "path to the tilbo daemon socket")

	rootCmd.AddCommand(tagCmd)
	rootCmd.AddCommand(searchCmd)
	rootCmd.AddCommand(metaCmd)
	rootCmd.AddCommand(relatedCmd)
	rootCmd.AddCommand(newDaemonCmd())
	rootCmd.AddCommand(ruleCmd)
	rootCmd.AddCommand(harvesterCmd)
	rootCmd.AddCommand(configCmd)
	rootCmd.AddCommand(completionCmd)
}

func main() {
	if err := fang.Execute(context.Background(), rootCmd); err != nil {
		os.Exit(1)
	}
}

// connect opens a single connection to the daemon socket. It does not attempt
// to auto-start the daemon; callers receive an error immediately if the socket
// is unreachable.
func connect(ctx context.Context) (*ipc.Client, error) {
	c, err := ipc.NewClient(ctx, sockFlag)
	if err != nil {
		return nil, fmt.Errorf("cannot connect to tilbo daemon at %s: %w", sockFlag, err)
	}
	return c, nil
}

// dial connects to the daemon, auto-starting it if not reachable.
func dial(ctx context.Context) (*ipc.Client, error) {
	c, err := ipc.NewClient(ctx, sockFlag)
	if err == nil {
		return c, nil
	}

	// Daemon unreachable — attempt to spawn it in the background.
	if spawnErr := spawnDaemon(); spawnErr != nil {
		return nil, fmt.Errorf(
			"cannot connect to tilbo daemon at %s: %w (auto-start failed)",
			sockFlag, errors.Join(err, spawnErr),
		)
	}

	// Retry for up to 3 seconds while the daemon initialises.
	const (
		retries  = 15
		interval = 200 * time.Millisecond
	)
	for range retries {
		select {
		case <-ctx.Done():
			return nil, ctx.Err()
		case <-time.After(interval):
		}
		c, err = ipc.NewClient(ctx, sockFlag)
		if err == nil {
			return c, nil
		}
	}
	return nil, fmt.Errorf("cannot connect to tilbo daemon at %s after auto-start: %w", sockFlag, err)
}

// spawnDaemon launches "tilbo --socket <sock> daemon" as a detached background process.
func spawnDaemon() error {
	exe, err := os.Executable()
	if err != nil {
		return fmt.Errorf("resolve executable: %w", err)
	}
	if resolved, resolveErr := filepath.EvalSymlinks(exe); resolveErr == nil {
		exe = resolved
	}

	cmd := exec.CommandContext(context.Background(), exe, "--socket", sockFlag, "daemon")
	cmd.SysProcAttr = &syscall.SysProcAttr{Setsid: true}
	return cmd.Start()
}

// call dials (with auto-start), sends one request, closes, and returns the response.
func call(ctx context.Context, req *ipcv1.Request) (*ipcv1.Response, error) {
	c, err := dial(ctx)
	if err != nil {
		return nil, err
	}
	defer c.Close()
	return c.Call(ctx, req)
}

// callDirect connects without auto-start, sends one request, and closes.
// Use this for daemon management subcommands where the daemon must already be running.
func callDirect(ctx context.Context, req *ipcv1.Request) (*ipcv1.Response, error) {
	c, err := connect(ctx)
	if err != nil {
		return nil, err
	}
	defer c.Close()
	return c.Call(ctx, req)
}

func defaultSocketPath() string {
	uid := os.Getuid()
	return fmt.Sprintf("/run/user/%d/tilbo.sock", uid)
}

// absPath resolves path relative to cwd if not already absolute.
func absPath(path string) string {
	if filepath.IsAbs(path) {
		return path
	}
	cwd, err := os.Getwd()
	if err != nil {
		return path
	}
	return filepath.Join(cwd, path)
}

// daemonError extracts an error message from a response if it is an ErrorResponse.
func daemonError(resp *ipcv1.Response) error {
	if e, ok := resp.GetKind().(*ipcv1.Response_Error); ok {
		return fmt.Errorf("daemon: %s (code %d)", e.Error.GetMessage(), e.Error.GetCode())
	}
	return nil
}
