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
	"os/exec"
	"os/signal"
	"path/filepath"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/tetratelabs/wazero"

	"github.com/darkliquid/tilbo/internal/bookmarks"
	"github.com/darkliquid/tilbo/internal/dbus"
	"github.com/darkliquid/tilbo/internal/embed"
	tilbofuse "github.com/darkliquid/tilbo/internal/fuse"
	"github.com/darkliquid/tilbo/internal/graph"
	"github.com/darkliquid/tilbo/internal/harvester"
	"github.com/darkliquid/tilbo/internal/index"
	"github.com/darkliquid/tilbo/internal/ipc"
	ipcv1 "github.com/darkliquid/tilbo/internal/ipc/gen/tilbo/ipc/v1"
	"github.com/darkliquid/tilbo/internal/rules"
	isync "github.com/darkliquid/tilbo/internal/sync"
	"github.com/darkliquid/tilbo/internal/watcher"
	"github.com/darkliquid/tilbo/internal/xattr"
)

// version, commit, and buildDate are injected at build time by goreleaser via
// -ldflags "-X main.version=... -X main.commit=... -X main.buildDate=...".
// They default to "dev" so untagged local builds still produce useful output.
var (
	version   = "dev"
	commit    = "none"
	buildDate = "unknown"
)

func main() {
	var (
		watchPath      = flag.String("watch", defaultWatchPath(), "filesystem path to watch")
		dbPath         = flag.String("db", defaultDBPath(), "path to the SQLite index database")
		fuseMount      = flag.String("fuse-mount", defaultFuseMountPath(), "FUSE virtual filesystem mount point (empty to disable)")
		sockOverride   = flag.String("socket", "", "override default Unix socket path")
		logFormat      = flag.String("log-format", "text", "log format: text or json")
		logLevel       = flag.String("log-level", "info", "log level: debug, info, warn, error")
		watcherBackend = flag.String("watcher", "auto", "filesystem watcher backend: auto, fanotify, inotify")
		watchHidden    = flag.Bool("watch-hidden", false, "watch hidden files and directories")
		embedModel     = flag.String("embed-model", "", "path to ONNX tokenizer/model directory for embeddings")
		printVersion   = flag.Bool("version", false, "print version information and exit")
	)
	flag.Parse()

	if *printVersion {
		fmt.Printf("tilbo-daemon %s (commit %s, built %s)\n", version, commit, buildDate)
		return
	}

	sockPath := *sockOverride
	if sockPath == "" {
		sockPath = socketPath()
	}

	if err := setupLogging(*logFormat, *logLevel); err != nil {
		fmt.Fprintf(os.Stderr, "tilbo-daemon: bad log flags: %v\n", err)
		os.Exit(1)
	}

	slog.Info("tilbo-daemon starting",
		"version", version,
		"commit", commit,
		"built", buildDate,
		"watch", *watchPath,
		"db", *dbPath,
		"fuse", *fuseMount,
		"pid", os.Getpid(),
	)

	// signal.NotifyContext cancels on SIGTERM or SIGINT.
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGTERM, syscall.SIGINT)
	defer stop()

	// Separate channel for SIGHUP (config reload).
	hupCh := make(chan os.Signal, 1)
	signal.Notify(hupCh, syscall.SIGHUP)
	defer signal.Stop(hupCh)

	if err := run(ctx, hupCh, *watchPath, *dbPath, *fuseMount, sockPath, watcher.Backend(*watcherBackend), *watchHidden, *embedModel); err != nil {
		slog.Error("daemon error", "err", err)
		os.Exit(1)
	}
	slog.Info("tilbo-daemon stopped")
}

