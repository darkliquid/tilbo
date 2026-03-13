package navigate

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commandcore"
)

const maxHydratePaths = 200

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

		entries, paths, err := hctx.LoadDir(nav.Path, hidden)
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

		// Hydrating tags per entry can be expensive in very large directories.
		// Keep navigation responsive by skipping hydration beyond a soft cap.
		if len(paths) <= maxHydratePaths {
			if tagMap, hydrateErr := hctx.HydrateTags(opCtx, paths); hydrateErr != nil {
				hctx.Publish(ctx, commandcore.OperationFailedEvent{
					EventBase: commandcore.EventBase{OpID: nav.OperationID(), At: time.Now()},
					Command:   nav.Type(),
					Err:       hydrateErr,
				})
			} else {
				entries = commandcore.MergeEntryTags(entries, tagMap)
			}
		}

		hctx.Mutate(func(s *commandcore.State) {
			s.DirectoryEntries = append([]commandcore.DirectoryEntry(nil), entries...)
			s.LastDirectoryLoad = time.Now()
		})

		hctx.Publish(ctx, commandcore.DirectoryLoadedEvent{
			EventBase: commandcore.EventBase{OpID: nav.OperationID(), At: time.Now()},
			Path:      nav.Path,
			Entries:   entries,
		})
	}()

	return nil
}
