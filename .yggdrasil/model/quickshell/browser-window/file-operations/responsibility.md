# Responsibility

Non-visual QtObject owning file selection state and manipulation functions. Responsible for:

- **Selection**: `selectFile()` (stats file + fetches metadata), `clearSelection()`, `selectedFile`, `selectedFileMeta`, `selectedPaths`, `selectionMode`
- **Delete**: `deleteSelected()`, `permanentDeleteSelected()` — iterates targets, emits refresh signals
- **Clipboard**: `copySelected()`, `paste()`
- **Create**: `createNew(isDir)` — creates file or directory via daemon
- **Drag & drop**: `handleFilesDropped()` — converts URLs, copies then pastes to target
- **Zoom**: `zoomIn()`, `zoomOut()`, `zoomReset()` — controls `_gridIconSize`
- **Display settings**: `_gridIconSize`, `_useInlineThumbnails`
- **Signals**: emits `refreshNeeded()` and `trashRefreshNeeded()` instead of calling load functions directly

Receives `currentPath`, `isTrashView`, `isSearchMode` as bound properties from navigation.

## Not responsible for

- Navigation or directory loading (→ navigation)
- Visual rendering (→ layout, sidebar)
- Tag patching (→ navigation, which owns the data arrays)
