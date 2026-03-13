package search

import (
	"context"
	"fmt"
	"slices"
	"time"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commandcore"
)

// Handle executes a search command: runs local and/or daemon search, merges
// the results, and publishes a SearchCompletedEvent.
func Handle(ctx context.Context, cmd commandcore.Command, hctx commandcore.HandlerContext) error {
	s, ok := cmd.(Command)
	if !ok {
		return fmt.Errorf("search handler received %T", cmd)
	}

	if s.Limit == 0 {
		s.Limit = defaultSearchLimit
	}

	hctx.RegisterInFlight(s.OperationID(), s.Type())
	hctx.Mutate(func(st *commandcore.State) {
		st.IsSearchMode = true
		st.SearchChips = append([]string(nil), s.Chips...)
	})

	state, _ := hctx.Snapshot()
	allowHidden := searchAllowHidden(s.Chips, state.Hidden)

	opCtx, cancel := hctx.OpContext(s.OperationID(), commandcore.DefaultOperationTimeout)
	go func() {
		defer cancel()
		defer hctx.FinishOp(s.OperationID())

		localFiles, localErr := hctx.LocalSearch(s.Chips, s.Limit, allowHidden)
		files := localFiles
		err := localErr

		daemonFiles, daemonErr := hctx.SearchDaemon(opCtx, s.Chips, s.Limit)
		if daemonFiles != nil || daemonErr != nil {
			files = commandcore.EnsureSearchSource(daemonFiles, s.Chips, localFiles)
			err = commandcore.BuildSearchError(daemonErr, localErr)
			if len(files) > 0 {
				err = nil
			}
		}

		if err != nil {
			hctx.Mutate(func(st *commandcore.State) {
				st.LastError = err.Error()
			})
			hctx.Publish(ctx, commandcore.OperationFailedEvent{
				EventBase: commandcore.EventBase{OpID: s.OperationID(), At: time.Now()},
				Command:   s.Type(),
				Err:       err,
			})
			return
		}

		select {
		case <-opCtx.Done():
			return
		default:
		}

		hctx.Mutate(func(st *commandcore.State) {
			st.SearchResults = append([]commandcore.SearchFile(nil), files...)
			st.LastSearch = time.Now()
		})

		hctx.Publish(ctx, commandcore.SearchCompletedEvent{
			EventBase: commandcore.EventBase{OpID: s.OperationID(), At: time.Now()},
			Chips:     append([]string(nil), s.Chips...),
			Files:     append([]commandcore.SearchFile(nil), files...),
		})
	}()

	return nil
}

const defaultSearchLimit uint32 = 1000

// searchAllowHidden reports whether hidden files should be included in search.
func searchAllowHidden(chips []string, current bool) bool {
	return current || slices.Contains(chips, "hidden:any")
}
