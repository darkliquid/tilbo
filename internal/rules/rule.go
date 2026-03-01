// Package rules implements the tilbo rule engine: declarative TOML rules,
// Lua scripted rules, and WASM scripted rules that tag files based on metadata.
package rules

import (
	"context"

	"github.com/darkliquid/tilbo/internal/harvester"
)

// Rule is the interface implemented by all rule types.
type Rule interface {
	// Name returns the rule's registered name.
	Name() string
	// Priority returns the evaluation priority. Higher values run later and win
	// on source attribution when multiple rules add the same tag.
	Priority() int
	// Eval evaluates the rule against meta. Returns tags to add, or nil if the
	// rule does not fire.
	Eval(ctx context.Context, meta harvester.MetaMap) ([]string, error)
}

// TagDiff is the result of rule evaluation for a single file.
type TagDiff struct {
	// Added contains tags to apply to the file (not already present).
	Added []string
	// Sources maps each added tag name to its provenance string ("rule:<name>").
	Sources map[string]string
}
