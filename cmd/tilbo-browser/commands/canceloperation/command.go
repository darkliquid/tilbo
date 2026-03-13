// Package canceloperation defines browser command types for canceloperation operations.
package canceloperation

import "github.com/darkliquid/tilbo/cmd/tilbo-browser/core"

// Command requests cancellation of another operation.
type Command struct {
	CommandBase core.Base

	TargetOpID string
}

func (c Command) Type() core.Type { return core.CancelOperation }
func (c Command) OperationID() string    { return c.CommandBase.OperationID() }
