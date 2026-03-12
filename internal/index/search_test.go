package index

import (
	"context"
	"path/filepath"
	"sort"
	"testing"
)

// testDB opens a fresh in-memory (temp dir) database for one test.
func testDB(t *testing.T) *DB {
	t.Helper()
	ctx := context.Background()
	db, err := Open(ctx, filepath.Join(t.TempDir(), "test.db"))
	if err != nil {
		t.Fatalf("Open: %v", err)
	}
	t.Cleanup(func() { db.Close() })
	return db
}

// addFile inserts a file and returns its ID. Fails the test on error.
func addFile(t *testing.T, db *DB, path string, mtime, size int64) int64 {
	t.Helper()
	id, err := db.UpsertFile(context.Background(), path, 1, 2, mtime, size)
	if err != nil {
		t.Fatalf("UpsertFile(%q): %v", path, err)
	}
	return id
}

// tagFile adds tags to a file by ID. Fails the test on error.
func tagFile(t *testing.T, db *DB, fileID int64, tags ...string) {
	t.Helper()
	if err := db.SetFileTags(context.Background(), fileID, tags); err != nil {
		t.Fatalf("SetFileTags: %v", err)
	}
}

// addMeta inserts a metadata key-value pair for a file. Fails the test on error.
func addMeta(t *testing.T, db *DB, fileID int64, key, value, source string) {
	t.Helper()
	if err := db.UpsertMeta(context.Background(), fileID, key, value, source); err != nil {
		t.Fatalf("UpsertMeta(%q=%q): %v", key, value, err)
	}
}

// pathsOf extracts just the paths from a search result slice.
func pathsOf(results []SearchResult) []string {
	paths := make([]string, len(results))
	for i, r := range results {
		paths[i] = r.Path
	}
	return paths
}

func TestSearch_EmptyIndex(t *testing.T) {
	db := testDB(t)
	results, total, err := db.Search(context.Background(), SearchParams{})
	if err != nil {
		t.Fatalf("Search: %v", err)
	}
	if len(results) != 0 {
		t.Errorf("expected 0 results, got %d", len(results))
	}
	if total != 0 {
		t.Errorf("expected total=0, got %d", total)
	}
}

func TestSearch_ReturnsAllFiles(t *testing.T) {
	ctx := context.Background()
	db := testDB(t)
	addFile(t, db, "/a/foo.txt", 1000, 100)
	addFile(t, db, "/a/bar.txt", 2000, 200)
	addFile(t, db, "/a/baz.txt", 3000, 300)

	results, total, err := db.Search(ctx, SearchParams{Limit: 50})
	if err != nil {
		t.Fatalf("Search: %v", err)
	}
	if total != 3 {
		t.Errorf("total: got %d, want 3", total)
	}
	if len(results) != 3 {
		t.Errorf("results: got %d, want 3", len(results))
	}
}

func TestSearch_TagAnd(t *testing.T) {
	ctx := context.Background()
	db := testDB(t)

	// file1 has both tags; file2 has only "work"; file3 has only "python"
	id1 := addFile(t, db, "/files/file1.py", 1000, 100)
	id2 := addFile(t, db, "/files/file2.py", 1000, 100)
	id3 := addFile(t, db, "/files/file3.py", 1000, 100)

	tagFile(t, db, id1, "python", "work")
	tagFile(t, db, id2, "work")
	tagFile(t, db, id3, "python")

	results, total, err := db.Search(ctx, SearchParams{
		Tags:  []string{"python", "work"},
		Limit: 50,
	})
	if err != nil {
		t.Fatalf("Search: %v", err)
	}
	if total != 1 || len(results) != 1 {
		t.Errorf("expected 1 result (AND), got %d (total=%d)", len(results), total)
	}
	if results[0].Path != "/files/file1.py" {
		t.Errorf("wrong file: got %q", results[0].Path)
	}
}

