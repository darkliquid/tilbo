// Package graph provides an in-memory bipartite file-tag graph used to power
// the "related files" feature (M4). File nodes carry the key "f:<path>";
// tag nodes carry the key "t:<name>". Adjacency maps are maintained alongside
// the dominikbraun/graph backing store to provide O(1) neighbour lookup
// during BFS traversal.
package graph

import (
	"context"
	"math"
	"sort"
	"strings"
	"sync"

	dgraph "github.com/dominikbraun/graph"
)

const (
	filePrefix = "f:"
	tagPrefix  = "t:"
)

// RelatedFile is a scored related-file result returned by Related.
type RelatedFile struct {
	Path        string
	Score       float64
	HopDistance int
}

// Graph is a thread-safe bipartite in-memory graph between file and tag nodes.
type Graph struct {
	mu sync.RWMutex

	g       dgraph.Graph[string, string] // backing store
	fileAdj map[string]map[string]struct{} // fileKey → set of tagKeys
	tagAdj  map[string]map[string]struct{} // tagKey  → set of fileKeys

	fileEmbeddings map[string][]float32

	tagCardinality map[string]int // tagname → #files
	totalFiles     int
}

// New returns an empty Graph.
func New() *Graph {
	return &Graph{
		g:              dgraph.New(dgraph.StringHash),
		fileAdj:        make(map[string]map[string]struct{}),
		tagAdj:         make(map[string]map[string]struct{}),
		fileEmbeddings: make(map[string][]float32),
		tagCardinality: make(map[string]int),
	}
}

// Load replaces the entire graph contents with the provided file-tag pairs.
// Each element is [path, tagname]. The context is accepted for API consistency
// but is not used.
func (g *Graph) Load(_ context.Context, pairs [][2]string) {
	g.mu.Lock()
	defer g.mu.Unlock()

	g.g = dgraph.New(dgraph.StringHash)
	g.fileAdj = make(map[string]map[string]struct{})
	g.tagAdj = make(map[string]map[string]struct{})

	for _, p := range pairs {
		g.addEdgeLocked(p[0], p[1])
	}
	g.rebuildCountsLocked()
}

// LoadEmbeddings populates the graph's embedding lookup for similarity blending.
// Typically called shortly after Load.
func (g *Graph) LoadEmbeddings(_ context.Context, embs map[string][]float32) {
	g.mu.Lock()
	defer g.mu.Unlock()

	for path, vec := range embs {
		g.fileEmbeddings[filePrefix+path] = vec
	}
}

// SetEmbedding updates the embedding vector for a single path.
func (g *Graph) SetEmbedding(path string, vec []float32) {
	g.mu.Lock()
	defer g.mu.Unlock()
	g.fileEmbeddings[filePrefix+path] = vec
}

// SetFileTags updates the graph so that path's tag-set exactly equals tagNames.
func (g *Graph) SetFileTags(path string, tagNames []string) {
	g.mu.Lock()
	defer g.mu.Unlock()

	fk := filePrefix + path

	// Remove old edges.
	if old, ok := g.fileAdj[fk]; ok {
		for tk := range old {
			_ = g.g.RemoveEdge(fk, tk)
			delete(g.tagAdj[tk], fk)
		}
	}
	_ = g.g.RemoveVertex(fk)
	delete(g.fileAdj, fk)

	for _, name := range tagNames {
		g.addEdgeLocked(path, name)
	}
	g.rebuildCountsLocked()
}

// RemoveFile removes path and all its edges from the graph.
func (g *Graph) RemoveFile(path string) {
	g.mu.Lock()
	defer g.mu.Unlock()

	fk := filePrefix + path
	if old, ok := g.fileAdj[fk]; ok {
		for tk := range old {
			_ = g.g.RemoveEdge(fk, tk)
			delete(g.tagAdj[tk], fk)
		}
	}
	_ = g.g.RemoveVertex(fk)
	delete(g.fileAdj, fk)
	delete(g.fileEmbeddings, fk)
	g.rebuildCountsLocked()
}

