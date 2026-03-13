// Package submitportal defines browser command types for submitportal operations.
package submitportal

import "github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commandcore"

// Command requests closing portal mode with selected URIs.
type Command struct {
	CommandBase commandcore.Base

	SelectedFiles []string
}

func (c Command) Type() commandcore.Type { return commandcore.SubmitPortal }
func (c Command) OperationID() string    { return c.CommandBase.OperationID() }
