package sync //nolint:revive,nolintlint // package path is stable API surface; nolintlint cannot infer revive hit location

import (
	"context"
	"errors"
	"fmt"
	"io/fs"
	"log/slog"
	"math"
	"path/filepath"
	"runtime"
	"sync/atomic"
	"syscall"
	"time"

	"golang.org/x/sys/unix"

	"github.com/darkliquid/tilbo/internal/fsutil"
	"github.com/darkliquid/tilbo/internal/index"
	ipcv1 "github.com/darkliquid/tilbo/internal/ipc/gen/tilbo/ipc/v1"
	"github.com/darkliquid/tilbo/internal/xattr"
)

// DaemonState encapsulates the current state of the daemon.
type DaemonState struct {
	State        ipcv1.DaemonState
	FilesIndexed uint64
}

// Syncer handles the background synchronisation between filesystem xattrs and the SQLite index.
type Syncer struct {
	idx          *index.DB
	tags         *xattr.Service
	watchPath    string
	watchHidden  bool
	excludePaths []string

	state        atomic.Value // holds ipcv1.DaemonState
	filesIndexed atomic.Uint64

	// OnStateChanged is called whenever the daemon state changes.
	OnStateChanged func(state ipcv1.DaemonState)

	// OnIndexUpdated is called when a full sync scan completes.
	OnIndexUpdated func(filesTotal, tagsTotal uint64)

	// OnFileSynced is called for files that have no harvested metadata yet
	// (no mime xattr) so the harvester pipeline runs on them. Calls are
	// dispatched to a bounded goroutine pool to prevent goroutine explosion
	// on large libraries.
	OnFileSynced func(ctx context.Context, path string)

	// onFileSyncedSem is a semaphore limiting concurrent OnFileSynced goroutines.
	onFileSyncedSem chan struct{}
}

// onFileSyncedWorkers is the max number of concurrent OnFileSynced goroutines.
// Each worker can itself spawn additional async harvester goroutines (e.g. ffprobe),
// so keeping this modest avoids overwhelming the system on large libraries.
var onFileSyncedWorkers = runtime.NumCPU() * 2

// New creates a new Syncer.
func New(idx *index.DB, tags *xattr.Service, watchPath string, watchHidden bool, excludePaths []string) *Syncer {
	clean := make([]string, len(excludePaths))
	for i, p := range excludePaths {
		clean[i] = filepath.Clean(p)
	}
	s := &Syncer{
		idx:             idx,
		tags:            tags,
		watchPath:       filepath.Clean(watchPath),
		watchHidden:     watchHidden,
		excludePaths:    clean,
		onFileSyncedSem: make(chan struct{}, onFileSyncedWorkers),
	}
	s.setState(ipcv1.DaemonState_DAEMON_STATE_IDLE)
	return s
}

// State returns the current DaemonState.
func (s *Syncer) State() DaemonState {
	state, _ := s.state.Load().(ipcv1.DaemonState)
	return DaemonState{
		State:        state,
		FilesIndexed: s.filesIndexed.Load(),
	}
}

func (s *Syncer) setState(state ipcv1.DaemonState) {
	s.state.Store(state)
	if s.OnStateChanged != nil {
		s.OnStateChanged(state)
	}
}

// setLowIOPrio sets the current thread to the lowest I/O priority (IDLE class).
func setLowIOPrio() {
	const (
		ioprioClassShift = 13
		ioprioClassIdle  = 3
		ioprioWhoProcess = 1
		sysIoprioSet     = 251 // valid for amd64/arm64
	)

	// Best-effort. If it fails, we just continue.
	// We use the current process/thread ID.
	_, _, _ = unix.Syscall(
		sysIoprioSet,
		uintptr(ioprioWhoProcess),
		0,
		uintptr(ioprioClassIdle<<ioprioClassShift),
	)
}

