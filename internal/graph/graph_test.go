package graph

import (
	"context"
	"testing"
)

func TestGraph_EmptyRelated(t *testing.T) {
	g := New()
	got := g.Related(context.Background(), "/no/such/file", 3, 10, 1.0)
	if len(got) != 0 {
		t.Fatalf("expected no results, got %v", got)
	}
}

func TestGraph_DirectNeighbours(t *testing.T) {
	g := New()
	// seed shares "video" tag with /b and /c.
	g.SetFileTags("/a", []string{"video", "action"})
	g.SetFileTags("/b", []string{"video"})
	g.SetFileTags("/c", []string{"video", "action"})
	g.SetFileTags("/d", []string{"comedy"})

	results := g.Related(context.Background(), "/a", 1, 10, 1.0)

	paths := make(map[string]bool)
	for _, r := range results {
		paths[r.Path] = true
		if r.HopDistance != 1 {
			t.Errorf("expected hop 1 for %q, got %d", r.Path, r.HopDistance)
		}
	}
	if !paths["/b"] {
		t.Error("expected /b in results")
	}
	if !paths["/c"] {
		t.Error("expected /c in results")
	}
	if paths["/d"] {
		t.Error("/d shares no tags with /a; should not appear")
	}
}

func TestGraph_MultiTagBoost(t *testing.T) {
	g := New()
	// /a shares both "video" and "action" with /b, but only "video" with /c.
	g.SetFileTags("/a", []string{"video", "action"})
	g.SetFileTags("/b", []string{"video", "action"})
	g.SetFileTags("/c", []string{"video"})

	results := g.Related(context.Background(), "/a", 1, 10, 1.0)
	if len(results) < 2 {
		t.Fatalf("expected at least 2 results, got %v", results)
	}
	// /b should score higher than /c because it shares two tags.
	if results[0].Path != "/b" {
		t.Errorf("expected /b first (higher score), got %q (score %.4f)",
			results[0].Path, results[0].Score)
	}
}

func TestGraph_HopDecay(t *testing.T) {
	// Chain: /a -[x]-> /b -[y]-> /c
	// /c is hop-2 from /a; /b is hop-1. /b should rank higher.
	g := New()
	g.SetFileTags("/a", []string{"x"})
	g.SetFileTags("/b", []string{"x", "y"})
	g.SetFileTags("/c", []string{"y"})

	results := g.Related(context.Background(), "/a", 2, 10, 1.0)
	if len(results) < 2 {
		t.Fatalf("expected 2 results, got %v", results)
	}
	if results[0].Path != "/b" {
		t.Errorf("expected /b first (hop-1), got %q", results[0].Path)
	}
	if results[1].Path != "/c" {
		t.Errorf("expected /c second (hop-2), got %q", results[1].Path)
	}
	if results[1].HopDistance != 2 {
		t.Errorf("expected hop 2 for /c, got %d", results[1].HopDistance)
	}
}

func TestGraph_MaxHopsRespected(t *testing.T) {
	// Chain: /a -[x]-> /b -[y]-> /c; with maxHops=1, /c should not appear.
	g := New()
	g.SetFileTags("/a", []string{"x"})
	g.SetFileTags("/b", []string{"x", "y"})
	g.SetFileTags("/c", []string{"y"})

	results := g.Related(context.Background(), "/a", 1, 10, 1.0)
	for _, r := range results {
		if r.Path == "/c" {
			t.Error("/c should not appear with maxHops=1")
		}
	}
}

func TestGraph_LimitRespected(t *testing.T) {
	g := New()
	g.SetFileTags("/a", []string{"t1", "t2", "t3"})
	g.SetFileTags("/b", []string{"t1"})
	g.SetFileTags("/c", []string{"t2"})
	g.SetFileTags("/d", []string{"t3"})

	results := g.Related(context.Background(), "/a", 1, 2, 1.0)
	if len(results) != 2 {
		t.Fatalf("expected limit=2, got %d results", len(results))
	}
}

func TestGraph_RemoveFile(t *testing.T) {
	g := New()
	g.SetFileTags("/a", []string{"video"})
	g.SetFileTags("/b", []string{"video"})
	g.RemoveFile("/b")

	results := g.Related(context.Background(), "/a", 1, 10, 1.0)
	for _, r := range results {
		if r.Path == "/b" {
			t.Error("/b should not appear after RemoveFile")
		}
	}
}

func TestGraph_Load(t *testing.T) {
	g := New()
	pairs := [][2]string{
		{"/a", "video"},
		{"/b", "video"},
		{"/b", "action"},
	}
	g.Load(context.Background(), pairs)

	results := g.Related(context.Background(), "/a", 1, 10, 1.0)
	found := false
	for _, r := range results {
		if r.Path == "/b" {
			found = true
		}
	}
	if !found {
		t.Error("expected /b in results after Load")
	}
}

func TestGraph_SeedNotInResults(t *testing.T) {
	g := New()
	g.SetFileTags("/a", []string{"video"})
	g.SetFileTags("/b", []string{"video"})

	results := g.Related(context.Background(), "/a", 1, 10, 1.0)
	for _, r := range results {
		if r.Path == "/a" {
			t.Error("seed file should not appear in Related results")
		}
	}
}

func BenchmarkGraph_Related(b *testing.B) {
	g := New()
	// Build a moderately large graph: 1000 files, each with 5 tags from a pool of 100.
	tags := make([]string, 100)
	for i := range tags {
		tags[i] = "tag" + string(rune('A'+i%26)) + string(rune('0'+i/26))
	}
	for i := 0; i < 1000; i++ {
		fileTags := make([]string, 5)
		for j := range fileTags {
			fileTags[j] = tags[(i+j)%len(tags)]
		}
		path := "/file/" + string(rune('a'+i%26)) + string(rune('0'+i/26))
		g.SetFileTags(path, fileTags)
	}

	seed := "/fileA0"
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		g.Related(context.Background(), seed, 2, 20, 1.0)
	}
}
