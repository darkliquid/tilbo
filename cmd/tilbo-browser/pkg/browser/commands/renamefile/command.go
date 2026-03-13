// Package renamefile defines browser command types for renamefile operations.
package renamefile

import "github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commandcore"

// Command requests renaming a file.
type Command struct {
	CommandBase commandcore.Base

	OldPath string
	NewName string
}

func (c Command) Type() commandcore.Type { return commandcore.RenameFile }
func (c Command) OperationID() string    { return c.CommandBase.OperationID() }
