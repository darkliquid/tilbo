package togglehidden

import (
	"context"
	"fmt"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/core"
)

// Handle executes a toggle-hidden command: updates the hidden-file visibility flag.
func Handle(_ context.Context, cmd core.Command, hctx core.HandlerContext) error {
	toggle, ok := cmd.(Command)
	if !ok {
		return fmt.Errorf("toggle hidden handler received %T", cmd)
	}

	hctx.Mutate(func(s *core.State) {
		s.Hidden = toggle.Show
	})

	return nil
}
