// Package chmodfile defines browser command types for chmodfile operations.
package chmodfile

import "github.com/darkliquid/tilbo/cmd/tilbo-browser/core"

// Command requests changing file mode bits.
type Command struct {
	CommandBase core.Base

	Path string
	Mode uint32
}

func (c Command) Type() core.Type     { return core.ChmodFile }
func (c Command) OperationID() string { return c.CommandBase.OperationID() }
