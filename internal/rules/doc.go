// Package rules implements the tag rule engine that automatically applies tags
// to files based on their metadata.
//
// # Rule Types
//
// Two rule formats are supported:
//
//   - TOML Declarative Rules: Condition-based matching stored in
//     ~/.config/tilbo/rules/*.toml. Each rule specifies a set of conditions
//     (operators: eq, glob, gte, lte, gt, lt, between, in, not, before, after)
//     and a list of tags to apply when all conditions match. Set "any = true"
//     for OR semantics across conditions.
//
//   - Lua Scripted Rules: Stored in ~/.config/tilbo/rules/*.lua. Each script
//     defines an apply(meta) function that receives the metadata map and returns
//     a list of tag names. The Lua sandbox provides only standard math, string,
//     and table libraries — no filesystem or network access.
//
// # Rule Overrides
//
// When a user manually removes a tag that was applied by a rule, the removal is
// recorded as an override in the index's tag_overrides table. The rule engine
// checks overrides before applying tags and will not reapply a suppressed tag
// until the override is cleared. This prevents rules from fighting user intent.
//
// # Registry
//
// Rules are loaded from both user (~/.config/tilbo/rules/) and system
// (/etc/tilbo/rules/) directories. The registry is rebuilt on SIGHUP or when
// the daemon receives a reload-rules request, which also triggers a background
// re-evaluation sweep over all indexed files.
//
// # Sweep
//
// The sweep process re-evaluates all rules against all indexed files. It runs
// in the background after rule reload and respects existing overrides. This
// ensures that newly added or modified rules are applied retroactively.
package rules
