package daemon

import (
	"context"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"syscall"
	"testing"

	"github.com/darkliquid/tilbo/internal/config"
	"github.com/darkliquid/tilbo/internal/graph"
	"github.com/darkliquid/tilbo/internal/index"
	"github.com/darkliquid/tilbo/internal/thumbnail"
	"github.com/darkliquid/tilbo/internal/xattr"
)

// ── Test helpers ──────────────────────────────────────────────────────────────

// newTestHandler creates a daemonBrowserMethods backed by a temp index and xattr
// sidecar, returning the handler and the temporary root directory.
func newTestHandler(t *testing.T) (*daemonBrowserMethods, string) {
	t.Helper()
	root := t.TempDir()
	dbPath := filepath.Join(root, "index.db")
	ctx := context.Background()

	idx, err := index.Open(ctx, dbPath)
	if err != nil {
		t.Fatalf("index.Open: %v", err)
	}
	t.Cleanup(func() { _ = idx.Close() })

	return &daemonBrowserMethods{
		idx:       idx,
		tags:      xattr.New(nil),
		g:         graph.New(),
		fuseMount: "",
	}, root
}

// seedFile creates path on disk and inserts it into h's index so that index
// operations (ModifyTags, HydrateTags, etc.) can find it.
func seedFile(t *testing.T, h *daemonBrowserMethods, path string, content []byte) {
	t.Helper()
	if err := os.WriteFile(path, content, 0o644); err != nil {
		t.Fatalf("seedFile write: %v", err)
	}
	var st syscall.Stat_t
	if err := syscall.Stat(path, &st); err != nil {
		t.Fatalf("seedFile stat: %v", err)
	}
	info, err := os.Stat(path)
	if err != nil {
		t.Fatalf("seedFile os.Stat: %v", err)
	}
	if _, err := h.idx.UpsertFile(context.Background(), path,
		int64(st.Ino), int64(st.Dev), info.ModTime().Unix(), info.Size()); err != nil {
		t.Fatalf("seedFile UpsertFile: %v", err)
	}
}

// ── validatePath ──────────────────────────────────────────────────────────────

func TestValidatePath_Empty(t *testing.T) {
	if _, err := validatePath(""); err == nil {
		t.Fatal("expected error for empty path")
	}
}

func TestValidatePath_NullByte(t *testing.T) {
	if _, err := validatePath("/foo\x00bar"); err == nil {
		t.Fatal("expected error for null byte in path")
	}
}

func TestValidatePath_Relative(t *testing.T) {
	if _, err := validatePath("relative/path"); err == nil {
		t.Fatal("expected error for relative path")
	}
}

func TestValidatePath_DotDotRelative(t *testing.T) {
	// After Clean, "../etc/passwd" → "../etc/passwd" which is still relative.
	if _, err := validatePath("../etc/passwd"); err == nil {
		t.Fatal("expected error for relative path starting with ..")
	}
}

func TestValidatePath_CleansPath(t *testing.T) {
	got, err := validatePath("/foo/bar/../baz")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got != "/foo/baz" {
		t.Errorf("got %q, want /foo/baz", got)
	}
}

func TestValidatePath_AbsolutePassthrough(t *testing.T) {
	got, err := validatePath("/tmp/tilbo-test")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got != "/tmp/tilbo-test" {
		t.Errorf("got %q, want /tmp/tilbo-test", got)
	}
}

func TestThumbnailSizeFromRequest(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		size int
		want thumbnail.Size
	}{
		{name: "unspecified defaults to normal", size: 0, want: thumbnail.Normal},
		{name: "normal stays normal", size: 1, want: thumbnail.Normal},
		{name: "large maps to large", size: 2, want: thumbnail.Large},
		{name: "unknown defaults to normal", size: 99, want: thumbnail.Normal},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			if got := thumbnailSizeFromRequest(tt.size); got != tt.want {
				t.Fatalf("thumbnailSizeFromRequest(%d) = %v, want %v", tt.size, got, tt.want)
			}
		})
	}
}

