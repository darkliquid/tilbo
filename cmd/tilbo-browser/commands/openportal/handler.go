package openportal

import (
	"context"
	"fmt"
	"time"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/core"
)

// Handle executes an open-portal command: sets the window mode and publishes a
// PortalOpenedEvent.
func Handle(ctx context.Context, cmd core.Command, hctx core.HandlerContext) error {
	op, ok := cmd.(Command)
	if !ok {
		return fmt.Errorf("open portal handler received %T", cmd)
	}

	hctx.Mutate(func(s *core.State) {
		s.WindowMode = op.Mode
	})

	hctx.Publish(ctx, core.PortalOpenedEvent{
		EventBase: core.EventBase{OpID: op.OperationID(), At: time.Now()},
		Mode:      op.Mode,
	})

	return nil
}
