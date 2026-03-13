// Package chmodfile defines browser command types for chmodfile operations.
package chmodfile

import "github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commandcore"

// Command requests changing file mode bits.
type Command struct {
	CommandBase commandcore.Base

	Path string
	Mode uint32
}

func (c Command) Type() commandcore.Type { return commandcore.ChmodFile }
func (c Command) OperationID() string    { return c.CommandBase.OperationID() }