func TestGetBrowserConfig_Defaults(t *testing.T) {
	t.Parallel()

	h, _ := newTestHandler(t)

	cfg, err := h.GetBrowserConfig()
	if err != nil {
		t.Fatalf("GetBrowserConfig: %v", err)
	}
	if !cfg.UseTrash {
		t.Fatal("UseTrash should default to true")
	}
	if !cfg.InlineThumbnails {
		t.Fatal("InlineThumbnails should default to true")
	}
	if cfg.AutoPropertiesSlideout {
		t.Fatal("AutoPropertiesSlideout should default to false")
	}
	if cfg.Theme != defaultBrowserTheme {
		t.Fatalf("Theme = %q, want %q", cfg.Theme, defaultBrowserTheme)
	}
}

func TestGetBrowserConfig_UsesConfiguredValues(t *testing.T) {
	t.Parallel()

	h, _ := newTestHandler(t)
	h.cfg = &config.Config{
		Browser: config.BrowserConfig{
			UseTrash:               config.Bool(false),
			InlineThumbnails:       config.Bool(false),
			AutoPropertiesSlideout: config.Bool(true),
			Theme:                  "light",
			Keybindings: map[string]string{
				"copy": "Meta+C",
			},
		},
	}

	cfg, err := h.GetBrowserConfig()
	if err != nil {
		t.Fatalf("GetBrowserConfig: %v", err)
	}
	if cfg.UseTrash {
		t.Fatal("UseTrash should honor false")
	}
	if cfg.InlineThumbnails {
		t.Fatal("InlineThumbnails should honor false")
	}
	if !cfg.AutoPropertiesSlideout {
		t.Fatal("AutoPropertiesSlideout should honor true")
	}
	if cfg.Theme != "light" {
		t.Fatalf("Theme = %q, want light", cfg.Theme)
	}
	if got := cfg.Keybindings["copy"]; got != "Meta+C" {
		t.Fatalf("copy keybinding = %q, want Meta+C", got)
	}
}

// ── validateNewName ───────────────────────────────────────────────────────────

func TestValidateNewName_Empty(t *testing.T) {
	if err := validateNewName(""); err == nil {
		t.Fatal("expected error for empty name")
	}
}

func TestValidateNewName_NullByte(t *testing.T) {
	if err := validateNewName("foo\x00bar"); err == nil {
		t.Fatal("expected error for null byte in name")
	}
}

func TestValidateNewName_Slash(t *testing.T) {
	if err := validateNewName("sub/name"); err == nil {
		t.Fatal("expected error for slash in name")
	}
}

func TestValidateNewName_Valid(t *testing.T) {
	if err := validateNewName("valid-name.txt"); err != nil {
		t.Fatalf("unexpected error for valid name: %v", err)
	}
}

// ── ListDirectory ─────────────────────────────────────────────────────────────

func TestListDirectory_HidesHiddenByDefault(t *testing.T) {
	h, root := newTestHandler(t)
	os.WriteFile(filepath.Join(root, "visible.txt"), []byte(""), 0o644)
	os.WriteFile(filepath.Join(root, ".hidden"), []byte(""), 0o644)
	os.Mkdir(filepath.Join(root, "subdir"), 0o755)

	entries, err := h.ListDirectory(root, false)
	if err != nil {
		t.Fatalf("ListDirectory: %v", err)
	}
	names := make(map[string]bool, len(entries))
	for _, e := range entries {
		names[e.Name] = true
	}
	if !names["visible.txt"] {
		t.Error("visible.txt should be in entries")
	}
	if !names["subdir"] {
		t.Error("subdir should be in entries")
	}
	if names[".hidden"] {
		t.Error(".hidden should be excluded when hidden=false")
	}
}

func TestListDirectory_IncludesHiddenWhenRequested(t *testing.T) {
	h, root := newTestHandler(t)
	os.WriteFile(filepath.Join(root, "visible.txt"), []byte(""), 0o644)
	os.WriteFile(filepath.Join(root, ".hidden"), []byte(""), 0o644)

	entries, err := h.ListDirectory(root, true)
	if err != nil {
		t.Fatalf("ListDirectory: %v", err)
	}
	names := make(map[string]bool, len(entries))
	for _, e := range entries {
		if e.Name[0] == '.' && !e.Hidden {
			t.Errorf("entry %q should have Hidden=true", e.Name)
		}
		names[e.Name] = true
	}
	if !names[".hidden"] {
		t.Error(".hidden should be present when hidden=true")
	}
}

