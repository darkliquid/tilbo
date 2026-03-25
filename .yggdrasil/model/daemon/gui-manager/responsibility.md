# Responsibility

The GUI Manager module is responsible for:

- **Quickshell process lifecycle**: starting and stopping the Quickshell GUI as a child process of the daemon
- **Single-instance enforcement**: detecting if a GUI is already running and broadcasting a `ShowWindow` event instead of starting a second instance
- **Shell.qml resolution**: finding the Quickshell entry point from config, relative to the daemon binary, or from well-known install paths
- **Icon theme detection**: detecting the current desktop icon theme and passing it to Quickshell via environment variable
- **Event broadcasting**: sending GUI lifecycle events (`ShowWindow`) to connected clients

## Not responsible for

- GUI content or behavior (→ `internal/quickshell/`)
- IPC method registration for LaunchGUI/StopGUI (→ `daemon` via `buildIPCRequestHandler`)
- Browser file operations (→ `daemon/browser-handlers`)
