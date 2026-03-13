package state

import (
	"os"
	"path/filepath"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/core"
)

// LoadDirectory lists a filesystem path and returns normalized directory entries
// with an additional slice of absolute paths intended for follow-up tag hydration.
func LoadDirectory(path string, hidden bool) ([]core.DirectoryEntry, []string, error) {
	dirEntries, err := os.ReadDir(path)
	if err != nil {
		return nil, nil, err
	}

	entries := make([]core.DirectoryEntry, 0, len(dirEntries))
	pathsToHydrate := make([]string, 0, len(dirEntries))

	for _, de := range dirEntries {
		name := de.Name()
		if !hidden && name != "" && name[0] == '.' {
			continue
		}

		fullPath := filepath.Join(path, name)
		pathsToHydrate = append(pathsToHydrate, fullPath)

		var size int64
		var mtime int64
		if info, err := de.Info(); err == nil {
			size = info.Size()
			mtime = info.ModTime().Unix()
		}

		entries = append(entries, core.DirectoryEntry{
			Name:   name,
			Path:   fullPath,
			IsDir:  de.IsDir(),
			Size:   size,
			MTime:  mtime,
			Tags:   []string{},
			Hidden: name != "" && name[0] == '.',
		})
	}

	return entries, pathsToHydrate, nil
}
