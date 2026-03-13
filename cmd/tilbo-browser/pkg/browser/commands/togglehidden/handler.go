package togglehidden

import (
	"context"
	"fmt"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commandcore"
)

// Handle executes a toggle-hidden command: updates the hidden-file visibility flag.
func Handle(_ context.Context, cmd commandcore.Command, hctx commandcore.HandlerContext) error {
	toggle, ok := cmd.(Command)
	if !ok {
		return fmt.Errorf("toggle hidden handler received %T", cmd)
	}

	hctx.Mutate(func(s *commandcore.State) {
		s.Hidden = toggle.Show
	})

	return nil
}
