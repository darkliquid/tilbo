package shutdown

import (
	"context"
	"fmt"
	"time"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commandcore"
)

// Handle executes a shutdown command: publishes a ShutdownInitiatedEvent and
// cancels the controller's root context.
func Handle(ctx context.Context, cmd commandcore.Command, hctx commandcore.HandlerContext) error {
	sd, ok := cmd.(Command)
	if !ok {
		return fmt.Errorf("shutdown handler received %T", cmd)
	}

	hctx.Publish(ctx, commandcore.ShutdownInitiatedEvent{
		EventBase: commandcore.EventBase{OpID: sd.OperationID(), At: time.Now()},
		Reason:    sd.Reason,
	})

	hctx.CancelCtx()
	return nil
}
