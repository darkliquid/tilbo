-- name: DeleteFile :exec
DELETE FROM files WHERE path = ?;


-- name: UpsertTag :one
INSERT INTO tags(name) VALUES (?)
ON CONFLICT(name) DO UPDATE SET name = name
RETURNING id;

-- name: AddFileTag :exec
INSERT OR IGNORE INTO file_tags(file_id, tag_id) VALUES (?, ?);

-- name: RemoveFileTag :exec
DELETE FROM file_tags WHERE file_id = ? AND tag_id = ?;

-- name: ClearFileTags :exec
DELETE FROM file_tags WHERE file_id = ?;

-- name: UpsertMeta :exec
INSERT INTO metadata(file_id, key, value, source)
VALUES (?, ?, ?, ?)
ON CONFLICT(file_id, key) DO UPDATE SET
    value  = excluded.value,
    source = excluded.source;

-- name: DeleteMeta :exec
DELETE FROM metadata WHERE file_id = ? AND key = ?;

-- name: SetTagProvenance :exec
INSERT INTO tag_provenance(file_id, tag_id, source, set_at)
VALUES (?, ?, ?, ?)
ON CONFLICT(file_id, tag_id) DO UPDATE SET
    source = excluded.source,
    set_at = excluded.set_at;

-- name: GetStats :one
SELECT 
    (SELECT COUNT(*) FROM files) as files_count, 
    (SELECT COUNT(*) FROM tags) as tags_count;


-- name: DeleteStaleFiles :exec
DELETE FROM files WHERE path LIKE ? AND indexed_at < ?;

-- name: ReadSidecar :one
SELECT data FROM sidecar_data WHERE inode = ? AND device = ?;

-- name: WriteSidecar :exec
INSERT INTO sidecar_data(inode, device, data) 
VALUES (?, ?, ?) 
ON CONFLICT(inode, device) DO UPDATE SET data=excluded.data;

-- name: DeleteSidecar :exec
DELETE FROM sidecar_data WHERE inode = ? AND device = ?;

-- name: ListFilePaths :many
SELECT path FROM files ORDER BY path;

-- name: ListAllTags :many
SELECT name FROM tags ORDER BY name;

-- name: GetFileIDByPath :one
SELECT id FROM files WHERE path = ?;

-- name: GetTagOverrides :many
SELECT t.name, o.rule_name
FROM tag_overrides o
JOIN tags t ON t.id = o.tag_id
WHERE o.file_id = ?;

-- name: ListFileTagPairs :many
SELECT f.path, t.name
FROM file_tags ft
JOIN files f ON f.id = ft.file_id
JOIN tags  t ON t.id = ft.tag_id;

-- name: GetFileSummary :one
SELECT id, mtime, size_bytes FROM files WHERE path = ? LIMIT 1;

-- name: GetFileTags :many
SELECT t.name FROM file_tags ft 
JOIN tags t ON t.id = ft.tag_id 
WHERE ft.file_id = ?
ORDER BY t.name;

-- name: GetFileMeta :many
SELECT key, value, source FROM metadata WHERE file_id = ?;


-- name: UpsertFile :one
INSERT INTO files(path, inode, device, mtime, size_bytes, indexed_at)
VALUES (?, ?, ?, ?, ?, ?)
ON CONFLICT(path) DO UPDATE SET
    inode      = excluded.inode,
    device     = excluded.device,
    mtime      = excluded.mtime,
    size_bytes = excluded.size_bytes,
    indexed_at = excluded.indexed_at
RETURNING id;
