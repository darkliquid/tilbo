package rules

import (
	"context"
	"fmt"
	"math"
	"path/filepath"
	"strings"
	"time"

	"github.com/darkliquid/tilbo/internal/harvester"
)

// matchCond is a normalised condition for a single metadata field.
// At most one operator group should be set.
type matchCond struct {
	glob       string     // shorthand or explicit glob
	eq         any        // exact equality target
	gte        *float64   // ≥
	lte        *float64   // ≤
	gt         *float64   // >
	lt         *float64   // <
	between    [2]float64 // inclusive range [min, max]
	hasBetween bool
	in         []any      // membership list
	before     *time.Time // mtime must be before this date
	after      *time.Time // mtime must be after this date
	not        *matchCond // negation wrapper
}

// TOMLRule is a declarative rule loaded from a TOML rule file.
type TOMLRule struct {
	name     string
	priority int
	tags     []string
	any      bool // OR semantics across conditions (default: AND)
	match    map[string]matchCond
}

// Name returns the rule's name.
func (r *TOMLRule) Name() string { return r.name }

// Priority returns the rule's priority.
func (r *TOMLRule) Priority() int { return r.priority }

// Eval evaluates the rule's match conditions against the metadata map.
func (r *TOMLRule) Eval(_ context.Context, meta harvester.MetaMap) ([]string, error) {
	if r.matches(meta) {
		return r.tags, nil
	}
	return nil, nil
}

// matches evaluates all conditions against meta, honouring any/all semantics.
func (r *TOMLRule) matches(meta harvester.MetaMap) bool {
	if len(r.match) == 0 {
		return true
	}
	for field, cond := range r.match {
		val := meta[field]
		result := evalCond(cond, val)
		if r.any && result {
			return true
		}
		if !r.any && !result {
			return false
		}
	}
	return !r.any
}

// evalCond evaluates a single condition against a metadata value.
func evalCond(cond matchCond, val any) bool {
	if cond.not != nil {
		return !evalCond(*cond.not, val)
	}

	if cond.glob != "" {
		s, ok := val.(string)
		if !ok {
			return false
		}
		// filepath.Match handles standard glob patterns.
		if matched, err := filepath.Match(cond.glob, s); err == nil && matched {
			return true
		}
		// Also support "type/*" style patterns not covered by filepath.Match.
		return globMatchSimple(cond.glob, s)
	}

	if cond.eq != nil {
		return equalValues(cond.eq, val)
	}

	if cond.gte != nil || cond.lte != nil || cond.gt != nil || cond.lt != nil {
		n, ok := toFloat(val)
		if !ok {
			return false
		}
		if cond.gte != nil && n < *cond.gte {
			return false
		}
		if cond.lte != nil && n > *cond.lte {
			return false
		}
		if cond.gt != nil && n <= *cond.gt {
			return false
		}
		if cond.lt != nil && n >= *cond.lt {
			return false
		}
		return true
	}

	if cond.hasBetween {
		n, ok := toFloat(val)
		if !ok {
			return false
		}
		return n >= cond.between[0] && n <= cond.between[1]
	}

	if len(cond.in) > 0 {
		for _, item := range cond.in {
			if equalValues(item, val) {
				return true
			}
		}
		return false
	}

	if cond.before != nil {
		t, ok := toTime(val)
		if !ok {
			return false
		}
		return t.Before(*cond.before)
	}

	if cond.after != nil {
		t, ok := toTime(val)
		if !ok {
			return false
		}
		return t.After(*cond.after)
	}

	return false
}

// parseMatchCond converts a raw TOML value (string or map[string]any) into a matchCond.
// A bare string is treated as a glob pattern.
func parseMatchCond(raw any) (matchCond, error) {
	switch v := raw.(type) {
	case string:
		return matchCond{glob: v}, nil
	case map[string]any:
		return parseCondMap(v)
	default:
		return matchCond{}, fmt.Errorf("unexpected condition type %T", raw)
	}
}

