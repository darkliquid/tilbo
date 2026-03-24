# Responsibility

The Quickshell GUI is the graphical file browser for tilbo. It is responsible for:

- **Application entry point**: `shell.qml` bootstraps the Quickshell `ShellRoot` and creates the `BrowserWindow`
- **Daemon communication**: all file operations, tag management, and search are delegated to the daemon via JSON-RPC over a Unix socket — the GUI is a thin presentation layer
- **User interaction**: directory browsing, file selection, tag search, metadata inspection, image preview, drag-and-drop, clipboard operations, trash management

## Not responsible for

- File indexing, tag storage, or metadata extraction (→ daemon)
- IPC protocol definition (→ proto/ipc.proto)
- CLI operations (→ cli)
