package chmodfile

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commandcore"
)

// Handle executes a chmod-file command: changes file mode bits and publishes a
// FileOperationDoneEvent on success.
func Handle(ctx context.Context, cmd commandcore.Command, hctx commandcore.HandlerContext) error {
	op, ok := cmd.(Command)
	if !ok {
		return fmt.Errorf("chmod file handler received %T", cmd)
	}
	if op.Path == "" {
		return errors.New("chmod file path is empty")
	}

	hctx.RegisterInFlight(op.OperationID(), op.Type())
	opCtx, cancel := hctx.OpContext(op.OperationID(), commandcore.DefaultOperationTimeout)
	go func() {
		defer cancel()
		defer hctx.FinishOp(op.OperationID())

		if err := hctx.FSChmod(op.Path, op.Mode); err != nil {
			hctx.Mutate(func(s *commandcore.State) {
				s.LastError = err.Error()
			})
			hctx.Publish(ctx, commandcore.OperationFailedEvent{
				EventBase: commandcore.EventBase{OpID: op.OperationID(), At: time.Now()},
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

		hctx.Publish(ctx, commandcore.FileOperationDoneEvent{
			EventBase: commandcore.EventBase{OpID: op.OperationID(), At: time.Now()},
			Command:   op.Type(),
			Path:      op.Path,
		})
	}()

	return nil
}
