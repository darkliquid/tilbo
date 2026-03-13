package browser

import (
	"os"
	"path/filepath"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commandcore"
)

// LoadDirectory lists a filesystem path and returns normalized directory entries
// with an additional slice of absolute paths intended for follow-up tag hydration.
func LoadDirectory(path string, hidden bool) ([]commandcore.DirectoryEntry, []string, error) {
	dirEntries, err := os.ReadDir(path)
	if err != nil {
		return nil, nil, err
	}

	entries := make([]commandcore.DirectoryEntry, 0, len(dirEntries))
	pathsToHydrate := make([]string, 0, len(dirEntries))

	for _, de := range dirEntries {
		name := de.Name()
		if !hidden && name != "" && name[0] == '.' {
			continue
		}

		fullPath := filepath.Join(path, name)
		pathsToHydrate = append(pathsToHydrate, fullPath)

		// Keep listing fast and non-blocking. Metadata for selected items is
		// enriched on demand via the sidebar path.

		entries = append(entries, commandcore.DirectoryEntry{
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
