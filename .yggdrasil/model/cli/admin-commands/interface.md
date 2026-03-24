# Interface

## `daemon` (parent command)

### `daemon status`
Shows daemon state, files indexed, uptime, and any warnings.
Output: multi-line human-readable status block with `formatUptime()` for duration display.

### `daemon reload-rules`
Sends `ReloadRulesRequest` to trigger live rule reload + full re-sweep.
Reports any rule load errors from the response. On success, prints confirmation.

## `gui [path]`
Sends `LaunchGUIRequest` to the daemon. Optional path argument navigates the GUI to that directory.
- If GUI already running: prints "GUI already running; showing window"
- If GUI launched: prints "GUI launched"

## Helper functions

### `formatUptime(seconds) string`
Formats an uptime duration as human-readable string (e.g., "2h 15m 30s").
