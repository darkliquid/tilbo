package sync

import (
	"context"
	"fmt"
	"io/fs"
	"log/slog"
	"path/filepath"
	"runtime"
	"sync/atomic"
	"syscall"
	"time"

	"golang.org/x/sys/unix"

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
	idx       *index.DB
	tags      *xattr.Service
	watchPath string

	state        atomic.Value // holds ipcv1.DaemonState
	filesIndexed atomic.Uint64
}

// New creates a new Syncer.
func New(idx *index.DB, tags *xattr.Service, watchPath string) *Syncer {
	s := &Syncer{
		idx:       idx,
		tags:      tags,
		watchPath: watchPath,
	}
	s.state.Store(ipcv1.DaemonState_DAEMON_STATE_IDLE)
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

// setLowIOPrio sets the current thread to the lowest I/O priority (IDLE class).
func setLowIOPrio() {
	const (
		IOPRIO_CLASS_SHIFT = 13
		IOPRIO_CLASS_IDLE  = 3
		IOPRIO_WHO_PROCESS = 1
		SYS_IOPRIO_SET     = 251 // valid for amd64/arm64
	)

	// Best-effort. If it fails, we just continue.
	// We use the current process/thread ID.
	unix.Syscall(SYS_IOPRIO_SET, uintptr(IOPRIO_WHO_PROCESS), 0, uintptr(IOPRIO_CLASS_IDLE<<IOPRIO_CLASS_SHIFT))
}

// Run performs a full filesystem walk of the watchPath, upserting all discovered
// files and their xattrs into the index. It runs in the background and sets its
// own I/O priority to IDLE to avoid impacting the system.
func (s *Syncer) Run(ctx context.Context) error {
	s.state.Store(ipcv1.DaemonState_DAEMON_STATE_SCANNING)
	s.filesIndexed.Store(0)

	defer func() {
		if ctx.Err() == nil {
			s.state.Store(ipcv1.DaemonState_DAEMON_STATE_READY)
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

	err := filepath.WalkDir(s.watchPath, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			slog.DebugContext(ctx, "syncer: walk error", "path", path, "err", err)
			return nil // ignore permission errors and keep going
		}

		if ctx.Err() != nil {
			return ctx.Err()
		}

		if d.IsDir() {
			return nil
		}

		info, err := d.Info()
		if err != nil {
			return nil
		}

		sysStat, ok := info.Sys().(*syscall.Stat_t)
		if !ok {
			return nil
		}

		if err := s.SyncFile(ctx, path, sysStat); err != nil {
			slog.DebugContext(ctx, "syncer: sync file error", "path", path, "err", err)
		}

		return nil
	})

	if err != nil && err != context.Canceled && err != context.DeadlineExceeded {
		s.state.Store(ipcv1.DaemonState_DAEMON_STATE_DEGRADED)
		return fmt.Errorf("syncer: walk dir %q: %w", s.watchPath, err)
	}

	// Remove stale files from the index that were not seen during this scan
	// (i.e. their indexed_at timestamp is older than startTime).
	if err == nil {
		if err := s.idx.DeleteStaleFiles(ctx, s.watchPath, startTime); err != nil {
			slog.WarnContext(ctx, "syncer: cleanup stale files failed", "err", err)
		}
	}

	slog.InfoContext(ctx, "syncer: completed full scan", "indexed", s.filesIndexed.Load())
	return nil
}

// SyncFile processes a single file, reading its xattrs and updating the index.
func (s *Syncer) SyncFile(ctx context.Context, path string, stat *syscall.Stat_t) error {

	// 1. Read all xattrs. If none exist, we still want to ensure the file is in the index
	// so the harvester pipeline (M2) can process it if rules apply.
	tags, err := s.tags.ReadTags(ctx, path)
	if err != nil {
		return fmt.Errorf("read tags: %w", err)
	}

	meta, err := s.tags.ReadAllMeta(ctx, path)
	if err != nil {
		return fmt.Errorf("read meta: %w", err)
	}

	sourceMap, err := s.tags.ReadSource(ctx, path)
	if err != nil {
		return fmt.Errorf("read source: %w", err)
	}

	// 2. Upsert the file record
	fileID, err := s.idx.UpsertFile(ctx, path, int64(stat.Ino), int64(stat.Dev), stat.Mtim.Sec, stat.Size)
	if err != nil {
		return fmt.Errorf("upsert file: %w", err)
	}

	// 3. Set file tags
	if err := s.idx.SetFileTags(ctx, fileID, tags); err != nil {
		return fmt.Errorf("set tags: %w", err)
	}

	// 4. Upsert metadata and tag provenance
	for k, v := range meta {
		// If source isn't explicitly provided, default to "manual" or "unknown"
		src := "manual"
		if err := s.idx.UpsertMeta(ctx, fileID, k, v, src); err != nil {
			slog.DebugContext(ctx, "syncer: upsert meta", "file", path, "key", k, "err", err)
		}
	}

	for tagName, sourceName := range sourceMap {
		tagID, err := s.idx.UpsertTag(ctx, tagName)
		if err == nil {
			_ = s.idx.SetTagProvenance(ctx, fileID, tagID, sourceName)
		}
	}

	s.filesIndexed.Add(1)
	return nil
}
