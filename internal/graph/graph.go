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

	tagCardinality map[string]int // tagname → #files
	totalFiles     int
}

// New returns an empty Graph.
func New() *Graph {
	return &Graph{
		g:              dgraph.New(dgraph.StringHash),
		fileAdj:        make(map[string]map[string]struct{}),
		tagAdj:         make(map[string]map[string]struct{}),
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
	g.rebuildCountsLocked()
}

// Related returns at most limit files related to seedPath via multi-hop BFS.
// maxHops is the maximum number of file→tag→file traversal steps (1 = direct
// tag neighbours). hopWeight scales the per-hop IDF contribution. Files
// accumulate score from all connecting tags in the same hop (multi-path
// credit) but are not re-scored at later hops.
func (g *Graph) Related(_ context.Context, seedPath string, maxHops, limit int, hopWeight float64) []RelatedFile {
	g.mu.RLock()
	defer g.mu.RUnlock()

	fk := filePrefix + seedPath
	if _, ok := g.fileAdj[fk]; !ok {
		return nil
	}

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

		nextFrontier := make(map[string]struct{}, len(pending))
		for nfk, sc := range pending {
			scores[nfk] = result{score: sc, hop: hop}
			scored[nfk] = struct{}{}
			nextFrontier[nfk] = struct{}{}
		}
		frontier = nextFrontier
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
