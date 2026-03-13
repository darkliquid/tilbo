package state

import (
	"os"
	"path/filepath"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/core"
)

// LoadDirectory lists a filesystem path and returns normalized directory entries
// with an additional slice of absolute paths intended for follow-up tag hydration.
// Size and MTime are intentionally left zero here; they are populated
// asynchronously by the navigate handler after the initial UI render.
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

		entries = append(entries, core.DirectoryEntry{
			Name:   name,
			Path:   fullPath,
			IsDir:  de.IsDir(),
			Size:   0,
			MTime:  0,
			Tags:   []string{},
			Hidden: name != "" && name[0] == '.',
		})
	}

	return entries, pathsToHydrate, nil
}
