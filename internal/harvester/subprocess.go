package harvester

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"os/exec"
	"syscall"
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

	inJSON, err := json.Marshal(input)
	if err != nil {
		return nil, fmt.Errorf("harvester %q: marshal input: %w", h.Name(), err)
	}

	if err := ctx.Err(); err != nil {
		return nil, err
	}

	//nolint:gosec // command is from a user-managed trusted config file
	cmd := exec.Command(args[0], args[1:]...)
	cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
	cmd.Stdin = bytes.NewReader(inJSON)

	var stdout bytes.Buffer
	var stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	if err := cmd.Start(); err != nil {
		return nil, fmt.Errorf("harvester %q: start: %w", h.Name(), err)
	}

	waitCh := make(chan error, 1)
	go func() {
		waitCh <- cmd.Wait()
	}()

	select {
	case err = <-waitCh:
	case <-ctx.Done():
		if killErr := killProcessGroup(cmd.Process.Pid); killErr != nil {
			slog.DebugContext(ctx, "subprocess harvester kill group",
				"harvester", h.Name(),
				"pid", cmd.Process.Pid,
				"err", killErr,
			)
		}
		err = <-waitCh
	}

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

	out := stdout.Bytes()
	if len(out) == 0 {
		return MetaMap{}, nil
	}

	var meta MetaMap
	if err := json.Unmarshal(out, &meta); err != nil {
		return nil, fmt.Errorf("harvester %q: parse output: %w", h.Name(), err)
	}
	return meta, nil
}

func killProcessGroup(pid int) error {
	if pid <= 0 {
		return nil
	}
	if err := syscall.Kill(-pid, syscall.SIGKILL); err != nil && !errors.Is(err, syscall.ESRCH) {
		return err
	}
	return nil
}