func TestSearch_TagOr(t *testing.T) {
	ctx := context.Background()
	db := testDB(t)

	id1 := addFile(t, db, "/files/a.txt", 1000, 100)
	id2 := addFile(t, db, "/files/b.txt", 1000, 100)
	id3 := addFile(t, db, "/files/c.txt", 1000, 100)

	tagFile(t, db, id1, "python")
	tagFile(t, db, id2, "work")
	tagFile(t, db, id3, "other")

	results, total, err := db.Search(ctx, SearchParams{
		Tags:    []string{"python", "work"},
		TagsAny: true,
		Limit:   50,
	})
	if err != nil {
		t.Fatalf("Search: %v", err)
	}
	if total != 2 || len(results) != 2 {
		t.Errorf("expected 2 results (OR), got %d (total=%d)", len(results), total)
	}
	paths := pathsOf(results)
	sort.Strings(paths)
	if paths[0] != "/files/a.txt" || paths[1] != "/files/b.txt" {
		t.Errorf("wrong files: %v", paths)
	}
}

func TestSearch_TagExclude(t *testing.T) {
	ctx := context.Background()
	db := testDB(t)

	id1 := addFile(t, db, "/files/a.txt", 1000, 100)
	id2 := addFile(t, db, "/files/b.txt", 1000, 100)

	tagFile(t, db, id1, "work")
	tagFile(t, db, id2, "work", "archived")

	results, _, err := db.Search(ctx, SearchParams{
		Tags:       []string{"work"},
		TagExclude: []string{"archived"},
		Limit:      50,
	})
	if err != nil {
		t.Fatalf("Search: %v", err)
	}
	if len(results) != 1 || results[0].Path != "/files/a.txt" {
		t.Errorf("expected only a.txt, got %v", pathsOf(results))
	}
}

func TestSearch_MetaFilter_Eq(t *testing.T) {
	ctx := context.Background()
	db := testDB(t)

	id1 := addFile(t, db, "/files/a.txt", 1000, 100)
	id2 := addFile(t, db, "/files/b.txt", 1000, 100)

	addMeta(t, db, id1, "author", "alice", "user")
	addMeta(t, db, id2, "author", "bob", "user")

	results, _, err := db.Search(ctx, SearchParams{
		MetaFilters: map[string]string{"author": "eq:alice"},
		Limit:       50,
	})
	if err != nil {
		t.Fatalf("Search: %v", err)
	}
	if len(results) != 1 || results[0].Path != "/files/a.txt" {
		t.Errorf("expected a.txt, got %v", pathsOf(results))
	}
}

func TestSearch_MetaFilter_Contains(t *testing.T) {
	ctx := context.Background()
	db := testDB(t)

	id1 := addFile(t, db, "/files/a.txt", 1000, 100)
	id2 := addFile(t, db, "/files/b.txt", 1000, 100)

	addMeta(t, db, id1, "title", "Introduction to Go", "harvester")
	addMeta(t, db, id2, "title", "Python Cookbook", "harvester")

	results, _, err := db.Search(ctx, SearchParams{
		MetaFilters: map[string]string{"title": "contains:Go"},
		Limit:       50,
	})
	if err != nil {
		t.Fatalf("Search: %v", err)
	}
	if len(results) != 1 || results[0].Path != "/files/a.txt" {
		t.Errorf("expected a.txt, got %v", pathsOf(results))
	}
}

func TestSearch_MetaFilter_NumericGTE(t *testing.T) {
	ctx := context.Background()
	db := testDB(t)

	id1 := addFile(t, db, "/files/small.jpg", 1000, 100)
	id2 := addFile(t, db, "/files/large.jpg", 1000, 100)

	addMeta(t, db, id1, "width", "640", "stat")
	addMeta(t, db, id2, "width", "1920", "stat")

	results, _, err := db.Search(ctx, SearchParams{
		MetaFilters: map[string]string{"width": "gte:1280"},
		Limit:       50,
	})
	if err != nil {
		t.Fatalf("Search: %v", err)
	}
	if len(results) != 1 || results[0].Path != "/files/large.jpg" {
		t.Errorf("expected large.jpg, got %v", pathsOf(results))
	}
}