// Run performs a full filesystem walk of the watchPath, upserting all discovered
// files and their xattrs into the index. It runs in the background and sets its
// own I/O priority to IDLE to avoid impacting the system.
func (s *Syncer) Run(ctx context.Context) error {
	s.setState(ipcv1.DaemonState_DAEMON_STATE_SCANNING)
	s.filesIndexed.Store(0)

	defer func() {
		if ctx.Err() == nil {
			s.setState(ipcv1.DaemonState_DAEMON_STATE_READY)
		}
	}()

	slog.InfoContext(ctx, "syncer: starting full scan", "path", s.watchPath)
	startTime := time.Now().Unix()

	// Lock the goroutine to its current OS thread so that the IOPRIO_SET syscall
	// applies consistently to the thread performing the I/O.
	runtime.LockOSThread()
	setLowIOPrio()
	// We keep the thread locked for the duration of the scan to maintain the priority.
	defer runtime.UnlockOSThread()

	err := filepath.WalkDir(s.watchPath, func(path string, d fs.DirEntry, walkErr error) error {
		return s.walkEntry(ctx, path, d, walkErr)
	})

	if err != nil && !errors.Is(err, context.Canceled) && !errors.Is(err, context.DeadlineExceeded) {
		s.setState(ipcv1.DaemonState_DAEMON_STATE_DEGRADED)
		return fmt.Errorf("syncer: walk dir %q: %w", s.watchPath, err)
	}

	// Remove stale files from the index that were not seen during this scan
	// (i.e. their indexed_at timestamp is older than startTime).
	if err == nil {
		if err := s.idx.DeleteStaleFiles(ctx, s.watchPath, startTime); err != nil {
			slog.WarnContext(ctx, "syncer: cleanup stale files failed", "err", err)
		}
	}

	if s.OnIndexUpdated != nil {
		stats, _ := s.idx.GetStats(ctx)
		s.OnIndexUpdated(saturatingUint64FromInt64(stats.FilesCount), saturatingUint64FromInt64(stats.TagsCount))
	}

	slog.InfoContext(ctx, "syncer: completed full scan", "indexed", s.filesIndexed.Load())
	return nil
}

func (s *Syncer) walkEntry(ctx context.Context, path string, d fs.DirEntry, walkErr error) error {
	if walkErr != nil {
		slog.DebugContext(ctx, "syncer: walk error", "path", path, "err", walkErr)
		return nil // ignore per-file walk errors and continue background scan
	}

	if ctx.Err() != nil {
		return ctx.Err()
	}

	if d.IsDir() {
		cleanPath := filepath.Clean(path)
		for _, ex := range s.excludePaths {
			if cleanPath == ex {
				return filepath.SkipDir
			}
		}
	}

	if !s.watchHidden && fsutil.HasHiddenComponentBelowRoot(s.watchPath, path) {
		if d.IsDir() {
			return filepath.SkipDir
		}
		return nil
	}

	if d.IsDir() {
		return nil
	}

	info, err := d.Info()
	if err != nil {
		return nil //nolint:nilerr // ignore file-specific stat/read errors and continue scan
	}

	sysStat, ok := info.Sys().(*syscall.Stat_t)
	if !ok {
		return nil
	}

	needsHarvest, err := s.SyncFile(ctx, path, sysStat)
	if err != nil {
		slog.DebugContext(ctx, "syncer: sync file error", "path", path, "err", err)
		return nil
	}

	// Only trigger harvesting for files with no existing metadata (mime xattr
	// absent). Already-harvested files don't need reprocessing on restart.
	if needsHarvest && s.OnFileSynced != nil {
		// Acquire a slot in the bounded worker pool, blocking the walk if full.
		// This caps concurrent goroutines and prevents resource exhaustion on
		// large libraries.
		s.onFileSyncedSem <- struct{}{}
		go func(p string) {
			defer func() { <-s.onFileSyncedSem }()
			s.OnFileSynced(ctx, p)
		}(path)
	}

	return nil
}

// SyncFile processes a single file, reading its xattrs and updating the index.
// It returns needsHarvest=true when the file has no existing mime metadata,
// indicating it should be run through the harvester pipeline.
func (s *Syncer) SyncFile(ctx context.Context, path string, stat *syscall.Stat_t) (needsHarvest bool, err error) {
	// 1. Read all xattrs. If none exist, we still want to ensure the file is in the index
	// so the harvester pipeline (M2) can process it if rules apply.
	tags, err := s.tags.ReadTags(ctx, path)
	if err != nil {
		return false, fmt.Errorf("read tags: %w", err)
	}

	meta, err := s.tags.ReadAllMeta(ctx, path)
	if err != nil {
		return false, fmt.Errorf("read meta: %w", err)
	}

	sourceMap, err := s.tags.ReadSource(ctx, path)
	if err != nil {
		return false, fmt.Errorf("read source: %w", err)
	}

	// File needs harvesting if it has no mime metadata yet.
	_, hasMIME := meta["mime"]
	needsHarvest = !hasMIME

	// 2. Upsert the file record
	inode := saturatingInt64FromUint64(stat.Ino)
	device := saturatingInt64FromUint64(stat.Dev)
	_, err = s.idx.SyncFileApply(ctx, path, inode, device, stat.Mtim.Sec, stat.Size, tags, meta, sourceMap)
	if err != nil {
		return false, fmt.Errorf("apply file sync: %w", err)
	}

	s.filesIndexed.Add(1)
	return needsHarvest, nil
}

func saturatingUint64FromInt64(v int64) uint64 {
	if v <= 0 {
		return 0
	}
	return uint64(v)
}

func saturatingInt64FromUint64(v uint64) int64 {
	if v > math.MaxInt64 {
		return math.MaxInt64
	}
	return int64(v)
}
