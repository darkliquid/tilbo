-- 0004_embeddings.sql: Initial vector embedding storage for semantic similarity.
--
-- NOTE: This migration is superseded by 0005_vec_embeddings.sql which drops
-- this table and replaces it with a vec0 virtual table. It is retained for
-- migration history completeness.
--
-- Stores 384-dimensional float32 embeddings (from all-MiniLM-L6-v2) as raw
-- little-endian BLOB values. KNN search was originally performed in Go by
-- loading candidate embeddings into memory and computing L2 distance.

-- Original BLOB-based embedding storage (superseded by 0005).
CREATE TABLE IF NOT EXISTS file_embeddings (
    file_id   INTEGER PRIMARY KEY REFERENCES files(id) ON DELETE CASCADE,
    embedding BLOB    NOT NULL   -- float32[384], little-endian byte order
);
