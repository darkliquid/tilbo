// Package shutdown defines browser command types for shutdown operations.
package shutdown

import "github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commandcore"

// Command requests application shutdown.
type Command struct {
	CommandBase commandcore.Base

	Reason string
}

func (c Command) Type() commandcore.Type { return commandcore.Shutdown }
func (c Command) OperationID() string    { return c.CommandBase.OperationID() }
