// Package search defines browser command types for search operations.
package search

import "github.com/darkliquid/tilbo/cmd/tilbo-browser/core"

// Command requests a tag/path metadata search.
type Command struct {
	CommandBase core.Base

	Chips []string
	Limit uint32
}

func (c Command) Type() core.Type     { return core.Search }
func (c Command) OperationID() string { return c.CommandBase.OperationID() }
