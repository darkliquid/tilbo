# Interface

## `guiManager` struct

Created via `newGUIManager(shellPath, broadcast)`.

### Fields

| Field | Type | Purpose |
|-------|------|---------|
| `mu` | `sync.Mutex` | Serializes Launch/Stop operations |
| `cmd` | `*exec.Cmd` | Current Quickshell child process (nil if not running) |
| `shellPath` | `string` | Resolved path to `shell.qml` |
| `broadcast` | `func(*ipcv1.Event)` | Function to broadcast events to IPC clients |

## `Launch(path string) (alreadyRunning bool, err error)`

Starts the Quickshell GUI or raises an existing window.

- If GUI is already running: broadcasts `ShowWindow` event, returns `(true, nil)`
- If not running: resolves shell.qml, detects icon theme, starts Quickshell process with environment variables, returns `(false, nil)`
- If shell.qml cannot be found: returns error

Environment variables set for Quickshell:
- `TILBO_ICON_THEME` — detected icon theme name
- `TILBO_INITIAL_PATH` — initial directory to display (from `path` argument)

## `Stop() error`

Sends SIGTERM to the Quickshell process. Returns error if no process is running.

## `isRunning() bool`

Checks if the managed process is still alive. Internal method (called under mutex).

## Failure modes

- `shell.qml` not found: returns descriptive error suggesting config option
- Process start failure: returns wrapped exec error
- Stop when not running: returns error
