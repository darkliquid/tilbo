-- 0001_initial.sql: core schema for tilbo index

CREATE TABLE IF NOT EXISTS schema_migrations (
    version    INTEGER PRIMARY KEY,
    applied_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS files (
    id           INTEGER PRIMARY KEY,
    path         TEXT    NOT NULL UNIQUE,
    inode        INTEGER NOT NULL,
    device       INTEGER NOT NULL,
    mtime        INTEGER NOT NULL,
    size_bytes   INTEGER NOT NULL,
    content_hash TEXT,
    indexed_at   INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS files_inode_device ON files(inode, device);
CREATE INDEX IF NOT EXISTS files_mtime ON files(mtime);

CREATE TABLE IF NOT EXISTS tags (
    id          INTEGER PRIMARY KEY,
    name        TEXT    NOT NULL UNIQUE,
    cardinality INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS tags_name ON tags(name);

CREATE TABLE IF NOT EXISTS file_tags (
    file_id INTEGER NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    tag_id  INTEGER NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
    PRIMARY KEY (file_id, tag_id)
);
CREATE INDEX IF NOT EXISTS file_tags_tag_id  ON file_tags(tag_id);
CREATE INDEX IF NOT EXISTS file_tags_file_id ON file_tags(file_id);

CREATE TABLE IF NOT EXISTS metadata (
    file_id INTEGER NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    key     TEXT    NOT NULL,
    value   TEXT    NOT NULL,
    source  TEXT    NOT NULL,
    PRIMARY KEY (file_id, key)
);
CREATE INDEX IF NOT EXISTS metadata_key_value ON metadata(key, value);

CREATE TABLE IF NOT EXISTS tag_provenance (
    file_id INTEGER NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    tag_id  INTEGER NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
    source  TEXT    NOT NULL,
    set_at  INTEGER NOT NULL,
    PRIMARY KEY (file_id, tag_id)
);

CREATE TABLE IF NOT EXISTS tag_overrides (
    file_id       INTEGER NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    tag_id        INTEGER NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
    rule_name     TEXT    NOT NULL,
    suppressed_at INTEGER NOT NULL,
    PRIMARY KEY (file_id, tag_id, rule_name)
);

CREATE TRIGGER IF NOT EXISTS tag_cardinality_inc AFTER INSERT ON file_tags BEGIN
    UPDATE tags SET cardinality = cardinality + 1 WHERE id = NEW.tag_id;
END;

CREATE TRIGGER IF NOT EXISTS tag_cardinality_dec AFTER DELETE ON file_tags BEGIN
    UPDATE tags SET cardinality = cardinality - 1 WHERE id = OLD.tag_id;
END;