func TestSearch_MetaFilter_NumericLTE(t *testing.T) {
	ctx := context.Background()
	db := testDB(t)

	id1 := addFile(t, db, "/files/small.jpg", 1000, 100)
	id2 := addFile(t, db, "/files/large.jpg", 1000, 100)

	addMeta(t, db, id1, "width", "640", "stat")
	addMeta(t, db, id2, "width", "1920", "stat")

	results, _, err := db.Search(ctx, SearchParams{
		MetaFilters: map[string]string{"width": "lte:800"},
		Limit:       50,
	})
	if err != nil {
		t.Fatalf("Search: %v", err)
	}
	if len(results) != 1 || results[0].Path != "/files/small.jpg" {
		t.Errorf("expected small.jpg, got %v", pathsOf(results))
	}
}

func TestSearch_MetaFilter_GT_LT(t *testing.T) {
	ctx := context.Background()
	db := testDB(t)

	id1 := addFile(t, db, "/files/a.mp3", 1000, 100)
	id2 := addFile(t, db, "/files/b.mp3", 1000, 100)
	id3 := addFile(t, db, "/files/c.mp3", 1000, 100)

	addMeta(t, db, id1, "duration", "120", "ffprobe")
	addMeta(t, db, id2, "duration", "240", "ffprobe")
	addMeta(t, db, id3, "duration", "360", "ffprobe")

	// gt:120 should match 240 and 360
	results, _, err := db.Search(ctx, SearchParams{
		MetaFilters: map[string]string{"duration": "gt:120"},
		Limit:       50,
	})
	if err != nil {
		t.Fatalf("Search gt: %v", err)
	}
	if len(results) != 2 {
		t.Errorf("gt:120 expected 2, got %d: %v", len(results), pathsOf(results))
	}

	// lt:360 should match 120 and 240
	results2, _, err := db.Search(ctx, SearchParams{
		MetaFilters: map[string]string{"duration": "lt:360"},
		Limit:       50,
	})
	if err != nil {
		t.Fatalf("Search lt: %v", err)
	}
	if len(results2) != 2 {
		t.Errorf("lt:360 expected 2, got %d: %v", len(results2), pathsOf(results2))
	}
}

func TestSearch_FTSQuery(t *testing.T) {
	ctx := context.Background()
	db := testDB(t)

	id1 := addFile(t, db, "/files/a.txt", 1000, 100)
	id2 := addFile(t, db, "/files/b.txt", 1000, 100)

	addMeta(t, db, id1, "title", "introduction to golang", "harvester")
	addMeta(t, db, id2, "title", "python recipes book", "harvester")

	results, _, err := db.Search(ctx, SearchParams{
		FTSQuery: "golang",
		Limit:    50,
	})
	if err != nil {
		t.Fatalf("Search FTS: %v", err)
	}
	if len(results) != 1 || results[0].Path != "/files/a.txt" {
		t.Errorf("FTS expected a.txt, got %v", pathsOf(results))
	}
}

func TestSearch_MtimeSince(t *testing.T) {
	ctx := context.Background()
	db := testDB(t)

	// old file: mtime 100 seconds ago (relative to epoch, but use small values)
	addFile(t, db, "/files/old.txt", 1000, 100)
	// new file: mtime 9000
	addFile(t, db, "/files/new.txt", 9000, 100)

	results, _, err := db.Search(ctx, SearchParams{
		MtimeSince: 5000,
		Limit:      50,
	})
	if err != nil {
		t.Fatalf("Search MtimeSince: %v", err)
	}
	if len(results) != 1 || results[0].Path != "/files/new.txt" {
		t.Errorf("expected new.txt, got %v", pathsOf(results))
	}
}

func TestSearch_Untagged(t *testing.T) {
	ctx := context.Background()
	db := testDB(t)

	id1 := addFile(t, db, "/files/tagged.txt", 1000, 100)
	addFile(t, db, "/files/bare.txt", 1000, 100)

	tagFile(t, db, id1, "work")

	results, _, err := db.Search(ctx, SearchParams{
		Untagged: true,
		Limit:    50,
	})
	if err != nil {
		t.Fatalf("Search Untagged: %v", err)
	}
	if len(results) != 1 || results[0].Path != "/files/bare.txt" {
		t.Errorf("expected bare.txt, got %v", pathsOf(results))
	}
}

