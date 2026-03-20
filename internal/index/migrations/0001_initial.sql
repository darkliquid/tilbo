-- 0001_initial.sql: Core schema for the tilbo file index.
--
-- This migration establishes the foundational tables for tilbo's SQLite index:
--
--   schema_migrations - Tracks which migrations have been applied.
--   files             - One row per indexed file, identified by path and inode/device.
--   tags              - Unique tag names with a denormalized cardinality counter.
--   file_tags         - Many-to-many join between files and tags.
--   metadata          - Arbitrary key-value pairs per file (from harvesters).
--   tag_provenance    - Records which source applied each tag and when.
--   tag_overrides     - Rules that suppress specific tags on specific files.
--
-- All child tables use ON DELETE CASCADE so removing a file automatically
-- cleans up its tags, metadata, provenance, and overrides.
--
-- Two triggers maintain the tags.cardinality counter in real time so that
-- tag popularity queries avoid expensive COUNT(*) aggregations.

-- Tracks applied migration versions to support incremental schema upgrades.
CREATE TABLE IF NOT EXISTS schema_migrations (
    version    INTEGER PRIMARY KEY,
    applied_at INTEGER NOT NULL       -- Unix epoch seconds when this migration was applied
);

-- Core file table: one row per indexed filesystem entry. The (inode, device)
-- pair provides a stable identity that survives renames within the same
-- filesystem.
CREATE TABLE IF NOT EXISTS files (
    id           INTEGER PRIMARY KEY,
    path         TEXT    NOT NULL UNIQUE,  -- Absolute filesystem path
    inode        INTEGER NOT NULL,         -- stat(2) st_ino
    device       INTEGER NOT NULL,         -- stat(2) st_dev
    mtime        INTEGER NOT NULL,         -- Last modification time (Unix epoch seconds)
    size_bytes   INTEGER NOT NULL,         -- File size
    content_hash TEXT,                     -- Optional content hash (e.g. xxhash) for dedup
    indexed_at   INTEGER NOT NULL          -- When this row was last upserted (scan timestamp)
);
-- Used by sidecar lookups and rename detection.
CREATE INDEX IF NOT EXISTS files_inode_device ON files(inode, device);
-- Supports sorting/filtering by modification time.
CREATE INDEX IF NOT EXISTS files_mtime ON files(mtime);

-- Unique tag names. The cardinality column is maintained by triggers and
-- counts how many files currently have this tag.
CREATE TABLE IF NOT EXISTS tags (
    id          INTEGER PRIMARY KEY,
    name        TEXT    NOT NULL UNIQUE,
    cardinality INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS tags_name ON tags(name);

-- Many-to-many association between files and tags.
CREATE TABLE IF NOT EXISTS file_tags (
    file_id INTEGER NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    tag_id  INTEGER NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
    PRIMARY KEY (file_id, tag_id)
);
-- Supports lookups in both directions: "tags for file" and "files for tag".
CREATE INDEX IF NOT EXISTS file_tags_tag_id  ON file_tags(tag_id);
CREATE INDEX IF NOT EXISTS file_tags_file_id ON file_tags(file_id);

-- Arbitrary key-value metadata per file. Each key is unique per file.
-- The source column records which harvester produced the value (e.g. "exif",
-- "xattr", "manual").
CREATE TABLE IF NOT EXISTS metadata (
    file_id INTEGER NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    key     TEXT    NOT NULL,
    value   TEXT    NOT NULL,
    source  TEXT    NOT NULL,       -- Harvester or "manual" for user-set values
    PRIMARY KEY (file_id, key)
);
-- Supports metadata filter queries like "find files where width >= 1280".
CREATE INDEX IF NOT EXISTS metadata_key_value ON metadata(key, value);

-- Records which source applied each tag to each file, and when. Used for
-- debugging and conflict resolution when multiple harvesters claim the
-- same tag.
CREATE TABLE IF NOT EXISTS tag_provenance (
    file_id INTEGER NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    tag_id  INTEGER NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
    source  TEXT    NOT NULL,       -- Source name (harvester or rule)
    set_at  INTEGER NOT NULL,       -- Unix epoch seconds when the tag was applied
    PRIMARY KEY (file_id, tag_id)
);

-- Allows rules to suppress (override/block) tags that would otherwise be
-- applied by harvesters. For example, a rule might suppress the "photo" tag
-- on screenshot files even though the MIME harvester would add it.
CREATE TABLE IF NOT EXISTS tag_overrides (
    file_id       INTEGER NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    tag_id        INTEGER NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
    rule_name     TEXT    NOT NULL,    -- Name of the rule that created this override
    suppressed_at INTEGER NOT NULL,    -- Unix epoch seconds when the override was created
    PRIMARY KEY (file_id, tag_id, rule_name)
);

-- Automatically increment a tag's cardinality when a file is tagged.
CREATE TRIGGER IF NOT EXISTS tag_cardinality_inc AFTER INSERT ON file_tags BEGIN
    UPDATE tags SET cardinality = cardinality + 1 WHERE id = NEW.tag_id;
END;

-- Automatically decrement a tag's cardinality when a tag is removed from a file.
CREATE TRIGGER IF NOT EXISTS tag_cardinality_dec AFTER DELETE ON file_tags BEGIN
    UPDATE tags SET cardinality = cardinality - 1 WHERE id = OLD.tag_id;
END;
