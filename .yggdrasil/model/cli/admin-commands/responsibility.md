# Responsibility

The Admin Commands module is responsible for:

- **daemon status**: showing daemon state (running, indexing, idle), files indexed count, uptime, and warnings (`tilbo daemon status`)
- **daemon reload-rules**: triggering a live rule reload and full re-sweep of indexed files (`tilbo daemon reload-rules`)
- **gui**: launching the Quickshell GUI via the daemon, or raising an existing window (`tilbo gui [path]`)

## Not responsible for

- Daemon lifecycle management (start/stop) — the daemon is managed via systemd or direct invocation
- GUI process management (→ daemon/gui-manager)
