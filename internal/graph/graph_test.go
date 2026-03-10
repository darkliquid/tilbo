package graph

import (
	"context"
	"fmt"
	"slices"
	"testing"
	"time"
)

func TestGraph_EmptyRelated(t *testing.T) {
	g := New()
	got := g.Related(context.Background(), "/no/such/file", 3, 10, 1.0, 0.4)
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

	results := g.Related(context.Background(), "/a", 1, 10, 1.0, 0.4)

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

	results := g.Related(context.Background(), "/a", 1, 10, 1.0, 0.4)
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

	results := g.Related(context.Background(), "/a", 2, 10, 1.0, 0.4)
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

	results := g.Related(context.Background(), "/a", 1, 10, 1.0, 0.4)
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

	results := g.Related(context.Background(), "/a", 1, 2, 1.0, 0.4)
	if len(results) != 2 {
		t.Fatalf("expected limit=2, got %d results", len(results))
	}
}

func TestGraph_RemoveFile(t *testing.T) {
	g := New()
	g.SetFileTags("/a", []string{"video"})
	g.SetFileTags("/b", []string{"video"})
	g.RemoveFile("/b")

	results := g.Related(context.Background(), "/a", 1, 10, 1.0, 0.4)
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

	results := g.Related(context.Background(), "/a", 1, 10, 1.0, 0.4)
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

	results := g.Related(context.Background(), "/a", 1, 10, 1.0, 0.4)
	for _, r := range results {
		if r.Path == "/a" {
			t.Error("seed file should not appear in Related results")
		}
	}
}

// buildGraph constructs a graph using Load() with a bimodal tag distribution
// that mimics real-world corpora: a small number of generic "common" tags
// (high cardinality, automatically stopworded during BFS) and a large pool of
// specific tags (low cardinality, actually traversed).
//
// nCommonTags tags each appear in ~nFiles/nCommonTags files (high cardinality).
// nSpecificTags tags share the remaining tag slots among files (low cardinality).
// Returns the graph and the path of the first file.
func buildGraph(nFiles, nCommonTags, nSpecificTags, tagsPerFile int) (*Graph, string) {
	pairs := make([][2]string, 0, nFiles*tagsPerFile)
	firstPath := ""
	for i := 0; i < nFiles; i++ {
		path := fmt.Sprintf("/bench/%d", i)
		if i == 0 {
			firstPath = path
		}
		// One common tag per file (high cardinality, will be stopworded).
		commonTag := fmt.Sprintf("common%d", i%nCommonTags)
		pairs = append(pairs, [2]string{path, commonTag})
		// Remaining tags from the specific pool (low cardinality).
		for j := 1; j < tagsPerFile; j++ {
			tagIdx := ((i*(j*7+1) + j*13) % nSpecificTags)
			pairs = append(pairs, [2]string{path, fmt.Sprintf("specific%d", tagIdx)})
		}
	}
	g := New()
	g.Load(context.Background(), pairs)
	return g, firstPath
}

func BenchmarkGraph_Related_1k(b *testing.B) {
	// 1k files, 5 common tags (~200 each), 200 specific tags (~16 each).
	g, seed := buildGraph(1_000, 5, 200, 5)
	b.ResetTimer()
	for b.Loop() {
		g.Related(context.Background(), seed, 3, 100, 1.0, 0.4)
	}
}

func BenchmarkGraph_Related_10k(b *testing.B) {
	// 10k files, 10 common tags (~1k each), 500 specific tags (~80 each).
	g, seed := buildGraph(10_000, 10, 500, 5)
	b.ResetTimer()
	for b.Loop() {
		g.Related(context.Background(), seed, 3, 100, 1.0, 0.4)
	}
}

func BenchmarkGraph_Related_100k(b *testing.B) {
	// 100k files, 20 common tags (~5k each, at the 5% stopword boundary),
	// 5000 specific tags (~80 each). Realistic power-law corpus.
	g, seed := buildGraph(100_000, 20, 5_000, 5)
	b.ResetTimer()

	timings := make([]int64, 0, b.N)
	for b.Loop() {
		t0 := time.Now()
		g.Related(context.Background(), seed, 3, 100, 1.0, 0.4)
		timings = append(timings, time.Since(t0).Nanoseconds())
	}
	b.StopTimer()

	if len(timings) > 0 {
		slices.Sort(timings)
		p50 := timings[len(timings)/2]
		p99 := timings[int(float64(len(timings))*0.99)]
		b.ReportMetric(float64(p50), "ns/p50")
		b.ReportMetric(float64(p99), "ns/p99")
		// Assert p99 < 50ms target from M4 milestone spec.
		if p99 > 50_000_000 {
			b.Errorf("p99 latency %dms exceeds 50ms target", p99/1_000_000)
		}
	}
}