// run is the main daemon loop. It returns nil on clean shutdown and a non-nil
// error if any component fails unexpectedly.
func run(ctx context.Context, hupCh <-chan os.Signal, watchPath, dbPath, fuseMount, sockPath string, watcherBackend watcher.Backend, watchHidden bool, embedModelPath string) error {
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
		if ctx.Err() != nil {
			slog.Debug("skip index close during canceled shutdown")
			return
		}
		if err := idx.Close(); err != nil {
			slog.Error("close index", "err", err)
		}
	}()
	slog.Info("index ready", "path", dbPath)

	// Start the filesystem watcher (fanotify, inotify, or auto-detected).
	w, err := watcher.New(ctx, watchPath, watcherBackend, watcher.Options{WatchHidden: watchHidden})
	if err != nil {
		return fmt.Errorf("create watcher: %w", err)
	}
	statusWarnings := append([]string(nil), w.CapabilityWarnings()...)
	var statusWarningsMu sync.Mutex
	appendStatusWarning := func(warning string) {
		if warning == "" {
			return
		}
		statusWarningsMu.Lock()
		defer statusWarningsMu.Unlock()
		statusWarnings = append(statusWarnings, warning)
	}

	watchErrCh := make(chan error, 1)
	go func() { watchErrCh <- w.Run(ctx) }()
	slog.Info("watcher running", "path", watchPath)

	tags := xattr.New(nil)

	// Initialize the background syncer.
	syncer := isync.New(idx, tags, watchPath)
	
	// Start D-Bus so we can report daemon state changes.
	dbusConn, dbusErr := dbus.NewDaemonBus()
	if dbusErr != nil {
		slog.Warn("dbus: failed to connect; continuing without D-Bus signals", "err", dbusErr)
	} else {
		defer dbusConn.Close()
		syncer.OnStateChanged = func(state ipcv1.DaemonState) {
			s := "idle"
			// Translate protobuf states into strings for D-Bus
			switch state {
			case ipcv1.DaemonState_DAEMON_STATE_SCANNING:
				s = "scanning"
			case ipcv1.DaemonState_DAEMON_STATE_READY:
				s = "ready"
			case ipcv1.DaemonState_DAEMON_STATE_DEGRADED:
				s = "degraded"
			}
			dbusConn.EmitDaemonStateChanged(s)
		}
		syncer.OnIndexUpdated = func(filesTotal, tagsTotal uint64) {
			dbusConn.EmitIndexUpdated(filesTotal, tagsTotal)
		}
	}

	syncErrCh := make(chan error, 1)
	go func() {
		syncErrCh <- syncer.Run(ctx)
	}()
	defer func() {
		if err := waitForSyncerShutdown(syncErrCh); err != nil && !errors.Is(err, context.Canceled) {
			slog.Warn("syncer shutdown timed out or failed", "err", err)
		}
	}()

	// --- M2: harvester pipeline and rule engine ---

	// Shared WASM compilation cache stored in the OS temp directory.
	wasmCacheDir := filepath.Join(os.TempDir(), "tilbo-wasm-cache")
	_ = os.MkdirAll(wasmCacheDir, 0o700)
	wasmCache, err := wazero.NewCompilationCacheWithDir(wasmCacheDir)
	if err != nil {
		slog.Warn("wasm cache unavailable; compilation cache disabled", "err", err)
		wasmCache = nil
	}

	// Harvester pipeline — built-ins first, then user drop-ins.
	pipeline := harvester.NewPipeline()
	registerBuiltins(pipeline)

	harvReg := harvester.NewRegistry(harvester.DefaultDirs(), wasmCache)
	if err := harvReg.Load(ctx, pipeline); err != nil {
		slog.Warn("harvester registry load error", "err", err)
	}
	defer harvReg.Close(ctx)

	// Rule engine.
	engine := rules.NewEngine()
	ruleReg := rules.NewRegistry(rules.DefaultDirs(), wasmCache)
	if err := ruleReg.Load(ctx, engine); err != nil {
		slog.Warn("rule registry load error", "err", err)
	}
	defer ruleReg.Close(ctx)

	// --- M4: in-memory bipartite file-tag graph ---

	fileGraph := graph.New()
	if pairs, err := idx.ListFileTagPairs(ctx); err != nil {
		slog.Warn("graph: failed to load file-tag pairs", "err", err)
	} else {
		fileGraph.Load(ctx, pairs)
		slog.Info("graph loaded", "pairs", len(pairs))
	}

	if embs, err := idx.ListEmbeddings(ctx); err != nil {
		slog.Warn("graph: failed to load embeddings", "err", err)
	} else {
		fileGraph.LoadEmbeddings(ctx, embs)
		slog.Info("embeddings loaded", "vectors", len(embs))
	}

	var embedder *embed.ONNXEmbedder
	if embedModelPath != "" {
		emb, err := embed.NewONNXEmbedder(ctx, embedModelPath)
		if err != nil {
			slog.Warn("failed to init embedder; continuing without vector search", "err", err)
		} else {
			embedder = emb
			defer embedder.Close()
			slog.Info("embedder initialized", "model", embedModelPath)
		}
	}

	// Processor (runs pipeline + rules on each file event).
	proc := newProcessor(idx, tags, pipeline, engine, fileGraph, embedder)
	if dbusConn != nil {
		proc.OnFileTagged = func(path string, added, removed []string) {
			dbusConn.EmitFileTagged(path, added, removed)
		}
	}

	// Sweeper (re-evaluates all files after rule reload).
	sweeper := rules.NewSweeper(idx, tags, pipeline, engine)

	// Start the IPC server.
	if err := os.MkdirAll(filepath.Dir(sockPath), 0o700); err != nil {
		return fmt.Errorf("create socket dir: %w", err)
	}

	handleIPCRequest := func(ctx context.Context, req *ipcv1.Request) (*ipcv1.Response, error) {
		switch r := req.Kind.(type) {
		case *ipcv1.Request_Status:
			state := syncer.State()
			statusWarningsMu.Lock()
			warnings := append([]string(nil), statusWarnings...)
			statusWarningsMu.Unlock()
			return &ipcv1.Response{
				Kind: &ipcv1.Response_Status{
					Status: &ipcv1.StatusResponse{
						State:        state.State,
						FilesIndexed: state.FilesIndexed,
						Warnings:     warnings,
					},
				},
			}, nil

		case *ipcv1.Request_Related:
			return handleRelated(ctx, r.Related, fileGraph, idx)

		case *ipcv1.Request_Search:
			return handleSearch(ctx, r.Search, idx)

		case *ipcv1.Request_Tag:
			return handleTag(ctx, r.Tag, idx, tags, fileGraph, proc.OnFileTagged)

		case *ipcv1.Request_Metadata:
			return handleMetadata(ctx, r.Metadata, idx)

		case *ipcv1.Request_MetadataSet:
			return handleMetadataSet(ctx, r.MetadataSet, idx)

		case *ipcv1.Request_ListTags:
			return handleListTags(ctx, r.ListTags, idx)

		case *ipcv1.Request_ReloadRules:
			var reloadErrs []string
			engine.Reset()
			newReg := rules.NewRegistry(rules.DefaultDirs(), wasmCache)
			if err := newReg.Load(ctx, engine); err != nil {
				reloadErrs = append(reloadErrs, err.Error())
			}
			go func() {
				if err := sweeper.Sweep(ctx); err != nil && !errors.Is(err, context.Canceled) {
					slog.WarnContext(ctx, "post-reload sweep error", "err", err)
				}
			}()
			return &ipcv1.Response{Kind: &ipcv1.Response_ReloadRules{
				ReloadRules: &ipcv1.ReloadRulesResponse{Errors: reloadErrs},
			}}, nil

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
	startFuseMount(ctx, fuseMount, idx, fileGraph, appendStatusWarning)

	// Main event loop.
	for {
		select {
		case ev, ok := <-w.Events():
			if !ok {
				// Events channel closed: watcher has stopped.
				return cleanShutdownErr(waitForWatcherShutdown(watchErrCh), ctx)
			}
			handleFSEvent(ctx, ev, syncer, idx, proc, fileGraph)

		case err := <-watchErrCh:
			return cleanShutdownErr(err, ctx)

		case <-hupCh:
			slog.Info("SIGHUP: reloading harvester and rule configuration")
			reloadConfig(ctx, pipeline, engine, ruleReg, sweeper, wasmCache)

		case <-ctx.Done():
			slog.Info("shutdown signal received; waiting for watcher")
			return cleanShutdownErr(waitForWatcherShutdown(watchErrCh), ctx)
		}
	}
}

func fuseCapabilityWarning(err error, mountPoint string) string {
	if isPermissionErr(err) {
		return fmt.Sprintf("fuse mount at %q failed due to missing permissions. grant access to /dev/fuse and CAP_SYS_ADMIN, then restart tilbo-daemon", mountPoint)
	}
	return fmt.Sprintf("fuse mount at %q failed: %v", mountPoint, err)
}

func isPermissionErr(err error) bool {
	if err == nil {
		return false
	}
	if errors.Is(err, os.ErrPermission) || errors.Is(err, syscall.EPERM) || errors.Is(err, syscall.EACCES) {
		return true
	}
	msg := strings.ToLower(err.Error())
	return strings.Contains(msg, "permission denied") || strings.Contains(msg, "operation not permitted")
}

func fuseMountDiagnostics(mountPoint string) string {
	var parts []string

	if _, err := os.Stat(mountPoint); err != nil {
		parts = append(parts, fmt.Sprintf("mountpoint stat=%v", err))
	} else {
		parts = append(parts, "mountpoint=ok")
	}

	if _, err := os.Stat("/dev/fuse"); err != nil {
		parts = append(parts, fmt.Sprintf("/dev/fuse=%v", err))
	} else {
		parts = append(parts, "/dev/fuse=present")
	}

	if _, err := exec.LookPath("fusermount3"); err != nil {
		parts = append(parts, "fusermount3=missing")
	} else {
		parts = append(parts, "fusermount3=present")
	}

	return strings.Join(parts, ", ")
}

func startFuseMount(ctx context.Context, fuseMount string, idx *index.DB, fileGraph *graph.Graph, appendStatusWarning func(string)) {
	if fuseMount == "" {
		return
	}

	type mountResult struct {
		srv *tilbofuse.Server
		err error
	}

	go func() {
		ch := make(chan mountResult, 1)
		slog.Debug("fuse: starting mount attempt", "path", fuseMount)

		go func() {
			srv, err := tilbofuse.Mount(ctx, fuseMount, idx, fileGraph)
			ch <- mountResult{srv, err}
		}()

		select {
		case res := <-ch:
			if res.err != nil {
				slog.Warn("fuse: mount failed; continuing without FUSE", "path", fuseMount, "err", res.err)
				appendStatusWarning(fuseCapabilityWarning(res.err, fuseMount))
				return
			}

			bookmarks.InjectVirtualTags(fuseMount)
			slog.Info("fuse: mounted successfully", "path", fuseMount)

			<-ctx.Done()
			if err := res.srv.Unmount(); err != nil {
				slog.Warn("fuse: unmount error", "err", err)
			}

		case <-time.After(5 * time.Second):
			diag := fuseMountDiagnostics(fuseMount)
			slog.Warn("fuse: mount timed out; continuing without FUSE", "path", fuseMount, "diagnostics", diag)
			appendStatusWarning(fmt.Sprintf("fuse mount timed out at %q. diagnostics: %s", fuseMount, diag))

			go func() {
				for _, argv := range [][]string{
					{"fusermount3", "-u", "-z", fuseMount},
					{"umount", "-l", fuseMount},
				} {
					if exec.Command(argv[0], argv[1:]...).Run() == nil { //nolint:gosec
						break
					}
				}
			}()

		case <-ctx.Done():
			slog.Debug("fuse: mount canceled before completion", "path", fuseMount)
		}
	}()
}

// reloadConfig reloads harvester and rule registries and triggers a rule sweep.
func reloadConfig(ctx context.Context, pipeline *harvester.Pipeline, engine *rules.Engine, oldRuleReg *rules.Registry, sweeper *rules.Sweeper, cache wazero.CompilationCache) {
	oldRuleReg.Close(ctx)
	engine.Reset()

	newRuleReg := rules.NewRegistry(rules.DefaultDirs(), cache)
	if err := newRuleReg.Load(ctx, engine); err != nil {
		slog.Error("rule registry reload error", "err", err)
	}
	// Replace the old registry pointer so the next SIGHUP closes the new one.
	// Note: oldRuleReg pointer not updated here; caller must handle if needed.
	// For simplicity we accept a potential double-close on the next SIGHUP
	// (Close is idempotent — it nils the closers slice after running them).
	_ = newRuleReg // held alive by sweeper/engine references

	slog.Info("SIGHUP: rules reloaded; starting sweep")
	go func() {
		if err := sweeper.Sweep(ctx); err != nil && !errors.Is(err, context.Canceled) {
			slog.Warn("sweep error", "err", err)
		}
	}()
}

// handleRelated handles a RelatedFiles IPC request using the in-memory graph.
func handleRelated(ctx context.Context, req *ipcv1.RelatedRequest, g *graph.Graph, idx *index.DB) (*ipcv1.Response, error) {
	maxHops := int(req.GetMaxHops())
	if maxHops <= 0 {
		maxHops = 2
	}
	limit := int(req.GetLimit())
	if limit <= 0 {
		limit = 20
	}
	hopWeight := float64(req.GetHopWeight())
	if hopWeight <= 0 {
		hopWeight = 1.0
	}

	vecWeight := float64(req.GetVecWeight())
	if vecWeight <= 0 {
		vecWeight = 0.4 // default vecWeight
	}

	related := g.Related(ctx, req.GetSeedPath(), maxHops, limit, hopWeight, vecWeight)

	scored := make([]*ipcv1.ScoredFile, 0, len(related))
	for _, r := range related {
		summary, err := idx.GetFileSummary(ctx, r.Path)
		if err != nil {
			slog.DebugContext(ctx, "related: skip missing file", "path", r.Path, "err", err)
			continue
		}
		scored = append(scored, &ipcv1.ScoredFile{
			File: &ipcv1.FileResult{
				Path:      summary.Path,
				Tags:      summary.Tags,
				Mtime:     summary.Mtime,
				SizeBytes: summary.SizeBytes,
			},
			Score:       r.Score,
			HopDistance: uint32(r.HopDistance),
		})
	}
	return &ipcv1.Response{
		Kind: &ipcv1.Response_Related{
			Related: &ipcv1.RelatedResponse{Files: scored},
		},
	}, nil
}

// handleFSEvent dispatches a filesystem event to the processing pipeline.
func handleFSEvent(ctx context.Context, ev watcher.Event, syncer *isync.Syncer, idx *index.DB, proc *Processor, g *graph.Graph) {
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
		// M2: run harvester pipeline + rule engine after the index is updated.
		proc.ProcessFile(ctx, ev.Path)

	case watcher.EventDelete:
		if err := idx.DeleteFile(ctx, ev.Path); err != nil {
			slog.DebugContext(ctx, "fs event delete file failed", "path", ev.Path, "err", err)
		}

	case watcher.EventRename:
		if err := idx.DeleteFile(ctx, ev.OldPath); err != nil {
			slog.DebugContext(ctx, "fs event delete old file failed", "path", ev.OldPath, "err", err)
		}
		var stat syscall.Stat_t
		if err := syscall.Stat(ev.Path, &stat); err != nil {
			slog.DebugContext(ctx, "fs event stat new file failed", "path", ev.Path, "err", err)
			return
		}
		if err := syncer.SyncFile(ctx, ev.Path, &stat); err != nil {
			slog.DebugContext(ctx, "fs event sync new file failed", "path", ev.Path, "err", err)
		}
		proc.ProcessFile(ctx, ev.Path)
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

func waitForWatcherShutdown(watchErrCh <-chan error) error {
	select {
	case err := <-watchErrCh:
		return err
	case <-time.After(2 * time.Second):
		slog.Warn("watcher shutdown timed out; continuing process exit")
		return nil
	}
}

func waitForSyncerShutdown(syncErrCh <-chan error) error {
	select {
	case err := <-syncErrCh:
		return err
	case <-time.After(2 * time.Second):
		return fmt.Errorf("syncer shutdown timed out")
	}
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

// defaultFuseMountPath returns the default FUSE mount point for the current user.
func defaultFuseMountPath() string {
	if h, err := os.UserHomeDir(); err == nil {
		return filepath.Join(h, "tags")
	}
	return ""
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
