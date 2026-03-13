package shutdown

import (
	"context"
	"fmt"
	"time"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/core"
)

// Handle executes a shutdown command: publishes a ShutdownInitiatedEvent and
// cancels the controller's root context.
func Handle(ctx context.Context, cmd core.Command, hctx core.HandlerContext) error {
	sd, ok := cmd.(Command)
	if !ok {
		return fmt.Errorf("shutdown handler received %T", cmd)
	}

	hctx.Publish(ctx, core.ShutdownInitiatedEvent{
		EventBase: core.EventBase{OpID: sd.OperationID(), At: time.Now()},
		Reason:    sd.Reason,
	})

	hctx.CancelCtx()
	return nil
}
