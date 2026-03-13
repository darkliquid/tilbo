// Package deletefile defines browser command types for deletefile operations.
package deletefile

import "github.com/darkliquid/tilbo/cmd/tilbo-browser/core"

// Command requests deleting a file tree.
type Command struct {
	CommandBase core.Base

	Path string
}

func (c Command) Type() core.Type { return core.DeleteFile }
func (c Command) OperationID() string    { return c.CommandBase.OperationID() }