func TestListDirectory_EntryFields(t *testing.T) {
	h, root := newTestHandler(t)
	path := filepath.Join(root, "data.txt")
	os.WriteFile(path, []byte("hello"), 0o644)

	entries, err := h.ListDirectory(root, false)
	if err != nil {
		t.Fatalf("ListDirectory: %v", err)
	}
	var found bool
	for _, e := range entries {
		if e.Name != "data.txt" {
			continue
		}
		found = true
		if e.Path != path {
			t.Errorf("Path: got %q, want %q", e.Path, path)
		}
		if e.IsDir {
			t.Error("IsDir should be false for a regular file")
		}
		if e.Size != 5 {
			t.Errorf("Size: got %d, want 5", e.Size)
		}
		if e.MTime == 0 {
			t.Error("MTime should be non-zero")
		}
		if e.Mode == 0 {
			t.Error("Mode should be non-zero")
		}
	}
	if !found {
		t.Error("data.txt not found in directory listing")
	}
}

func TestListDirectory_InvalidPath(t *testing.T) {
	h, _ := newTestHandler(t)
	if _, err := h.ListDirectory("", false); err == nil {
		t.Fatal("expected error for empty path")
	}
}

func TestListDirectory_NonexistentDirectory(t *testing.T) {
	h, root := newTestHandler(t)
	if _, err := h.ListDirectory(filepath.Join(root, "no-such-dir"), false); err == nil {
		t.Fatal("expected error for nonexistent directory")
	}
}

// ── StatFile ──────────────────────────────────────────────────────────────────

func TestStatFile_ReturnsCorrectFields(t *testing.T) {
	h, root := newTestHandler(t)
	path := filepath.Join(root, "stat.txt")
	os.WriteFile(path, []byte("data"), 0o644)

	stat, err := h.StatFile(path)
	if err != nil {
		t.Fatalf("StatFile: %v", err)
	}
	if stat.Size != 4 {
		t.Errorf("Size: got %d, want 4", stat.Size)
	}
	if stat.MTime == 0 {
		t.Error("MTime should be non-zero")
	}
	if stat.Mode == 0 {
		t.Error("Mode should be non-zero")
	}
}

func TestStatFile_InvalidPath(t *testing.T) {
	h, _ := newTestHandler(t)
	if _, err := h.StatFile(""); err == nil {
		t.Fatal("expected error for empty path")
	}
}

func TestStatFile_MissingFile(t *testing.T) {
	h, root := newTestHandler(t)
	if _, err := h.StatFile(filepath.Join(root, "missing.txt")); err == nil {
		t.Fatal("expected error for missing file")
	}
}

// ── GlobSearch ────────────────────────────────────────────────────────────────

func TestGlobSearch_MatchesByPattern(t *testing.T) {
	h, root := newTestHandler(t)
	os.WriteFile(filepath.Join(root, "a.txt"), []byte(""), 0o644)
	os.WriteFile(filepath.Join(root, "b.txt"), []byte(""), 0o644)
	os.WriteFile(filepath.Join(root, "c.jpg"), []byte(""), 0o644)

	results, err := h.GlobSearch([]string{filepath.Join(root, "*.txt")}, 1000, false)
	if err != nil {
		t.Fatalf("GlobSearch: %v", err)
	}
	if len(results) != 2 {
		t.Errorf("expected 2 results, got %d", len(results))
	}
}

func TestGlobSearch_ExcludesHiddenByDefault(t *testing.T) {
	h, root := newTestHandler(t)
	os.WriteFile(filepath.Join(root, "visible.txt"), []byte(""), 0o644)
	os.WriteFile(filepath.Join(root, ".dotfile.txt"), []byte(""), 0o644)

	results, err := h.GlobSearch([]string{filepath.Join(root, "*.txt")}, 1000, false)
	if err != nil {
		t.Fatalf("GlobSearch: %v", err)
	}
	for _, r := range results {
		if base := filepath.Base(r.Path); base[0] == '.' {
			t.Errorf("hidden file %q should be excluded when allowHidden=false", r.Path)
		}
	}
}

