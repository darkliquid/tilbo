package core

import (
	"fmt"
	"slices"
	"strings"
	"time"
)

// DefaultOperationTimeout is the default timeout for browser command operations.
const DefaultOperationTimeout = 30 * time.Second

// DirectoryEntry is a filesystem item in a rendered directory.
type DirectoryEntry struct {
	Name   string
	Path   string
	IsDir  bool
	Size   int64
	MTime  int64
	Tags   []string
	Hidden bool
}

// SearchFile is a search result item.
type SearchFile struct {
	Path  string
	Tags  []string
	Size  int64
	MTime int64
}

// PlaceEntry is a sidebar place.
type PlaceEntry struct {
	Name string
	Path string
}

// OperationMeta tracks metadata for one in-flight operation.
type OperationMeta struct {
	ID      string
	Command Type
	Started time.Time
	Timeout time.Duration
}

// State is the authoritative controller state snapshot.
type State struct {
	CurrentPath string
	Hidden      bool

	IsSearchMode bool
	SearchChips  []string

	DirectoryEntries []DirectoryEntry
	SearchResults    []SearchFile
	Autocomplete     []string
	Places           []PlaceEntry

	SelectedIndices []int
	WindowMode      string
	PortalSelection []string

	DaemonConnected bool
	LastError       string

	InFlightOps map[string]OperationMeta

	LastDirectoryLoad time.Time
	LastSearch        time.Time
	LastPlacesRefresh time.Time
}

// MergeEntryTags returns a copy of entries with tags filled in from tagMap.
func MergeEntryTags(entries []DirectoryEntry, tagMap map[string][]string) []DirectoryEntry {
	if len(entries) == 0 || len(tagMap) == 0 {
		return entries
	}

	merged := make([]DirectoryEntry, len(entries))
	copy(merged, entries)
	for i := range merged {
		if tags, ok := tagMap[merged[i].Path]; ok {
			merged[i].Tags = append([]string(nil), tags...)
		}
	}

	return merged
}

// EnsureSearchSource returns daemon files if non-empty, or falls back to local
// files when the search chips contain a glob chip.
func EnsureSearchSource(files []SearchFile, chips []string, local []SearchFile) []SearchFile {
	if len(files) > 0 {
		return files
	}
	if !hasGlobChip(chips) {
		return files
	}

	return local
}

// BuildSearchError combines daemon and local search errors into one.
func BuildSearchError(daemonErr, localErr error) error {
	if daemonErr == nil {
		return localErr
	}
	if localErr == nil {
		return daemonErr
	}

	return fmt.Errorf("daemon search: %w (local fallback: %w)", daemonErr, localErr)
}

func hasGlobChip(chips []string) bool {
	for _, chip := range chips {
		if strings.HasPrefix(chip, "glob:") {
			return true
		}
	}

	return false
}

// SearchAllowHidden reports whether hidden files should be included in search.
func SearchAllowHidden(chips []string, current bool) bool {
	return current || slices.Contains(chips, "hidden:any")
}