// Related returns at most limit files related to seedPath via multi-hop BFS.
// maxHops is the maximum number of file→tag→file traversal steps (1 = direct
// tag neighbours). hopWeight scales the per-hop IDF contribution. Files
// accumulate score from all connecting tags in the same hop (multi-path
// credit) but are not re-scored at later hops.
//
// Two mechanisms bound traversal cost for large corpora:
//  1. Tags whose cardinality exceeds 5% of total files are skipped (stopword
//     removal analogue); their IDF is near-zero anyway.
//  2. The BFS frontier is capped at limit×20 per hop; only the highest-scored
//     files advance to keep work per hop bounded.
func (g *Graph) Related(_ context.Context, seedPath string, maxHops, limit int, hopWeight, vecWeight float64) []RelatedFile {
	g.mu.RLock()
	defer g.mu.RUnlock()

	fk := filePrefix + seedPath
	if _, ok := g.fileAdj[fk]; !ok {
		return nil
	}

	// High-cardinality skip: tags in >5% of files are too generic for useful
	// traversal. Minimum threshold of 50 avoids skipping everything on tiny graphs.
	maxCard := g.totalFiles / 20
	if maxCard < 50 {
		maxCard = 50
	}

	// Frontier cap: keeps work per hop at O(cap × tagsPerFile × maxCardinality).
	// Factor of 8 balances result quality (enough candidates) against latency.
	const frontierFactor = 8
	maxFrontier := limit * frontierFactor
	if maxFrontier <= 0 {
		maxFrontier = 400
	}

	seedVec, hasSeedVec := g.fileEmbeddings[fk]

	type result struct {
		score float64
		hop   int
	}
	scores := make(map[string]result)

	// scored tracks files already assigned a hop so they are not re-scored.
	scored := map[string]struct{}{fk: {}}
	frontier := map[string]struct{}{fk: {}}

	for hop := 1; hop <= maxHops; hop++ {
		// Accumulate scores for new neighbours discovered this hop.
		pending := make(map[string]float64)

		for curFk := range frontier {
			for tk := range g.fileAdj[curFk] {
				tagName := strings.TrimPrefix(tk, tagPrefix)
				card := g.tagCardinality[tagName]
				if card >= maxCard {
					continue // skip high-cardinality stopword tags
				}
				idf := math.Log2(float64(g.totalFiles+1) / float64(card+1))
				contrib := hopWeight * idf / float64(hop)

				for nfk := range g.tagAdj[tk] {
					if _, seen := scored[nfk]; seen {
						continue
					}
					pending[nfk] += contrib
				}
			}
		}

		if len(pending) == 0 {
			break
		}

		// Build next frontier, capped at maxFrontier.
		if len(pending) <= maxFrontier {
			nextFrontier := make(map[string]struct{}, len(pending))
			for nfk, sc := range pending {
				scores[nfk] = result{score: sc, hop: hop}
				scored[nfk] = struct{}{}
				nextFrontier[nfk] = struct{}{}
			}
			frontier = nextFrontier
		} else {
			// Keep only the top-scoring candidates for the next hop.
			type kv struct {
				k  string
				sc float64
			}
			sl := make([]kv, 0, len(pending))
			for k, sc := range pending {
				sl = append(sl, kv{k, sc})
			}
			sort.Slice(sl, func(i, j int) bool { return sl[i].sc > sl[j].sc })
			nextFrontier := make(map[string]struct{}, maxFrontier)
			for _, item := range sl {
				scores[item.k] = result{score: item.sc, hop: hop}
				scored[item.k] = struct{}{}
				if len(nextFrontier) < maxFrontier {
					nextFrontier[item.k] = struct{}{}
				}
			}
			frontier = nextFrontier
		}

		// Apply vector similarity boost exactly once per discovered target
		if hasSeedVec {
			for nfk := range pending {
				if tgtVec, ok := g.fileEmbeddings[nfk]; ok {
					sim := cosineSimilarity(seedVec, tgtVec)
					if sim > 0 {
						// Only boost positive similarities
						r := scores[nfk]
						r.score += (sim * vecWeight)
						scores[nfk] = r
					}
				}
			}
		}
	}

	out := make([]RelatedFile, 0, len(scores))
	for fk, r := range scores {
		out = append(out, RelatedFile{
			Path:        strings.TrimPrefix(fk, filePrefix),
			Score:       r.score,
			HopDistance: r.hop,
		})
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Score > out[j].Score })
	if limit > 0 && len(out) > limit {
		out = out[:limit]
	}
	return out
}

// addEdgeLocked inserts a file→tag edge (caller must hold write lock).
func (g *Graph) addEdgeLocked(path, tagName string) {
	fk := filePrefix + path
	tk := tagPrefix + tagName

	_ = g.g.AddVertex(fk)
	_ = g.g.AddVertex(tk)
	_ = g.g.AddEdge(fk, tk)

	if g.fileAdj[fk] == nil {
		g.fileAdj[fk] = make(map[string]struct{})
	}
	g.fileAdj[fk][tk] = struct{}{}

	if g.tagAdj[tk] == nil {
		g.tagAdj[tk] = make(map[string]struct{})
	}
	g.tagAdj[tk][fk] = struct{}{}
}

// rebuildCountsLocked recomputes totalFiles and tagCardinality from the
// current adjacency maps (caller must hold write lock).
func (g *Graph) rebuildCountsLocked() {
	g.totalFiles = len(g.fileAdj)
	g.tagCardinality = make(map[string]int, len(g.tagAdj))
	for tk, nbrs := range g.tagAdj {
		g.tagCardinality[strings.TrimPrefix(tk, tagPrefix)] = len(nbrs)
	}
}

// cosineSimilarity computes the cosine similarity between two float32 slices.
// Requires identical dimensions.
func cosineSimilarity(a, b []float32) float64 {
	if len(a) != len(b) || len(a) == 0 {
		return 0.0
	}
	var dot, normA, normB float64
	for i := range a {
		va := float64(a[i])
		vb := float64(b[i])
		dot += va * vb
		normA += va * va
		normB += vb * vb
	}
	if normA == 0 || normB == 0 {
		return 0.0
	}
	return dot / (math.Sqrt(normA) * math.Sqrt(normB))
}
