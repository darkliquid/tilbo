# Responsibility

The File Views module provides two interchangeable views for displaying file entries:

- **FileGrid**: tile/icon grid view with configurable icon size, rubber-band selection, inline thumbnails, and drag-and-drop targets per cell
- **FileList**: table/list view with sortable column headers (name, size, mtime, tags), inline thumbnails, and row-based selection

Both views share the same entry contract and signal set, allowing BrowserWindow to switch between them without changing data flow.

### Shared capabilities
- **Multi-selection**: Ctrl+click (toggle), Shift+click (range), rubber-band (grid only), "select all" function
- **Context menu**: right-click on file or background triggers context menus
- **Inline rename**: editable name field activated by F2 or double-click on name
- **Drag-and-drop**: files can be dragged out and dropped onto directories
- **Inline thumbnails**: optional thumbnail display when `inlineThumbnails` is enabled

## Not responsible for

- File data loading or tag hydration (→ browser-window/navigation)
- File operations (delete, trash, copy) (→ browser-window/file-operations)
