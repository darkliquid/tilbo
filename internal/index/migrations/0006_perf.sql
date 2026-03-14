-- 0006_perf.sql: performance indexes

-- Speeds up DeleteStaleFiles: WHERE path LIKE ? AND indexed_at < ?
-- SQLite uses the path UNIQUE index for the prefix scan, then needs to check
-- indexed_at for each matching row. With large watch trees this secondary
-- filter benefits from its own index.
CREATE INDEX IF NOT EXISTS files_indexed_at ON files(indexed_at);
