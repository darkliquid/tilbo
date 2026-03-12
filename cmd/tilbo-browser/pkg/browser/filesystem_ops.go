package browser

import (
	"context"
	"os"
	"os/exec"
	"path/filepath"
	"time"
)

const defaultOpenWaitTimeout = 3 * time.Second

// FileSystemOps wraps filesystem side effects used by controller handlers.
type FileSystemOps struct{}

// NewFileSystemOps creates a filesystem operation helper.
func NewFileSystemOps() *FileSystemOps {
	return &FileSystemOps{}
}

// Open opens a file path using xdg-open.
func (o *FileSystemOps) Open(ctx context.Context, path string) error {
	if ctx == nil {
		ctx = context.Background()
	}

	openCtx, cancel := context.WithTimeout(ctx, defaultOpenWaitTimeout)
	defer cancel()

	// #nosec G204 -- command and argument are fixed and path is treated as data.
	cmd := exec.CommandContext(openCtx, "xdg-open", path)
	if err := cmd.Start(); err != nil {
		return err
	}

	go func() {
		_ = cmd.Wait()
	}()

	return nil
}

// Rename renames a file or directory to a sibling name.
func (o *FileSystemOps) Rename(oldPath, newName string) (string, error) {
	newPath := filepath.Join(filepath.Dir(oldPath), newName)
	if err := os.Rename(oldPath, newPath); err != nil {
		return "", err
	}

	return newPath, nil
}

// Delete removes a file tree.
func (o *FileSystemOps) Delete(path string) error {
	return os.RemoveAll(path)
}

// Chmod changes file mode bits.
func (o *FileSystemOps) Chmod(path string, mode uint32) error {
	return os.Chmod(path, os.FileMode(mode))
}
