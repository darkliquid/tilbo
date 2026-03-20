package rules

import (
	"context"
	"log/slog"
	"slices"
	"sort"
	"sync"

	"github.com/darkliquid/tilbo/internal/harvester"
)

// Engine evaluates registered rules against a file's metadata map and computes
// the set of new tags to apply. It is safe for concurrent use.
//
// Rules are maintained in ascending priority order so that when multiple rules
// produce the same tag, the highest-priority (last-evaluated) rule wins the
// source attribution recorded in TagDiff.Sources.
type Engine struct {
	mu    sync.RWMutex
	rules []Rule // sorted by priority ascending
}

// NewEngine creates an empty Engine.
func NewEngine() *Engine {
	return &Engine{}
}

// Reset removes all registered rules. Safe to call concurrently; used during
// configuration reload (SIGHUP) before re-loading rules from disk.
func (e *Engine) Reset() {
	e.mu.Lock()
	defer e.mu.Unlock()
	e.rules = nil
}

// Register adds a rule to the engine, maintaining ascending priority order.
func (e *Engine) Register(r Rule) {
	e.mu.Lock()
	defer e.mu.Unlock()
	e.rules = append(e.rules, r)
	sort.Slice(e.rules, func(i, j int) bool {
		return e.rules[i].Priority() < e.rules[j].Priority()
	})
}

// List returns all registered rules.
func (e *Engine) List() []Rule {
	e.mu.RLock()
	defer e.mu.RUnlock()
	res := make([]Rule, len(e.rules))
	copy(res, e.rules)
	return res
}

// Eval evaluates all registered rules against meta and returns the tags to add.
//
// existingTags is the current set of tag names on the file; tags already present
// are excluded from TagDiff.Added.
//
// overrides maps tag names to the set of rule names that are suppressed for this
// file. When a rule would add a tag but (tag, rule.Name()) appears in overrides,
// the tag is skipped for that rule (but may still be added by a different rule).
func (e *Engine) Eval(
	ctx context.Context,
	meta harvester.MetaMap,
	existingTags []string,
	overrides map[string][]string,
) (TagDiff, error) {
	// Snapshot the rule list under a read lock so evaluation does not hold
	// the lock for the entire duration, which could block Register/Reset.
	e.mu.RLock()
	rs := make([]Rule, len(e.rules))
	copy(rs, e.rules)
	e.mu.RUnlock()

	existing := make(map[string]bool, len(existingTags))
	for _, t := range existingTags {
		existing[t] = true
	}

	// toAdd maps tag name to the name of the last (highest-priority) rule that
	// produced it. Because rules are sorted ascending by priority, later entries
	// overwrite earlier ones, giving the highest-priority rule source attribution.
	toAdd := make(map[string]string)

	for _, rule := range rs {
		tags, err := rule.Eval(ctx, meta)
		if err != nil {
			// Individual rule failures are non-fatal: log and continue so that
			// one broken rule does not prevent other rules from firing.
			slog.WarnContext(ctx, "rule eval error", "rule", rule.Name(), "err", err)
			continue
		}
		for _, tag := range tags {
			if isSuppressed(tag, rule.Name(), overrides) {
				continue
			}
			toAdd[tag] = rule.Name()
		}
	}

	// Build the diff: only include tags not already on the file. The "rule:"
	// prefix in Sources enables downstream code (xattr provenance, index) to
	// distinguish rule-applied tags from manually applied ones.
	diff := TagDiff{Sources: make(map[string]string, len(toAdd))}
	for tag, ruleName := range toAdd {
		if !existing[tag] {
			diff.Added = append(diff.Added, tag)
			diff.Sources[tag] = "rule:" + ruleName
		}
	}
	return diff, nil
}

// isSuppressed reports whether the (tag, ruleName) pair is in the overrides map.
func isSuppressed(tag, ruleName string, overrides map[string][]string) bool {
	return slices.Contains(overrides[tag], ruleName)
}
