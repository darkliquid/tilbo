// Package refreshplaces defines browser command types for refreshplaces operations.
package refreshplaces

import "github.com/darkliquid/tilbo/cmd/tilbo-browser/core"

// Command requests refreshing sidebar places.
type Command struct {
	CommandBase core.Base
}

func (c Command) Type() core.Type     { return core.RefreshPlaces }
func (c Command) OperationID() string { return c.CommandBase.OperationID() }
