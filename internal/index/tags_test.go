package index

import (
	"context"
	"sort"
	"testing"
	"time"
)

func TestListAllTags_Empty(t *testing.T) {
	db := testDB(t)
	tags, err := db.ListAllTags(context.Background())
	if err != nil {
		t.Fatalf("ListAllTags: %v", err)
	}
	if len(tags) != 0 {
		t.Errorf("expected empty, got %v", tags)
	}
}

func TestListAllTags_AlphaOrder(t *testing.T) {
	ctx := context.Background()
	db := testDB(t)

	id := addFile(t, db, "/f.txt", 1000, 100)
	tagFile(t, db, id, "zebra", "apple", "mango")

	tags, err := db.ListAllTags(ctx)
	if err != nil {
		t.Fatalf("ListAllTags: %v", err)
	}
	if len(tags) != 3 {
		t.Fatalf("expected 3 tags, got %v", tags)
	}
	if tags[0] != "apple" || tags[1] != "mango" || tags[2] != "zebra" {
		t.Errorf("wrong order: %v", tags)
	}
}

func TestListCooccurringTags_Empty(t *testing.T) {
	ctx := context.Background()
	db := testDB(t)

	id1 := addFile(t, db, "/a.txt", 1000, 100)
	id2 := addFile(t, db, "/b.txt", 1000, 100)
	tagFile(t, db, id1, "work", "python")
	tagFile(t, db, id2, "work", "go")

	// No filters: all tags returned.
	tags, err := db.ListCooccurringTags(ctx, nil, nil)
	if err != nil {
		t.Fatalf("ListCooccurringTags: %v", err)
	}
	if len(tags) != 3 { // work, python, go
		t.Errorf("expected 3 tags, got %v", tags)
	}
}

func TestListCooccurringTags_AndSemantics(t *testing.T) {
	ctx := context.Background()
	db := testDB(t)

	// file1: work + python + draft
	// file2: work + go
	// file3: personal + go
	id1 := addFile(t, db, "/a.py", 1000, 100)
	id2 := addFile(t, db, "/b.go", 1000, 100)
	id3 := addFile(t, db, "/c.go", 1000, 100)
	tagFile(t, db, id1, "work", "python", "draft")
	tagFile(t, db, id2, "work", "go")
	tagFile(t, db, id3, "personal", "go")

	// Include "work": files 1 and 2 qualify → co-occurring tags are python, draft, go
	// "work" itself is excluded from result since it's in includeTags
	tags, err := db.ListCooccurringTags(ctx, []string{"work"}, nil)
	if err != nil {
		t.Fatalf("ListCooccurringTags: %v", err)
	}
	sort.Strings(tags)
	want := []string{"draft", "go", "python"}
	if len(tags) != len(want) {
		t.Fatalf("expected %v, got %v", want, tags)
	}
	for i, w := range want {
		if tags[i] != w {
			t.Errorf("tag[%d]: got %q, want %q", i, tags[i], w)
		}
	}
}

func TestListCooccurringTags_WithExclude(t *testing.T) {
	ctx := context.Background()
	db := testDB(t)

	// file1: work + python + draft
	// file2: work + python + final
	id1 := addFile(t, db, "/a.py", 1000, 100)
	id2 := addFile(t, db, "/b.py", 1000, 100)
	tagFile(t, db, id1, "work", "python", "draft")
	tagFile(t, db, id2, "work", "python", "final")

	// Include "work", exclude "draft" → only file2 qualifies → co-occurring = final
	// "work" excluded since it's in include list
	tags, err := db.ListCooccurringTags(ctx, []string{"work"}, []string{"draft"})
	if err != nil {
		t.Fatalf("ListCooccurringTags with exclude: %v", err)
	}
	sort.Strings(tags)
	// python (both files have it) - but file1 has draft so only file2 qualifies
	// python appears on file2 too → should be included
	// final appears on file2 → should be included
	// draft is excluded from query so should not appear
	for _, tag := range tags {
		if tag == "draft" {
			t.Errorf("excluded tag 'draft' should not appear in result, got %v", tags)
		}
	}
}

