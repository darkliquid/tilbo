// Package fuse implements the tilbo virtual FUSE filesystem at ~/tags.
// Files matching tag expressions appear as symlinks to their real paths.
package fuse

import (
	"fmt"
	"strconv"
	"strings"
	"time"
	"unicode"

	"github.com/darkliquid/tilbo/internal/index"
)

// exprKind identifies the kind of path expression.
type exprKind int

const (
	exprTag    exprKind = iota // tag intersection/union/exclusion
	exprRecent                 // @recent[:Nd]
	exprSearch                 // @search:<q>
	exprUntagged               // @untagged
	exprSimilar                // @similar:<abs_path>
	exprMeta                   // @meta:<k>:<op>:<v>
)

// Expr is a parsed virtual-directory path component.
type Expr struct {
	kind exprKind

	// exprTag: Tags + TagsAny + TagExclude
	Tags       []string
	TagsAny    bool
	TagExclude []string

	// exprRecent
	Since time.Time

	// exprSearch
	FTSQuery string

	// exprSimilar
	SeedPath string

	// exprMeta
	MetaKey string
	MetaOp  string // eq, gte, lte, gt, lt, contains
	MetaVal string
}

// ParseExpr parses a single virtual-directory name into an Expr.
// Returns an error if the expression is syntactically invalid.
//
// Supported forms:
//   - "tag"             single tag (AND)
//   - "a+b-c"          AND a and b, NOT c
//   - "a,b,c"          OR a, b, c  (no + allowed when , is present)
//   - "@recent"        modified in last 7 days
//   - "@recent:30d"    modified in last 30 days
//   - "@search:query"  FTS5 full-text search
//   - "@untagged"      files with no tags
//   - "@similar:/path" graph/vector similar to path
//   - "@meta:k:v"      metadata key equals value
//   - "@meta:k:gte:n"  metadata key ≥ n
func ParseExpr(name string) (*Expr, error) {
	if strings.HasPrefix(name, "@") {
		return parseSpecial(name)
	}
	return parseTagExpr(name)
}

func parseSpecial(name string) (*Expr, error) {
	switch {
	case name == "@recent":
		return &Expr{kind: exprRecent, Since: time.Now().AddDate(0, 0, -7)}, nil

	case strings.HasPrefix(name, "@recent:"):
		dur, err := parseRelativeDur(name[len("@recent:"):])
		if err != nil {
			return nil, fmt.Errorf("fuse: invalid @recent duration: %w", err)
		}
		return &Expr{kind: exprRecent, Since: time.Now().Add(-dur)}, nil

	case name == "@untagged":
		return &Expr{kind: exprUntagged}, nil

	case strings.HasPrefix(name, "@search:"):
		q := name[len("@search:"):]
		if q == "" {
			return nil, fmt.Errorf("fuse: @search requires a query")
		}
		return &Expr{kind: exprSearch, FTSQuery: q}, nil

	case strings.HasPrefix(name, "@similar:"):
		p := name[len("@similar:"):]
		if p == "" {
			return nil, fmt.Errorf("fuse: @similar requires a path")
		}
		return &Expr{kind: exprSimilar, SeedPath: p}, nil

	case strings.HasPrefix(name, "@meta:"):
		return parseMetaExpr(name[len("@meta:"):])

	default:
		return nil, fmt.Errorf("fuse: unknown special expression %q", name)
	}
}

func parseMetaExpr(s string) (*Expr, error) {
	// Format: key:value or key:op:value
	parts := strings.SplitN(s, ":", 3)
	if len(parts) < 2 {
		return nil, fmt.Errorf("fuse: @meta requires key:value")
	}
	e := &Expr{kind: exprMeta, MetaKey: parts[0]}
	if len(parts) == 2 {
		e.MetaOp = "eq"
		e.MetaVal = parts[1]
	} else {
		e.MetaOp = parts[1]
		e.MetaVal = parts[2]
	}
	switch e.MetaOp {
	case "eq", "gte", "lte", "gt", "lt", "contains":
	default:
		return nil, fmt.Errorf("fuse: unknown @meta op %q", e.MetaOp)
	}
	return e, nil
}

