# Interface

## Navigation functions

### `navigateTo(path)`
Pushes path onto history stack (truncating forward history), sets `currentPath`, calls `_loadDirectory`.

### `goBack()` / `goForward()`
Moves `_historyIndex` and navigates to the history entry. Clears search/trash mode.

### `goUp()`
Navigates to `currentPath`'s parent directory.

### `goHome()`
Navigates to `$HOME`.

### `navigateToTrash()`
Switches to trash view mode, clears search state, calls `_loadTrash`.

## Data loading

### `_loadDirectory(path)`
1. Calls `TilboDaemon.listDirectory(path, showHidden, cb)`
2. Sorts results via `_sortEntries`
3. Hydrates tags for all entries via `TilboDaemon.hydrateTags`
4. Patches `dirEntries` with tag data

### `_executeSearch(chips)`
Parses chip array into search parameters:
- Bare strings → tag filters
- `glob:pattern` → glob search
- `fts:query` → full-text search
- `hidden:any` → include hidden files
Calls `TilboDaemon.search` or `TilboDaemon.globSearch` based on chip types.

### `_sortEntries(arr) → array`
Client-side sort with folders-first invariant. Supports columns: `name` (case-insensitive), `size`, `mtime`, `tags` (by count).

### `_loadTrash()`
Calls `TilboDaemon.listTrash`, sorts results.
