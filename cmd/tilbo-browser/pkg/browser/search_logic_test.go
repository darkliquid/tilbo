package browser_test

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser"
)

func TestLocalSearchUsesGlobChips(t *testing.T) {
	t.Parallel()

	root := t.TempDir()
	fileA := filepath.Join(root, "a.txt")
	fileB := filepath.Join(root, "b.log")
	if err := os.WriteFile(fileA, []byte("a"), 0o600); err != nil {
		t.Fatalf("write a: %v", err)
	}
	if err := os.WriteFile(fileB, []byte("b"), 0o600); err != nil {
		t.Fatalf("write b: %v", err)
	}

	files, err := browser.LocalSearch([]string{"glob:" + filepath.Join(root, "*.txt")}, 10, false)
	if err != nil {
		t.Fatalf("local search: %v", err)
	}
	if len(files) != 1 {
		t.Fatalf("expected 1 txt file, got %d", len(files))
	}
	if files[0].Path != fileA {
		t.Fatalf("expected %q, got %q", fileA, files[0].Path)
	}
}

func TestFilterSearchFilesByHidden(t *testing.T) {
	t.Parallel()

	files := []browser.SearchFile{
		{Path: "/tmp/.hidden.txt", Tags: []string{"hidden"}},
		{Path: "/tmp/visible.txt", Tags: []string{"visible"}},
	}

	filtered := browser.FilterSearchFilesByHidden(files, false)
	if len(filtered) != 1 || filtered[0].Path != "/tmp/visible.txt" {
		t.Fatalf("unexpected filtered files: %#v", filtered)
	}

	all := browser.FilterSearchFilesByHidden(files, true)
	if len(all) != 2 {
		t.Fatalf("expected all files with allowHidden=true, got %#v", all)
	}

	all[0].Tags[0] = "mutated"
	if files[0].Tags[0] != "hidden" {
		t.Fatalf("expected source tags to remain unchanged, got %#v", files[0].Tags)
	}
}
