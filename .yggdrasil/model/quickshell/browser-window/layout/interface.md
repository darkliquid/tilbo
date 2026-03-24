# Interface

## Required Properties

| Property | Type | Purpose |
|----------|------|---------|
| `nav` | `QtObject` (BrowserNavigation) | Navigation state and functions |
| `fileOps` | `QtObject` (BrowserFileOperations) | File operations state and functions |

## Properties

| Property | Type | Default | Purpose |
|----------|------|---------|---------|
| `isGridView` | `bool` | `true` | Grid vs list view toggle |
| `pathEditMode` | `bool` | `false` | Path editor visible |
| `_keybindings` | `object` | `{}` | Shortcut overrides from daemon config |
| `_useTrash` | `bool` | `true` | Whether delete uses trash |
| `daemonConnected` | `bool` | `false` | Daemon connection status for search bar |

## Property Aliases

| Alias | Target | Purpose |
|-------|--------|---------|
| `sidebar` | BrowserSidebar instance | Exposes sidebar for orchestrator signal wiring |

## Functions

| Function | Parameters | Purpose |
|----------|-----------|---------|
| `breadcrumbModel(path)` | `string` | Returns array of `{label, path}` crumbs |
| `scrollBreadcrumbsToEnd()` | — | Auto-scrolls breadcrumb strip to rightmost crumb |

## Keyboard Shortcuts

| Default | Configurable Key | Action |
|---------|-----------------|--------|
| `Alt+Left` | `back` | `nav.goBack()` |
| `Alt+Right` | `forward` | `nav.goForward()` |
| `Alt+Up` | — | `nav.goUp()` |
| `Alt+Home` | — | `nav.goHome()` |
| `Ctrl+H` | `toggle_hidden` | Toggle hidden files + reload |
| `Ctrl+G` | `toggle_grid` | Toggle grid/list |
| `F5` | `refresh` | Reload current view |
| `Ctrl+L` | `focus_path` | Focus path editor |
| `Delete` | `delete` | `fileOps.deleteSelected()` |
| `Shift+Delete` | — | `fileOps.permanentDeleteSelected()` |
| `Ctrl+C` | — | `fileOps.copySelected(false)` |
| `Ctrl+X` | — | `fileOps.copySelected(true)` |
| `Ctrl+V` | — | `fileOps.paste()` |
| `Ctrl+Shift+N` | — | `fileOps.createNew(true)` |
| `Ctrl+A` | — | Select all in current view |
| `Ctrl++`/`Ctrl+=` | — | `fileOps.zoomIn()` |
| `Ctrl+-` | — | `fileOps.zoomOut()` |
| `Ctrl+0` | — | `fileOps.zoomReset()` |
