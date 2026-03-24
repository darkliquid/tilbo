# Interface

## Content Slot

```qml
default property alias contentItem: contentSlot.data
```

Children passed to BrowserSidebar are placed in the center of the RowLayout between left and right panels.

## Properties

| Property | Type | Default | Purpose |
|----------|------|---------|---------|
| `showLeftSidebar` | `bool` | `true` | Left sidebar visible |
| `showRightSidebar` | `bool` | `false` | Right properties panel visible |
| `places` | `array` | `[]` | XDG places + pinned folders |
| `mounts` | `array` | `[]` | Detected mount points |
| `savedSearches` | `array` | `[]` | Pinned search chip sets |
| `selectedFile` | `object` | `null` | Currently selected file (for properties panel) |
| `selectedFileMeta` | `object` | `null` | Metadata map for selected file |
| `isTrashView` | `bool` | `false` | Highlights trash entry in sidebar |

## Functions

| Function | Purpose |
|----------|---------|
| `loadPlaces()` | Fetches places from daemon |
| `loadMounts()` | Fetches mount points from daemon |
| `loadSavedSearches()` | Fetches saved searches from daemon |

## Signals

| Signal | Parameters | Purpose |
|--------|-----------|---------|
| `placeActivated` | `string path` | User clicked a place or mount |
| `trashActivated` | — | User clicked trash entry |
| `searchActivated` | `var chips` | User clicked a saved search |
| `previewRequested` | `string filePath, string mimeType` | User clicked preview thumbnail |
