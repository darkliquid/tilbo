package harvester

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
)

// WASMHarvester implements Harvester using a compiled WASM module via wazero.
// The module receives file information as JSON on stdin and emits additional
// metadata as JSON on stdout. A non-zero exit code means nothing to contribute.
// The module is compiled once; each Run call instantiates a fresh module instance.
type WASMHarvester struct {
	baseHarvester
	runtime  wazero.Runtime
	compiled wazero.CompiledModule
}

// NewWASMHarvester creates and compiles a WASMHarvester from the given config.
// The optional cache avoids recompiling the WASM binary across daemon restarts.
func NewWASMHarvester(ctx context.Context, cfg Config, cache wazero.CompilationCache) (*WASMHarvester, error) {
	rtCfg := wazero.NewRuntimeConfig()
	if cache != nil {
		rtCfg = rtCfg.WithCompilationCache(cache)
	}
	rt := wazero.NewRuntimeWithConfig(ctx, rtCfg)

	if _, err := wasi_snapshot_preview1.Instantiate(ctx, rt); err != nil {
		_ = rt.Close(ctx)
		return nil, fmt.Errorf("wasm harvester %q: instantiate wasi: %w", cfg.Harvester.Name, err)
	}

	path := ExpandPath(cfg.Harvester.Command[0])
	binary, err := os.ReadFile(path)
	if err != nil {
		_ = rt.Close(ctx)
		return nil, fmt.Errorf("wasm harvester %q: read binary: %w", cfg.Harvester.Name, err)
	}

	compiled, err := rt.CompileModule(ctx, binary)
	if err != nil {
		_ = rt.Close(ctx)
		return nil, fmt.Errorf("wasm harvester %q: compile: %w", cfg.Harvester.Name, err)
	}

	return &WASMHarvester{
		baseHarvester: baseHarvester{cfg: cfg},
		runtime:       rt,
		compiled:      compiled,
	}, nil
}

// Close releases the WASM runtime and its compiled module.
func (h *WASMHarvester) Close(ctx context.Context) error {
	return h.runtime.Close(ctx)
}

// Run instantiates a fresh WASM module instance, sends JSON input on stdin,
// and reads metadata JSON from stdout.
func (h *WASMHarvester) Run(ctx context.Context, input Input) (MetaMap, error) {
	timeout := time.Duration(h.cfg.Harvester.TimeoutMS) * time.Millisecond
	if timeout <= 0 {
		timeout = 5 * time.Second
	}
	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	inJSON, err := json.Marshal(input)
	if err != nil {
		return nil, fmt.Errorf("wasm harvester %q: marshal input: %w", h.Name(), err)
	}

	var stdout, stderr bytes.Buffer
	modCfg := wazero.NewModuleConfig().
		WithStdin(bytes.NewReader(inJSON)).
		WithStdout(&stdout).
		WithStderr(&stderr).
		WithName("") // anonymous: allows multiple concurrent instances

	mod, err := h.runtime.InstantiateModule(ctx, h.compiled, modCfg)
	if mod != nil {
		_ = mod.Close(ctx)
	}
	if err != nil {
		var exitErr *sys.ExitError
		if errors.As(err, &exitErr) {
			if exitErr.ExitCode() != 0 {
				slog.DebugContext(ctx, "wasm harvester non-zero exit",
					"harvester", h.Name(),
					"exit_code", exitErr.ExitCode(),
					"stderr", stderr.String(),
				)
				return nil, nil
			}
			// Exit code 0: success; fall through to read stdout.
		} else {
			return nil, fmt.Errorf("wasm harvester %q: run: %w", h.Name(), err)
		}
	}

	if stdout.Len() == 0 {
		return nil, nil
	}

	var meta MetaMap
	if err := json.Unmarshal(stdout.Bytes(), &meta); err != nil {
		return nil, fmt.Errorf("wasm harvester %q: parse output: %w", h.Name(), err)
	}
	return meta, nil
}
