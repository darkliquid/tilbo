-- 0003_sidecar.sql: store sidecar data in the database instead of adjacent files

CREATE TABLE IF NOT EXISTS sidecar_data (
    inode  INTEGER NOT NULL,
    device INTEGER NOT NULL,
    data   TEXT NOT NULL, -- JSON payload containing tags, meta, and source
    PRIMARY KEY (inode, device)
);
