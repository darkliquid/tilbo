-- 0002_fts5.sql: Full-text search index over metadata values.
--
-- Adds an FTS5 virtual table that indexes all metadata values, enabling
-- free-text search across file metadata via the SearchRequest.fts_query field.
--
-- The FTS table is configured as a "content=" (external content) table backed
-- by the metadata table, meaning it does not store its own copy of the text.
-- Three triggers keep the FTS index in sync with the metadata table on every
-- insert, update, and delete.
--
-- Tokenization uses the unicode61 tokenizer for good multilingual support.

-- FTS5 virtual table indexing metadata values. External content mode means
-- the actual text is read from the metadata table via rowid lookups.
CREATE VIRTUAL TABLE IF NOT EXISTS metadata_fts USING fts5(
    value,
    content     = 'metadata',
    content_rowid = 'rowid',
    tokenize    = 'unicode61'
);

-- Keep FTS in sync: index new metadata values as they are inserted.
CREATE TRIGGER IF NOT EXISTS metadata_fts_insert AFTER INSERT ON metadata BEGIN
    INSERT INTO metadata_fts(rowid, value) VALUES (new.rowid, new.value);
END;

-- Keep FTS in sync: remove deleted metadata values from the index.
-- Uses the FTS5 'delete' command to remove the old entry.
CREATE TRIGGER IF NOT EXISTS metadata_fts_delete BEFORE DELETE ON metadata BEGIN
    INSERT INTO metadata_fts(metadata_fts, rowid, value) VALUES ('delete', old.rowid, old.value);
END;

-- Keep FTS in sync: on update, remove the old value and insert the new one.
CREATE TRIGGER IF NOT EXISTS metadata_fts_update AFTER UPDATE ON metadata BEGIN
    INSERT INTO metadata_fts(metadata_fts, rowid, value) VALUES ('delete', old.rowid, old.value);
    INSERT INTO metadata_fts(rowid, value) VALUES (new.rowid, new.value);
END;
