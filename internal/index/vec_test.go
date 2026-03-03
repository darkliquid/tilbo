package index

import (
	"context"
	"math"
	"path/filepath"
	"testing"
)

func TestSerializeDeserializeFloat32(t *testing.T) {
	in := []float32{0, 1, -1, 0.5, math.Pi, math.SmallestNonzeroFloat32, math.MaxFloat32}
	b := SerializeFloat32(in)
	if len(b) != len(in)*4 {
		t.Fatalf("expected %d bytes, got %d", len(in)*4, len(b))
	}
	out := DeserializeFloat32(b)
	if len(out) != len(in) {
		t.Fatalf("expected %d floats, got %d", len(in), len(out))
	}
	for i := range in {
		if in[i] != out[i] {
			t.Errorf("index %d: want %v, got %v", i, in[i], out[i])
		}
	}
}

func makeVec(seed float32) []float32 {
	v := make([]float32, EmbeddingDim)
	for i := range v {
		v[i] = seed + float32(i)*0.001
	}
	return v
}

func openTestDB(t *testing.T) *DB {
	t.Helper()
	ctx := context.Background()
	db, err := Open(ctx, filepath.Join(t.TempDir(), "test.db"))
	if err != nil {
		t.Fatalf("Open: %v", err)
	}
	t.Cleanup(func() { db.Close() })
	return db
}

func TestUpsertEmbedding(t *testing.T) {
	ctx := context.Background()
	db := openTestDB(t)

	fileID, err := db.UpsertFile(ctx, "/tmp/a.txt", 1, 1, 100, 10)
	if err != nil {
		t.Fatalf("UpsertFile: %v", err)
	}

	vec := makeVec(0.1)
	if err := db.UpsertEmbedding(ctx, fileID, vec); err != nil {
		t.Fatalf("UpsertEmbedding: %v", err)
	}

	// Upsert again with different values — must not error.
	vec2 := makeVec(0.9)
	if err := db.UpsertEmbedding(ctx, fileID, vec2); err != nil {
		t.Fatalf("UpsertEmbedding (overwrite): %v", err)
	}
}

func TestUpsertEmbeddingWrongDim(t *testing.T) {
	ctx := context.Background()
	db := openTestDB(t)

	fileID, _ := db.UpsertFile(ctx, "/tmp/b.txt", 2, 1, 100, 10)
	if err := db.UpsertEmbedding(ctx, fileID, []float32{1, 2, 3}); err == nil {
		t.Fatal("expected error for wrong dimension, got nil")
	}
}

func TestDeleteEmbedding(t *testing.T) {
	ctx := context.Background()
	db := openTestDB(t)

	fileID, _ := db.UpsertFile(ctx, "/tmp/c.txt", 3, 1, 100, 10)

	if err := db.UpsertEmbedding(ctx, fileID, makeVec(0.5)); err != nil {
		t.Fatalf("UpsertEmbedding: %v", err)
	}
	if err := db.DeleteEmbedding(ctx, fileID); err != nil {
		t.Fatalf("DeleteEmbedding: %v", err)
	}
	// Deleting a non-existent embedding must be a no-op.
	if err := db.DeleteEmbedding(ctx, fileID); err != nil {
		t.Fatalf("DeleteEmbedding (no-op): %v", err)
	}
}

func TestKNNSearch(t *testing.T) {
	ctx := context.Background()
	db := openTestDB(t)

	// Insert three files with distinct embeddings.
	paths := []string{"/tmp/x.txt", "/tmp/y.txt", "/tmp/z.txt"}
	seeds := []float32{0.1, 0.5, 0.9}
	ids := make([]int64, len(paths))
	for i, p := range paths {
		id, err := db.UpsertFile(ctx, p, int64(i+10), 1, 100, 10)
		if err != nil {
			t.Fatalf("UpsertFile %s: %v", p, err)
		}
		ids[i] = id
		if err := db.UpsertEmbedding(ctx, id, makeVec(seeds[i])); err != nil {
			t.Fatalf("UpsertEmbedding %s: %v", p, err)
		}
	}

	// Query closest to seed 0.1 — /tmp/x.txt should be first.
	results, err := db.KNNSearch(ctx, makeVec(0.1), 3, nil)
	if err != nil {
		t.Fatalf("KNNSearch: %v", err)
	}
	if len(results) == 0 {
		t.Fatal("expected results, got none")
	}
	if results[0].Path != "/tmp/x.txt" {
		t.Errorf("expected /tmp/x.txt as nearest, got %s", results[0].Path)
	}
}

func TestKNNSearchWithTagFilter(t *testing.T) {
	ctx := context.Background()
	db := openTestDB(t)

	// Insert two files; tag only one.
	id1, _ := db.UpsertFile(ctx, "/tmp/tagged.txt", 20, 1, 100, 10)
	id2, _ := db.UpsertFile(ctx, "/tmp/untagged.txt", 21, 1, 100, 10)

	_ = db.UpsertEmbedding(ctx, id1, makeVec(0.1))
	_ = db.UpsertEmbedding(ctx, id2, makeVec(0.1))

	tagID, _ := db.UpsertTag(ctx, "work")
	_ = db.AddFileTag(ctx, id1, tagID)

	// Search with tag filter — only tagged file should appear.
	results, err := db.KNNSearch(ctx, makeVec(0.1), 10, []string{"work"})
	if err != nil {
		t.Fatalf("KNNSearch with filter: %v", err)
	}
	for _, r := range results {
		if r.Path != "/tmp/tagged.txt" {
			t.Errorf("unexpected result %s in tag-filtered KNN", r.Path)
		}
	}
}

func TestKNNSearchWrongDim(t *testing.T) {
	ctx := context.Background()
	db := openTestDB(t)
	if _, err := db.KNNSearch(ctx, []float32{1, 2, 3}, 5, nil); err == nil {
		t.Fatal("expected error for wrong query dimension")
	}
}
