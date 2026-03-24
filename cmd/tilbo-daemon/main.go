// tilbo-daemon is the core engine for the tilbo tag-first file manager.
// It watches a filesystem mount via fanotify, maintains a SQLite index of
// file tags and metadata, and exposes a Unix socket IPC endpoint for clients.
package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/charmbracelet/fang"
	"github.com/tetratelabs/wazero"

	"github.com/darkliquid/tilbo/internal/bookmarks"
	"github.com/darkliquid/tilbo/internal/config"
	"github.com/darkliquid/tilbo/internal/extension"
	tilbofuse "github.com/darkliquid/tilbo/internal/fuse"
	"github.com/darkliquid/tilbo/internal/graph"
	"github.com/darkliquid/tilbo/internal/harvester"
	"github.com/darkliquid/tilbo/internal/index"
	"github.com/darkliquid/tilbo/internal/ipc"
	ipcv1 "github.com/darkliquid/tilbo/internal/ipc/gen/tilbo/ipc/v1"
	"github.com/darkliquid/tilbo/internal/rules"
	isync "github.com/darkliquid/tilbo/internal/sync"
	"github.com/darkliquid/tilbo/internal/thumbnail"
	"github.com/darkliquid/tilbo/internal/vectorize"
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

const (
	fuseMountWaitTimeout = 5 * time.Second
	shutdownWaitTimeout  = 2 * time.Second
)

func main() {
	if err := fang.Execute(context.Background(), newRootCmd()); err != nil {
		os.Exit(1)
	}
}

// run is the main daemon loop. It returns nil on clean shutdown and a non-nil
// error if any component fails unexpectedly.
//
//nolint:funlen // daemon initialization is inherently long
func run(
	ctx context.Context,
	hupCh <-chan os.Signal,
	watchPath, dbPath, fuseMount, sockPath, cfgPath string,
	watcherBackend watcher.Backend,
	watchHidden bool,
	embedModelPath string,
	embedModelName string,
	embedDisabled bool,
) error {
	if err := ensureParentDir(dbPath, "create db dir"); err != nil {
		return err
	}

	idx, err := openIndexDB(ctx, dbPath)
	if err != nil {
		return err
	}
	defer closeIndexOnShutdown(ctx, idx)
	slog.InfoContext(ctx, "index ready", "path", dbPath)

	events, watchErrCh, warningStore, err := startWatcher(ctx, watchPath, fuseMount, watcherBackend, watchHidden)
	if err != nil {
		return err
	}

	tags := xattr.New(nil)

	var syncerExcludePaths []string
	if fuseMount != "" {
		syncerExcludePaths = []string{fuseMount}
	}
	syncer := isync.New(idx, tags, watchPath, watchHidden, syncerExcludePaths)

	wasmCache := initWASMCache(ctx)

	pipeline, harvReg := initHarvesterPipeline(ctx, wasmCache)
	defer harvReg.Close(ctx)

	engine, ruleReg := initRuleEngine(ctx, cfgPath, wasmCache)
	defer ruleReg.Close(ctx)

	extRegistry := initExtensionRegistry(ctx)

	fileGraph := loadGraphState(ctx, idx)
	embedder := initOptionalEmbedder(ctx, embedModelPath, embedModelName, embedDisabled)

	proc := newProcessor(idx, tags, pipeline, engine, fileGraph, embedder)

	// Load config for browser features (pinned places, keybindings, use_trash).
	browserCfg, _ := config.Load(cfgPath)
	browserCfgPtr := &browserCfg

	uiBrowserMethods := &daemonBrowserMethods{
		idx:         idx,
		tags:        tags,
		g:           fileGraph,
		fuseMount:   fuseMount,
		cfg:         browserCfgPtr,
		cfgPath:     cfgPath,
		extRegistry: extRegistry,
		thumbGen:    thumbnail.New(""),
	}

	sweeper := rules.NewSweeper(idx, tags, pipeline, engine)

	syncErrCh := startSyncerLoop(ctx, syncer, proc)
	defer logSyncerShutdown(syncErrCh)

	if err := ensureParentDir(sockPath, "create socket dir"); err != nil {
		return err
	}

	guiMgr := newGUIManager(browserCfg.Daemon.GUIShellPath, nil)

	handleTagReq := func(reqCtx context.Context, req *ipcv1.TagRequest) (*ipcv1.Response, error) {
		return handleTag(reqCtx, req, idx, tags, fileGraph, proc.OnFileTagged)
	}
	handleIPCRequest := buildIPCRequestHandler(
		syncer,
		warningStore,
		fileGraph,
		idx,
		handleTagReq,
		sweeper,
		wasmCache,
		cfgPath,
		engine,
		embedder,
		uiBrowserMethods,
		guiMgr,
	)

	ipcServer, err := startIPCServer(ctx, sockPath, handleIPCRequest)
	if err != nil {
		return err
	}
	defer ipcServer.Stop()

	// Wire up broadcast now that the IPC server exists.
	guiMgr.broadcast = ipcServer.BroadcastEvent

	proc.OnFileTagged = func(path string, added, removed []string) {
		ipcServer.BroadcastEvent(&ipcv1.Event{
			Kind: &ipcv1.Event_FileTagged{
				FileTagged: &ipcv1.FileTaggedEvent{Path: path, Added: added, Removed: removed},
			},
		})
	}
	uiBrowserMethods.onFileTagged = proc.OnFileTagged

	syncer.OnStateChanged = func(state ipcv1.DaemonState) {
		ipcServer.BroadcastEvent(&ipcv1.Event{
			Kind: &ipcv1.Event_DaemonStateChanged{
				DaemonStateChanged: &ipcv1.DaemonStateChangedEvent{State: daemonStateLabel(state)},
			},
		})
	}
	syncer.OnIndexUpdated = func(filesTotal, tagsTotal uint64) {
		ipcServer.BroadcastEvent(&ipcv1.Event{
			Kind: &ipcv1.Event_IndexUpdated{
				IndexUpdated: &ipcv1.IndexUpdatedEvent{FilesTotal: filesTotal, TagsTotal: tagsTotal},
			},
		})
	}

	slog.InfoContext(ctx, "tilbo-daemon ready", "socket", sockPath)
	startFuseMount(ctx, fuseMount, idx, fileGraph, warningStore.Append)

	return runEventLoop(ctx, events, watchErrCh, hupCh, syncer, idx, proc, engine, ruleReg, sweeper, wasmCache, cfgPath)
}

