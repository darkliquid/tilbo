# Responsibility

Visual Item providing the left and right sidebar panels. Uses a `default property alias` pattern to accept a content slot (the file area) between the panels in a RowLayout. Responsible for:

- **Left sidebar**: places list, mounts list, saved searches list, trash entry — each navigable via signals
- **Left strip toggle**: vertical "PLACES" label that shows/hides the sidebar
- **Right properties panel**: file preview (thumbnail or icon), name, path/size/modified details, metadata key-value list, tags flow
- **Right strip toggle**: vertical "PROPERTIES" label that shows/hides the panel
- **Data loading**: `loadPlaces()`, `loadMounts()`, `loadSavedSearches()` via TilboDaemon
- **Context menus**: right-click on pinned places (change icon, remove), right-click on saved searches (remove)
- **Icon picker dialog**: for changing pinned place icons
- **Signals**: `placeActivated(path)`, `trashActivated()`, `searchActivated(chips)`, `previewRequested(filePath, mimeType)`

Receives `selectedFile`, `selectedFileMeta`, `isTrashView` as properties.

## Not responsible for

- Navigation logic (→ navigation)
- File operations (→ file-operations)
- File area content (passed in via content slot, rendered by layout)
- Toolbar, footer, keyboard shortcuts (→ layout)
