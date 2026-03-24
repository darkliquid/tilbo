# Responsibility

The Browser Handlers module is responsible for:

- **File manager operations**: directory listing, file/directory creation, rename, delete, trash, restore, open with default application
- **Path validation**: strict input validation for all path arguments (null bytes, absolute paths, traversal prevention)
- **MIME-to-icon mapping**: translating MIME types to XDG icon theme names for the GUI
- **Thumbnail generation**: providing file thumbnails for the browser view
- **File type detection**: identifying archive types, mount points, filesystem capabilities
- **Desktop file parsing**: resolving `.desktop` file entries for "open with" functionality
- **Bookmark management**: reading/writing file manager bookmarks
- **Clipboard operations**: copy/cut/paste file operations
- **Extension registry**: managing file type associations

## Not responsible for

- Core tag/search/metadata operations (→ `daemon/ipc-handlers`)
- IPC server setup or socket management (→ `daemon`)
- GUI subprocess management (→ `daemon/gui-manager`)
