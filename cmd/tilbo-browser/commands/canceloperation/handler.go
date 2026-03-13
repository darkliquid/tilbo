package canceloperation

import (
	"context"
	"fmt"
	"time"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/core"
)

// Handle executes a cancel-operation command: cancels the target operation
// context, removes it from in-flight tracking, and publishes an
// OperationCancelledEvent.
func Handle(ctx context.Context, cmd core.Command, hctx core.HandlerContext) error {
	cancelCmd, ok := cmd.(Command)
	if !ok {
		return fmt.Errorf("cancel handler received %T", cmd)
	}

	if cancelCmd.TargetOpID == "" {
		return nil
	}

	if hctx.CancelOp(cancelCmd.TargetOpID) {
		hctx.Mutate(func(s *core.State) {
			delete(s.InFlightOps, cancelCmd.TargetOpID)
		})
		hctx.Publish(ctx, core.OperationCancelledEvent{
			EventBase:  core.EventBase{OpID: cancelCmd.OperationID(), At: time.Now()},
			TargetOpID: cancelCmd.TargetOpID,
		})
	}

	return nil
}
