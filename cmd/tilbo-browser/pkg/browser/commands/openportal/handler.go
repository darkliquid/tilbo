package openportal

import (
	"context"
	"fmt"
	"time"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commandcore"
)

// Handle executes an open-portal command: sets the window mode and publishes a
// PortalOpenedEvent.
func Handle(ctx context.Context, cmd commandcore.Command, hctx commandcore.HandlerContext) error {
	op, ok := cmd.(Command)
	if !ok {
		return fmt.Errorf("open portal handler received %T", cmd)
	}

	hctx.Mutate(func(s *commandcore.State) {
		s.WindowMode = op.Mode
	})

	hctx.Publish(ctx, commandcore.PortalOpenedEvent{
		EventBase: commandcore.EventBase{OpID: op.OperationID(), At: time.Now()},
		Mode:      op.Mode,
	})

	return nil
}
