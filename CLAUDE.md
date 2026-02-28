# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# tilbo

Tag-first file management platform for Linux. Replaces folder-hierarchy browsing with
metadata-driven, graph-aware file interaction. Files are organised via extended filesystem
attributes (xattrs), enriched by a pluggable harvester pipeline, and exposed through a
virtual FUSE filesystem, a CLI, and a resident Qt/QML file browser / XDG portal backend.

## Stack

- **Language:** Go 1.22+ throughout. CGo permitted only in `cmd/tilbo-browser` (Qt binding).
- **UI:** `mappu/miqt` (Qt6 bindings) + QML. All QML components live in `qml/`.
- **Plugin sandbox:** `tetratelabs/wazero` (pure-Go WASM runtime, zero extra deps).
- **Storage:** `modernc.org/sqlite` (CGo-free) with FTS5 + `sqlite-vec` extension.
- **FUSE:** `hanwen/go-fuse/v2` low-level API.
- **IPC:** length-prefixed protobuf over Unix socket at `/run/user/$UID/tilbo.sock`.
- **D-Bus:** `godbus/dbus/v5` for portal backend and browser single-instance.
- **Filesystem events:** fanotify via `golang.org/x/sys/unix` (NOT fsnotify/inotify).
- **xattr:** `pkg/xattr`.
- **Scripted rules:** `yuin/gopher-lua` (Lua 5.1 VM, sandboxed).
- **Embeddings:** `knights-analytics/hugot` (ONNX, optional, off by default).

## Processes

| Binary | Role |
|---|---|
| `tilbo-daemon` | Core engine: fanotify, harvester pipeline, SQLite index, FUSE server, xattr sync, rule engine, WASM host, graph |
| `tilbo-cli` | Terminal client: search, tag management, xattr inspection, daemon config |
| `tilbo-browser` | Resident Qt/QML file manager + XDG portal FileChooser backend |

IPC split: D-Bus for portal activation and lifecycle signals; Unix socket for all bulk/streaming data.

## Repository Layout

```
tilbo/
  cmd/tilbo-daemon/
  cmd/tilbo-cli/
  cmd/tilbo-browser/       ← CGo, Qt; keep isolated
  internal/xattr/          ← xattr read/write library
  internal/index/          ← SQLite schema, queries, migrations
  internal/watcher/        ← fanotify wrapper
  internal/harvester/      ← pipeline, subprocess host, WASM host
  internal/rules/          ← TOML rule engine, Lua VM, WASM rules
  internal/fuse/           ← go-fuse mount, path parser, virtual dirs
  internal/graph/          ← in-memory graph, BFS/Dijkstra, scoring
  internal/ipc/            ← protobuf schema, socket server/client
  internal/dbus/           ← D-Bus portal backend, browser activation
  internal/embed/          ← ONNX embedding, sqlite-vec integration
  qml/                     ← QML components and assets
  plugins/examples/        ← example WASM and shell harvesters
```

## Build Commands

```sh
# Build all binaries (daemon and CLI are CGo-free)
go build ./cmd/tilbo-daemon ./cmd/tilbo-cli

# Build browser (requires Qt6 and CGo)
go build ./cmd/tilbo-browser

# Run tests
go test ./...

# Run a single package's tests
go test ./internal/index/...

# Lint
golangci-lint run ./...
```

## Key Constraints

- **xattr is source of truth.** The SQLite index is a cache — it must be fully rebuildable from xattrs alone.
- **Never call Qt methods from a non-Qt goroutine.** Use channel → `QTimer.singleShot` bridge pattern (see Qt Thread Safety below).
- **All harvester/rule plugin execution is sandboxed.** WASM plugins get WASI stdio only, no fs/network.
- **fanotify requires kernel ≥ 5.17** for `FAN_RENAME`. Detect at runtime and log a warning if unavailable; fall back to inotify-based rename tracking.
- **CGo is only permitted in `cmd/tilbo-browser`** and test helpers that exercise Qt. All other packages must be CGo-free.

## Coding Rules (non-browser packages)

Applies to `internal/**/*.go`, `cmd/tilbo-daemon/**/*.go`, `cmd/tilbo-cli/**/*.go`:

- No CGo. Use `modernc.org/sqlite` not `mattn/go-sqlite3`. Use `golang.org/x/sys/unix` for fanotify, not `fsnotify`.
- Use `log/slog` for structured logging. Never `fmt.Print*` for log output.
- All exported functions must have godoc comments.
- Return errors; do not panic in library code. Only `main` packages may call `log.Fatal`.
- All functions that do I/O must accept `context.Context` as first argument.
- Use `t.Cleanup` not `defer` in tests that create temp files or start goroutines.

## Coding Rules (browser package)

Applies to `cmd/tilbo-browser/**/*.go`:

- CGo is permitted here and only here.
- Never call Qt/miqt methods from a non-Qt goroutine. Use the `mainThreadCh` channel pattern.
- Keep the Go↔QML boundary thin: pass only primitives and JSON strings. Never pass Go structs into QML properties directly.
- All daemon IPC calls from the browser must be asynchronous (goroutine + channel). Never block the Qt event loop.
- QML files live in `qml/` and are embedded via `//go:embed qml`. Do not inline QML in Go strings.
- The browser process owns `org.freedesktop.impl.portal.FileChooser` on the session bus. The daemon does NOT own this interface.

## Qt Thread Safety Pattern

```go
func (b *Browser) SearchAsync(query string, callback func([]FileResult)) {
    go func() {
        results, _ := b.daemonClient.Search(query)
        b.mainThreadCh <- func() { callback(results) }
    }()
}

// Drain on every Qt event loop tick via QTimer(interval=0):
func (b *Browser) drainMainThreadChannel() {
    for {
        select {
        case fn := <-b.mainThreadCh:
            fn()
        default:
            return
        }
    }
}
```

## Detailed Reference Docs

Read these files when working in the relevant area:

| File | When to read |
|---|---|
| `.claude/docs/architecture.md` | Overview of all layers and data flows |
| `.claude/docs/milestones.md` | Milestone breakdown, task lists, priorities |
| `.claude/docs/adr.md` | Architecture Decision Records (ADR-1 through ADR-8) |
| `.claude/docs/ipc-schema.md` | Protobuf IPC message types and socket protocol |
| `.claude/docs/plugin-sdk.md` | Harvester/rule plugin contracts (stdio JSON, TOML, Lua, .so) |
| `.claude/docs/fuse-design.md` | FUSE path grammar, virtual dir semantics, inode scheme |
| `.claude/docs/index-schema.md` | SQLite schema, FTS5 config, sqlite-vec columns, graph tables |
| `.claude/docs/portal-design.md` | XDG portal backend, D-Bus interfaces, browser residency model |
