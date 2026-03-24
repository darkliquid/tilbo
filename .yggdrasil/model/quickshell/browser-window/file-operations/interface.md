# Interface

## Functions

### `_deleteSelected()`
Deletes selected files. Uses trash or permanent delete based on `_useTrash` config. Operates on `selectedPaths` or falls back to `selectedFile.path`.

### `_copySelected(isMove)`
Sets daemon clipboard. Syncs with system clipboard via `wl-copy` or `xclip` (best effort).

### `_paste()`
Pastes daemon clipboard into `currentPath`. Disabled in trash/search mode. Refreshes directory.

### `handleFilesDropped(urls, targetPath, isCopy)`
Handles drag-and-drop from external sources. Converts `file://` URLs to paths, executes copy/move via daemon.

### `_createNew(isDir)`
Creates a new file or directory with default name ("New File" / "New Folder"). Disabled in grid/search mode.

### `zoomIn()` / `zoomOut()` / `zoomReset()`
Adjusts `_gridIconSize` in 16px steps (range: 32–256, default: 48).

## Context menu actions

All context menus (background, file, search result) trigger the same underlying functions. Actions available depend on view mode (normal/search/trash).
