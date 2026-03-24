# Interface

## Properties

| Property | Type | Purpose |
|----------|------|---------|
| `connected` | `bool` (readonly) | Whether the socket is currently connected |

## Signals

| Signal | Parameters | When emitted |
|--------|-----------|--------------|
| `fileTagged` | `path, added, removed` | Daemon notifies a file's tags changed |
| `indexUpdated` | `filesTotal, tagsTotal` | Index sync completed |
| `daemonStateChanged` | `state` | Daemon state changed (idle, indexing, etc.) |
| `showWindow` | `path` | Daemon requests the GUI to raise/show a window |

## Methods (all take a trailing callback(result, err))

### File browsing
- `listDirectory(path, showHidden, cb)` — list directory entries with tag enrichment
- `search(chips, showHidden, cb)` — execute chip-based search (tags, glob, fts)
- `getThumbnail(path, size, cb)` — get/generate thumbnail for a file

### Tag operations
- `modifyTags(paths, tags, operation, cb)` — add/remove/set tags
- `hydrateTags(paths, cb)` — batch-resolve tags for file paths
- `listTags(prefix, cb)` — list known tags with optional prefix filter

### Metadata
- `getMetadata(path, cb)` — get metadata key-value pairs with sources
- `setMetadata(path, key, value, cb)` — set a metadata key

### File operations
- `rename(path, newName, cb)` — rename file/directory
- `deleteFiles(paths, cb)` — permanently delete files
- `trash(paths, cb)` — move to XDG trash
- `copy(paths, isMove, cb)` — set clipboard (copy or cut)
- `paste(destinationDir, cb)` — paste clipboard contents
- `createFile(dir, name, cb)` / `createDirectory(dir, name, cb)` — create new entries
- `open(path, cb)` — open with default application
- `getOpenWith(path, cb)` — list available applications
- `openWith(path, desktopFile, cb)` — open with specific application

### Trash
- `listTrash(cb)` — list trash entries
- `restoreTrash(name, cb)` — restore from trash

### Config
- `getBrowserConfig(cb)` — get browser config (keybindings, useTrash, inlineThumbnails)
- `pinSearch(name, chips, icon, cb)` — save a search to sidebar

## Internal mechanics

### `_call(request, callback)`
Assigns an auto-incrementing ID, serializes as JSON, writes to socket. Stores callback in `_pending[id]`.

### `_handleLine(line)`
Parses JSON. If response has matching ID in `_pending`, invokes callback. If event, dispatches to appropriate signal.

## Failure modes
- Socket disconnect: all pending callbacks receive `("daemon disconnected")` error, reconnect timer starts
- Parse error: line logged and skipped
