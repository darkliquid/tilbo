// Package openfile defines browser command types for openfile operations.
package openfile

import "github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commandcore"

// Command requests opening a file with a local handler.
type Command struct {
	CommandBase commandcore.Base

	Path string
}

func (c Command) Type() commandcore.Type { return commandcore.OpenFile }
func (c Command) OperationID() string    { return c.CommandBase.OperationID() }