func parseTagExpr(name string) (*Expr, error) {
	if name == "" {
		return nil, fmt.Errorf("fuse: empty tag expression")
	}
	for _, r := range name {
		if !unicode.IsPrint(r) {
			return nil, fmt.Errorf("fuse: tag expression contains non-printable characters")
		}
	}

	// OR mode: expression contains ',' but no '+'
	if strings.Contains(name, ",") {
		if strings.Contains(name, "+") {
			return nil, fmt.Errorf("fuse: mixed , and + not supported; use CLI for complex queries")
		}
		tags := strings.Split(name, ",")
		for i, t := range tags {
			tags[i] = strings.TrimSpace(t)
			if tags[i] == "" {
				return nil, fmt.Errorf("fuse: empty tag in OR expression")
			}
		}
		// Negation within OR terms is not supported.
		for _, t := range tags {
			if strings.ContainsAny(t, "+-") {
				return nil, fmt.Errorf("fuse: negation within OR expression not supported")
			}
		}
		return &Expr{kind: exprTag, Tags: tags, TagsAny: true}, nil
	}

	// AND+NOT mode: split by '+'; within each segment, '-' introduces NOT tags.
	// e.g. "python+work-draft" → include=[python,work] exclude=[draft]
	parts := strings.Split(name, "+")
	var include, exclude []string
	for _, p := range parts {
		if p == "" {
			return nil, fmt.Errorf("fuse: empty part in AND expression")
		}
		subs := strings.Split(p, "-")
		if subs[0] == "" {
			// Leading '-' with no preceding tag in this segment.
			if len(include) == 0 {
				return nil, fmt.Errorf("fuse: negation-only expression not supported")
			}
		} else {
			include = append(include, subs[0])
		}
		for _, neg := range subs[1:] {
			if neg == "" {
				return nil, fmt.Errorf("fuse: empty negation tag")
			}
			exclude = append(exclude, neg)
		}
	}
	if len(include) == 0 {
		return nil, fmt.Errorf("fuse: negation-only expression not supported")
	}
	return &Expr{kind: exprTag, Tags: include, TagExclude: exclude}, nil
}

// ToSearchParams converts the Expr to index.SearchParams.
// For exprSimilar, the caller must handle graph lookup separately.
func (e *Expr) ToSearchParams(limit uint32) (index.SearchParams, error) {
	const defaultLimit = 10_000

	if limit == 0 {
		limit = defaultLimit
	}

	switch e.kind {
	case exprTag:
		return index.SearchParams{
			Tags:       e.Tags,
			TagsAny:    e.TagsAny,
			TagExclude: e.TagExclude,
			Limit:      limit,
			SortBy:     []string{"mtime:desc"},
		}, nil

	case exprRecent:
		return index.SearchParams{
			MtimeSince: e.Since.Unix(),
			Limit:      limit,
			SortBy:     []string{"mtime:desc"},
		}, nil

	case exprSearch:
		return index.SearchParams{
			FTSQuery: e.FTSQuery,
			Limit:    limit,
			SortBy:   []string{"mtime:desc"},
		}, nil

	case exprUntagged:
		return index.SearchParams{
			Untagged: true,
			Limit:    limit,
			SortBy:   []string{"mtime:desc"},
		}, nil

	case exprMeta:
		return index.SearchParams{
			MetaFilters: map[string]string{e.MetaKey: e.MetaOp + ":" + e.MetaVal},
			Limit:       limit,
			SortBy:      []string{"mtime:desc"},
		}, nil

	case exprSimilar:
		// Caller must handle via graph query; return empty params as sentinel.
		return index.SearchParams{}, nil

	default:
		return index.SearchParams{}, fmt.Errorf("fuse: unknown expr kind %d", e.kind)
	}
}

// IsSimilar reports whether this expression requires graph traversal.
func (e *Expr) IsSimilar() bool { return e.kind == exprSimilar }

// IsUntagged reports whether this expression matches untagged files.
func (e *Expr) IsUntagged() bool { return e.kind == exprUntagged }

// parseRelativeDur parses strings like "7d", "30d", "2h" into a time.Duration.
func parseRelativeDur(s string) (time.Duration, error) {
	if s == "" {
		return 0, fmt.Errorf("empty duration")
	}
	unit := s[len(s)-1]
	numStr := s[:len(s)-1]
	n, err := strconv.Atoi(numStr)
	if err != nil || n <= 0 {
		return 0, fmt.Errorf("invalid number %q", numStr)
	}
	switch unit {
	case 'd':
		return time.Duration(n) * 24 * time.Hour, nil
	case 'h':
		return time.Duration(n) * time.Hour, nil
	case 'w':
		return time.Duration(n) * 7 * 24 * time.Hour, nil
	default:
		return 0, fmt.Errorf("unknown unit %q (use d, h, w)", string(unit))
	}
}
