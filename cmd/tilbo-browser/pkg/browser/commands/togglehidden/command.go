// Package togglehidden defines browser command types for togglehidden operations.
package togglehidden

import "github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commandcore"

// Command requests hidden file visibility change.
type Command struct {
	CommandBase commandcore.Base

	Show bool
}

func (c Command) Type() commandcore.Type { return commandcore.ToggleHidden }
func (c Command) OperationID() string    { return c.CommandBase.OperationID() }
