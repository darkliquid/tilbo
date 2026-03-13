// Package harvester implements the tilbo harvester pipeline: per-file metadata
// enrichment by concurrent, sandboxed harvesters whose output feeds the rule engine.
package harvester

import (
	"context"
	"fmt"
	"math"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

// MetaMap holds file metadata as an in-memory map produced by harvesters and
// consumed by the rule engine. Values may be strings, float64, or bool — matching
// JSON unmarshaling conventions. Keys beginning with "_" are internal and are not
// written to xattr.
type MetaMap map[string]any

const (
	metaTrueString  = "true"
	metaFalseString = "false"
)

// Input is the payload sent to a harvester. It is serialised as JSON on the
// harvester's stdin.
type Input struct {
	Path     string  `json:"path"`
	MIME     string  `json:"mime"`
	Existing MetaMap `json:"existing"`
}

//nolint:revive // exported: hierarchical naming is deliberate
type HarvesterConfig struct {
	Name       string   `toml:"name"`
	Command    []string `toml:"command"`
	MIMEFilter []string `toml:"mime_filter"`
	PathGlob   []string `toml:"path_glob"`
	Priority   int      `toml:"priority"`
	TimeoutMS  int      `toml:"timeout_ms"`
	Async      bool     `toml:"async"`
}

// Config is the top-level structure of a TOML harvester registration file located
// in ~/.config/tilbo/harvesters/<name>.toml.
type Config struct {
	Harvester HarvesterConfig `toml:"harvester"`
}

// Harvester is the interface implemented by all harvester types.
type Harvester interface {
	// Name returns the harvester's registered name.
	Name() string
	// Priority returns the execution priority. Lower values run first; built-ins use 0.
	Priority() int
	// Async reports whether this harvester runs asynchronously, not blocking rule evaluation.
	Async() bool
	// Matches reports whether this harvester should run for the given path and MIME type.
	Matches(path, mime string) bool
	// Run executes the harvester for the given input. Returns an empty MetaMap
	// and nil error when the harvester has nothing to contribute.
	Run(ctx context.Context, input Input) (MetaMap, error)
}

// baseHarvester embeds common Config-derived behaviour shared by all harvester types.
type baseHarvester struct {
	cfg Config
}

func (b *baseHarvester) Name() string  { return b.cfg.Harvester.Name }
func (b *baseHarvester) Priority() int { return b.cfg.Harvester.Priority }
func (b *baseHarvester) Async() bool   { return b.cfg.Harvester.Async }

// Matches reports whether this harvester should run for the given path and MIME type.
// Both filters must pass: an empty filter list matches everything.
func (b *baseHarvester) Matches(path, mime string) bool {
	h := b.cfg.Harvester
	if len(h.MIMEFilter) > 0 && !matchesMIME(mime, h.MIMEFilter) {
		return false
	}
	if len(h.PathGlob) > 0 && !matchesGlob(path, h.PathGlob) {
		return false
	}
	return true
}

// ExpandPath expands a leading "~/" to the current user's home directory.
func ExpandPath(path string) string {
	if strings.HasPrefix(path, "~/") {
		if home, err := os.UserHomeDir(); err == nil {
			return filepath.Join(home, path[2:])
		}
	}
	return path
}

// ParseMetaValue converts a string xattr metadata value to the most appropriate
// Go type (bool, float64, or string), enabling typed comparisons in the rule engine.
func ParseMetaValue(s string) any {
	if s == metaTrueString {
		return true
	}
	if s == metaFalseString {
		return false
	}
	if n, err := strconv.ParseInt(s, 10, 64); err == nil {
		return float64(n)
	}
	if n, err := strconv.ParseFloat(s, 64); err == nil {
		return n
	}
	return s
}

// ValueToString converts a MetaMap value to a string suitable for xattr storage.
// Integers stored as float64 are formatted without a decimal point.
func ValueToString(v any) string {
	switch n := v.(type) {
	case string:
		return n
	case float64:
		if n == math.Trunc(n) && !math.IsInf(n, 0) && !math.IsNaN(n) {
			return strconv.FormatInt(int64(n), 10)
		}
		return strconv.FormatFloat(n, 'f', -1, 64)
	case bool:
		if n {
			return metaTrueString
		}
		return metaFalseString
	default:
		return fmt.Sprintf("%v", v)
	}
}

// matchesMIME reports whether mime satisfies any pattern in filters.
// Patterns may use a "type/*" wildcard in the subtype position.
// An empty filter list matches everything.
func matchesMIME(mime string, filters []string) bool {
	for _, f := range filters {
		if f == mime {
			return true
		}
		if before, ok := strings.CutSuffix(f, "/*"); ok {
			prefix := before
			if strings.HasPrefix(mime, prefix+"/") {
				return true
			}
		}
	}
	return false
}

// matchesGlob reports whether path satisfies any glob in the list.
// Globs are matched against both the base name and the full path.
// An empty glob list matches everything.
func matchesGlob(path string, globs []string) bool {
	base := filepath.Base(path)
	for _, g := range globs {
		if ok, _ := filepath.Match(g, base); ok {
			return true
		}
		if ok, _ := filepath.Match(g, path); ok {
			return true
		}
	}
	return false
}