func TestGlobSearch_IncludesHiddenWhenAllowed(t *testing.T) {
	h, root := newTestHandler(t)
	os.WriteFile(filepath.Join(root, "visible.go"), []byte(""), 0o644)
	os.WriteFile(filepath.Join(root, ".dotfile.go"), []byte(""), 0o644)

	results, err := h.GlobSearch([]string{filepath.Join(root, "*.go")}, 1000, true)
	if err != nil {
		t.Fatalf("GlobSearch: %v", err)
	}
	// Both visible.go and .dotfile.go should be present.
	if len(results) != 2 {
		t.Errorf("expected 2 results with allowHidden=true, got %d", len(results))
	}
}

func TestGlobSearch_RespectsLimit(t *testing.T) {
	h, root := newTestHandler(t)
	for _, name := range []string{"a.txt", "b.txt", "c.txt"} {
		os.WriteFile(filepath.Join(root, name), []byte(""), 0o644)
	}
	results, err := h.GlobSearch([]string{filepath.Join(root, "*.txt")}, 2, false)
	if err != nil {
		t.Fatalf("GlobSearch: %v", err)
	}
	if len(results) > 2 {
		t.Errorf("expected at most 2 results, got %d", len(results))
	}
}

func TestGlobSearch_NullBytePattern(t *testing.T) {
	h, _ := newTestHandler(t)
	if _, err := h.GlobSearch([]string{"/tmp/\x00bad"}, 1000, false); err == nil {
		t.Fatal("expected error for null-byte pattern")
	}
}

func TestGlobSearch_ResultsHaveCorrectFields(t *testing.T) {
	h, root := newTestHandler(t)
	os.WriteFile(filepath.Join(root, "f.txt"), []byte("abc"), 0o644)

	results, err := h.GlobSearch([]string{filepath.Join(root, "*.txt")}, 1000, false)
	if err != nil {
		t.Fatalf("GlobSearch: %v", err)
	}
	if len(results) != 1 {
		t.Fatalf("expected 1 result, got %d", len(results))
	}
	r := results[0]
	if r.Path == "" {
		t.Error("Path should not be empty")
	}
	if r.MTime == 0 {
		t.Error("MTime should be non-zero")
	}
	if r.Size != 3 {
		t.Errorf("Size: got %d, want 3", r.Size)
	}
}

// ── RenameFile ────────────────────────────────────────────────────────────────

func TestRenameFile_RenamesAndReturnsNewPath(t *testing.T) {
	h, root := newTestHandler(t)
	src := filepath.Join(root, "old.txt")
	os.WriteFile(src, []byte("data"), 0o644)

	newPath, err := h.RenameFile(src, "new.txt")
	if err != nil {
		t.Fatalf("RenameFile: %v", err)
	}
	want := filepath.Join(root, "new.txt")
	if newPath != want {
		t.Errorf("newPath: got %q, want %q", newPath, want)
	}
	if _, err := os.Stat(want); err != nil {
		t.Errorf("new file should exist: %v", err)
	}
	if _, err := os.Stat(src); !os.IsNotExist(err) {
		t.Error("old file should not exist after rename")
	}
}

func TestRenameFile_InvalidSourcePath(t *testing.T) {
	h, _ := newTestHandler(t)
	if _, err := h.RenameFile("", "new.txt"); err == nil {
		t.Fatal("expected error for empty source path")
	}
}

func TestRenameFile_InvalidNewName_Slash(t *testing.T) {
	h, root := newTestHandler(t)
	src := filepath.Join(root, "src.txt")
	os.WriteFile(src, []byte(""), 0o644)
	if _, err := h.RenameFile(src, "sub/name.txt"); err == nil {
		t.Fatal("expected error for slash in new name")
	}
}

func TestRenameFile_InvalidNewName_Empty(t *testing.T) {
	h, root := newTestHandler(t)
	src := filepath.Join(root, "src.txt")
	os.WriteFile(src, []byte(""), 0o644)
	if _, err := h.RenameFile(src, ""); err == nil {
		t.Fatal("expected error for empty new name")
	}
}

