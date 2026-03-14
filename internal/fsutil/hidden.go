// Package fsutil contains shared filesystem path helpers.
package fsutil

import (
	"path/filepath"
	"slices"
	"strings"
)

// IsHiddenName reports whether name is a dot-prefixed filesystem entry.
func IsHiddenName(name string) bool {
	if name == "" || name == "." || name == ".." {
		return false
	}
	return name[0] == '.'
}

// HasHiddenComponentBelowRoot reports whether path contains a hidden file or
// directory component below root. Hidden components that are part of root
// itself do not count, which lets callers explicitly target a hidden root
// without traversing into additional hidden descendants.
func HasHiddenComponentBelowRoot(root, path string) bool {
	rel, ok := relativePathBelowRoot(root, path)
	if !ok || rel == "." {
		return false
	}

	return slices.ContainsFunc(strings.Split(rel, string(filepath.Separator)), IsHiddenName)
}

func relativePathBelowRoot(root, path string) (string, bool) {
	cleanRoot := filepath.Clean(root)
	cleanPath := filepath.Clean(path)

	rel, err := filepath.Rel(cleanRoot, cleanPath)
	if err != nil {
		return "", false
	}

	parentPrefix := ".." + string(filepath.Separator)
	if rel == ".." || strings.HasPrefix(rel, parentPrefix) {
		return "", false
	}

	return rel, true
}
