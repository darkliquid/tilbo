// Package openfile defines browser command types for openfile operations.
package openfile

import "github.com/darkliquid/tilbo/cmd/tilbo-browser/core"

// Command requests opening a file with a local handler.
type Command struct {
	CommandBase core.Base

	Path string
}

func (c Command) Type() core.Type { return core.OpenFile }
func (c Command) OperationID() string    { return c.CommandBase.OperationID() }
