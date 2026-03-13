package navigate

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"time"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commandcore"
)

const maxHydratePaths = 200
const hydrateTimeout = 2 * time.Second

// Handle executes a navigate command: loads the directory and publishes a
// DirectoryLoadedEvent (with optional tag hydration from the daemon).
func Handle(ctx context.Context, cmd commandcore.Command, hctx commandcore.HandlerContext) error {
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
	hctx.Mutate(func(s *commandcore.State) {
		s.IsSearchMode = false
		s.CurrentPath = nav.Path
	})

	opCtx, cancel := hctx.OpContext(nav.OperationID(), commandcore.DefaultOperationTimeout)
	go func() {
		defer cancel()
		defer hctx.FinishOp(nav.OperationID())

		slog.Debug("navigate.loadDir.start", "path", nav.Path)
		t0 := time.Now()
		entries, paths, err := hctx.LoadDir(nav.Path, hidden)
		slog.Debug(
			"navigate.loadDir",
			"path",
			nav.Path,
			"n",
			len(entries),
			"dur",
			time.Since(t0).Round(time.Millisecond),
		)
		if err != nil {
			hctx.Mutate(func(s *commandcore.State) {
				s.LastError = err.Error()
			})
			hctx.Publish(ctx, commandcore.OperationFailedEvent{
				EventBase: commandcore.EventBase{OpID: nav.OperationID(), At: time.Now()},
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
		// daemon tag hydration is slow.
		hctx.Mutate(func(s *commandcore.State) {
			s.DirectoryEntries = append([]commandcore.DirectoryEntry(nil), entries...)
			s.LastDirectoryLoad = time.Now()
		})

		hctx.Publish(ctx, commandcore.DirectoryLoadedEvent{
			EventBase: commandcore.EventBase{OpID: nav.OperationID(), At: time.Now()},
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
				"n",
				len(paths),
				"dur",
				time.Since(t1).Round(time.Millisecond),
				"err",
				hydrateErr,
			)
			return
		}
		slog.Debug("navigate.hydrateTags", "n", len(paths), "dur", time.Since(t1).Round(time.Millisecond))

		hydrated := commandcore.MergeEntryTags(entries, tagMap)

		latest, _ := hctx.Snapshot()
		if latest.CurrentPath != nav.Path || latest.IsSearchMode {
			return
		}

		hctx.Mutate(func(s *commandcore.State) {
			s.DirectoryEntries = append([]commandcore.DirectoryEntry(nil), hydrated...)
			s.LastDirectoryLoad = time.Now()
		})

		hctx.Publish(ctx, commandcore.DirectoryLoadedEvent{
			EventBase: commandcore.EventBase{OpID: nav.OperationID(), At: time.Now()},
			Path:      nav.Path,
			Entries:   hydrated,
		})
	}()

	return nil
}
