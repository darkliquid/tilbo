package browser

import (
	"os"
	"path/filepath"
)

// LoadDirectory lists a filesystem path and returns normalized directory entries
// with an additional slice of absolute paths intended for follow-up tag hydration.
func LoadDirectory(path string, hidden bool) ([]DirectoryEntry, []string, error) {
	dirEntries, err := os.ReadDir(path)
	if err != nil {
		return nil, nil, err
	}

	entries := make([]DirectoryEntry, 0, len(dirEntries))
	pathsToHydrate := make([]string, 0, len(dirEntries))

	for _, de := range dirEntries {
		name := de.Name()
		if !hidden && name != "" && name[0] == '.' {
			continue
		}

		info, infoErr := de.Info()
		if infoErr != nil {
			continue
		}

		fullPath := filepath.Join(path, name)
		pathsToHydrate = append(pathsToHydrate, fullPath)
		entries = append(entries, DirectoryEntry{
			Name:   name,
			Path:   fullPath,
			IsDir:  de.IsDir(),
			Size:   info.Size(),
			MTime:  info.ModTime().Unix(),
			Tags:   []string{},
			Hidden: name != "" && name[0] == '.',
		})
	}

	return entries, pathsToHydrate, nil
}
