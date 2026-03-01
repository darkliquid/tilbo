package harvester

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

// Registry loads harvester configurations from TOML drop-in files and registers
// the resulting harvesters in a Pipeline.
type Registry struct {
	dirs    []string
	cache   wazero.CompilationCache    // shared WASM compilation cache; may be nil
	closers []func(context.Context) error
}

// NewRegistry creates a Registry that scans the given directories for harvester
// TOML files. If cache is non-nil it is shared across all WASM harvesters.
func NewRegistry(dirs []string, cache wazero.CompilationCache) *Registry {
	return &Registry{dirs: dirs, cache: cache}
}

// DefaultDirs returns the standard harvester config directories for the current user.
func DefaultDirs() []string {
	if cfgDir, err := os.UserConfigDir(); err == nil {
		return []string{filepath.Join(cfgDir, "tilbo", "harvesters")}
	}
	if home, err := os.UserHomeDir(); err == nil {
		return []string{filepath.Join(home, ".config", "tilbo", "harvesters")}
	}
	return nil
}

// Load scans all registered directories for *.toml files and registers the
// discovered harvesters in p. Individual load errors are logged and skipped.
func (r *Registry) Load(ctx context.Context, p *Pipeline) error {
	for _, dir := range r.dirs {
		entries, err := os.ReadDir(dir)
		if os.IsNotExist(err) {
			continue
		}
		if err != nil {
			return fmt.Errorf("harvester registry: read dir %q: %w", dir, err)
		}
		for _, entry := range entries {
			if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".toml") {
				continue
			}
			path := filepath.Join(dir, entry.Name())
			h, err := r.loadOne(ctx, path)
			if err != nil {
				slog.WarnContext(ctx, "harvester registry: skip config",
					"file", path, "err", err)
				continue
			}
			p.Register(h)
			slog.InfoContext(ctx, "harvester registry: registered",
				"name", h.Name(), "priority", h.Priority())
		}
	}
	return nil
}

// Close releases resources held by WASM runtimes created during Load.
func (r *Registry) Close(ctx context.Context) {
	for _, fn := range r.closers {
		if err := fn(ctx); err != nil {
			slog.WarnContext(ctx, "harvester registry: close wasm runtime", "err", err)
		}
	}
	r.closers = nil
}

// loadOne parses a single TOML harvester config file and returns the appropriate Harvester.
// WASM harvesters are detected by a ".wasm" suffix on the first command element.
func (r *Registry) loadOne(ctx context.Context, cfgPath string) (Harvester, error) {
	var cfg Config
	if _, err := toml.DecodeFile(cfgPath, &cfg); err != nil {
		return nil, fmt.Errorf("parse %q: %w", cfgPath, err)
	}
	h := cfg.Harvester
	if h.Name == "" {
		return nil, fmt.Errorf("parse %q: missing harvester.name", cfgPath)
	}
	if len(h.Command) == 0 {
		return nil, fmt.Errorf("harvester %q: empty command", h.Name)
	}

	cmd := ExpandPath(h.Command[0])
	if strings.HasSuffix(cmd, ".wasm") {
		wh, err := NewWASMHarvester(ctx, cfg, r.cache)
		if err != nil {
			return nil, err
		}
		r.closers = append(r.closers, wh.Close)
		return wh, nil
	}
	return newSubprocessHarvester(cfg), nil
}
