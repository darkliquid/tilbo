# Interface

## `rootCmd` (cobra.Command)

Top-level command: `tilbo`. Persistent flags:

| Flag | Default | Purpose |
|------|---------|---------|
| `--socket` | `/run/user/$UID/tilbo.sock` | Override daemon Unix socket path |
| `--version` | — | Print version and exit |

### `PersistentPreRunE`

Runs before every subcommand. Checks that the daemon socket exists unless the command is annotated `"no_daemon": "true"`. Returns a descriptive error if the daemon is not running.

## Helper functions

### `dial(ctx) (*ipc.Client, error)`

Connects to the daemon Unix socket at `sockFlag` path. Returns an IPC client or connection error.

### `call(ctx, *ipcv1.Request) (*ipcv1.Response, error)`

Convenience wrapper: dials the daemon, sends a single request, returns the response. Closes the connection after the call.

### `daemonError(resp) error`

Checks if a response contains an error variant (`Response_Error`). Returns the error message or nil.

### `absPath(path) string`

Converts a relative path to absolute using `filepath.Abs`. Falls back to the original path on error.

### `defaultSocketPath() string`

Returns `/run/user/$UID/tilbo.sock` using the current user's UID.

## Failure modes

- Daemon not running: `PersistentPreRunE` returns error before command executes
- Socket connection failure: `dial` returns wrapped error
- Daemon returns error response: `daemonError` extracts and returns it
