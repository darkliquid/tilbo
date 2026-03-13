// Package autocomplete defines browser command types for autocomplete operations.
package autocomplete

import "github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commandcore"

// Command requests autocomplete item refresh for a prefix.
type Command struct {
	CommandBase commandcore.Base

	Prefix string
}

func (c Command) Type() commandcore.Type { return commandcore.Autocomplete }
func (c Command) OperationID() string    { return c.CommandBase.OperationID() }
