# Interface

## `daemonBrowserMethods` struct

Implements `browser.Methods` interface. Created in `run()` with dependencies injected.

### Dependencies

| Field | Type | Purpose |
|-------|------|---------|
| `idx` | `*index.DB` | SQLite index for metadata queries |
| `tags` | `*xattr.Service` | Tag read/write via extended attributes |
| `g` | `*graph.Graph` | Tag relationship graph |
| `fuseMount` | `string` | FUSE mount path for tag-based browsing |
| `onFileTagged` | `func(path, added, removed)` | Callback for tag change notifications |
| `cfg` | `*config.Config` | Daemon configuration |
| `extRegistry` | `*extension.Registry` | File type associations |
| `thumbGen` | `*thumbnail.Generator` | Thumbnail generation |

### Methods (implements `browser.Methods`)

- `ListDirectory(ctx, path, showHidden) ([]browser.Entry, error)` — list directory with tag enrichment
- `CreateFile(ctx, dir, name) error` — create empty file
- `CreateDirectory(ctx, dir, name) error` — create directory
- `Rename(ctx, path, newName) error` — rename file/directory
- `Delete(ctx, paths) error` — permanently delete files
- `Trash(ctx, paths) error` — move to XDG trash
- `Restore(ctx, trashIDs) error` — restore from trash
- `Open(ctx, path) error` — open with default application via `xdg-open`
- `GetThumbnail(ctx, path, size) ([]byte, error)` — generate/retrieve thumbnail
- `ListBookmarks(ctx) ([]browser.Bookmark, error)` — list file manager bookmarks
- `AddBookmark(ctx, path, name) error` — add bookmark
- `RemoveBookmark(ctx, path) error` — remove bookmark

## Validation helpers

### `validatePath(path) (string, error)`
Rejects empty, null-byte-containing, and relative paths. Returns cleaned absolute path.

### `validateNewName(name) error`
Rejects empty names, null bytes, and path separators (prevents directory traversal).

### `mimeToIconName(mime) string`
Maps MIME type strings to XDG icon theme names (e.g., `image/*` → `image-x-generic`).

## Failure modes

- Invalid path: returns descriptive error before any filesystem access
- File not found: returns `os.ErrNotExist`
- Permission denied: returns wrapped `EACCES`/`EPERM`
- Trash operations: may fail if XDG trash directories are not writable
