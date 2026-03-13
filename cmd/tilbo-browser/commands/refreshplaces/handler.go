package refreshplaces

import (
	"context"
	"fmt"
	"time"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/core"
)

// Handle executes a refresh-places command: rebuilds the sidebar places list
// and publishes a PlacesRefreshedEvent on success.
func Handle(ctx context.Context, cmd core.Command, hctx core.HandlerContext) error {
	if _, ok := cmd.(Command); !ok {
		return fmt.Errorf("refresh places handler received %T", cmd)
	}

	hctx.RegisterInFlight(cmd.OperationID(), cmd.Type())
	opCtx, cancel := hctx.OpContext(cmd.OperationID(), core.DefaultOperationTimeout)
	go func() {
		defer cancel()
		defer hctx.FinishOp(cmd.OperationID())

		places, err := hctx.BuildPlaces()
		if err != nil {
			hctx.Mutate(func(s *core.State) {
				s.LastError = err.Error()
			})
			hctx.Publish(ctx, core.OperationFailedEvent{
				EventBase: core.EventBase{OpID: cmd.OperationID(), At: time.Now()},
				Command:   cmd.Type(),
				Err:       err,
			})
			return
		}

		select {
		case <-opCtx.Done():
			return
		default:
		}

		hctx.Mutate(func(s *core.State) {
			s.Places = append([]core.PlaceEntry(nil), places...)
			s.LastPlacesRefresh = time.Now()
		})

		hctx.Publish(ctx, core.PlacesRefreshedEvent{
			EventBase: core.EventBase{OpID: cmd.OperationID(), At: time.Now()},
			Places:    append([]core.PlaceEntry(nil), places...),
		})
	}()

	return nil
}