func TestRenameFile_SourceDoesNotExist(t *testing.T) {
	h, root := newTestHandler(t)
	if _, err := h.RenameFile(filepath.Join(root, "ghost.txt"), "new.txt"); err == nil {
		t.Fatal("expected error for nonexistent source")
	}
}

// ── DeleteFile ────────────────────────────────────────────────────────────────

func TestDeleteFile_RemovesFile(t *testing.T) {
	h, root := newTestHandler(t)
	h.cfg = &config.Config{Browser: config.BrowserConfig{UseTrash: config.Bool(false)}}
	path := filepath.Join(root, "delete-me.txt")
	os.WriteFile(path, []byte("bye"), 0o644)

	if err := h.DeleteFile(path); err != nil {
		t.Fatalf("DeleteFile: %v", err)
	}
	if _, err := os.Stat(path); !os.IsNotExist(err) {
		t.Error("file should not exist after DeleteFile")
	}
}

func TestDeleteFile_RemovesDirectoryTree(t *testing.T) {
	h, root := newTestHandler(t)
	h.cfg = &config.Config{Browser: config.BrowserConfig{UseTrash: config.Bool(false)}}
	dir := filepath.Join(root, "rmdir")
	os.MkdirAll(filepath.Join(dir, "sub"), 0o755)
	os.WriteFile(filepath.Join(dir, "sub", "f.txt"), []byte(""), 0o644)

	if err := h.DeleteFile(dir); err != nil {
		t.Fatalf("DeleteFile dir: %v", err)
	}
	if _, err := os.Stat(dir); !os.IsNotExist(err) {
		t.Error("directory should not exist after DeleteFile")
	}
}

func TestDeleteFile_InvalidPath(t *testing.T) {
	h, _ := newTestHandler(t)
	if err := h.DeleteFile(""); err == nil {
		t.Fatal("expected error for empty path")
	}
}

// ── ChmodFile ─────────────────────────────────────────────────────────────────

func TestChmodFile_ChangesPermissionBits(t *testing.T) {
	h, root := newTestHandler(t)
	path := filepath.Join(root, "chmod.txt")
	os.WriteFile(path, []byte(""), 0o644)

	if err := h.ChmodFile(path, 0o600); err != nil {
		t.Fatalf("ChmodFile: %v", err)
	}
	info, err := os.Stat(path)
	if err != nil {
		t.Fatalf("stat after chmod: %v", err)
	}
	if info.Mode().Perm() != 0o600 {
		t.Errorf("mode: got %04o, want 0600", info.Mode().Perm())
	}
}

func TestChmodFile_InvalidPath(t *testing.T) {
	h, _ := newTestHandler(t)
	if err := h.ChmodFile("", 0o644); err == nil {
		t.Fatal("expected error for empty path")
	}
}

// ── ListPlaces ────────────────────────────────────────────────────────────────

func TestListPlaces_AlwaysContainsHome(t *testing.T) {
	h, _ := newTestHandler(t)
	places, err := h.ListPlaces()
	if err != nil {
		t.Fatalf("ListPlaces: %v", err)
	}
	if len(places) == 0 {
		t.Fatal("expected at least one place entry")
	}
	var hasHome bool
	for _, p := range places {
		if p.Name == "Home" && p.Path != "" {
			hasHome = true
		}
	}
	if !hasHome {
		t.Error("expected a Home place entry with non-empty path")
	}
}

func TestListPlaces_NoFUSEMount_NoVirtualDirs(t *testing.T) {
	h, _ := newTestHandler(t)
	h.fuseMount = ""
	places, err := h.ListPlaces()
	if err != nil {
		t.Fatalf("ListPlaces: %v", err)
	}
	for _, p := range places {
		if strings.HasPrefix(p.Name, "@") ||
			strings.Contains(p.Path, "@recent") ||
			strings.Contains(p.Path, "@untagged") ||
			strings.Contains(p.Path, "@browse") {
			t.Errorf("unexpected FUSE virtual place when fuseMount is empty: %+v", p)
		}
	}
}

// ── ModifyTags / HydrateTags / ListTags ───────────────────────────────────────

