-- 0004_embeddings.sql: vector embedding storage for semantic similarity search.
--
-- Vectors are stored as raw little-endian float32 blobs (384 dimensions,
-- matching all-MiniLM-L6-v2 output).  KNN search is performed in Go by
-- loading candidate embeddings and computing L2 distance.
--
-- When a compatible sqlite-vec WASM binary becomes available this table can be
-- replaced by a vec0 virtual table for hardware-accelerated ANN search.

CREATE TABLE IF NOT EXISTS file_embeddings (
    file_id   INTEGER PRIMARY KEY REFERENCES files(id) ON DELETE CASCADE,
    embedding BLOB    NOT NULL   -- SerializedFloat32[384], little-endian
);
