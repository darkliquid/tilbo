# PRD: Tilbo Core Browser Improvements

## Overview
This PRD outlines several quality-of-life and typical file browser features missing from Tilbo's current UI. These improvements focus on fundamental file operations, navigation, and system integration to bring Tilbo closer to being a daily-driver file manager while retaining its unique tag-based discovery strengths.

## Goals
- Add standard file operations (copy, paste, creation, multi-selection).
- Improve directory navigation (sorting, zooming, parent/home shortcuts).
- Enhance system integration (mount points, progress indicators).
- Expand tag-based discovery (saved searches, tag management).

## Quality Gates
These commands must pass for every user story:
- `go test ./...` - Unit and integration tests
- `golangci-lint run` - Code quality and security linting

For UI stories:
- Successful compilation/startup of `tilbo-quickshell`

## User Stories

### US-001: Multi-selection support (Grid/List)
**Description:** As a user, I want to select multiple files using Ctrl+Click and Shift+Click so that I can perform batch actions (tagging, deleting).

**Acceptance Criteria:**
- [ ] Implement a `selection` property (array of paths) in `FileGrid.qml` and `FileList.qml`.
- [ ] Add `Ctrl+Click` to toggle selection of an item.
- [ ] Add `Shift+Click` to select a range of items.
- [ ] Highlight selected items visually.
- [ ] Update `BrowserWindow.qml` to track the current selection.

### US-002: Clipboard Operations (Copy/Paste)
**Description:** As a user, I want to copy and paste files using standard shortcuts and the system clipboard so that I can move data between directories and applications.

**Acceptance Criteria:**
- [ ] Add `Copy` and `Paste` actions to the IPC protocol and `daemonBrowserMethods`.
- [ ] Support `Ctrl+C` (copy) and `Ctrl+V` (paste) keyboard shortcuts.
- [ ] Use the system clipboard (`text/uri-list`) for interoperability.
- [ ] Implement backend logic to handle cross-directory copying/moving.
- [ ] Add `Copy` and `Paste` to the file and directory context menus.

### US-003: Create New File/Folder
**Description:** As a user, I want to create new empty files or folders via the context menu so that I can organize my data.

**Acceptance Criteria:**
- [ ] Add `New Folder` and `New File` items to the context menu when clicking on an empty area in `FileGrid` or `FileList`.
- [ ] Implement IPC handlers for creating directories and empty files.
- [ ] Automatically enter rename mode for the newly created item.

### US-004: Interactive Header Sorting (List View)
**Description:** As a user, I want to click column headers in the list view to sort items by name, size, or modification date.

**Acceptance Criteria:**
- [ ] Make headers in `FileList.qml` interactive (clickable).
- [ ] Emit a `sortRequested(column, order)` signal from `FileList`.
- [ ] Implement sorting logic in `BrowserWindow.qml` for the `activeEntries` model.
- [ ] Show a visual indicator (arrow) for the current sort column and order.

### US-005: Directory Zooming (Grid View)
**Description:** As a user, I want to zoom the grid view using Ctrl+Scroll so that I can see more files or larger thumbnails.

**Acceptance Criteria:**
- [ ] Add `iconSize` property to `FileGrid.qml`.
- [ ] Implement `Ctrl+Plus`, `Ctrl+Minus`, and `Ctrl+Scroll` to adjust `iconSize`.
- [ ] Persist the preferred icon size in `BrowserConfig`.

### US-006: Navigation Shortcuts (Up/Home)
**Description:** As a user, I want dedicated shortcuts and buttons for ascending the directory tree or going home.

**Acceptance Criteria:**
- [ ] Add an "Up" button to the toolbar and bind `Alt+Up` to ascend one directory.
- [ ] Add a "Home" button or shortcut to jump to `$HOME`.
- [ ] Update breadcrumb navigation to handle these jumps cleanly.

### US-007: Mount Discovery in Sidebar
**Description:** As a user, I want to see removable drives and system mount points in the sidebar for easy access.

**Acceptance Criteria:**
- [ ] Implement mount point discovery in `tilbo-daemon` (reading `/proc/mounts` or using `gio`).
- [ ] Show detected mounts in a separate section of the left sidebar in `BrowserWindow.qml`.
- [ ] Add "Eject/Unmount" context menu actions for removable media.

### US-008: Saved Search Queries (Virtual Folders)
**Description:** As a user, I want to pin a complex search query to the sidebar so that I can access those files like a folder.

**Acceptance Criteria:**
- [ ] Allow pinning the current "Search Mode" state (chips) to the sidebar.
- [ ] Add `SavedSearch` type to the configuration and sidebar model.
- [ ] Clicking a saved search in the sidebar restores the tag/glob chips and executes the search.

### US-009: Visual Query Builder
**Description:** As a user, I want a visual interface for adding search filters (like size ranges or date filters) without typing prefixes.

**Acceptance Criteria:**
- [ ] Add a "Filter" button to the search bar.
- [ ] Open a small overlay or dialog with dropdowns/inputs for `Size`, `MIME Type`, and `Date Range`.
- [ ] Converting visual filters into search chips (e.g., `fts:`, `glob:`).

## Functional Requirements
- FR-1: Multi-selection must support standard OS-level modifier keys (Ctrl, Shift).
- FR-2: File operations (Copy/Paste/Create) must update the UI immediately upon completion.
- FR-3: Sorting must be stable and case-insensitive for names.
- FR-4: Saved searches must persist across daemon restarts.

## Non-Goals
- Full shell-integrated Drag and Drop (Qt/QML drag-drop is sufficient internally).
- Advanced Archive management (browsing inside ZIPs) — context menu only for now.

## Technical Considerations
- Multi-selection requires updating `activeEntries` or maintaining a separate `selectionModel`.
- `tilbo-daemon` already handles some file operations; ensure new IPC calls use `context.Context` and handle errors gracefully.
- Re-use `ThemeIcon` for any new buttons to maintain visual consistency.

## Success Metrics
- User can successfully copy a file from one folder to another without using the terminal.
- Clicking "Size" header in list view correctly orders files by byte count.
- Pinned search query correctly restores results after restart.

## Open Questions
- None.
