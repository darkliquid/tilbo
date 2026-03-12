package harvester

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"os/exec"
	"time"
)

const defaultHarvesterTimeout = 5 * time.Second

// SubprocessHarvester implements Harvester by launching an external process.
// The process receives file information as JSON on stdin and emits additional
// metadata as JSON on stdout. A non-zero exit code means nothing to contribute.
type SubprocessHarvester struct {
	baseHarvester
}

func newSubprocessHarvester(cfg Config) *SubprocessHarvester {
	return &SubprocessHarvester{baseHarvester{cfg: cfg}}
}

// Run executes the configured command, writes JSON input to stdin, and decodes
// the JSON metadata from stdout. A non-zero exit is treated as "no output".
func (h *SubprocessHarvester) Run(ctx context.Context, input Input) (MetaMap, error) {
	timeout := time.Duration(h.cfg.Harvester.TimeoutMS) * time.Millisecond
	if timeout <= 0 {
		timeout = defaultHarvesterTimeout
	}
	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	args := make([]string, len(h.cfg.Harvester.Command))
	for i, a := range h.cfg.Harvester.Command {
		args[i] = ExpandPath(a)
	}

	//nolint:gosec // command is from a user-managed trusted config file
	cmd := exec.CommandContext(ctx, args[0], args[1:]...)

	inJSON, err := json.Marshal(input)
	if err != nil {
		return nil, fmt.Errorf("harvester %q: marshal input: %w", h.Name(), err)
	}
	cmd.Stdin = bytes.NewReader(inJSON)

	var stderr bytes.Buffer
	cmd.Stderr = &stderr

	out, err := cmd.Output()
	if err != nil {
		var exitErr *exec.ExitError
		if errors.As(err, &exitErr) {
			slog.DebugContext(ctx, "subprocess harvester non-zero exit",
				"harvester", h.Name(),
				"exit_code", exitErr.ExitCode(),
				"stderr", stderr.String(),
			)
			return MetaMap{}, nil
		}
		return nil, fmt.Errorf("harvester %q: run: %w", h.Name(), err)
	}

	if len(out) == 0 {
		return MetaMap{}, nil
	}

	var meta MetaMap
	if err := json.Unmarshal(out, &meta); err != nil {
		return nil, fmt.Errorf("harvester %q: parse output: %w", h.Name(), err)
	}
	return meta, nil
}
