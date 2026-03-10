-- 0005_vec_embeddings.sql: convert embeddings to vec0 virtual table
--
-- Drops the old BLOB-based embeddings table and creates a vec0 virtual table
-- to enable hardware-accelerated/C-optimized approximate nearest neighbors search.

DROP TABLE IF EXISTS file_embeddings;

CREATE VIRTUAL TABLE file_embeddings USING vec0(
    file_id INTEGER PRIMARY KEY,
    embedding float[384]
);

