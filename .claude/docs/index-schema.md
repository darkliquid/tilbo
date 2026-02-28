# Index Schema

All tables live in a single SQLite database at `~/.local/share/tilbo/index.db`.
Use `modernc.org/sqlite` (CGo-free). Enable WAL mode and set `PRAGMA synchronous = NORMAL`.

## Core Tables

```sql
-- Files tracked by the daemon
CREATE TABLE files (
    id           INTEGER PRIMARY KEY,
    path         TEXT    NOT NULL UNIQUE,
    inode        INTEGER NOT NULL,
    device       INTEGER NOT NULL,
    mtime        INTEGER NOT NULL,   -- unix timestamp
    size_bytes   INTEGER NOT NULL,
    content_hash TEXT,               -- optional; populated by content-hash harvester
    indexed_at   INTEGER NOT NULL    -- unix timestamp
);
CREATE INDEX files_inode_device ON files(inode, device);
CREATE INDEX files_mtime ON files(mtime);

-- Tag dictionary
CREATE TABLE tags (
    id          INTEGER PRIMARY KEY,
    name        TEXT    NOT NULL UNIQUE,
    cardinality INTEGER NOT NULL DEFAULT 0  -- updated by trigger
);
CREATE INDEX tags_name ON tags(name);

-- File-tag junction (the core of the graph)
CREATE TABLE file_tags (
    file_id INTEGER NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    tag_id  INTEGER NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
    PRIMARY KEY (file_id, tag_id)
);
CREATE INDEX file_tags_tag_id   ON file_tags(tag_id);
CREATE INDEX file_tags_file_id  ON file_tags(file_id);

-- Arbitrary metadata key-value per file
CREATE TABLE metadata (
    file_id INTEGER NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    key     TEXT    NOT NULL,
    value   TEXT    NOT NULL,
    source  TEXT    NOT NULL,  -- harvester name that produced this value
    PRIMARY KEY (file_id, key)
);
CREATE INDEX metadata_key_value ON metadata(key, value);

-- Tag provenance: which source set which tag
CREATE TABLE tag_provenance (
    file_id INTEGER NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    tag_id  INTEGER NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
    source  TEXT    NOT NULL,  -- 'manual' or 'rule:<rule_name>'
    set_at  INTEGER NOT NULL,
    PRIMARY KEY (file_id, tag_id)
);

-- Per-file rule override: suppress a rule from reapplying a tag
CREATE TABLE tag_overrides (
    file_id      INTEGER NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    tag_id       INTEGER NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
    rule_name    TEXT    NOT NULL,
    suppressed_at INTEGER NOT NULL,
    PRIMARY KEY (file_id, tag_id, rule_name)
);

-- Cardinality maintenance trigger
CREATE TRIGGER tag_cardinality_inc AFTER INSERT ON file_tags BEGIN
    UPDATE tags SET cardinality = cardinality + 1 WHERE id = NEW.tag_id;
END;
CREATE TRIGGER tag_cardinality_dec AFTER DELETE ON file_tags BEGIN
    UPDATE tags SET cardinality = cardinality - 1 WHERE id = OLD.tag_id;
END;
```

## FTS5 Full-Text Index

```sql
-- Virtual FTS5 table over metadata values
CREATE VIRTUAL TABLE metadata_fts USING fts5(
    value,
    content     = 'metadata',
    content_rowid = 'rowid',
    tokenize    = 'unicode61'
);

-- Keep FTS in sync
CREATE TRIGGER metadata_fts_insert AFTER INSERT ON metadata BEGIN
    INSERT INTO metadata_fts(rowid, value) VALUES (new.rowid, new.value);
END;
CREATE TRIGGER metadata_fts_delete BEFORE DELETE ON metadata BEGIN
    INSERT INTO metadata_fts(metadata_fts, rowid, value) VALUES ('delete', old.rowid, old.value);
END;
CREATE TRIGGER metadata_fts_update AFTER UPDATE ON metadata BEGIN
    INSERT INTO metadata_fts(metadata_fts, rowid, value) VALUES ('delete', old.rowid, old.value);
    INSERT INTO metadata_fts(rowid, value) VALUES (new.rowid, new.value);
END;
```

## Vector Embeddings (sqlite-vec)

Load extension at connection open: `conn.LoadExtension("sqlite_vec", "sqlite3_vec_init")`.

```sql
-- Embedding vectors for similarity search
-- Dimension 384 matches all-MiniLM-L6-v2 output
CREATE VIRTUAL TABLE file_embeddings USING vec0(
    file_id INTEGER PRIMARY KEY,
    embedding FLOAT[384]
);
```

**KNN query pattern:**
```sql
SELECT f.path, f.id, distance
FROM file_embeddings
JOIN files f ON f.id = file_embeddings.file_id
WHERE embedding MATCH ?   -- float32 blob
  AND k = 20
ORDER BY distance;
```

**Pre-filtered KNN** (similar files tagged "work"):
```sql
WITH work_files AS (
    SELECT ft.file_id
    FROM file_tags ft
    JOIN tags t ON t.id = ft.tag_id
    WHERE t.name = 'work'
)
SELECT f.path, distance
FROM file_embeddings
JOIN work_files ON work_files.file_id = file_embeddings.file_id
JOIN files f ON f.id = file_embeddings.file_id
WHERE embedding MATCH ?
  AND k = 20
ORDER BY distance;
```

## Tag Intersection Query

```sql
-- Files tagged ALL of: python, work
-- (adjust HAVING count for different set sizes)
SELECT f.path, f.id
FROM files f
JOIN file_tags ft ON ft.file_id = f.id
JOIN tags t ON t.id = ft.tag_id
WHERE t.name IN ('python', 'work')
GROUP BY f.id
HAVING COUNT(DISTINCT t.name) = 2
ORDER BY f.mtime DESC
LIMIT 100;
```

## Graph Traversal (SQLite recursive CTE)

Used as fallback when in-memory graph is not available. For collections > 100k files,
prefer the in-memory BFS in `internal/graph`.

```sql
WITH RECURSIVE
seed_tags(tag_id) AS (
    SELECT id FROM tags WHERE name IN ('python', 'work')
),
reachable(file_id, depth) AS (
    SELECT ft.file_id, 0
    FROM file_tags ft
    WHERE ft.tag_id IN (SELECT tag_id FROM seed_tags)

    UNION

    SELECT ft2.file_id, r.depth + 1
    FROM reachable r
    JOIN file_tags ft1 ON ft1.file_id = r.file_id
    JOIN file_tags ft2 ON ft2.tag_id = ft1.tag_id
    WHERE r.depth < 3   -- hop limit
)
SELECT file_id, MIN(depth) AS min_depth
FROM reachable
GROUP BY file_id
ORDER BY min_depth
LIMIT 100;
```

## Migrations

Use sequential numbered migration files in `internal/index/migrations/`:
```
0001_initial.sql
0002_add_embeddings.sql
0003_add_tag_overrides.sql
```

Track applied migrations in a `schema_migrations` table:
```sql
CREATE TABLE schema_migrations (
    version INTEGER PRIMARY KEY,
    applied_at INTEGER NOT NULL
);
```

Run migrations at daemon startup before accepting any connections.
Migrations must be idempotent (use `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`).