func TestModifyTags_AddTags(t *testing.T) {
	h, root := newTestHandler(t)
	path := filepath.Join(root, "tagged.txt")
	seedFile(t, h, path, []byte(""))

	result, err := h.ModifyTags([]string{path}, []string{"work", "photo"}, "add")
	if err != nil {
		t.Fatalf("ModifyTags add: %v", err)
	}
	if len(result.PathsOK) != 1 || result.PathsOK[0] != path {
		t.Errorf("pathsOK: got %v, want [%s]", result.PathsOK, path)
	}
	if len(result.PathsError) != 0 {
		t.Errorf("pathsError: got %v, want []", result.PathsError)
	}

	pts, err := h.HydrateTags([]string{path})
	if err != nil {
		t.Fatalf("HydrateTags: %v", err)
	}
	if len(pts) != 1 {
		t.Fatalf("expected 1 PathTags entry, got %d", len(pts))
	}
	got := pts[0].Tags
	sort.Strings(got)
	want := []string{"photo", "work"}
	if len(got) != 2 || got[0] != want[0] || got[1] != want[1] {
		t.Errorf("tags: got %v, want %v", got, want)
	}
}

func TestModifyTags_RemoveTags(t *testing.T) {
	h, root := newTestHandler(t)
	path := filepath.Join(root, "rm-tag.txt")
	seedFile(t, h, path, []byte(""))

	if _, err := h.ModifyTags([]string{path}, []string{"work", "draft"}, "add"); err != nil {
		t.Fatalf("ModifyTags add: %v", err)
	}
	if _, err := h.ModifyTags([]string{path}, []string{"work"}, "remove"); err != nil {
		t.Fatalf("ModifyTags remove: %v", err)
	}

	pts, _ := h.HydrateTags([]string{path})
	if len(pts) != 1 {
		t.Fatalf("expected 1 PathTags entry, got %d", len(pts))
	}
	for _, tg := range pts[0].Tags {
		if tg == "work" {
			t.Error("'work' tag should have been removed")
		}
	}
}

func TestModifyTags_SetReplacesAllTags(t *testing.T) {
	h, root := newTestHandler(t)
	path := filepath.Join(root, "set-tag.txt")
	seedFile(t, h, path, []byte(""))

	if _, err := h.ModifyTags([]string{path}, []string{"old1", "old2"}, "add"); err != nil {
		t.Fatalf("ModifyTags add: %v", err)
	}
	if _, err := h.ModifyTags([]string{path}, []string{"new"}, "set"); err != nil {
		t.Fatalf("ModifyTags set: %v", err)
	}

	pts, _ := h.HydrateTags([]string{path})
	if len(pts) != 1 {
		t.Fatalf("expected 1 PathTags entry, got %d", len(pts))
	}
	tags := pts[0].Tags
	if len(tags) != 1 || tags[0] != "new" {
		t.Errorf("tags after set: got %v, want [new]", tags)
	}
}

func TestModifyTags_InvalidOperation(t *testing.T) {
	h, root := newTestHandler(t)
	path := filepath.Join(root, "bad-op.txt")
	os.WriteFile(path, []byte(""), 0o644)

	if _, err := h.ModifyTags([]string{path}, []string{"x"}, "badop"); err == nil {
		t.Fatal("expected error for invalid operation")
	}
}

func TestModifyTags_InvalidPath(t *testing.T) {
	h, _ := newTestHandler(t)
	if _, err := h.ModifyTags([]string{""}, []string{"x"}, "add"); err == nil {
		t.Fatal("expected error for empty path")
	}
}

func TestModifyTags_EmitsFileTaggedSignal(t *testing.T) {
	h, root := newTestHandler(t)
	path := filepath.Join(root, "signal.txt")
	seedFile(t, h, path, []byte(""))

	var sigPath string
	var sigAdded []string
	h.onFileTagged = func(p string, added, _ []string) {
		sigPath = p
		sigAdded = append(sigAdded, added...)
	}

	if _, err := h.ModifyTags([]string{path}, []string{"ping"}, "add"); err != nil {
		t.Fatalf("ModifyTags: %v", err)
	}
	if sigPath != path {
		t.Errorf("signal path: got %q, want %q", sigPath, path)
	}
	if len(sigAdded) != 1 || sigAdded[0] != "ping" {
		t.Errorf("signal added tags: got %v, want [ping]", sigAdded)
	}
}