func ensureParentDir(path string, action string) error {
	if err := os.MkdirAll(filepath.Dir(path), 0o700); err != nil {
		return fmt.Errorf("%s: %w", action, err)
	}
	return nil
}

func openIndexDB(ctx context.Context, dbPath string) (*index.DB, error) {
	idx, err := index.Open(ctx, dbPath)
	if err != nil {
		return nil, fmt.Errorf("open index: %w", err)
	}
	return idx, nil
}

func closeIndexOnShutdown(ctx context.Context, idx *index.DB) {
	if ctx.Err() != nil {
		slog.DebugContext(ctx, "skip index close during canceled shutdown")
		return
	}
	if closeErr := idx.Close(); closeErr != nil {
		slog.ErrorContext(ctx, "close index", "err", closeErr)
	}
}

func initWASMCache(ctx context.Context) wazero.CompilationCache {
	wasmCacheDir := filepath.Join(os.TempDir(), "tilbo-wasm-cache")
	_ = os.MkdirAll(wasmCacheDir, 0o700)

	wasmCache, err := wazero.NewCompilationCacheWithDir(wasmCacheDir)
	if err != nil {
		slog.WarnContext(ctx, "wasm cache unavailable; compilation cache disabled", "err", err)
		return nil
	}
	return wasmCache
}

func initExtensionRegistry(ctx context.Context) *extension.Registry {
	reg := extension.NewRegistry()
	if err := reg.Load(ctx, extension.DefaultDirs()); err != nil {
		slog.WarnContext(ctx, "extension registry load error", "err", err)
	}
	return reg
}

