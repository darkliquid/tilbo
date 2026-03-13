package navigate

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"os"
	"sync"
	"time"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/core"
)

const maxHydratePaths = 200
const hydrateTimeout = 2 * time.Second

// metadataWorkers is the size of the worker pool used for concurrent lstat
// calls during metadata enrichment. Eight concurrent syscalls strikes a balance
// between throughput and avoiding excessive parallelism on slow filesystems
// (NFS, FUSE) or on directories with thousands of entries.
const metadataWorkers = 8

// Handle executes a navigate command: loads the directory and publishes a
// DirectoryLoadedEvent (with optional tag hydration from the daemon).
func Handle(ctx context.Context, cmd core.Command, hctx core.HandlerContext) error {
	nav, ok := cmd.(Command)
	if !ok {
		return fmt.Errorf("navigate handler received %T", cmd)
	}
	if nav.Path == "" {
		return errors.New("navigate path is empty")
	}

	state, _ := hctx.Snapshot()
	hidden := state.Hidden

	hctx.RegisterInFlight(nav.OperationID(), nav.Type())
	hctx.Mutate(func(s *core.State) {
		s.IsSearchMode = false
		s.CurrentPath = nav.Path
	})

	opCtx, cancel := hctx.OpContext(nav.OperationID(), core.DefaultOperationTimeout)
	go func() {
		defer cancel()
		defer hctx.FinishOp(nav.OperationID())

		slog.Debug("navigate.loadDir.start", "path", nav.Path)
		t0 := time.Now()
		entries, paths, err := hctx.LoadDir(nav.Path, hidden)
		slog.Debug(
			"navigate.loadDir",
			"path", nav.Path,
			"n", len(entries),
			"dur", time.Since(t0).Round(time.Millisecond),
		)
		if err != nil {
			hctx.Mutate(func(s *core.State) {
				s.LastError = err.Error()
			})
			hctx.Publish(ctx, core.OperationFailedEvent{
				EventBase: core.EventBase{OpID: nav.OperationID(), At: time.Now()},
				Command:   nav.Type(),
				Err:       err,
			})
			return
		}

		select {
		case <-opCtx.Done():
			return
		default:
		}

		// Publish directory contents immediately so the UI is responsive even when
		// metadata enrichment and daemon tag hydration are slow.
		hctx.Mutate(func(s *core.State) {
			s.DirectoryEntries = append([]core.DirectoryEntry(nil), entries...)
			s.LastDirectoryLoad = time.Now()
		})

		hctx.Publish(ctx, core.DirectoryLoadedEvent{
			EventBase: core.EventBase{OpID: nav.OperationID(), At: time.Now()},
			Path:      nav.Path,
			Entries:   entries,
		})

		// Enrich entries with size and mtime using a bounded worker pool.
		// This runs after the initial render so navigation stays instant.
		tmeta := time.Now()
		entries = enrichMetadata(opCtx, entries)
		slog.Debug(
			"navigate.enrichMetadata",
			"path", nav.Path,
			"n", len(entries),
			"dur", time.Since(tmeta).Round(time.Millisecond),
		)

		select {
		case <-opCtx.Done():
			return
		default:
		}

		latest, _ := hctx.Snapshot()
		if latest.CurrentPath != nav.Path || latest.IsSearchMode {
			return
		}

		hctx.Mutate(func(s *core.State) {
			s.DirectoryEntries = append([]core.DirectoryEntry(nil), entries...)
			s.LastDirectoryLoad = time.Now()
		})

		hctx.Publish(ctx, core.DirectoryLoadedEvent{
			EventBase: core.EventBase{OpID: nav.OperationID(), At: time.Now()},
			Path:      nav.Path,
			Entries:   entries,
		})

		// Hydrating tags per entry can be expensive in very large directories.
		// Keep navigation responsive by limiting path count and time budget.
		if len(paths) == 0 || len(paths) > maxHydratePaths {
			return
		}

		hydrateCtx, cancelHydrate := context.WithTimeout(opCtx, hydrateTimeout)
		defer cancelHydrate()

		t1 := time.Now()
		tagMap, hydrateErr := hctx.HydrateTags(hydrateCtx, paths)
		if hydrateErr != nil {
			slog.Debug(
				"navigate.hydrateTags",
				"n", len(paths),
				"dur", time.Since(t1).Round(time.Millisecond),
				"err", hydrateErr,
			)
			return
		}
		slog.Debug("navigate.hydrateTags", "n", len(paths), "dur", time.Since(t1).Round(time.Millisecond))

		hydrated := core.MergeEntryTags(entries, tagMap)

		latest, _ = hctx.Snapshot()
		if latest.CurrentPath != nav.Path || latest.IsSearchMode {
			return
		}

		hctx.Mutate(func(s *core.State) {
			s.DirectoryEntries = append([]core.DirectoryEntry(nil), hydrated...)
			s.LastDirectoryLoad = time.Now()
		})

		hctx.Publish(ctx, core.DirectoryLoadedEvent{
			EventBase: core.EventBase{OpID: nav.OperationID(), At: time.Now()},
			Path:      nav.Path,
			Entries:   hydrated,
		})
	}()

	return nil
}

// enrichMetadata runs lstat on every entry using a fixed worker pool to
// populate Size and MTime without blocking the caller. It respects ctx
// cancellation so navigation to a new directory aborts in-flight enrichment.
func enrichMetadata(ctx context.Context, entries []core.DirectoryEntry) []core.DirectoryEntry {
	if len(entries) == 0 {
		return entries
	}

	result := make([]core.DirectoryEntry, len(entries))
	copy(result, entries)

	// Use a work-channel worker pool: exactly metadataWorkers goroutines are
	// created regardless of directory size, avoiding goroutine explosion in
	// very large directories.
	work := make(chan int, len(entries))
	for i := range result {
		work <- i
	}
	close(work)

	var wg sync.WaitGroup
	for range metadataWorkers {
		wg.Go(func() {
			for idx := range work {
				if ctx.Err() != nil {
					return
				}
				info, err := os.Lstat(result[idx].Path)
				if err == nil {
					result[idx].Size = info.Size()
					result[idx].MTime = info.ModTime().Unix()
				}
			}
		})
	}
	wg.Wait()

	return result
}
