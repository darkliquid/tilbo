// Package shutdown defines browser command types for shutdown operations.
package shutdown

import "github.com/darkliquid/tilbo/cmd/tilbo-browser/core"

// Command requests application shutdown.
type Command struct {
	CommandBase core.Base

	Reason string
}

func (c Command) Type() core.Type { return core.Shutdown }
func (c Command) OperationID() string    { return c.CommandBase.OperationID() }