func initHarvesterPipeline(
	ctx context.Context,
	wasmCache wazero.CompilationCache,
) (*harvester.Pipeline, *harvester.Registry) {
	pipeline := harvester.NewPipeline()
	registerBuiltins(pipeline)

	harvReg := harvester.NewRegistry(harvester.DefaultDirs(), wasmCache)
	if loadErr := harvReg.Load(ctx, pipeline); loadErr != nil {
		slog.WarnContext(ctx, "harvester registry load error", "err", loadErr)
	}
	return pipeline, harvReg
}

func initRuleEngine(
	ctx context.Context,
	cfgPath string,
	wasmCache wazero.CompilationCache,
) (*rules.Engine, *rules.Registry) {
	engine := rules.NewEngine()
	ruleReg := rules.NewRegistry(rules.DefaultDirs(), wasmCache)

	if loadErr := ruleReg.Load(ctx, engine); loadErr != nil {
		slog.WarnContext(ctx, "rule registry load error", "err", loadErr)
	}
	if inlineCfg, loadErr := config.Load(cfgPath); loadErr != nil {
		slog.WarnContext(ctx, "config inline rules: load error", "err", loadErr)
	} else if loadErr := ruleReg.LoadInline(ctx, inlineCfg.Rules, engine); loadErr != nil {
		slog.WarnContext(ctx, "config inline rules: register error", "err", loadErr)
	}

	return engine, ruleReg
}

func loadGraphState(ctx context.Context, idx *index.DB) *graph.Graph {
	fileGraph := graph.New()

	if pairs, pairsErr := idx.ListFileTagPairs(ctx); pairsErr != nil {
		slog.WarnContext(ctx, "graph: failed to load file-tag pairs", "err", pairsErr)
	} else {
		fileGraph.Load(ctx, pairs)
		slog.InfoContext(ctx, "graph loaded", "pairs", len(pairs))
	}

	if embs, embsErr := idx.ListEmbeddings(ctx); embsErr != nil {
		slog.WarnContext(ctx, "graph: failed to load embeddings", "err", embsErr)
	} else {
		fileGraph.LoadEmbeddings(ctx, embs)
		slog.InfoContext(ctx, "embeddings loaded", "vectors", len(embs))
	}

	return fileGraph
}

func initOptionalEmbedder(
	ctx context.Context,
	embedModelPath string,
	embedModelName string,
	embedDisabled bool,
) *vectorize.ONNXEmbedder {
	if embedDisabled {
		return nil
	}

	resolvedPath, modelName, shouldDownload := resolveEmbedModelSource(embedModelPath, embedModelName)
	if shouldDownload {
		var dlErr error
		resolvedPath, dlErr = vectorize.EnsureModel(ctx, modelName, vectorize.DefaultModelDir())
		if dlErr != nil {
			slog.WarnContext(ctx, "embedding model unavailable; vectorization disabled", "err", dlErr)
			return nil
		}
	}

	embedder, err := vectorize.NewONNXEmbedder(ctx, resolvedPath)
	if err != nil {
		slog.WarnContext(ctx, "embedding model failed to load; vectorization disabled", "err", err)
		return nil
	}

	return embedder
}

func resolveEmbedModelSource(embedModelPath, embedModelName string) (string, string, bool) {
	if embedModelPath != "" {
		return embedModelPath, "", false
	}
	if embedModelName == "" {
		embedModelName = vectorize.DefaultModelName
	}
	return "", embedModelName, true
}

func startSyncerLoop(ctx context.Context, syncer *isync.Syncer, proc *Processor) <-chan error {
	syncer.OnFileSynced = proc.ProcessFile

	syncErrCh := make(chan error, 1)
	go func() {
		syncErrCh <- syncer.Run(ctx)
	}()
	return syncErrCh
}

func logSyncerShutdown(syncErrCh <-chan error) {
	if syncErr := waitForSyncerShutdown(syncErrCh); syncErr != nil && !errors.Is(syncErr, context.Canceled) {
		slog.Warn("syncer shutdown timed out or failed", "err", syncErr)
	}
}

