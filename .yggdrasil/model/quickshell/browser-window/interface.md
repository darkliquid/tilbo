# Interface

## Properties

| Property | Type | Purpose |
|----------|------|---------|
| `daemonConnected` | `bool` | Bound to `TilboDaemon.connected`, passed to layout |

## Subcomponent instances

| Id | Type | Purpose |
|----|------|---------|
| `nav` | `BrowserNavigation` | Navigation state and logic |
| `fileOps` | `BrowserFileOperations` | File selection and manipulation |
| `layout` | `BrowserLayout` | All visual content |
| `layout.sidebar` | `BrowserSidebar` | Sidebar panels (alias exposed by layout) |

## Signal wiring

| Source | Target | Purpose |
|--------|--------|---------|
| `nav.navigationChanged` | `fileOps.clearSelection(); sidebar.showRightSidebar = false` | Clear selection on navigation |
| `fileOps.refreshNeeded` | `nav._loadDirectory(nav.currentPath)` | Reload after file ops |
| `fileOps.trashRefreshNeeded` | `nav._loadTrash()` | Reload trash after delete |
| `sidebar.placeActivated(path)` | `nav.navigateTo(path)` | Navigate to clicked place |
| `sidebar.trashActivated` | `nav.navigateToTrash()` | Switch to trash view |
| `sidebar.searchActivated(chips)` | `nav.executeSearch(chips)` | Execute saved search |

## Daemon event handlers

| Event | Handler |
|-------|---------|
| `onDaemonStateChanged` | Update `daemonConnected` |
| `onShowWindow(path)` | Raise window, navigate to path |
| `onFileTagged(path, added, removed)` | Patch entry tags via nav, update fileOps.selectedFile |
| `onIndexUpdated` | Re-execute active search if in search mode |
