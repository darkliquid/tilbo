package submitportal

import (
	"context"
	"fmt"
	"time"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commandcore"
)

// Handle executes a submit-portal command: publishes a PortalClosedEvent with
// the selected files.
func Handle(ctx context.Context, cmd commandcore.Command, hctx commandcore.HandlerContext) error {
	submit, ok := cmd.(Command)
	if !ok {
		return fmt.Errorf("submit portal handler received %T", cmd)
	}

	hctx.Publish(ctx, commandcore.PortalClosedEvent{
		EventBase:     commandcore.EventBase{OpID: submit.OperationID(), At: time.Now()},
		SelectedFiles: append([]string(nil), submit.SelectedFiles...),
	})

	return nil
}
