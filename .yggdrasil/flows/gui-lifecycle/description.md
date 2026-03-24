# GUI Lifecycle

## Business context

The Quickshell GUI is a separate process managed by the daemon. Users can launch and stop the GUI via IPC commands. If the GUI is already running, a launch request broadcasts a `ShowWindow` event to raise the existing window rather than starting a second instance.

## Trigger

A client sends a `LaunchGUI` or `StopGUI` IPC request, or the daemon shuts down.

## Goal

At most one GUI instance runs at any time, managed by the daemon for clean lifecycle control.

## Participants

- **GUI Manager** (`daemon/gui-manager`) — tracks the Quickshell subprocess, resolves shell.qml path, starts/stops the process
- **IPC Handlers** (`daemon/ipc-handlers`) — expose LaunchGUI/StopGUI as IPC methods

## Paths

### Launch (no existing GUI)

1. Client sends `LaunchGUI` request with optional initial path
2. GUI Manager detects no running process
3. Resolves `shell.qml` path (config, relative to binary, or well-known install paths)
4. Detects the current icon theme
5. Starts Quickshell as a child process with environment variables (icon theme, initial path)
6. Returns `alreadyRunning=false`

### Launch (GUI already running)

1. Client sends `LaunchGUI` request
2. GUI Manager detects running process
3. Broadcasts a `ShowWindow` event via the IPC server
4. Returns `alreadyRunning=true`

### Stop

1. Client sends `StopGUI` request
2. GUI Manager sends SIGTERM to the Quickshell process
3. Process exits cleanly

### Daemon shutdown

1. Context is cancelled
2. GUI Manager stops the Quickshell process as part of cleanup

## Invariants across all paths

- At most one Quickshell process is managed at a time
- GUI Manager uses a mutex to serialize Launch/Stop operations
- The shell.qml path is resolved once at manager creation
