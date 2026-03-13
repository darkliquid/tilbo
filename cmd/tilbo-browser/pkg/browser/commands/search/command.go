// Package search defines browser command types for search operations.
package search

import "github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commandcore"

// Command requests a tag/path metadata search.
type Command struct {
	CommandBase commandcore.Base

	Chips []string
	Limit uint32
}

func (c Command) Type() commandcore.Type { return commandcore.Search }
func (c Command) OperationID() string    { return c.CommandBase.OperationID() }
