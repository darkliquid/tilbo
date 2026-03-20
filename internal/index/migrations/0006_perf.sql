-- 0006_perf.sql: Performance optimization indexes.
--
-- Adds secondary indexes that are not required for correctness but
-- significantly improve query performance on large indexes (100k+ files).

-- Speeds up the DeleteStaleFiles query: WHERE path LIKE ? AND indexed_at < ?.
-- SQLite can use the existing path UNIQUE index for the LIKE prefix scan, but
-- then must do a full scan of matching rows to check indexed_at. This index
-- allows SQLite to efficiently filter by indexed_at without a table scan,
-- which matters for large watched directory trees during cleanup after scans.
CREATE INDEX IF NOT EXISTS files_indexed_at ON files(indexed_at);
