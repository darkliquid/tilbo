package rules

import (
	"context"
	"os"
	"path/filepath"
	"slices"
	"syscall"
	"testing"

	"github.com/darkliquid/tilbo/internal/harvester"
	"github.com/darkliquid/tilbo/internal/index"
	"github.com/darkliquid/tilbo/internal/sidecar"
	"github.com/darkliquid/tilbo/internal/xattr"
)

func setupSweepTest(t *testing.T) (context.Context, *index.DB, *xattr.Service, string) {
	ctx := context.Background()
	dir := t.TempDir()
	dbPath := filepath.Join(dir, "test.db")
	db, err := index.Open(ctx, dbPath)
	if err != nil {
		t.Fatalf("index open: %v", err)
	}
	if err := db.Migrate(ctx); err != nil {
		t.Fatalf("index migrate: %v", err)
	}

	scStore := sidecar.New(db)
	tags := xattr.New(scStore)
	return ctx, db, tags, dir
}

func TestSweeper_Sweep(t *testing.T) {
	ctx, db, tags, dir := setupSweepTest(t)
	defer db.Close()

	// Create a test file
	f1 := filepath.Join(dir, "file1.txt")
	_ = os.WriteFile(f1, []byte("test content"), 0644)

	var st syscall.Stat_t
	if err := syscall.Stat(f1, &st); err != nil {
		t.Fatalf("stat: %v", err)
	}

	// Index the file
	if _, err := db.UpsertFile(ctx, f1, int64(st.Ino), int64(st.Dev), st.Mtim.Sec, st.Size); err != nil {
		t.Fatalf("upsert file: %v", err)
	}

	// Setup a rule
	engine := NewEngine()
	engine.Register(&TOMLRule{
		name:  "test-rule",
		tags:  []string{"test-tag"},
		match: map[string]matchCond{"mime": {glob: "text/plain*"}},
	})

	// Setup harvester to find mime type
	pipeline := harvester.NewPipeline()
	// No built-in harvesters needed if we manually set mime,
	// but let's assume we want to test the full flow.
	// For simplicity, we'll just mock the metadata.

	sweeper := NewSweeper(db, tags, pipeline, engine)

	t.Run("first sweep", func(t *testing.T) {
		// Manually set mime to help the rule fire
		_ = tags.WriteMeta(ctx, f1, "mime", "text/plain")

		if err := sweeper.Sweep(ctx); err != nil {
			t.Fatalf("Sweep failed: %v", err)
		}

		// Verify tags
		summary, err := db.GetFileSummary(ctx, f1)
		if err != nil {
			t.Fatalf("GetFileSummary: %v", err)
		}
		if !slices.Contains(summary.Tags, "test-tag") {
			t.Errorf("expected test-tag, got %v", summary.Tags)
		}
	})

	t.Run("no-op sweep", func(t *testing.T) {
		if err := sweeper.Sweep(ctx); err != nil {
			t.Fatalf("Sweep failed: %v", err)
		}
		// No changes should have happened.
	})
}
