# Graceful Shutdown

## What must be satisfied

The daemon must shut down cleanly on SIGTERM/SIGINT via Go context cancellation. SIGHUP triggers a live config/rule reload without restarting (Unix convention, similar to nginx/systemd). All long-running goroutines must respect context cancellation and release resources (database connections, FUSE mounts, Unix sockets, file watchers).

## Why

The daemon manages persistent resources (SQLite databases, FUSE mounts, Unix domain sockets, file watchers). Unclean shutdown can leave stale sockets, mounted FUSE filesystems, or corrupted indexes. SIGHUP reload follows Unix daemon conventions and avoids downtime for config changes.

## Guidance

- Use `signal.NotifyContext` for SIGTERM/SIGINT → context cancellation
- Handle SIGHUP on a separate channel for live reload
- Defer cleanup functions in initialization order (reverse teardown)
- Use `cleanShutdownErr()` to distinguish intentional shutdown from unexpected errors
- Wait for goroutines with bounded timeouts (`shutdownWaitTimeout`)
