-- query.sql - Named SQL queries for tilbo's index database.
--
-- These queries are consumed by sqlc to generate type-safe Go code. Each
-- query is annotated with its name, return mode (:exec, :one, :many), and
-- a description of when it is used.

-- ---------------------------------------------------------------------------
-- File CRUD
-- ---------------------------------------------------------------------------

-- name: UpsertFile :one
-- Inserts a new file record or updates an existing one when the path already
-- exists. Called during indexing scans to track every discovered file along
-- with its inode/device identity and modification metadata. Returns the
-- file's row ID for use in subsequent tag/metadata operations.
INSERT INTO files(path, inode, device, mtime, size_bytes, indexed_at)
VALUES (?, ?, ?, ?, ?, ?)
ON CONFLICT(path) DO UPDATE SET
    inode      = excluded.inode,
    device     = excluded.device,
    mtime      = excluded.mtime,
    size_bytes = excluded.size_bytes,
    indexed_at = excluded.indexed_at
RETURNING id;

-- name: DeleteFile :exec
-- Permanently removes a file from the index. Cascades to file_tags, metadata,
-- tag_provenance, and tag_overrides via ON DELETE CASCADE foreign keys.
-- Called when a file is detected as deleted during a scan or explicitly removed.
DELETE FROM files WHERE path = ?;

-- name: DeleteStaleFiles :exec
-- Removes files under a given path prefix that were not seen in the most
-- recent scan cycle. The indexed_at timestamp is compared against the scan
-- start time to identify stale entries. Used at the end of each directory
-- scan to clean up files that were moved or deleted outside tilbo.
DELETE FROM files WHERE path LIKE ? AND indexed_at < ?;

-- name: GetFileIDByPath :one
-- Looks up the internal row ID for a file by its absolute path. Used by
-- handlers that receive a path from the IPC layer and need the integer ID
-- for tag/metadata operations.
SELECT id FROM files WHERE path = ?;

-- name: GetFileSummary :one
-- Retrieves the core stat fields (id, mtime, size) for a file. Used during
-- scanning to check whether a file has changed since it was last indexed,
-- avoiding unnecessary re-processing of unchanged files.
SELECT id, mtime, size_bytes FROM files WHERE path = ? LIMIT 1;

-- name: ListFilePaths :many
-- Returns all indexed file paths in alphabetical order. Used for bulk
-- operations such as full tag recomputation or export.
SELECT path FROM files ORDER BY path;

-- ---------------------------------------------------------------------------
-- Tags
-- ---------------------------------------------------------------------------

-- name: UpsertTag :one
-- Inserts a tag name or returns the existing row if the name already exists.
-- The "DO UPDATE SET name = name" is a no-op trick to make RETURNING work
-- on conflict. Returns the tag's row ID for use in file_tags joins.
INSERT INTO tags(name) VALUES (?)
ON CONFLICT(name) DO UPDATE SET name = name
RETURNING id;

-- name: AddFileTag :exec
-- Associates a tag with a file. Uses INSERT OR IGNORE so duplicate
-- associations are silently skipped. The tag_cardinality_inc trigger
-- fires on successful insert to maintain the tags.cardinality counter.
INSERT OR IGNORE INTO file_tags(file_id, tag_id) VALUES (?, ?);

-- name: RemoveFileTag :exec
-- Removes a single tag from a file. The tag_cardinality_dec trigger fires
-- on successful delete to decrement the tags.cardinality counter.
DELETE FROM file_tags WHERE file_id = ? AND tag_id = ?;

-- name: ClearFileTags :exec
-- Removes all tags from a file. Called before TAG_OPERATION_SET to replace
-- the entire tag set, and during file re-indexing when tags need to be
-- recomputed from scratch.
DELETE FROM file_tags WHERE file_id = ?;

-- name: ListAllTags :many
-- Returns all known tag names in alphabetical order. Used by the ListTags
-- IPC handler for autocomplete and tag browsing UIs.
SELECT name FROM tags ORDER BY name;

