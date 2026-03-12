package browser_test

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser"
)

func TestLoadDirectoryFiltersHiddenFiles(t *testing.T) {
	t.Parallel()

	root := t.TempDir()
	visible := filepath.Join(root, "visible.txt")
	hidden := filepath.Join(root, ".hidden.txt")

	if err := os.WriteFile(visible, []byte("ok"), 0o600); err != nil {
		t.Fatalf("write visible: %v", err)
	}
	if err := os.WriteFile(hidden, []byte("ok"), 0o600); err != nil {
		t.Fatalf("write hidden: %v", err)
	}

	entries, hydratePaths, err := browser.LoadDirectory(root, false)
	if err != nil {
		t.Fatalf("load directory: %v", err)
	}

	if len(entries) != 1 {
		t.Fatalf("expected 1 visible entry, got %d", len(entries))
	}
	if len(hydratePaths) != 1 {
		t.Fatalf("expected 1 hydration path, got %d", len(hydratePaths))
	}
	if entries[0].Path != visible {
		t.Fatalf("expected visible file path %q, got %q", visible, entries[0].Path)
	}
}

func TestLoadDirectoryIncludesHiddenWhenEnabled(t *testing.T) {
	t.Parallel()

	root := t.TempDir()
	visible := filepath.Join(root, "visible.txt")
	hidden := filepath.Join(root, ".hidden.txt")

	if err := os.WriteFile(visible, []byte("ok"), 0o600); err != nil {
		t.Fatalf("write visible: %v", err)
	}
	if err := os.WriteFile(hidden, []byte("ok"), 0o600); err != nil {
		t.Fatalf("write hidden: %v", err)
	}

	entries, hydratePaths, err := browser.LoadDirectory(root, true)
	if err != nil {
		t.Fatalf("load directory: %v", err)
	}

	if len(entries) != 2 {
		t.Fatalf("expected 2 entries, got %d", len(entries))
	}
	if len(hydratePaths) != 2 {
		t.Fatalf("expected 2 hydration paths, got %d", len(hydratePaths))
	}

	entryByPath := make(map[string]browser.DirectoryEntry, len(entries))
	for _, entry := range entries {
		entryByPath[entry.Path] = entry
	}

	hiddenEntry, ok := entryByPath[hidden]
	if !ok {
		t.Fatalf("expected hidden file entry %q", hidden)
	}
	if !hiddenEntry.Hidden {
		t.Fatalf("expected hidden flag for %q", hidden)
	}

	visibleEntry, ok := entryByPath[visible]
	if !ok {
		t.Fatalf("expected visible file entry %q", visible)
	}
	if visibleEntry.Hidden {
		t.Fatalf("did not expect hidden flag for %q", visible)
	}
}
