// Package autocomplete defines browser command types for autocomplete operations.
package autocomplete

import "github.com/darkliquid/tilbo/cmd/tilbo-browser/core"

// Command requests autocomplete item refresh for a prefix.
type Command struct {
	CommandBase core.Base

	Prefix string
}

func (c Command) Type() core.Type { return core.Autocomplete }
func (c Command) OperationID() string    { return c.CommandBase.OperationID() }
