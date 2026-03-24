package daemoncmd

import (
	"context"
	"errors"
	"os"
	"path/filepath"
	"syscall"
	"testing"
)

func TestIsNonRetryableProcessingErr_ContextErrors(t *testing.T) {
	if !isNonRetryableProcessingErr(context.Canceled) {
		t.Fatal("expected context.Canceled to be non-retriable")
	}
	if !isNonRetryableProcessingErr(context.DeadlineExceeded) {
		t.Fatal("expected context.DeadlineExceeded to be non-retriable")
	}
}

func TestIsNonRetryableProcessingErr_PermissionErrors(t *testing.T) {
	if !isNonRetryableProcessingErr(os.ErrPermission) {
		t.Fatal("expected os.ErrPermission to be non-retriable")
	}
	if !isNonRetryableProcessingErr(syscall.EPERM) {
		t.Fatal("expected syscall.EPERM to be non-retriable")
	}
	if !isNonRetryableProcessingErr(syscall.EACCES) {
		t.Fatal("expected syscall.EACCES to be non-retriable")
	}
	wrapped := errors.New("index: upsert meta file=1 key=\"mime\": permission denied")
	if !isNonRetryableProcessingErr(wrapped) {
		t.Fatal("expected wrapped permission denied error to be non-retriable")
	}
}

func TestProcessorMarksAndSkipsNonRetryablePath(t *testing.T) {
	p := &Processor{nonRetryablePaths: make(map[string]struct{})}
	path := "/tmp/non-retry"

	if p.shouldSkipPath(path) {
		t.Fatal("path should not be skipped before mark")
	}

	p.markPathNonRetryable(path)

	if !p.shouldSkipPath(path) {
		t.Fatal("path should be skipped after mark")
	}
}

func TestProcessorClearPathNonRetryable(t *testing.T) {
	p := &Processor{nonRetryablePaths: make(map[string]struct{})}
	path := "/tmp/non-retry-clear"

	p.markPathNonRetryable(path)
	if !p.shouldSkipPath(path) {
		t.Fatal("path should be skipped after mark")
	}

	p.clearPathNonRetryable(path)
	if p.shouldSkipPath(path) {
		t.Fatal("path should not be skipped after clear")
	}
}

func TestProcessorClearAllNonRetryablePaths(t *testing.T) {
	p := &Processor{nonRetryablePaths: make(map[string]struct{})}

	p.markPathNonRetryable("/tmp/non-retry-1")
	p.markPathNonRetryable("/tmp/non-retry-2")

	p.clearAllNonRetryablePaths()

	if len(p.nonRetryablePaths) != 0 {
		t.Fatalf("expected all skipped paths to be cleared, got %d", len(p.nonRetryablePaths))
	}
}

func TestIsRetryEligiblePath(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "writable.txt")
	if err := os.WriteFile(path, []byte("ok"), 0o600); err != nil {
		t.Fatalf("write temp file: %v", err)
	}

	if !isRetryEligiblePath(path) {
		t.Fatal("expected writable file to be retry eligible")
	}

	if isRetryEligiblePath(filepath.Join(dir, "missing.txt")) {
		t.Fatal("expected missing file to be non-eligible")
	}
}
