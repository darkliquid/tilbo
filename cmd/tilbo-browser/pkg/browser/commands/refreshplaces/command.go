// Package refreshplaces defines browser command types for refreshplaces operations.
package refreshplaces

import "github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commandcore"

// Command requests refreshing sidebar places.
type Command struct {
	CommandBase commandcore.Base
}

func (c Command) Type() commandcore.Type { return commandcore.RefreshPlaces }
func (c Command) OperationID() string    { return c.CommandBase.OperationID() }