func TestListCooccurringTags_ExcludesUsedTags(t *testing.T) {
	ctx := context.Background()
	db := testDB(t)

	id := addFile(t, db, "/a.txt", 1000, 100)
	tagFile(t, db, id, "alpha", "beta", "gamma")

	tags, err := db.ListCooccurringTags(ctx, []string{"alpha"}, []string{"beta"})
	if err != nil {
		t.Fatalf("ListCooccurringTags: %v", err)
	}
	// alpha and beta are used → neither should appear in result
	for _, tag := range tags {
		if tag == "alpha" || tag == "beta" {
			t.Errorf("used tag %q should be excluded from result, got %v", tag, tags)
		}
	}
}

func TestDeleteStaleFiles(t *testing.T) {
	ctx := context.Background()
	db := testDB(t)

	// Insert three files (all get indexed_at = now).
	addFile(t, db, "/watched/old.txt", 1000, 100)
	addFile(t, db, "/watched/new.txt", 1000, 100)
	addFile(t, db, "/other/file.txt", 1000, 100) // different prefix

	// Wind back indexed_at for old.txt so it appears stale.
	oldTime := time.Now().Unix() - 10000
	if _, err := db.db.ExecContext(ctx,
		"UPDATE files SET indexed_at = ? WHERE path = ?", oldTime, "/watched/old.txt"); err != nil {
		t.Fatalf("set stale indexed_at: %v", err)
	}

	// Delete files under /watched/ not seen since 5 minutes ago.
	cutoff := time.Now().Unix() - 300
	if err := db.DeleteStaleFiles(ctx, "/watched/", cutoff); err != nil {
		t.Fatalf("DeleteStaleFiles: %v", err)
	}

	// old.txt should be gone; new.txt and /other/file.txt should remain.
	results, _, err := db.Search(ctx, SearchParams{Limit: 50})
	if err != nil {
		t.Fatalf("Search after delete: %v", err)
	}
	if len(results) != 2 {
		t.Errorf("expected 2 remaining, got %d: %v", len(results), pathsOf(results))
	}
	for _, r := range results {
		if r.Path == "/watched/old.txt" {
			t.Error("old.txt should have been deleted")
		}
	}
}

func TestGetFileTags(t *testing.T) {
	ctx := context.Background()
	db := testDB(t)

	id := addFile(t, db, "/f.txt", 1000, 100)
	tagFile(t, db, id, "b", "a", "c")

	tags, err := db.GetFileTags(ctx, "/f.txt")
	if err != nil {
		t.Fatalf("GetFileTags: %v", err)
	}
	// Returned alphabetically.
	if len(tags) != 3 || tags[0] != "a" || tags[1] != "b" || tags[2] != "c" {
		t.Errorf("got %v, want [a b c]", tags)
	}
}

func TestGetFileTags_Missing(t *testing.T) {
	db := testDB(t)
	tags, err := db.GetFileTags(context.Background(), "/nonexistent.txt")
	if err != nil {
		t.Fatalf("GetFileTags missing: %v", err)
	}
	if len(tags) != 0 {
		t.Errorf("expected empty tags for missing file, got %v", tags)
	}
}

func TestModifyFileTags_Add(t *testing.T) {
	ctx := context.Background()
	db := testDB(t)

	id := addFile(t, db, "/f.txt", 1000, 100)
	tagFile(t, db, id, "work")

	if err := db.ModifyFileTags(ctx, "/f.txt", []string{"draft", "review"}, "add"); err != nil {
		t.Fatalf("ModifyFileTags add: %v", err)
	}

	tags, _ := db.GetFileTags(ctx, "/f.txt")
	sort.Strings(tags)
	want := []string{"draft", "review", "work"}
	if len(tags) != 3 {
		t.Fatalf("expected %v, got %v", want, tags)
	}
	for i, w := range want {
		if tags[i] != w {
			t.Errorf("tag[%d]: got %q want %q", i, tags[i], w)
		}
	}
}

func TestModifyFileTags_Remove(t *testing.T) {
	ctx := context.Background()
	db := testDB(t)

	id := addFile(t, db, "/f.txt", 1000, 100)
	tagFile(t, db, id, "work", "draft", "review")

	if err := db.ModifyFileTags(ctx, "/f.txt", []string{"draft"}, "remove"); err != nil {
		t.Fatalf("ModifyFileTags remove: %v", err)
	}

	tags, _ := db.GetFileTags(ctx, "/f.txt")
	sort.Strings(tags)
	for _, tag := range tags {
		if tag == "draft" {
			t.Error("draft should have been removed")
		}
	}
	if len(tags) != 2 {
		t.Errorf("expected 2 tags remaining, got %v", tags)
	}
}