func parseCondMap(m map[string]any) (matchCond, error) {
	var cond matchCond
	for k, v := range m {
		switch k {
		case "glob":
			s, ok := v.(string)
			if !ok {
				return cond, fmt.Errorf("glob: expected string, got %T", v)
			}
			cond.glob = s

		case "eq":
			cond.eq = v

		case "gte":
			f, err := mustFloat(v, "gte")
			if err != nil {
				return cond, err
			}
			cond.gte = &f

		case "lte":
			f, err := mustFloat(v, "lte")
			if err != nil {
				return cond, err
			}
			cond.lte = &f

		case "gt":
			f, err := mustFloat(v, "gt")
			if err != nil {
				return cond, err
			}
			cond.gt = &f

		case "lt":
			f, err := mustFloat(v, "lt")
			if err != nil {
				return cond, err
			}
			cond.lt = &f

		case "between":
			arr, ok := v.([]any)
			if !ok || len(arr) != 2 {
				return cond, fmt.Errorf("between: expected [min, max] array")
			}
			mn, err := mustFloat(arr[0], "between min")
			if err != nil {
				return cond, err
			}
			mx, err := mustFloat(arr[1], "between max")
			if err != nil {
				return cond, err
			}
			cond.between = [2]float64{mn, mx}
			cond.hasBetween = true

		case "in":
			arr, ok := v.([]any)
			if !ok {
				return cond, fmt.Errorf("in: expected array")
			}
			cond.in = arr

		case "before":
			s, ok := v.(string)
			if !ok {
				return cond, fmt.Errorf("before: expected string")
			}
			t, err := parseDate(s)
			if err != nil {
				return cond, fmt.Errorf("before: %w", err)
			}
			cond.before = &t

		case "after":
			s, ok := v.(string)
			if !ok {
				return cond, fmt.Errorf("after: expected string")
			}
			t, err := parseDate(s)
			if err != nil {
				return cond, fmt.Errorf("after: %w", err)
			}
			cond.after = &t

		case "not":
			sub, err := parseMatchCond(v)
			if err != nil {
				return cond, fmt.Errorf("not: %w", err)
			}
			cond.not = &sub

		default:
			return cond, fmt.Errorf("unknown condition operator %q", k)
		}
	}
	return cond, nil
}

func mustFloat(v any, field string) (float64, error) {
	f, ok := toFloat(v)
	if !ok {
		return 0, fmt.Errorf("%s: expected number, got %T", field, v)
	}
	return f, nil
}

// toFloat converts numeric types (float64, float32, int*, int64) to float64.
func toFloat(v any) (float64, bool) {
	switch n := v.(type) {
	case float64:
		return n, true
	case float32:
		return float64(n), true
	case int:
		return float64(n), true
	case int32:
		return float64(n), true
	case int64:
		return float64(n), true
	case uint:
		return float64(n), true
	case uint64:
		return float64(n), true
	}
	return 0, false
}

// equalValues compares two values for equality with numeric type coercion.
func equalValues(a, b any) bool {
	if a == b {
		return true
	}
	fa, aOK := toFloat(a)
	fb, bOK := toFloat(b)
	if aOK && bOK {
		return math.Abs(fa-fb) < 1e-9
	}
	as, aOK := a.(string)
	bs, bOK := b.(string)
	if aOK && bOK {
		return as == bs
	}
	return false
}

// globMatchSimple handles "prefix/*" style patterns that filepath.Match rejects
// on non-path strings (e.g. MIME types like "video/x-matroska").
func globMatchSimple(pattern, s string) bool {
	if !strings.Contains(pattern, "*") {
		return pattern == s
	}
	parts := strings.SplitN(pattern, "*", 2)
	prefix, suffix := parts[0], parts[1]
	if !strings.HasPrefix(s, prefix) {
		return false
	}
	rest := s[len(prefix):]
	if suffix == "" {
		return true
	}
	return strings.HasSuffix(rest, suffix)
}

// toTime converts a value to time.Time. Accepts Unix timestamps (float64) or
// ISO date/RFC3339 strings.
func toTime(v any) (time.Time, bool) {
	switch n := v.(type) {
	case float64:
		return time.Unix(int64(n), 0), true
	case int64:
		return time.Unix(n, 0), true
	case string:
		for _, layout := range []string{time.RFC3339, "2006-01-02", "2006-01-02T15:04:05"} {
			if t, err := time.Parse(layout, n); err == nil {
				return t, true
			}
		}
	}
	return time.Time{}, false
}

// parseDate parses an ISO date ("2006-01-02") or RFC3339 string.
func parseDate(s string) (time.Time, error) {
	for _, layout := range []string{"2006-01-02", time.RFC3339} {
		if t, err := time.Parse(layout, s); err == nil {
			return t, nil
		}
	}
	return time.Time{}, fmt.Errorf("unsupported date format %q (want 2006-01-02 or RFC3339)", s)
}
