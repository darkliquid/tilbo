// Package vectorize provides local ONNX embedding model integration for
// semantic similarity search.
//
// The [ONNXEmbedder] loads a sentence-transformer model (default:
// all-MiniLM-L6-v2) via the hugot library and generates 384-dimensional
// float32 embeddings from concatenated file paths, tags, and textual metadata.
//
// Embeddings are stored in the SQLite index (via sqlite-vec) and used by the
// graph package to blend cosine similarity with tag-graph traversal scores
// for the "related files" feature.
//
// The embedding pipeline runs locally with no network calls after the initial
// model download. It can be disabled entirely via the --embed-disabled flag.
package vectorize
