// Package graph implements the tag relationship graph used for related-file queries.
//
// The graph is built in-memory from the SQLite index on daemon startup and updated
// incrementally as files are tagged. It supports weighted BFS traversal to find
// files related to a seed file via shared tags.
//
// # Scoring
//
// Related files are ranked by a combination of tag-graph traversal and optional
// vector similarity:
//
//  1. Tag Graph: A weighted IDF score across shared tags, decayed by hop distance.
//     Tags shared by many files contribute less (inverse document frequency). Tags
//     with cardinality above 5% of total indexed files are treated as stopwords and
//     skipped entirely to prevent common tags from dominating results.
//
//  2. Vector Similarity: If embeddings are available, a cosine similarity boost is
//     applied to candidates found during graph traversal. The hop_weight and
//     vec_weight parameters control the blend.
//
// # Frontier Bounds
//
// The BFS frontier is capped at limit×8 candidates per hop to bound traversal
// cost on large corpora with dense tag graphs. Some reachable files may not
// appear in results when the frontier is saturated.
//
// # Lifecycle
//
// The graph is an in-memory snapshot that does not persist across daemon restarts.
// It is always rebuilt from the index on startup.
package graph
