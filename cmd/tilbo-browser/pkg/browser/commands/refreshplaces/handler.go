package refreshplaces

import (
	"context"
	"fmt"
	"time"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commandcore"
)

// Handle executes a refresh-places command: rebuilds the sidebar places list
// and publishes a PlacesRefreshedEvent on success.
func Handle(ctx context.Context, cmd commandcore.Command, hctx commandcore.HandlerContext) error {
	if _, ok := cmd.(Command); !ok {
		return fmt.Errorf("refresh places handler received %T", cmd)
	}

	hctx.RegisterInFlight(cmd.OperationID(), cmd.Type())
	opCtx, cancel := hctx.OpContext(cmd.OperationID(), commandcore.DefaultOperationTimeout)
	go func() {
		defer cancel()
		defer hctx.FinishOp(cmd.OperationID())

		places, err := hctx.BuildPlaces()
		if err != nil {
			hctx.Mutate(func(s *commandcore.State) {
				s.LastError = err.Error()
			})
			hctx.Publish(ctx, commandcore.OperationFailedEvent{
				EventBase: commandcore.EventBase{OpID: cmd.OperationID(), At: time.Now()},
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

		hctx.Mutate(func(s *commandcore.State) {
			s.Places = append([]commandcore.PlaceEntry(nil), places...)
			s.LastPlacesRefresh = time.Now()
		})

		hctx.Publish(ctx, commandcore.PlacesRefreshedEvent{
			EventBase: commandcore.EventBase{OpID: cmd.OperationID(), At: time.Now()},
			Places:    append([]commandcore.PlaceEntry(nil), places...),
		})
	}()

	return nil
}
