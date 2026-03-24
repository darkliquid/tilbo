package rules

import (
	"context"

	"github.com/darkliquid/tilbo/internal/harvester"
)

// Rule is the interface implemented by all rule types (TOMLRule, LuaRule,
// WASMRule). Implementations must be safe for concurrent Eval calls from
// different goroutines. A rule returning (nil, nil) means the rule did not
// match and produces no tags; returning (nil, err) signals evaluation failure.
type Rule interface {
	// Name returns the rule's registered name, used for override matching
	// and provenance tracking.
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
