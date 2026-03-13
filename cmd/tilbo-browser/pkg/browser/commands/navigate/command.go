// Package navigate defines browser command types for navigate operations.
package navigate

import "github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commandcore"

// Command requests loading a directory path.
type Command struct {
	CommandBase commandcore.Base

	Path string
}

// Type identifies this command kind.
func (c Command) Type() commandcore.Type { return commandcore.Navigate }

// OperationID returns the command operation id.
func (c Command) OperationID() string { return c.CommandBase.OperationID() }
