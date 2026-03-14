package rules

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"path/filepath"
	"strings"

	"github.com/BurntSushi/toml"
	"github.com/tetratelabs/wazero"
)

// rawRuleFile is the top-level structure of a TOML rule file.
type rawRuleFile struct {
	Rules []RuleDef `toml:"rule"`
}

// RuleDef is a single rule entry in a TOML rule file or the shared config.
// Match values are decoded as interface{} to handle both bare strings (glob
// shorthand) and structured condition tables.
type RuleDef struct {
	Name     string         `toml:"name"`
	Tags     []string       `toml:"tags"`
	Priority int            `toml:"priority"`
	Any      bool           `toml:"any"`
	Match    map[string]any `toml:"match"`
}

// Registry loads rule files from config directories and registers the resulting
// rules into an Engine.
type Registry struct {
	dirs    []string
	cache   wazero.CompilationCache
	closers []func(context.Context) error
}

// NewRegistry creates a Registry that scans the given directories for rule files.
func NewRegistry(dirs []string, cache wazero.CompilationCache) *Registry {
	return &Registry{dirs: dirs, cache: cache}
}

// DefaultDirs returns the standard rule config directories, user rules first.
func DefaultDirs() []string {
	var dirs []string
	if cfgDir, err := os.UserConfigDir(); err == nil {
		dirs = append(dirs, filepath.Join(cfgDir, "tilbo", "rules"))
	} else if home, err := os.UserHomeDir(); err == nil {
		dirs = append(dirs, filepath.Join(home, ".config", "tilbo", "rules"))
	}
	dirs = append(dirs, "/etc/tilbo/rules")
	return dirs
}

// Load scans all registered directories for rule files (.toml, .lua, .wasm)
// and registers the resulting rules in e. Individual load errors are logged and
// skipped.
//
//nolint:gocognit // extension dispatch and per-file error handling are intentionally explicit
func (r *Registry) Load(ctx context.Context, e *Engine) error {
	for _, dir := range r.dirs {
		entries, err := os.ReadDir(dir)
		if os.IsNotExist(err) {
			continue
		}
		if err != nil {
			return fmt.Errorf("rules registry: read dir %q: %w", dir, err)
		}
		for _, entry := range entries {
			if entry.IsDir() {
				continue
			}
			path := filepath.Join(dir, entry.Name())
			ext := strings.ToLower(filepath.Ext(entry.Name()))
			switch ext {
			case ".toml":
				if err := r.loadTOML(ctx, path, e); err != nil {
					slog.WarnContext(ctx, "rules registry: skip toml file",
						"file", path, "err", err)
				}
			case ".lua":
				if err := r.loadLua(path, e); err != nil {
					slog.WarnContext(ctx, "rules registry: skip lua file",
						"file", path, "err", err)
				}
			case ".wasm":
				if err := r.loadWASM(ctx, path, e); err != nil {
					slog.WarnContext(ctx, "rules registry: skip wasm file",
						"file", path, "err", err)
				}
			}
		}
	}
	return nil
}

// Close releases resources held by WASM rule runtimes.
func (r *Registry) Close(ctx context.Context) {
	for _, fn := range r.closers {
		if err := fn(ctx); err != nil {
			slog.WarnContext(ctx, "rules registry: close wasm runtime", "err", err)
		}
	}
	r.closers = nil
}

// LoadInline registers rules defined inline (e.g. from the shared config file).
// It is additive: rules from dirs loaded via Load are not affected.
func (r *Registry) LoadInline(ctx context.Context, defs []RuleDef, e *Engine) error {
	return r.registerDefs(ctx, defs, "<config>", e)
}

func (r *Registry) loadTOML(ctx context.Context, path string, e *Engine) error {
	var raw rawRuleFile
	if _, err := toml.DecodeFile(path, &raw); err != nil {
		return fmt.Errorf("parse %q: %w", path, err)
	}
	return r.registerDefs(ctx, raw.Rules, path, e)
}

func (r *Registry) registerDefs(ctx context.Context, defs []RuleDef, source string, e *Engine) error {
	for i, def := range defs {
		if def.Name == "" {
			return fmt.Errorf("rule #%d in %q: missing name", i+1, source)
		}
		if len(def.Tags) == 0 {
			slog.WarnContext(ctx, "rules registry: rule has no tags; skipping",
				"rule", def.Name, "source", source)
			continue
		}
		match := make(map[string]matchCond, len(def.Match))
		for field, rawCond := range def.Match {
			cond, err := parseMatchCond(rawCond)
			if err != nil {
				return fmt.Errorf("rule %q field %q: %w", def.Name, field, err)
			}
			match[field] = cond
		}
		rule := &TOMLRule{
			name:     def.Name,
			priority: def.Priority,
			tags:     def.Tags,
			any:      def.Any,
			match:    match,
		}
		e.Register(rule)
		slog.InfoContext(ctx, "rules registry: registered toml rule",
			"name", def.Name, "priority", def.Priority, "source", source)
	}
	return nil
}

func (r *Registry) loadLua(path string, e *Engine) error {
	src, err := os.ReadFile(path)
	if err != nil {
		return fmt.Errorf("read %q: %w", path, err)
	}
	name := strings.TrimSuffix(filepath.Base(path), ".lua")
	e.Register(newLuaRule(name, 0, string(src)))
	slog.Info("rules registry: registered lua rule", "name", name)
	return nil
}

func (r *Registry) loadWASM(ctx context.Context, path string, e *Engine) error {
	name := strings.TrimSuffix(filepath.Base(path), ".wasm")
	rule, err := newWASMRule(ctx, name, 0, path, r.cache)
	if err != nil {
		return err
	}
	r.closers = append(r.closers, rule.Close)
	e.Register(rule)
	slog.InfoContext(ctx, "rules registry: registered wasm rule", "name", name)
	return nil
}
