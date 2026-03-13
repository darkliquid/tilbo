// Package togglehidden defines browser command types for togglehidden operations.
package togglehidden

import "github.com/darkliquid/tilbo/cmd/tilbo-browser/core"

// Command requests hidden file visibility change.
type Command struct {
	CommandBase core.Base

	Show bool
}

func (c Command) Type() core.Type     { return core.ToggleHidden }
func (c Command) OperationID() string { return c.CommandBase.OperationID() }
