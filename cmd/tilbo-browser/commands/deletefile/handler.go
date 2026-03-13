package deletefile

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/core"
)

// Handle executes a delete-file command: removes the file tree and publishes a
// FileOperationDoneEvent on success.
func Handle(ctx context.Context, cmd core.Command, hctx core.HandlerContext) error {
	op, ok := cmd.(Command)
	if !ok {
		return fmt.Errorf("delete file handler received %T", cmd)
	}
	if op.Path == "" {
		return errors.New("delete file path is empty")
	}

	hctx.RegisterInFlight(op.OperationID(), op.Type())
	opCtx, cancel := hctx.OpContext(op.OperationID(), core.DefaultOperationTimeout)
	go func() {
		defer cancel()
		defer hctx.FinishOp(op.OperationID())

		if err := hctx.FSDelete(op.Path); err != nil {
			hctx.Mutate(func(s *core.State) {
				s.LastError = err.Error()
			})
			hctx.Publish(ctx, core.OperationFailedEvent{
				EventBase: core.EventBase{OpID: op.OperationID(), At: time.Now()},
				Command:   op.Type(),
				Err:       err,
			})
			return
		}

		select {
		case <-opCtx.Done():
			return
		default:
		}

		hctx.Publish(ctx, core.FileOperationDoneEvent{
			EventBase: core.EventBase{OpID: op.OperationID(), At: time.Now()},
			Command:   op.Type(),
			Path:      op.Path,
		})
	}()

	return nil
}
