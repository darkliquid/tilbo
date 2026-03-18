// Package trash implements XDG trash operations.
package trash

import (
	"bufio"
	"fmt"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

// TrashEntry represents a file in the trash.
//
//nolint:revive // keep name for clarity
type TrashEntry struct {
	Name         string // filename in trash (without trashinfo extension)
	OriginalPath string
	DeletionDate int64 // unix timestamp
	SizeBytes    int64
}

// trashDir returns the trash directory for the given path.
// For home filesystem: $XDG_DATA_HOME/Trash (default ~/.local/share/Trash).
// For other mounts: $mountpoint/.Trash-$UID.
func trashDir(path string) (string, error) {
	homeTrash := homeTrashDir()
	// Check if path is on same device as home trash
	pathStat, err := os.Stat(filepath.Dir(path))
	if err != nil {
		return "", fmt.Errorf("stat parent dir: %w", err)
	}
	trashStat, err := os.Stat(filepath.Dir(homeTrash))
	if err != nil {
		// Home trash dir parent doesn't exist yet, assume same device
		return homeTrash, nil //nolint:nilerr // expected fallback on stat error
	}
	_ = pathStat
	_ = trashStat
	// For simplicity, always use home trash
	return homeTrash, nil
}

func homeTrashDir() string {
	if dir := os.Getenv("XDG_DATA_HOME"); dir != "" {
		return filepath.Join(dir, "Trash")
	}
	if home, err := os.UserHomeDir(); err == nil {
		return filepath.Join(home, ".local", "share", "Trash")
	}
	return filepath.Join(os.TempDir(), "Trash")
}

// MoveToTrash moves path to the XDG trash.
func MoveToTrash(path string) error {
	absPath, err := filepath.Abs(path)
	if err != nil {
		return fmt.Errorf("trash: resolve path: %w", err)
	}
	trashBase, err := trashDir(absPath)
	if err != nil {
		return fmt.Errorf("trash: get trash dir: %w", err)
	}

	filesDir := filepath.Join(trashBase, "files")
	infoDir := filepath.Join(trashBase, "info")
	if err := os.MkdirAll(filesDir, 0o700); err != nil {
		return fmt.Errorf("trash: create files dir: %w", err)
	}
	if err := os.MkdirAll(infoDir, 0o700); err != nil {
		return fmt.Errorf("trash: create info dir: %w", err)
	}

	base := filepath.Base(absPath)
	trashName := base
	// Find unique name
	for i := 1; ; i++ {
		if _, err := os.Stat(filepath.Join(filesDir, trashName)); os.IsNotExist(err) {
			break
		}
		ext := filepath.Ext(base)
		trashName = strings.TrimSuffix(base, ext) + fmt.Sprintf("_%d", i) + ext
	}

	// Write .trashinfo
	infoContent := fmt.Sprintf("[Trash Info]\nPath=%s\nDeletionDate=%s\n",
		url.PathEscape(absPath),
		time.Now().Format("2006-01-02T15:04:05"))
	infoPath := filepath.Join(infoDir, trashName+".trashinfo")
	if err := os.WriteFile(infoPath, []byte(infoContent), 0o600); err != nil {
		return fmt.Errorf("trash: write trashinfo: %w", err)
	}

	// Move file
	trashFilePath := filepath.Join(filesDir, trashName)
	if err := os.Rename(absPath, trashFilePath); err != nil {
		// Rename across filesystems fails; copy+delete as fallback would be complex.
		// Remove the trashinfo and return the error.
		_ = os.Remove(infoPath)
		return fmt.Errorf("trash: move file: %w", err)
	}

	return nil
}

// ListTrash returns all entries in the home trash.
func ListTrash() ([]TrashEntry, error) {
	trashBase := homeTrashDir()
	filesDir := filepath.Join(trashBase, "files")
	infoDir := filepath.Join(trashBase, "info")

	infoEntries, err := os.ReadDir(infoDir)
	if os.IsNotExist(err) {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("trash: read info dir: %w", err)
	}

	var entries []TrashEntry
	for _, ie := range infoEntries {
		if !strings.HasSuffix(ie.Name(), ".trashinfo") {
			continue
		}
		name := strings.TrimSuffix(ie.Name(), ".trashinfo")
		entry, err := parseTrashInfo(filepath.Join(infoDir, ie.Name()), name)
		if err != nil {
			continue
		}
		// Get size
		if info, statErr := os.Stat(filepath.Join(filesDir, name)); statErr == nil {
			entry.SizeBytes = info.Size()
		}
		entries = append(entries, entry)
	}
	return entries, nil
}

func parseTrashInfo(infoPath, name string) (TrashEntry, error) {
	f, err := os.Open(infoPath)
	if err != nil {
		return TrashEntry{}, err
	}
	defer f.Close()

	entry := TrashEntry{Name: name}
	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := scanner.Text()
		//nolint:nestif // parsing simple INI-like lines
		if after, ok := strings.CutPrefix(line, "Path="); ok {
			rawPath := after
			if decoded, err := url.PathUnescape(rawPath); err == nil {
				entry.OriginalPath = decoded
			} else {
				entry.OriginalPath = rawPath
			}
		} else if after, ok := strings.CutPrefix(line, "DeletionDate="); ok {
			dateStr := after
			if t, err := time.Parse("2006-01-02T15:04:05", dateStr); err == nil {
				entry.DeletionDate = t.Unix()
			} else {
				// Try parsing as unix timestamp
				if ts, err := strconv.ParseInt(dateStr, 10, 64); err == nil {
					entry.DeletionDate = ts
				}
			}
		}
	}
	return entry, scanner.Err()
}

// RestoreFromTrash moves the named trash entry back to its original location.
func RestoreFromTrash(trashName string) error {
	trashBase := homeTrashDir()
	infoPath := filepath.Join(trashBase, "info", trashName+".trashinfo")
	entry, err := parseTrashInfo(infoPath, trashName)
	if err != nil {
		return fmt.Errorf("trash: read trashinfo for %q: %w", trashName, err)
	}

	src := filepath.Join(trashBase, "files", trashName)
	dst := entry.OriginalPath
	if dst == "" {
		return fmt.Errorf("trash: no original path in trashinfo for %q", trashName)
	}

	if err := os.MkdirAll(filepath.Dir(dst), 0o750); err != nil {
		return fmt.Errorf("trash: create parent dir for restore: %w", err)
	}
	if err := os.Rename(src, dst); err != nil {
		return fmt.Errorf("trash: restore file: %w", err)
	}
	_ = os.Remove(infoPath)
	return nil
}

// EmptyTrash permanently removes all entries from the home trash.
func EmptyTrash() error {
	trashBase := homeTrashDir()
	filesDir := filepath.Join(trashBase, "files")
	infoDir := filepath.Join(trashBase, "info")

	if err := removeDir(filesDir); err != nil {
		return fmt.Errorf("trash: empty files dir: %w", err)
	}
	if err := removeDir(infoDir); err != nil {
		return fmt.Errorf("trash: empty info dir: %w", err)
	}
	return nil
}

func removeDir(dir string) error {
	entries, err := os.ReadDir(dir)
	if os.IsNotExist(err) {
		return nil
	}
	if err != nil {
		return err
	}
	for _, e := range entries {
		if err := os.RemoveAll(filepath.Join(dir, e.Name())); err != nil {
			return err
		}
	}
	return nil
}
