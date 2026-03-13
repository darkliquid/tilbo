// Package submitportal defines browser command types for submitportal operations.
package submitportal

import "github.com/darkliquid/tilbo/cmd/tilbo-browser/core"

// Command requests closing portal mode with selected URIs.
type Command struct {
	CommandBase core.Base

	SelectedFiles []string
}

func (c Command) Type() core.Type { return core.SubmitPortal }
func (c Command) OperationID() string    { return c.CommandBase.OperationID() }
