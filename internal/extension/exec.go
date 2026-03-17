package extension

import (
	"context"
	"os/exec"
)

func newExecCommand(ctx context.Context, name string, args ...string) *exec.Cmd {
	return exec.CommandContext(ctx, name, args...)
}
