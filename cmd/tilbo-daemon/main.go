// tilbo-daemon is the core engine for the tilbo tag-first file manager.
// It watches a filesystem mount via fanotify, maintains a SQLite index of
// file tags and metadata, and exposes a Unix socket IPC endpoint for clients.
package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"log/slog"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"

	"github.com/darkliquid/tilbo/internal/index"
	"github.com/darkliquid/tilbo/internal/ipc"
	ipcv1 "github.com/darkliquid/tilbo/internal/ipc/gen/tilbo/ipc/v1"
	"github.com/darkliquid/tilbo/internal/sync"
	"github.com/darkliquid/tilbo/internal/watcher"
)

func main() {
	var (
		watchPath = flag.String("watch", defaultWatchPath(), "filesystem path to watch")
		dbPath    = flag.String("db", defaultDBPath(), "path to the SQLite index database")
		logFormat = flag.String("log-format", "text", "log format: text or json")
		logLevel  = flag.String("log-level", "info", "log level: debug, info, warn, error")
	)
	flag.Parse()

	if err := setupLogging(*logFormat, *logLevel); err != nil {
		fmt.Fprintf(os.Stderr, "tilbo-daemon: bad log flags: %v\n", err)
		os.Exit(1)
	}

	slog.Info("tilbo-daemon starting",
		"watch", *watchPath,
		"db", *dbPath,
		"pid", os.Getpid(),
	)

	// signal.NotifyContext cancels on SIGTERM or SIGINT.
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGTERM, syscall.SIGINT)
	defer stop()

	// Separate channel for SIGHUP (config reload).
	hupCh := make(chan os.Signal, 1)
	signal.Notify(hupCh, syscall.SIGHUP)
	defer signal.Stop(hupCh)

	if err := run(ctx, hupCh, *watchPath, *dbPath); err != nil {
		slog.Error("daemon error", "err", err)
		os.Exit(1)
	}
	slog.Info("tilbo-daemon stopped")
}

// run is the main daemon loop. It returns nil on clean shutdown and a non-nil
// error if any component fails unexpectedly.
func run(ctx context.Context, hupCh <-chan os.Signal, watchPath, dbPath string) error {
	// Ensure the database directory exists.
	if err := os.MkdirAll(filepath.Dir(dbPath), 0o700); err != nil {
		return fmt.Errorf("create db dir: %w", err)
	}

	// Open (or create) the SQLite index.
	idx, err := index.Open(ctx, dbPath)
	if err != nil {
		return fmt.Errorf("open index: %w", err)
	}
	defer func() {
		if err := idx.Close(); err != nil {
			slog.Error("close index", "err", err)
		}
	}()
	slog.Info("index ready", "path", dbPath)

	// Start the fanotify watcher.
	w, err := watcher.New(ctx, watchPath)
	if err != nil {
		return fmt.Errorf("create watcher: %w", err)
	}

	watchErrCh := make(chan error, 1)
	go func() { watchErrCh <- w.Run(ctx) }()
	slog.Info("watcher running", "path", watchPath)

	// Initialize the background syncer.
	syncer := sync.New(idx, watchPath)
	go func() {
		if err := syncer.Run(ctx); err != nil {
			slog.Error("syncer failed", "err", err)
		}
	}()

	// Start the IPC server.
	sockPath := socketPath()
	if err := os.MkdirAll(filepath.Dir(sockPath), 0o700); err != nil {
		return fmt.Errorf("create socket dir: %w", err)
	}

	handleIPCRequest := func(ctx context.Context, req *ipcv1.Request) (*ipcv1.Response, error) {
		switch req.Kind.(type) {
		case *ipcv1.Request_Status:
			state := syncer.State()
			return &ipcv1.Response{
				Kind: &ipcv1.Response_Status{
					Status: &ipcv1.StatusResponse{
						State:        state.State,
						FilesIndexed: state.FilesIndexed,
					},
				},
			}, nil
		default:
			return nil, fmt.Errorf("unimplemented request type: %T", req.Kind)
		}
	}

	ipcServer := ipc.NewServer(sockPath, handleIPCRequest)
	if err := ipcServer.Start(ctx); err != nil {
		return fmt.Errorf("start ipc server: %w", err)
	}
	defer ipcServer.Stop()

	slog.Info("tilbo-daemon ready", "socket", sockPath)

	// Main event loop.
	for {
		select {
		case ev, ok := <-w.Events():
			if !ok {
				// Events channel closed: watcher has stopped.
				return cleanShutdownErr(<-watchErrCh, ctx)
			}
			handleFSEvent(ctx, ev, syncer, idx)

		case err := <-watchErrCh:
			return cleanShutdownErr(err, ctx)

		case <-hupCh:
			slog.Info("SIGHUP: reloading configuration")
			// TODO(M2): reload harvester and rule configuration.

		case <-ctx.Done():
			slog.Info("shutdown signal received; waiting for watcher")
			return cleanShutdownErr(<-watchErrCh, ctx)
		}
	}
}

