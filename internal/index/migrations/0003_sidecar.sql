-- 0003_sidecar.sql: In-database sidecar storage.
--
-- Replaces the earlier approach of writing .tilbo.json sidecar files next to
-- each indexed file. Storing sidecars in the database avoids filesystem clutter,
-- permission issues, and race conditions with external tools.
--
-- Sidecar data is keyed by (inode, device) rather than path so that user-applied
-- tags and metadata survive file renames within the same filesystem. The JSON
-- payload contains the user's manual tags, metadata overrides, and source
-- attribution.

-- Stores per-file sidecar data keyed by inode/device identity.
CREATE TABLE IF NOT EXISTS sidecar_data (
    inode  INTEGER NOT NULL,          -- stat(2) st_ino of the target file
    device INTEGER NOT NULL,          -- stat(2) st_dev of the target file
    data   TEXT NOT NULL,             -- JSON payload: {"tags":[...], "meta":{...}, "source":"..."}
    PRIMARY KEY (inode, device)
);
