# Responsibility

Visual Item providing the complete window content structure. Manages its own toolbars via anchoring (not ApplicationWindow header/footer). Responsible for:

- **Header toolbar**: tilbo label, back/forward/up/home nav buttons, TagSearchBar, pin search dialog, grid/list toggle, selection mode toggle, hidden files toggle
- **Footer toolbar**: pin-current-place button, breadcrumb strip with click-to-navigate, editable path field, edit toggle
- **Keyboard shortcuts**: ~20 configurable shortcuts for navigation, file ops, view toggles, zoom
- **File area**: instantiates BrowserSidebar with file content slot containing trash view and FileGrid/FileList StackLayout
- **Breadcrumb model**: `breadcrumbModel(path)` generates crumb array, `scrollBreadcrumbsToEnd()` auto-scrolls
- **OpenWith dialog**: lists applications for opening selected file
- **Image preview overlay**: fullscreen ImagePreview component
- **State**: `isGridView`, `pathEditMode`, `_keybindings`, `_useTrash`, `daemonConnected`
- **Reacts to** `nav.currentPathChanged` to clear selection and scroll breadcrumbs

Receives `nav` (BrowserNavigation) and `fileOps` (BrowserFileOperations) as required properties. Exposes `sidebar` alias for orchestrator access.

## Not responsible for

- Navigation logic (→ navigation)
- File manipulation logic (→ file-operations)
- Sidebar data loading (→ sidebar)
- Daemon communication (→ daemon-service)
