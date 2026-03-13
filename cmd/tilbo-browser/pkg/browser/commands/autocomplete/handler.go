package autocomplete

import (
	"context"
	"fmt"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commandcore"
)

// Handle executes an autocomplete command: resolves suggestions via local glob
// expansion or daemon prefix lookup, then publishes an AutocompleteUpdatedEvent.
func Handle(ctx context.Context, cmd commandcore.Command, hctx commandcore.HandlerContext) error {
	auto, ok := cmd.(Command)
	if !ok {
		return fmt.Errorf("autocomplete handler received %T", cmd)
	}

	hctx.RegisterInFlight(auto.OperationID(), auto.Type())
	opCtx, cancel := hctx.OpContext(auto.OperationID(), commandcore.DefaultOperationTimeout)
	go func() {
		defer cancel()
		defer hctx.FinishOp(auto.OperationID())

		var items []string
		var err error

		if strings.HasPrefix(auto.Prefix, "glob:") {
			items, err = autocompleteGlobItems(auto.Prefix)
		} else {
			items, err = hctx.Autocomplete(opCtx, auto.Prefix)
		}

		if err != nil {
			hctx.Mutate(func(s *commandcore.State) {
				s.LastError = err.Error()
			})
			hctx.Publish(ctx, commandcore.OperationFailedEvent{
				EventBase: commandcore.EventBase{OpID: auto.OperationID(), At: time.Now()},
				Command:   auto.Type(),
				Err:       err,
			})
			return
		}

		select {
		case <-opCtx.Done():
			return
		default:
		}

		hctx.Mutate(func(s *commandcore.State) {
			s.Autocomplete = append([]string(nil), items...)
		})

		hctx.Publish(ctx, commandcore.AutocompleteUpdatedEvent{
			EventBase: commandcore.EventBase{OpID: auto.OperationID(), At: time.Now()},
			Items:     append([]string(nil), items...),
		})
	}()

	return nil
}

func autocompleteGlobItems(prefix string) ([]string, error) {
	globStr := strings.TrimPrefix(prefix, "glob:")
	if globStr == "" {
		return []string{}, nil
	}

	matches, err := filepath.Glob(globStr + "*")
	if err != nil {
		return nil, err
	}
	sort.Strings(matches)

	items := make([]string, 0, len(matches))
	for _, match := range matches {
		items = append(items, "glob:"+match)
	}

	return items, nil
}