func TestSearch_PathFilter(t *testing.T) {
	ctx := context.Background()
	db := testDB(t)

	addFile(t, db, "/files/a.txt", 1000, 100)
	addFile(t, db, "/files/b.txt", 1000, 100)

	results, _, err := db.Search(ctx, SearchParams{
		MetaFilters: map[string]string{"__path__": "eq:/files/a.txt"},
		Limit:       50,
	})
	if err != nil {
		t.Fatalf("Search path filter: %v", err)
	}
	if len(results) != 1 || results[0].Path != "/files/a.txt" {
		t.Errorf("expected /files/a.txt, got %v", pathsOf(results))
	}
}

func TestSearch_SortByName(t *testing.T) {
	ctx := context.Background()
	db := testDB(t)

	addFile(t, db, "/files/charlie.txt", 1000, 100)
	addFile(t, db, "/files/alice.txt", 2000, 100)
	addFile(t, db, "/files/bob.txt", 3000, 100)

	results, _, err := db.Search(ctx, SearchParams{
		SortBy: []string{"name:asc"},
		Limit:  50,
	})
	if err != nil {
		t.Fatalf("Search sort: %v", err)
	}
	if len(results) != 3 {
		t.Fatalf("expected 3, got %d", len(results))
	}
	paths := pathsOf(results)
	if paths[0] != "/files/alice.txt" || paths[1] != "/files/bob.txt" || paths[2] != "/files/charlie.txt" {
		t.Errorf("wrong sort order: %v", paths)
	}
}

func TestSearch_SortBySize(t *testing.T) {
	ctx := context.Background()
	db := testDB(t)

	addFile(t, db, "/files/big.txt", 1000, 9000)
	addFile(t, db, "/files/mid.txt", 1000, 5000)
	addFile(t, db, "/files/tiny.txt", 1000, 100)

	results, _, err := db.Search(ctx, SearchParams{
		SortBy: []string{"size:asc"},
		Limit:  50,
	})
	if err != nil {
		t.Fatalf("Search sort size: %v", err)
	}
	paths := pathsOf(results)
	if paths[0] != "/files/tiny.txt" || paths[2] != "/files/big.txt" {
		t.Errorf("wrong size order: %v", paths)
	}
}

func TestSearch_SortByMtimeDesc(t *testing.T) {
	ctx := context.Background()
	db := testDB(t)

	addFile(t, db, "/files/oldest.txt", 100, 100)
	addFile(t, db, "/files/newest.txt", 9999, 100)
	addFile(t, db, "/files/middle.txt", 5000, 100)

	results, _, err := db.Search(ctx, SearchParams{
		SortBy: []string{"mtime:desc"},
		Limit:  50,
	})
	if err != nil {
		t.Fatalf("Search sort mtime: %v", err)
	}
	paths := pathsOf(results)
	if paths[0] != "/files/newest.txt" || paths[2] != "/files/oldest.txt" {
		t.Errorf("wrong mtime order: %v", paths)
	}
}

func TestSearch_Pagination(t *testing.T) {
	ctx := context.Background()
	db := testDB(t)

	for i := range 10 {
		addFile(t, db, "/files/"+string(rune('a'+i))+".txt", int64(i), 100)
	}

	// First page of 4.
	page1, total, err := db.Search(ctx, SearchParams{
		SortBy: []string{"name:asc"},
		Limit:  4,
		Offset: 0,
	})
	if err != nil {
		t.Fatalf("page1: %v", err)
	}
	if total != 10 {
		t.Errorf("total: got %d, want 10", total)
	}
	if len(page1) != 4 {
		t.Errorf("page1 len: got %d, want 4", len(page1))
	}

	// Second page of 4.
	page2, _, err := db.Search(ctx, SearchParams{
		SortBy: []string{"name:asc"},
		Limit:  4,
		Offset: 4,
	})
	if err != nil {
		t.Fatalf("page2: %v", err)
	}
	if len(page2) != 4 {
		t.Errorf("page2 len: got %d, want 4", len(page2))
	}
	// Pages must not overlap.
	p1Set := make(map[string]bool)
	for _, r := range page1 {
		p1Set[r.Path] = true
	}
	for _, r := range page2 {
		if p1Set[r.Path] {
			t.Errorf("overlap between page1 and page2: %q", r.Path)
		}
	}
}

