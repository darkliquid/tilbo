// Package renamefile defines browser command types for renamefile operations.
package renamefile

import "github.com/darkliquid/tilbo/cmd/tilbo-browser/core"

// Command requests renaming a file.
type Command struct {
	CommandBase core.Base

	OldPath string
	NewName string
}

func (c Command) Type() core.Type     { return core.RenameFile }
func (c Command) OperationID() string { return c.CommandBase.OperationID() }
