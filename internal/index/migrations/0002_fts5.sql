-- 0002_fts5.sql: full-text search index over metadata values

CREATE VIRTUAL TABLE IF NOT EXISTS metadata_fts USING fts5(
    value,
    content     = 'metadata',
    content_rowid = 'rowid',
    tokenize    = 'unicode61'
);

CREATE TRIGGER IF NOT EXISTS metadata_fts_insert AFTER INSERT ON metadata BEGIN
    INSERT INTO metadata_fts(rowid, value) VALUES (new.rowid, new.value);
END;

CREATE TRIGGER IF NOT EXISTS metadata_fts_delete BEFORE DELETE ON metadata BEGIN
    INSERT INTO metadata_fts(metadata_fts, rowid, value) VALUES ('delete', old.rowid, old.value);
END;

CREATE TRIGGER IF NOT EXISTS metadata_fts_update AFTER UPDATE ON metadata BEGIN
    INSERT INTO metadata_fts(metadata_fts, rowid, value) VALUES ('delete', old.rowid, old.value);
    INSERT INTO metadata_fts(rowid, value) VALUES (new.rowid, new.value);
END;