-- name: GetFileTags :many
-- Returns all tag names for a given file, ordered alphabetically. Used by
-- MetadataRequest and HydrateTagsRequest handlers to populate tag lists
-- in responses.
SELECT t.name FROM file_tags ft
JOIN tags t ON t.id = ft.tag_id
WHERE ft.file_id = ?
ORDER BY t.name;

-- name: ListFileTagPairs :many
-- Returns every (path, tag_name) pair in the index. Used for bulk export
-- and for building the in-memory tag graph used by RelatedRequest.
SELECT f.path, t.name
FROM file_tags ft
JOIN files f ON f.id = ft.file_id
JOIN tags  t ON t.id = ft.tag_id;

-- ---------------------------------------------------------------------------
-- Metadata
-- ---------------------------------------------------------------------------

-- name: UpsertMeta :exec
-- Sets a metadata key-value pair on a file. If the key already exists, both
-- the value and source attribution are updated. Called by harvesters (exif,
-- xattr, etc.) during indexing and by MetadataSetRequest for manual edits.
INSERT INTO metadata(file_id, key, value, source)
VALUES (?, ?, ?, ?)
ON CONFLICT(file_id, key) DO UPDATE SET
    value  = excluded.value,
    source = excluded.source;

-- name: DeleteMeta :exec
-- Removes a single metadata key from a file. Called when MetadataSetRequest
-- receives an empty value string, signaling deletion.
DELETE FROM metadata WHERE file_id = ? AND key = ?;

-- name: GetFileMeta :many
-- Returns all metadata key-value pairs (with source attribution) for a file.
-- Used by MetadataRequest to build the full metadata response.
SELECT key, value, source FROM metadata WHERE file_id = ?;

-- ---------------------------------------------------------------------------
-- Tag provenance & overrides
-- ---------------------------------------------------------------------------

-- name: SetTagProvenance :exec
-- Records which source (harvester or rule) applied a tag to a file, and when.
-- This provenance information is used for debugging and for resolving
-- conflicts when multiple sources try to manage the same tag.
INSERT INTO tag_provenance(file_id, tag_id, source, set_at)
VALUES (?, ?, ?, ?)
ON CONFLICT(file_id, tag_id) DO UPDATE SET
    source = excluded.source,
    set_at = excluded.set_at;

-- name: GetTagOverrides :many
-- Returns all tag overrides for a file. Overrides are rules that suppress
-- (prevent) specific tags from being applied, even if a harvester would
-- normally add them. Used during tag computation to filter out suppressed tags.
SELECT t.name, o.rule_name
FROM tag_overrides o
JOIN tags t ON t.id = o.tag_id
WHERE o.file_id = ?;

-- ---------------------------------------------------------------------------
-- Sidecar data
-- ---------------------------------------------------------------------------

-- name: ReadSidecar :one
-- Reads the JSON sidecar payload for a file identified by its inode/device
-- pair. Sidecar data contains user-applied tags and metadata that persist
-- across file renames (since inode/device identity is stable). Used during
-- indexing to merge user data with harvester-produced data.
SELECT data FROM sidecar_data WHERE inode = ? AND device = ?;

-- name: WriteSidecar :exec
-- Writes or updates the JSON sidecar payload for a file. Called when the
-- user manually adds/removes tags or sets metadata, ensuring those changes
-- survive re-indexing and file renames.
INSERT INTO sidecar_data(inode, device, data)
VALUES (?, ?, ?)
ON CONFLICT(inode, device) DO UPDATE SET data=excluded.data;

-- name: DeleteSidecar :exec
-- Removes the sidecar data for a file. Called when a file is permanently
-- deleted (not trashed) to clean up orphaned sidecar records.
DELETE FROM sidecar_data WHERE inode = ? AND device = ?;

-- ---------------------------------------------------------------------------
-- Statistics
-- ---------------------------------------------------------------------------

-- name: GetStats :one
-- Returns aggregate counts for the StatusRequest handler: total number of
-- indexed files and total number of distinct tags.
SELECT
    (SELECT COUNT(*) FROM files) as files_count,
    (SELECT COUNT(*) FROM tags) as tags_count;