// handleFSEvent dispatches a filesystem event to the processing pipeline.
func handleFSEvent(ctx context.Context, ev watcher.Event, syncer *sync.Syncer, idx *index.DB) {
	slog.DebugContext(ctx, "fs event",
		"path", ev.Path,
		"old_path", ev.OldPath,
		"kind", ev.Kind,
	)
	
	switch ev.Kind {
	case watcher.EventCreate, watcher.EventModify:
		var stat syscall.Stat_t
		if err := syscall.Stat(ev.Path, &stat); err != nil {
			slog.DebugContext(ctx, "fs event stat failed", "path", ev.Path, "err", err)
			return
		}
		if err := syncer.SyncFile(ctx, ev.Path, &stat); err != nil {
			slog.DebugContext(ctx, "fs event sync file failed", "path", ev.Path, "err", err)
		}
	case watcher.EventDelete:
		if err := idx.DeleteFile(ctx, ev.Path); err != nil {
			slog.DebugContext(ctx, "fs event delete file failed", "path", ev.Path, "err", err)
		}
	case watcher.EventRename:
		// Delete old
		if err := idx.DeleteFile(ctx, ev.OldPath); err != nil {
			slog.DebugContext(ctx, "fs event delete old file failed", "path", ev.OldPath, "err", err)
		}
		// Sync new
		var stat syscall.Stat_t
		if err := syscall.Stat(ev.Path, &stat); err != nil {
			slog.DebugContext(ctx, "fs event stat new file failed", "path", ev.Path, "err", err)
			return
		}
		if err := syncer.SyncFile(ctx, ev.Path, &stat); err != nil {
			slog.DebugContext(ctx, "fs event sync new file failed", "path", ev.Path, "err", err)
		}
	}
}

// cleanShutdownErr returns nil if err is a context cancellation (expected on
// shutdown) and the original error otherwise.
func cleanShutdownErr(err error, ctx context.Context) error {
	if err == nil || errors.Is(err, context.Canceled) || errors.Is(err, context.DeadlineExceeded) {
		return nil
	}
	if ctx.Err() != nil {
		return nil
	}
	return err
}

// setupLogging configures the default slog handler.
func setupLogging(format, level string) error {
	var lvl slog.Level
	if err := lvl.UnmarshalText([]byte(level)); err != nil {
		return fmt.Errorf("invalid log level %q: %w", level, err)
	}

	opts := &slog.HandlerOptions{Level: lvl}
	var h slog.Handler
	switch format {
	case "json":
		h = slog.NewJSONHandler(os.Stderr, opts)
	case "text":
		h = slog.NewTextHandler(os.Stderr, opts)
	default:
		return fmt.Errorf("invalid log format %q: want text or json", format)
	}
	slog.SetDefault(slog.New(h))
	return nil
}

// socketPath returns the Unix socket path for the current user.
func socketPath() string {
	uid := os.Getuid()
	return fmt.Sprintf("/run/user/%d/tilbo.sock", uid)
}

// defaultWatchPath returns the path to watch when none is specified.
// Defaults to the user's home directory.
func defaultWatchPath() string {
	if h, err := os.UserHomeDir(); err == nil {
		return h
	}
	return "/"
}

// defaultDBPath returns the default SQLite database path for the current user.
func defaultDBPath() string {
	if dir, err := os.UserCacheDir(); err == nil {
		return filepath.Join(dir, "tilbo", "index.db")
	}
	if h, err := os.UserHomeDir(); err == nil {
		return filepath.Join(h, ".local", "share", "tilbo", "index.db")
	}
	return "tilbo-index.db"
}
