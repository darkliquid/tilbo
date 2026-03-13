// Package openportal defines browser command types for openportal operations.
package openportal

import "github.com/darkliquid/tilbo/cmd/tilbo-browser/core"

// Command requests opening portal mode.
type Command struct {
	CommandBase core.Base

	Mode string
}

func (c Command) Type() core.Type     { return core.OpenPortal }
func (c Command) OperationID() string { return c.CommandBase.OperationID() }
