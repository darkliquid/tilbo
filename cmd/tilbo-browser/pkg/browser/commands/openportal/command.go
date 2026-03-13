// Package openportal defines browser command types for openportal operations.
package openportal

import "github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commandcore"

// Command requests opening portal mode.
type Command struct {
	CommandBase commandcore.Base

	Mode string
}

func (c Command) Type() commandcore.Type { return commandcore.OpenPortal }
func (c Command) OperationID() string    { return c.CommandBase.OperationID() }
