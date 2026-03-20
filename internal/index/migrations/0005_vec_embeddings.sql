-- 0005_vec_embeddings.sql: Upgrade embeddings to sqlite-vec virtual table.
--
-- Replaces the plain BLOB-based file_embeddings table (from 0004) with a vec0
-- virtual table provided by the sqlite-vec extension. This enables C-optimized
-- approximate nearest neighbor (ANN) search directly in SQLite, eliminating
-- the need to load all embeddings into Go memory for brute-force KNN.
--
-- The embedding dimension (384 floats) matches the all-MiniLM-L6-v2 model
-- output used by tilbo's semantic search feature.

-- Drop the old BLOB-based embeddings table.
DROP TABLE IF EXISTS file_embeddings;

-- Create a vec0 virtual table for hardware-accelerated ANN search.
-- file_id maps to files.id; embedding stores 384-dimensional float vectors.
CREATE VIRTUAL TABLE file_embeddings USING vec0(
    file_id INTEGER PRIMARY KEY,
    embedding float[384]
);

