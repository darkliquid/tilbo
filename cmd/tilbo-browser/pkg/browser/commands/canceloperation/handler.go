package canceloperation

import (
	"context"
	"fmt"
	"time"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commandcore"
)

// Handle executes a cancel-operation command: cancels the target operation
// context, removes it from in-flight tracking, and publishes an
// OperationCancelledEvent.
func Handle(ctx context.Context, cmd commandcore.Command, hctx commandcore.HandlerContext) error {
	cancelCmd, ok := cmd.(Command)
	if !ok {
		return fmt.Errorf("cancel handler received %T", cmd)
	}

	if cancelCmd.TargetOpID == "" {
		return nil
	}

	if hctx.CancelOp(cancelCmd.TargetOpID) {
		hctx.Mutate(func(s *commandcore.State) {
			delete(s.InFlightOps, cancelCmd.TargetOpID)
		})
		hctx.Publish(ctx, commandcore.OperationCancelledEvent{
			EventBase:  commandcore.EventBase{OpID: cancelCmd.OperationID(), At: time.Now()},
			TargetOpID: cancelCmd.TargetOpID,
		})
	}

	return nil
}