func TestSearch_DefaultLimit(t *testing.T) {
	ctx := context.Background()
	db := testDB(t)

	// Insert 60 files; default limit is 50.
	for i := range 60 {
		addFile(t, db, "/files/"+string(rune('a'+i%26))+string(rune('0'+i/26))+".txt", int64(i), 100)
	}

	results, total, err := db.Search(ctx, SearchParams{}) // Limit=0 → default 50
	if err != nil {
		t.Fatalf("Search: %v", err)
	}
	if total != 60 {
		t.Errorf("total: got %d, want 60", total)
	}
	if len(results) != 50 {
		t.Errorf("results len: got %d, want 50 (default limit)", len(results))
	}
}

func TestSearch_ResultsHaveTags(t *testing.T) {
	ctx := context.Background()
	db := testDB(t)

	id1 := addFile(t, db, "/files/a.txt", 1000, 100)
	tagFile(t, db, id1, "work", "python")

	results, _, err := db.Search(ctx, SearchParams{Limit: 50})
	if err != nil {
		t.Fatalf("Search: %v", err)
	}
	if len(results) != 1 {
		t.Fatalf("expected 1 result")
	}
	tags := results[0].Tags
	sort.Strings(tags)
	if len(tags) != 2 || tags[0] != "python" || tags[1] != "work" {
		t.Errorf("tags: got %v, want [python work]", tags)
	}
}

func TestSearch_ResultsHaveMetadata(t *testing.T) {
	ctx := context.Background()
	db := testDB(t)

	id1 := addFile(t, db, "/files/a.txt", 1000, 100)
	addMeta(t, db, id1, "author", "alice", "user")
	addMeta(t, db, id1, "lang", "go", "user")

	results, _, err := db.Search(ctx, SearchParams{Limit: 50})
	if err != nil {
		t.Fatalf("Search: %v", err)
	}
	if len(results) != 1 {
		t.Fatalf("expected 1 result")
	}
	meta := results[0].Metadata
	if meta["author"] != "alice" || meta["lang"] != "go" {
		t.Errorf("metadata: got %v", meta)
	}
}

func TestSearch_CombinedFilters(t *testing.T) {
	ctx := context.Background()
	db := testDB(t)

	// file1: tagged "work", mtime=5000, width=1920
	id1 := addFile(t, db, "/files/hd-work.jpg", 5000, 100)
	tagFile(t, db, id1, "work")
	addMeta(t, db, id1, "width", "1920", "stat")

	// file2: tagged "work", mtime=5000, width=640
	id2 := addFile(t, db, "/files/sd-work.jpg", 5000, 100)
	tagFile(t, db, id2, "work")
	addMeta(t, db, id2, "width", "640", "stat")

	// file3: tagged "personal", mtime=5000, width=1920
	id3 := addFile(t, db, "/files/hd-personal.jpg", 5000, 100)
	tagFile(t, db, id3, "personal")
	addMeta(t, db, id3, "width", "1920", "stat")

	// Want: work AND width>=1280 → only file1
	results, _, err := db.Search(ctx, SearchParams{
		Tags:        []string{"work"},
		MetaFilters: map[string]string{"width": "gte:1280"},
		Limit:       50,
	})
	if err != nil {
		t.Fatalf("combined search: %v", err)
	}
	if len(results) != 1 || results[0].Path != "/files/hd-work.jpg" {
		t.Errorf("expected hd-work.jpg only, got %v", pathsOf(results))
	}
}
