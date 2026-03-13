// Package deletefile defines browser command types for deletefile operations.
package deletefile

import "github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commandcore"

// Command requests deleting a file tree.
type Command struct {
	CommandBase commandcore.Base

	Path string
}

func (c Command) Type() commandcore.Type { return commandcore.DeleteFile }
func (c Command) OperationID() string    { return c.CommandBase.OperationID() }