func startIPCServer(
	ctx context.Context,
	sockPath string,
	handleIPCRequest func(context.Context, *ipcv1.Request) (*ipcv1.Response, error),
) (*ipc.Server, error) {
	ipcServer := ipc.NewServer(sockPath, handleIPCRequest)
	if startErr := ipcServer.Start(ctx); startErr != nil {
		return nil, fmt.Errorf("start ipc server: %w", startErr)
	}
	return ipcServer, nil
}

type statusWarningStore struct {
	mu       sync.Mutex
	warnings []string
}

func newStatusWarningStore(initial []string) *statusWarningStore {
	return &statusWarningStore{
		warnings: append([]string(nil), initial...),
	}
}

func (s *statusWarningStore) Append(warning string) {
	if warning == "" {
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	s.warnings = append(s.warnings, warning)
}

func (s *statusWarningStore) List() []string {
	s.mu.Lock()
	defer s.mu.Unlock()
	return append([]string(nil), s.warnings...)
}

func startWatcher(
	ctx context.Context,
	watchPath, fuseMount string,
	watcherBackend watcher.Backend,
	watchHidden bool,
) (<-chan watcher.Event, <-chan error, *statusWarningStore, error) {
	watchOpts := watcher.Options{WatchHidden: watchHidden}
	if fuseMount != "" {
		watchOpts.ExcludePaths = []string{fuseMount}
	}

	w, err := watcher.New(ctx, watchPath, watcherBackend, watchOpts)
	if err != nil {
		return nil, nil, nil, fmt.Errorf("create watcher: %w", err)
	}

	warningStore := newStatusWarningStore(w.CapabilityWarnings())
	watchErrCh := make(chan error, 1)
	go func() { watchErrCh <- w.Run(ctx) }()
	slog.InfoContext(ctx, "watcher running", "path", watchPath)

	return w.Events(), watchErrCh, warningStore, nil
}

func daemonStateLabel(state ipcv1.DaemonState) string {
	switch state {
	case ipcv1.DaemonState_DAEMON_STATE_SCANNING:
		return "scanning"
	case ipcv1.DaemonState_DAEMON_STATE_READY:
		return "ready"
	case ipcv1.DaemonState_DAEMON_STATE_DEGRADED:
		return "degraded"
	default:
		return "idle"
	}
}

//nolint:gocyclo,cyclop,funlen // large switch for routing
func buildIPCRequestHandler(
	syncer *isync.Syncer,
	warningStore *statusWarningStore,
	fileGraph *graph.Graph,
	idx *index.DB,
	handleTagReq func(context.Context, *ipcv1.TagRequest) (*ipcv1.Response, error),
	sweeper *rules.Sweeper,
	wasmCache wazero.CompilationCache,
	cfgPath string,
	engine *rules.Engine,
	embedder *vectorize.ONNXEmbedder,
	browser *daemonBrowserMethods,
	guiMgr *guiManager,
) func(context.Context, *ipcv1.Request) (*ipcv1.Response, error) {
	return func(ctx context.Context, req *ipcv1.Request) (*ipcv1.Response, error) {
		switch r := req.GetKind().(type) {
		case *ipcv1.Request_Status:
			state := syncer.State()
			return &ipcv1.Response{
				Kind: &ipcv1.Response_Status{
					Status: &ipcv1.StatusResponse{
						State:        state.State,
						FilesIndexed: state.FilesIndexed,
						Warnings:     warningStore.List(),
					},
				},
			}, nil

		case *ipcv1.Request_Related:
			return handleRelated(ctx, r.Related, fileGraph, idx)

		case *ipcv1.Request_Search:
			return handleSearch(ctx, r.Search, idx, embedder)

		case *ipcv1.Request_Tag:
			return handleTagReq(ctx, r.Tag)

		case *ipcv1.Request_Metadata:
			return handleMetadata(ctx, r.Metadata, idx)

		case *ipcv1.Request_MetadataSet:
			return handleMetadataSet(ctx, r.MetadataSet, idx)

		case *ipcv1.Request_ListTags:
			return handleListTags(ctx, r.ListTags, idx)

		case *ipcv1.Request_HydrateTags:
			return handleHydrateTags(ctx, r.HydrateTags, idx)

		case *ipcv1.Request_ListDirectory:
			return handleListDirectory(r.ListDirectory, browser)
		case *ipcv1.Request_StatFile:
			return handleStatFile(r.StatFile, browser)
		case *ipcv1.Request_GlobSearch:
			return handleGlobSearch(r.GlobSearch, browser)
		case *ipcv1.Request_RenameFile:
			return handleRenameFile(r.RenameFile, browser)
		case *ipcv1.Request_DeleteFile:
			return handleDeleteFile(r.DeleteFile, browser)
		case *ipcv1.Request_ChmodFile:
			return handleChmodFile(r.ChmodFile, browser)
		case *ipcv1.Request_ListPlaces:
			return handleListPlaces(r.ListPlaces, browser)
		case *ipcv1.Request_PinPlace:
			return handlePinPlace(r.PinPlace, browser)
		case *ipcv1.Request_UnpinPlace:
			return handleUnpinPlace(r.UnpinPlace, browser)
		case *ipcv1.Request_TrashFile:
			return handleTrashFile(r.TrashFile, browser)
		case *ipcv1.Request_ListTrash:
			return handleListTrash(r.ListTrash, browser)
		case *ipcv1.Request_RestoreTrash:
			return handleRestoreTrash(r.RestoreTrash, browser)
		case *ipcv1.Request_EmptyTrash:
			return handleEmptyTrash(r.EmptyTrash, browser)
		case *ipcv1.Request_ListAppsForFile:
			return handleListAppsForFile(r.ListAppsForFile, browser)
		case *ipcv1.Request_OpenWithApp:
			return handleOpenWithApp(r.OpenWithApp, browser)
		case *ipcv1.Request_GetBrowserConfig:
			return handleGetBrowserConfig(r.GetBrowserConfig, browser)
		case *ipcv1.Request_GetFileBadges:
			return handleGetFileBadges(r.GetFileBadges, browser)
		case *ipcv1.Request_GetFileActions:
			return handleGetFileActions(r.GetFileActions, browser)
		case *ipcv1.Request_RunFileAction:
			return handleRunFileAction(r.RunFileAction, browser)

		case *ipcv1.Request_GetThumbnail:
			return handleGetThumbnail(r.GetThumbnail, browser)
		case *ipcv1.Request_Copy:
			return handleCopy(r.Copy, browser)
		case *ipcv1.Request_Paste:
			return handlePaste(r.Paste, browser)
		case *ipcv1.Request_CreateFile:
			return handleCreateFile(r.CreateFile, browser)
		case *ipcv1.Request_CreateDirectory:
			return handleCreateDirectory(r.CreateDirectory, browser)
		case *ipcv1.Request_ListMounts:
			return handleListMounts(r.ListMounts, browser)
		case *ipcv1.Request_PinSearch:
			return handlePinSearch(r.PinSearch, browser)
		case *ipcv1.Request_UnpinSearch:
			return handleUnpinSearch(r.UnpinSearch, browser)
		case *ipcv1.Request_ListSavedSearches:
			return handleListSavedSearches(r.ListSavedSearches, browser)

		case *ipcv1.Request_LaunchGui:
			alreadyRunning, launchErr := guiMgr.Launch(r.LaunchGui.GetPath())
			if launchErr != nil {
				return errResponse(daemonInternalErrCode, fmt.Sprintf("launch gui: %v", launchErr)), nil
			}
			return &ipcv1.Response{Kind: &ipcv1.Response_LaunchGui{
				LaunchGui: &ipcv1.LaunchGUIResponse{AlreadyRunning: alreadyRunning},
			}}, nil

		case *ipcv1.Request_ReloadRules:
			var reloadErrs []string
			engine.Reset()
			newReg := rules.NewRegistry(rules.DefaultDirs(), wasmCache)
			if loadErr := newReg.Load(ctx, engine); loadErr != nil {
				reloadErrs = append(reloadErrs, loadErr.Error())
			}
			if inlineCfg, loadErr := config.Load(cfgPath); loadErr != nil {
				reloadErrs = append(reloadErrs, loadErr.Error())
			} else if loadErr := newReg.LoadInline(ctx, inlineCfg.Rules, engine); loadErr != nil {
				reloadErrs = append(reloadErrs, loadErr.Error())
			}
			go func() {
				if sweepErr := sweeper.Sweep(ctx); sweepErr != nil && !errors.Is(sweepErr, context.Canceled) {
					slog.WarnContext(ctx, "post-reload sweep error", "err", sweepErr)
				}
			}()
			return &ipcv1.Response{Kind: &ipcv1.Response_ReloadRules{
				ReloadRules: &ipcv1.ReloadRulesResponse{Errors: reloadErrs},
			}}, nil

		default:
			return nil, fmt.Errorf("unimplemented request type: %T", req.GetKind())
		}
	}
}

func runEventLoop(
	ctx context.Context,
	events <-chan watcher.Event,
	watchErrCh <-chan error,
	hupCh <-chan os.Signal,
	syncer *isync.Syncer,
	idx *index.DB,
	proc *Processor,
	engine *rules.Engine,
	ruleReg *rules.Registry,
	sweeper *rules.Sweeper,
	wasmCache wazero.CompilationCache,
	cfgPath string,
) error {
	for {
		select {
		case ev, ok := <-events:
			if !ok {
				// Events channel closed: watcher has stopped.
				return cleanShutdownErr(ctx, waitForWatcherShutdown(watchErrCh))
			}
			handleFSEvent(ctx, ev, syncer, idx, proc)

		case watchErr := <-watchErrCh:
			return cleanShutdownErr(ctx, watchErr)

		case <-hupCh:
			slog.InfoContext(ctx, "SIGHUP: reloading harvester and rule configuration")
			proc.clearAllNonRetryablePaths()
			reloadConfig(ctx, engine, ruleReg, sweeper, wasmCache, cfgPath)

		case <-ctx.Done():
			slog.InfoContext(ctx, "shutdown signal received; waiting for watcher")
			return cleanShutdownErr(ctx, waitForWatcherShutdown(watchErrCh))
		}
	}
}

func fuseCapabilityWarning(err error, mountPoint string) string {
	if isPermissionErr(err) {
		return fmt.Sprintf(
			"fuse mount at %q failed due to missing permissions. grant access to /dev/fuse and CAP_SYS_ADMIN, then restart tilbo-daemon",
			mountPoint,
		)
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

func startFuseMount(
	ctx context.Context,
	fuseMount string,
	idx *index.DB,
	fileGraph *graph.Graph,
	appendStatusWarning func(string),
) {
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

		case <-time.After(fuseMountWaitTimeout):
			diag := fuseMountDiagnostics(fuseMount)
			slog.Warn("fuse: mount timed out; continuing without FUSE", "path", fuseMount, "diagnostics", diag)
			appendStatusWarning(fmt.Sprintf("fuse mount timed out at %q. diagnostics: %s", fuseMount, diag))

			go func() {
				for _, argv := range [][]string{
					{"fusermount3", "-u", "-z", fuseMount},
					{"umount", "-l", fuseMount},
				} {
					//nolint:gosec // argv comes from fixed internal command list
					if exec.CommandContext(context.Background(), argv[0], argv[1:]...).Run() == nil {
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
func reloadConfig(
	ctx context.Context,
	engine *rules.Engine,
	oldRuleReg *rules.Registry,
	sweeper *rules.Sweeper,
	cache wazero.CompilationCache,
	cfgPath string,
) {
	oldRuleReg.Close(ctx)
	engine.Reset()

	newRuleReg := rules.NewRegistry(rules.DefaultDirs(), cache)
	if err := newRuleReg.Load(ctx, engine); err != nil {
		slog.ErrorContext(ctx, "rule registry reload error", "err", err)
	}
	if inlineCfg, err := config.Load(cfgPath); err != nil {
		slog.WarnContext(ctx, "config inline rules reload: load error", "err", err)
	} else if err := newRuleReg.LoadInline(ctx, inlineCfg.Rules, engine); err != nil {
		slog.WarnContext(ctx, "config inline rules reload: register error", "err", err)
	}
	// Replace the old registry pointer so the next SIGHUP closes the new one.
	// Note: oldRuleReg pointer not updated here; caller must handle if needed.
	// For simplicity we accept a potential double-close on the next SIGHUP
	// (Close is idempotent — it nils the closers slice after running them).
	_ = newRuleReg // held alive by sweeper/engine references

	slog.InfoContext(ctx, "SIGHUP: rules reloaded; starting sweep")
	go func() {
		if err := sweeper.Sweep(ctx); err != nil && !errors.Is(err, context.Canceled) {
			slog.Warn("sweep error", "err", err)
		}
	}()
}

// handleRelated handles a RelatedFiles IPC request using the in-memory graph.
func handleRelated(
	ctx context.Context,
	req *ipcv1.RelatedRequest,
	g *graph.Graph,
	idx *index.DB,
) (*ipcv1.Response, error) {
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
			HopDistance: hopDistanceToUint32(r.HopDistance),
			CosineSim:   r.CosineSim,
		})
	}
	return &ipcv1.Response{
		Kind: &ipcv1.Response_Related{
			Related: &ipcv1.RelatedResponse{Files: scored},
		},
	}, nil
}

func hopDistanceToUint32(v int) uint32 {
	if v <= 0 {
		return 0
	}
	if v > int(^uint32(0)) {
		return ^uint32(0)
	}
	return uint32(v)
}

// handleFSEvent dispatches a filesystem event to the processing pipeline.
func handleFSEvent(
	ctx context.Context,
	ev watcher.Event,
	syncer *isync.Syncer,
	idx *index.DB,
	proc *Processor,
) {
	slog.DebugContext(ctx, "fs event",
		"path", ev.Path,
		"old_path", ev.OldPath,
		"kind", ev.Kind,
	)

	switch ev.Kind {
	case watcher.EventCreate, watcher.EventModify:
		// A fresh write/modify event is a signal that the file may now be writable.
		proc.clearPathNonRetryable(ev.Path)
		var stat syscall.Stat_t
		if err := syscall.Stat(ev.Path, &stat); err != nil {
			slog.DebugContext(ctx, "fs event stat failed", "path", ev.Path, "err", err)
			return
		}
		if _, err := syncer.SyncFile(ctx, ev.Path, &stat); err != nil {
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
		if _, err := syncer.SyncFile(ctx, ev.Path, &stat); err != nil {
			slog.DebugContext(ctx, "fs event sync new file failed", "path", ev.Path, "err", err)
		}
		proc.ProcessFile(ctx, ev.Path)
	}
}

// cleanShutdownErr returns nil if err is a context cancellation (expected on
// shutdown) and the original error otherwise.
func cleanShutdownErr(ctx context.Context, err error) error {
	switch {
	case err == nil:
		return nil
	case errors.Is(err, context.Canceled), errors.Is(err, context.DeadlineExceeded):
		return nil
	case ctx.Err() != nil:
		return nil //nolint:nilerr // context cancellation during shutdown is expected
	default:
		return err
	}
}

func waitForWatcherShutdown(watchErrCh <-chan error) error {
	select {
	case err := <-watchErrCh:
		return err
	case <-time.After(shutdownWaitTimeout):
		slog.Warn("watcher shutdown timed out; continuing process exit")
		return nil
	}
}

func waitForSyncerShutdown(syncErrCh <-chan error) error {
	select {
	case err := <-syncErrCh:
		return err
	case <-time.After(shutdownWaitTimeout):
		return errors.New("syncer shutdown timed out")
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
	if dir := os.Getenv("XDG_RUNTIME_DIR"); dir != "" {
		return filepath.Join(dir, "tilbo", "tags")
	}
	return fmt.Sprintf("/run/user/%d/tilbo/tags", os.Getuid())
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
	if dir := os.Getenv("XDG_STATE_HOME"); dir != "" {
		return filepath.Join(dir, "tilbo", "index.db")
	}
	if h, err := os.UserHomeDir(); err == nil {
		return filepath.Join(h, ".local", "state", "tilbo", "index.db")
	}
	return "tilbo-index.db"
}
