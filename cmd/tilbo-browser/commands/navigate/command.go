// Package navigate defines browser command types for navigate operations.
package navigate

import "github.com/darkliquid/tilbo/cmd/tilbo-browser/core"

// Command requests loading a directory path.
type Command struct {
	CommandBase core.Base

	Path string
}

// Type identifies this command kind.
func (c Command) Type() core.Type { return core.Navigate }

// OperationID returns the command operation id.
func (c Command) OperationID() string { return c.CommandBase.OperationID() }
