package index

import (
	"context"
	"path/filepath"
	"testing"
)

func TestOpenAndMigrate(t *testing.T) {
	ctx := context.Background()
	dir := t.TempDir()
	dbPath := filepath.Join(dir, "test.db")

	db, err := Open(ctx, dbPath)
	if err != nil {
		t.Fatalf("Open: %v", err)
	}
	t.Cleanup(func() { db.Close() })

	// Idempotent: run Migrate a second time; must not error.
	if err := db.Migrate(ctx); err != nil {
		t.Fatalf("Migrate (second call): %v", err)
	}
}

func TestUpsertFile(t *testing.T) {
	ctx := context.Background()
	dir := t.TempDir()
	db, err := Open(ctx, filepath.Join(dir, "test.db"))
	if err != nil {
		t.Fatalf("Open: %v", err)
	}
	t.Cleanup(func() { db.Close() })

	id, err := db.UpsertFile(ctx, "/tmp/foo.txt", 12345, 99, 1700000000, 1024)
	if err != nil {
		t.Fatalf("UpsertFile: %v", err)
	}
	if id <= 0 {
		t.Fatalf("expected positive fileID, got %d", id)
	}

	// Upsert again (update path) — should return same logical row.
	id2, err := db.UpsertFile(ctx, "/tmp/foo.txt", 12345, 99, 1700000001, 2048)
	if err != nil {
		t.Fatalf("UpsertFile (update): %v", err)
	}
	if id2 != id {
		t.Fatalf("expected same id on update, got %d vs %d", id, id2)
	}
}

func TestUpsertTag(t *testing.T) {
	ctx := context.Background()
	dir := t.TempDir()
	db, err := Open(ctx, filepath.Join(dir, "test.db"))
	if err != nil {
		t.Fatalf("Open: %v", err)
	}
	t.Cleanup(func() { db.Close() })

	id, err := db.UpsertTag(ctx, "work")
	if err != nil {
		t.Fatalf("UpsertTag: %v", err)
	}
	if id <= 0 {
		t.Fatalf("expected positive tagID, got %d", id)
	}

	// Second call must return the same ID.
	id2, err := db.UpsertTag(ctx, "work")
	if err != nil {
		t.Fatalf("UpsertTag (duplicate): %v", err)
	}
	if id2 != id {
		t.Fatalf("expected same tag id, got %d vs %d", id, id2)
	}
}

func TestAddFileTag(t *testing.T) {
	ctx := context.Background()
	dir := t.TempDir()
	db, err := Open(ctx, filepath.Join(dir, "test.db"))
	if err != nil {
		t.Fatalf("Open: %v", err)
	}
	t.Cleanup(func() { db.Close() })

	fileID, _ := db.UpsertFile(ctx, "/tmp/bar.txt", 1, 2, 100, 10)
	tagID, _ := db.UpsertTag(ctx, "docs")

	if err := db.AddFileTag(ctx, fileID, tagID); err != nil {
		t.Fatalf("AddFileTag: %v", err)
	}
	// Duplicate must be a no-op.
	if err := db.AddFileTag(ctx, fileID, tagID); err != nil {
		t.Fatalf("AddFileTag (duplicate): %v", err)
	}

	// Verify cardinality trigger fired.
	var card int
	if err := db.db.QueryRowContext(ctx, "SELECT cardinality FROM tags WHERE id = ?", tagID).Scan(&card); err != nil {
		t.Fatalf("query cardinality: %v", err)
	}
	if card != 1 {
		t.Fatalf("expected cardinality 1, got %d", card)
	}
}

func TestSetFileTags(t *testing.T) {
	ctx := context.Background()
	dir := t.TempDir()
	db, err := Open(ctx, filepath.Join(dir, "test.db"))
	if err != nil {
		t.Fatalf("Open: %v", err)
	}
	t.Cleanup(func() { db.Close() })

	fileID, _ := db.UpsertFile(ctx, "/tmp/baz.txt", 3, 4, 200, 20)

	if err := db.SetFileTags(ctx, fileID, []string{"alpha", "beta", "gamma"}); err != nil {
		t.Fatalf("SetFileTags: %v", err)
	}

	// Count tags associated with file.
	var count int
	if err := db.db.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM file_tags WHERE file_id = ?", fileID).Scan(&count); err != nil {
		t.Fatalf("count file_tags: %v", err)
	}
	if count != 3 {
		t.Fatalf("expected 3 tags, got %d", count)
	}

	// Replace with fewer tags.
	if err := db.SetFileTags(ctx, fileID, []string{"alpha"}); err != nil {
		t.Fatalf("SetFileTags (replace): %v", err)
	}
	if err := db.db.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM file_tags WHERE file_id = ?", fileID).Scan(&count); err != nil {
		t.Fatalf("count file_tags after replace: %v", err)
	}
	if count != 1 {
		t.Fatalf("expected 1 tag after replace, got %d", count)
	}
}

func TestUpsertMeta(t *testing.T) {
	ctx := context.Background()
	dir := t.TempDir()
	db, err := Open(ctx, filepath.Join(dir, "test.db"))
	if err != nil {
		t.Fatalf("Open: %v", err)
	}
	t.Cleanup(func() { db.Close() })

	fileID, _ := db.UpsertFile(ctx, "/tmp/meta.txt", 5, 6, 300, 30)

	if err := db.UpsertMeta(ctx, fileID, "author", "alice", "manual"); err != nil {
		t.Fatalf("UpsertMeta: %v", err)
	}

	// Update value.
	if err := db.UpsertMeta(ctx, fileID, "author", "bob", "harvester"); err != nil {
		t.Fatalf("UpsertMeta (update): %v", err)
	}

	var val, src string
	if err := db.db.QueryRowContext(ctx,
		"SELECT value, source FROM metadata WHERE file_id = ? AND key = ?", fileID, "author").Scan(&val, &src); err != nil {
		t.Fatalf("select metadata: %v", err)
	}
	if val != "bob" || src != "harvester" {
		t.Fatalf("expected bob/harvester, got %q/%q", val, src)
	}
}
