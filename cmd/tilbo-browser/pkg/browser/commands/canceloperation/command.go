// Package canceloperation defines browser command types for canceloperation operations.
package canceloperation

import "github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commandcore"

// Command requests cancellation of another operation.
type Command struct {
	CommandBase commandcore.Base

	TargetOpID string
}

func (c Command) Type() commandcore.Type { return commandcore.CancelOperation }
func (c Command) OperationID() string    { return c.CommandBase.OperationID() }
