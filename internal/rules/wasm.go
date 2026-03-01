package rules

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"os"
	"time"

	"github.com/tetratelabs/wazero"
	"github.com/tetratelabs/wazero/imports/wasi_snapshot_preview1"
	"github.com/tetratelabs/wazero/sys"

	"github.com/darkliquid/tilbo/internal/harvester"
)

// WASMRule evaluates a WASM module to produce tags. The module reads a
// JSON-encoded MetaMap from stdin and writes a JSON-encoded []string to stdout.
// A non-zero exit code means the rule adds no tags.
// The module is compiled once; each Eval call instantiates a fresh module instance.
type WASMRule struct {
	name     string
	priority int
	runtime  wazero.Runtime
	compiled wazero.CompiledModule
}

func newWASMRule(ctx context.Context, name string, priority int, path string, cache wazero.CompilationCache) (*WASMRule, error) {
	rtCfg := wazero.NewRuntimeConfig()
	if cache != nil {
		rtCfg = rtCfg.WithCompilationCache(cache)
	}
	rt := wazero.NewRuntimeWithConfig(ctx, rtCfg)

	if _, err := wasi_snapshot_preview1.Instantiate(ctx, rt); err != nil {
		_ = rt.Close(ctx)
		return nil, fmt.Errorf("wasm rule %q: instantiate wasi: %w", name, err)
	}

	binary, err := os.ReadFile(path)
	if err != nil {
		_ = rt.Close(ctx)
		return nil, fmt.Errorf("wasm rule %q: read binary: %w", name, err)
	}

	compiled, err := rt.CompileModule(ctx, binary)
	if err != nil {
		_ = rt.Close(ctx)
		return nil, fmt.Errorf("wasm rule %q: compile: %w", name, err)
	}

	return &WASMRule{
		name:     name,
		priority: priority,
		runtime:  rt,
		compiled: compiled,
	}, nil
}

// Close releases the WASM runtime.
func (r *WASMRule) Close(ctx context.Context) error {
	return r.runtime.Close(ctx)
}

// Name returns the rule's name.
func (r *WASMRule) Name() string { return r.name }

// Priority returns the rule's priority.
func (r *WASMRule) Priority() int { return r.priority }

// Eval runs the WASM module with meta on stdin and decodes the returned tag list.
func (r *WASMRule) Eval(ctx context.Context, meta harvester.MetaMap) ([]string, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	inJSON, err := json.Marshal(meta)
	if err != nil {
		return nil, fmt.Errorf("wasm rule %q: marshal input: %w", r.name, err)
	}

	var stdout, stderr bytes.Buffer
	modCfg := wazero.NewModuleConfig().
		WithStdin(bytes.NewReader(inJSON)).
		WithStdout(&stdout).
		WithStderr(&stderr).
		WithName("") // anonymous: allows multiple concurrent instances

	mod, err := r.runtime.InstantiateModule(ctx, r.compiled, modCfg)
	if mod != nil {
		_ = mod.Close(ctx)
	}
	if err != nil {
		var exitErr *sys.ExitError
		if errors.As(err, &exitErr) {
			if exitErr.ExitCode() != 0 {
				slog.DebugContext(ctx, "wasm rule non-zero exit",
					"rule", r.name, "exit_code", exitErr.ExitCode())
				return nil, nil
			}
			// Exit code 0: success; fall through to read stdout.
		} else {
			return nil, fmt.Errorf("wasm rule %q: run: %w", r.name, err)
		}
	}

	if stdout.Len() == 0 {
		return nil, nil
	}

	var tags []string
	if err := json.Unmarshal(stdout.Bytes(), &tags); err != nil {
		return nil, fmt.Errorf("wasm rule %q: parse output: %w", r.name, err)
	}
	return tags, nil
}
