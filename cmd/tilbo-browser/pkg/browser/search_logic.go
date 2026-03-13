package browser

import (
	"os"
	"path/filepath"
	"sort"
	"strings"
)

const minSignedInt32 = 1<<31 - 1

const defaultSearchLimit uint32 = 1000

// LocalSearch executes a fallback search strategy using glob chips.
func LocalSearch(chips []string, limit uint32, allowHidden bool) ([]SearchFile, error) {
	if limit == 0 {
		limit = defaultSearchLimit
	}

	globPatterns := globPatternsFromChips(chips)

	if len(globPatterns) == 0 {
		return []SearchFile{}, nil
	}

	maxResults := maxResultsFromLimit(limit)
	seen := make(map[string]struct{})
	files := make([]SearchFile, 0, maxResults)

	for _, pattern := range globPatterns {
		matches, err := sortedGlob(pattern)
		if err != nil {
			return nil, err
		}

		files = appendSearchMatches(files, matches, seen, maxResults, allowHidden)
		if len(files) >= maxResults {
			return files, nil
		}
	}

	return files, nil
}

func globPatternsFromChips(chips []string) []string {
	patterns := make([]string, 0)
	for _, chip := range chips {
		if after, ok := strings.CutPrefix(chip, "glob:"); ok && after != "" {
			patterns = append(patterns, after)
		}
	}

	return patterns
}

func maxResultsFromLimit(limit uint32) int {
	if limit > minSignedInt32 {
		return minSignedInt32
	}

	return int(limit)
}

func sortedGlob(pattern string) ([]string, error) {
	matches, err := filepath.Glob(pattern)
	if err != nil {
		return nil, err
	}

	sort.Strings(matches)
	return matches, nil
}

func appendSearchMatches(
	files []SearchFile,
	matches []string,
	seen map[string]struct{},
	maxResults int,
	allowHidden bool,
) []SearchFile {
	for _, match := range matches {
		if len(files) >= maxResults {
			return files
		}
		if _, ok := seen[match]; ok {
			continue
		}
		seen[match] = struct{}{}

		base := filepath.Base(match)
		if !allowHidden && base != "" && base[0] == '.' {
			continue
		}

		info, statErr := os.Stat(match)
		if statErr != nil {
			continue
		}

		files = append(files, SearchFile{
			Path:  match,
			Tags:  []string{},
			Size:  info.Size(),
			MTime: info.ModTime().Unix(),
		})
	}

	return files
}

// FilterSearchFilesByHidden filters SearchFile entries by hidden file visibility.
func FilterSearchFilesByHidden(files []SearchFile, allowHidden bool) []SearchFile {
	if allowHidden {
		out := make([]SearchFile, 0, len(files))
		for _, f := range files {
			out = append(out, SearchFile{
				Path:  f.Path,
				Tags:  append([]string(nil), f.Tags...),
				Size:  f.Size,
				MTime: f.MTime,
			})
		}
		return out
	}

	out := make([]SearchFile, 0, len(files))
	for _, f := range files {
		base := filepath.Base(f.Path)
		if base != "" && base[0] == '.' {
			continue
		}
		out = append(out, SearchFile{
			Path:  f.Path,
			Tags:  append([]string(nil), f.Tags...),
			Size:  f.Size,
			MTime: f.MTime,
		})
	}

	return out
}
