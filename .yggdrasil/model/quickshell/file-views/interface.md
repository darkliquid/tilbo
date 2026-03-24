# Interface

Both FileGrid and FileList share the same property/signal contract.

## Input properties

| Property | Type | Purpose |
|----------|------|---------|
| `entries` | `array` | Array of file entry objects (`{name, path, isDir, size, mtime, tags, iconName, mimeType}`) |
| `inlineThumbnails` | `bool` | Enable thumbnail display in cells/rows |
| `selection` | `array` | Currently selected file paths (two-way binding) |
| `sortColumn` | `string` | Current sort column (list view only) |
| `sortAscending` | `bool` | Sort direction (list view only) |

## Grid-specific properties

| Property | Type | Purpose |
|----------|------|---------|
| `iconSize` | `int` | Grid cell icon size in pixels |

## Signals

| Signal | Parameters | Purpose |
|--------|-----------|---------|
| `fileSelected(fileData)` | file entry object | Single click on a file |
| `directoryActivated(path)` | directory path | Double-click on a directory |
| `fileOpenRequested(path)` | file path | Double-click on a file |
| `renameRequested(path, newName)` | old path, new name | Inline rename completed |
| `createFileRequested()` | — | Background context menu "New File" |
| `createDirectoryRequested()` | — | Background context menu "New Folder" |
| `sortRequested(column, ascending)` | column name, direction | Column header clicked (list only) |
| `selectionChanged` | — | Selection array changed |
| `filesDropped(urls, target, isCopy)` | drop URLs, target path, copy flag | Files dropped onto a cell/background |

## Functions

### `selectAll()`
Selects all entries in the view.