func TestHydrateTags_MultiplePaths(t *testing.T) {
	h, root := newTestHandler(t)
	p1 := filepath.Join(root, "f1.txt")
	p2 := filepath.Join(root, "f2.txt")
	seedFile(t, h, p1, []byte(""))
	seedFile(t, h, p2, []byte(""))

	h.ModifyTags([]string{p1}, []string{"work"}, "add")
	h.ModifyTags([]string{p2}, []string{"personal"}, "add")

	pts, err := h.HydrateTags([]string{p1, p2})
	if err != nil {
		t.Fatalf("HydrateTags: %v", err)
	}
	if len(pts) != 2 {
		t.Fatalf("expected 2 PathTags entries, got %d", len(pts))
	}
	byPath := make(map[string][]string, 2)
	for _, pt := range pts {
		byPath[pt.Path] = pt.Tags
	}
	if v := byPath[p1]; len(v) != 1 || v[0] != "work" {
		t.Errorf("p1 tags: got %v, want [work]", v)
	}
	if v := byPath[p2]; len(v) != 1 || v[0] != "personal" {
		t.Errorf("p2 tags: got %v, want [personal]", v)
	}
}

func TestHydrateTags_InvalidPath(t *testing.T) {
	h, _ := newTestHandler(t)
	if _, err := h.HydrateTags([]string{""}); err == nil {
		t.Fatal("expected error for empty path in HydrateTags")
	}
}

func TestListTags_AfterAddingTags(t *testing.T) {
	h, root := newTestHandler(t)
	path := filepath.Join(root, "listtags.txt")
	seedFile(t, h, path, []byte(""))
	h.ModifyTags([]string{path}, []string{"alpha", "beta", "gamma"}, "add")

	all, err := h.ListTags("")
	if err != nil {
		t.Fatalf("ListTags: %v", err)
	}
	set := make(map[string]bool, len(all))
	for _, tg := range all {
		set[tg] = true
	}
	for _, want := range []string{"alpha", "beta", "gamma"} {
		if !set[want] {
			t.Errorf("expected tag %q in ListTags result", want)
		}
	}
}

func TestListTags_PrefixFilter(t *testing.T) {
	h, root := newTestHandler(t)
	path := filepath.Join(root, "prefix.txt")
	seedFile(t, h, path, []byte(""))
	h.ModifyTags([]string{path}, []string{"project-a", "project-b", "work"}, "add")

	filtered, err := h.ListTags("project")
	if err != nil {
		t.Fatalf("ListTags prefix: %v", err)
	}
	for _, tg := range filtered {
		if !strings.HasPrefix(tg, "project") {
			t.Errorf("unexpected tag %q with prefix filter 'project'", tg)
		}
	}
	if len(filtered) != 2 {
		t.Errorf("expected 2 tags with prefix 'project', got %d: %v", len(filtered), filtered)
	}
}

// ── Search (indexed) ──────────────────────────────────────────────────────────

func TestSearch_EmptyIndex(t *testing.T) {
	h, _ := newTestHandler(t)
	files, total, err := h.Search(nil, false, nil, nil, "", 50, 0, nil)
	if err != nil {
		t.Fatalf("Search: %v", err)
	}
	if total != 0 || len(files) != 0 {
		t.Errorf("expected empty results for empty index, got files=%d total=%d", len(files), total)
	}
}

func TestSearch_ByTag(t *testing.T) {
	h, root := newTestHandler(t)
	path := filepath.Join(root, "photo.jpg")
	seedFile(t, h, path, []byte(""))
	h.ModifyTags([]string{path}, []string{"photo"}, "add")

	files, total, err := h.Search([]string{"photo"}, false, nil, nil, "", 50, 0, nil)
	if err != nil {
		t.Fatalf("Search: %v", err)
	}
	if total == 0 || len(files) == 0 {
		t.Fatalf("expected at least one search result, got files=%d total=%d", len(files), total)
	}
	found := false
	for _, f := range files {
		if f.Path == path {
			found = true
		}
	}
	if !found {
		t.Errorf("path %q not found in search results %v", path, files)
	}
}
