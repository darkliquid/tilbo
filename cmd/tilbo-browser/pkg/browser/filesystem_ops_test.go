package browser_test

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser"
)

func TestFileSystemOpsRenameDeleteChmod(t *testing.T) {
	t.Parallel()

	ops := browser.NewFileSystemOps()
	root := t.TempDir()
	oldPath := filepath.Join(root, "old.txt")

	if err := os.WriteFile(oldPath, []byte("x"), 0o600); err != nil {
		t.Fatalf("write file: %v", err)
	}

	newPath, err := ops.Rename(oldPath, "new.txt")
	if err != nil {
		t.Fatalf("rename: %v", err)
	}
	if _, err := os.Stat(newPath); err != nil {
		t.Fatalf("renamed file stat: %v", err)
	}

	if err := ops.Chmod(newPath, 0o640); err != nil {
		t.Fatalf("chmod: %v", err)
	}

	if err := ops.Delete(newPath); err != nil {
		t.Fatalf("delete: %v", err)
	}
	if _, err := os.Stat(newPath); !os.IsNotExist(err) {
		t.Fatalf("expected file deleted, stat err=%v", err)
	}
}