func TestModifyFileTags_Remove_NonExistentTag(t *testing.T) {
	ctx := context.Background()
	db := testDB(t)

	id := addFile(t, db, "/f.txt", 1000, 100)
	tagFile(t, db, id, "work")

	// Removing a tag that doesn't exist should be a no-op (not an error).
	if err := db.ModifyFileTags(ctx, "/f.txt", []string{"nosuchtag"}, "remove"); err != nil {
		t.Errorf("expected no error for removing nonexistent tag, got: %v", err)
	}
}

func TestModifyFileTags_Set(t *testing.T) {
	ctx := context.Background()
	db := testDB(t)

	id := addFile(t, db, "/f.txt", 1000, 100)
	tagFile(t, db, id, "old1", "old2")

	if err := db.ModifyFileTags(ctx, "/f.txt", []string{"new1", "new2"}, "set"); err != nil {
		t.Fatalf("ModifyFileTags set: %v", err)
	}

	tags, _ := db.GetFileTags(ctx, "/f.txt")
	sort.Strings(tags)
	want := []string{"new1", "new2"}
	if len(tags) != 2 || tags[0] != "new1" || tags[1] != "new2" {
		t.Errorf("expected %v, got %v", want, tags)
	}
}

func TestModifyFileTags_UnknownOp(t *testing.T) {
	ctx := context.Background()
	db := testDB(t)
	addFile(t, db, "/f.txt", 1000, 100)

	err := db.ModifyFileTags(ctx, "/f.txt", []string{"x"}, "badop")
	if err == nil {
		t.Error("expected error for unknown operation")
	}
}

func TestDeleteMeta(t *testing.T) {
	ctx := context.Background()
	db := testDB(t)

	id := addFile(t, db, "/f.txt", 1000, 100)
	addMeta(t, db, id, "author", "alice", "user")
	addMeta(t, db, id, "lang", "go", "user")

	if err := db.DeleteMeta(ctx, "/f.txt", "author"); err != nil {
		t.Fatalf("DeleteMeta: %v", err)
	}

	vals, _, err := db.GetFileMeta(ctx, "/f.txt")
	if err != nil {
		t.Fatalf("GetFileMeta: %v", err)
	}
	if _, ok := vals["author"]; ok {
		t.Error("author should have been deleted")
	}
	if vals["lang"] != "go" {
		t.Error("lang should still be present")
	}
}

func TestGetFileMeta_NotFound(t *testing.T) {
	db := testDB(t)
	vals, sources, err := db.GetFileMeta(context.Background(), "/nonexistent.txt")
	if err != nil {
		t.Fatalf("GetFileMeta missing: %v", err)
	}
	if vals != nil || sources != nil {
		t.Errorf("expected nil,nil for missing file, got %v, %v", vals, sources)
	}
}

func TestGetFileMeta_Sources(t *testing.T) {
	ctx := context.Background()
	db := testDB(t)

	id := addFile(t, db, "/f.txt", 1000, 100)
	addMeta(t, db, id, "author", "alice", "manual")
	addMeta(t, db, id, "width", "1920", "stat-harvester")

	vals, sources, err := db.GetFileMeta(ctx, "/f.txt")
	if err != nil {
		t.Fatalf("GetFileMeta: %v", err)
	}
	if sources["author"] != "manual" {
		t.Errorf("author source: got %q, want manual", sources["author"])
	}
	if sources["width"] != "stat-harvester" {
		t.Errorf("width source: got %q, want stat-harvester", sources["width"])
	}
	_ = vals
}

func TestListFileTagPairs(t *testing.T) {
	ctx := context.Background()
	db := testDB(t)

	id1 := addFile(t, db, "/a.txt", 1000, 100)
	id2 := addFile(t, db, "/b.txt", 1000, 100)
	tagFile(t, db, id1, "work", "python")
	tagFile(t, db, id2, "work")

	pairs, err := db.ListFileTagPairs(ctx)
	if err != nil {
		t.Fatalf("ListFileTagPairs: %v", err)
	}
	// 3 pairs: (a.txt,work), (a.txt,python), (b.txt,work)
	if len(pairs) != 3 {
		t.Errorf("expected 3 pairs, got %d: %v", len(pairs), pairs)
	}
}
