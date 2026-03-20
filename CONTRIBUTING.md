# Contributing to Tilbo

This guide covers the architecture, development workflow, and project-specific conventions for contributing to Tilbo.

---

## Architecture Overview

Tilbo is a three-component system: a daemon, a CLI, and a GUI. All three are in a single Go module (`github.com/darkliquid/tilbo`) with the GUI written in QML.

### Component Interaction

```
                         Unix socket (JSON-RPC)
 tilbo-cli ────────────────────────────────────────► tilbo-daemon
                                                        │
 tilbo-quickshell (QML) ──── tilbo-ui.sock ────────────►│
                                                        │
                               ┌────────────────────────┤
                               │                        │
                         ┌─────▼─────┐           ┌──────▼──────┐
                         │  Watcher  │           │  IPC Server │
                         │ (fanotify │           │  (handlers) │
                         │ /inotify) │           └──────┬──────┘
                         └─────┬─────┘                  │
                               │ filesystem events      │ requests
                         ┌─────▼─────┐                  │
                         │ Processor │◄─────────────────┘
                         │ (M2 pipe) │
                         └─────┬─────┘
                               │
                    ┌──────────┼──────────┐
              ┌─────▼─────┐ ┌──▼──┐ ┌─────▼──────┐
              │ Harvester │ │Rules│ │ Vectorizer │
              │ Pipeline  │ │Eng. │ │ (optional) │
              └─────┬─────┘ └──┬──┘ └─────┬──────┘
                    │          │           │
              ┌─────▼──────────▼───────────▼─────┐
              │        SQLite Index               │
              │  (FTS5 + sqlite-vec + sidecar)    │
              └──────────────┬────────────────────┘
                             │
                      ┌──────▼──────┐
                      │ xattr / FS  │
                      │ (source of  │
                      │   truth)    │
                      └─────────────┘
                             │
                      ┌──────▼──────┐
                      │ FUSE Mount  │
                      │ (tag-based  │
                      │  symlinks)  │
                      └─────────────┘
```

### Data Flow

1. **Watcher** detects filesystem changes via fanotify (preferred) or inotify (fallback)
2. **Processor** (the M2 pipeline) receives events and orchestrates processing:
   - **Harvesters** extract metadata (MIME type, dimensions, EXIF, audio tags, etc.)
   - **Rule Engine** evaluates TOML/Lua rules against the metadata map and determines which tags to apply
   - **Vectorizer** (optional) generates embeddings for semantic similarity search
3. **Index** stores results in SQLite with FTS5 for full-text search and sqlite-vec for vector queries
4. **xattrs** are the source of truth for tags and metadata. The index is a rebuildable cache
5. **Sidecar** provides fallback storage for filesystems without xattr support (keyed by inode+device)
6. **FUSE** exposes a virtual filesystem where directories represent tag queries and entries are symlinks to real files
7. **IPC** serves requests from CLI and GUI over a Unix socket using protobuf-defined message envelopes

### Storage Hierarchy

Tags and metadata are written to two places simultaneously:

- **Primary (xattrs)**: `user.tags` (space-separated list), `user.meta.<key>` (individual values), `user.tags.source` (JSON provenance)
- **Fallback (sidecar)**: SQLite database at `~/.local/share/tilbo/sidecar.db` for filesystems without xattr support

The SQLite index is always the third copy, used purely for fast querying. It can be deleted and rebuilt from xattrs at any time.

### IPC Protocol

Communication uses a protobuf-defined envelope model (`proto/tilbo/ipc/v1/ipc.proto`):

```
Envelope { request_id, oneof { Request, Response, Event } }
```

- **Request/Response**: Paired by `request_id`. Each request type has a corresponding response type.
- **Events**: Server-pushed notifications (e.g., `FileTaggedEvent`, `IndexUpdatedEvent`) with no response expected.
- **Transport**: Newline-delimited JSON over Unix sockets. Go uses vtprotobuf for marshalling performance; the QML GUI uses protobufjs-generated ESM bindings.

There are two sockets:
- `/run/user/$UID/tilbo.sock` — CLI-to-daemon IPC
- `$XDG_RUNTIME_DIR/tilbo-ui.sock` — GUI-to-daemon IPC (also receives push events)

### SQLite Schema

The index has six migration stages (in `internal/index/migrations/`):

| Migration | Purpose |
|-----------|---------|
| `0001_initial` | Core tables: `files`, `tags`, `file_tags`, `metadata`, `tag_provenance`, `tag_overrides`. Cardinality triggers on `file_tags` |
| `0002_fts5` | FTS5 virtual table over metadata values |
| `0003_sidecar` | `sidecar_data` table (inode+device keyed JSON blobs) |
| `0004_embeddings` | Raw embedding storage |
| `0005_vec_embeddings` | sqlite-vec virtual table for ANN vector search |
| `0006_perf` | Additional indexes for query performance |

Hand-written queries live in `internal/index/query.sql` and are compiled to type-safe Go via sqlc (output in `internal/index/dbgen/`).

### Harvester Pipeline

The harvester system has three execution modes:

- **Built-in**: Pure-Go extractors in `internal/harvester/builtin/` (EXIF, PDF, MP4, MKV, EPUB, audio tags, MIME detection, file stat). These run in-process.
- **Subprocess**: External tools invoked via stdin/stdout JSON protocol. Configured via TOML drop-in files in `~/.config/tilbo/harvesters/`.
- **WebAssembly**: WASI modules run in wazero sandbox. Same JSON protocol as subprocess but with no filesystem/network access.

Harvesters are registered in a priority-ordered registry. They run concurrently per-file, filtered by MIME type or path glob. Results are merged into a single metadata map before rule evaluation.

### Rule Engine

Two rule types:

- **TOML declarative rules**: Condition-based matching (operators: `eq`, `glob`, `gte`, `lte`, `gt`, `lt`, `between`, `in`, `not`, `before`, `after`). Stored in `~/.config/tilbo/rules/*.toml`.
- **Lua scripted rules**: An `apply(meta)` function receives the metadata map and returns a list of tags. Sandboxed (no FS/network access). Stored in `~/.config/tilbo/rules/*.lua`.

Rule overrides: if a user manually removes a rule-applied tag, the override is recorded in `tag_overrides` and the rule won't reapply it.

### GUI Architecture

The Quickshell GUI (`cmd/tilbo-quickshell/`) is a pure QML application with no Go build step:

- **Services layer** (`services/`): `TilboDaemon.qml` handles socket connection and JSON-RPC; `Theme.qml` provides centralised colour palette; `I18n.qml` provides localisation
- **Components** (`components/`): Reusable UI elements (file grid, file list, tag search bar, theme button/icon, image preview)
- **Windows** (`windows/`): `BrowserWindow.qml` implements the main window with dual mode (normal directory browsing and tag-based search)

The GUI receives push events from the daemon (`FileTagged`, `IndexUpdated`, `DaemonStateChanged`, `ShowWindow`) and updates in real time without polling.

---

## Development Setup

### Prerequisites

- **Linux** (kernel 5.10+ for fanotify; 5.17+ recommended)
- **mise** — task runner (install from [mise.jdx.dev](https://mise.jdx.dev))
- **Docker** or **Colima** — for integration tests
- **Quickshell** — only needed if working on the GUI

mise manages all other tools (Go, buf, golangci-lint, sqlc, Node.js, esbuild, protobufjs-cli). Run `mise install` to set everything up.

### Building

```sh
mise run build          # Build daemon + CLI (runs code generation first)
mise run build-daemon   # Build daemon only
mise run build-cli      # Build CLI only
```

### fanotify Permissions

The daemon prefers fanotify for filesystem watching, which requires `CAP_SYS_ADMIN`:

```sh
sudo setcap cap_sys_admin+ep ./tilbo-daemon
```

Rebuilding the binary clears file capabilities — reapply after each build. If the capability is unavailable, the daemon falls back to inotify automatically.

---

## mise Task Reference

All development tasks are defined in `mise.toml`. mise manages tool versions (Go, buf, golangci-lint, sqlc, Node.js, esbuild, protobufjs-cli) so you don't need to install them globally.

### Core Tasks

| Task | What it does | Notes |
|------|-------------|-------|
| `mise run build` | Build all binaries | Depends on `generate` |
| `mise run build-daemon` | Build daemon only | Depends on `generate` |
| `mise run build-cli` | Build CLI only | Depends on `generate` |
| `mise run test` | Unit tests (`go test -v ./...`) | |
| `mise run lint` | Lint with golangci-lint | Very strict config, see below |
| `mise run format` | Auto-format (goimports + golines) | |
| `mise run fixup` | `go fix` + `golangci-lint --fix` | Fixes what it can automatically |
| `mise run ci` | Full pipeline | generate → lint → test → build |
| `mise run clean` | Remove build artifacts + generated code | |

### Code Generation Tasks

| Task | What it does | Notes |
|------|-------------|-------|
| `mise run generate` | All code generation | Depends on generate-proto + generate-sqlc |
| `mise run generate-proto` | `buf generate` | Generates Go + vtprotobuf from `.proto` |
| `mise run generate-js` | protobufjs → ESM bundle | Generates QML IPC bindings |
| `mise run generate-sqlc` | `sqlc generate` | Runs in `internal/index/` context |

### Testing Tasks

| Task | What it does | Notes |
|------|-------------|-------|
| `mise run test` | Unit tests | `go test -v ./...` |
| `mise run integration-test` | Integration tests | Requires Docker |
| `mise run local-integration-test` | Integration tests (Colima) | Sets `DOCKER_HOST` for Colima socket |

### Running a Single Test

```sh
go test -v -run TestFunctionName ./internal/package/...
```

### Running the GUI

```sh
mise run run-quickshell   # Daemon must be running first
```

This auto-detects the icon theme via `contrib/scripts/detect-icon-theme.sh` and launches Quickshell.

### Dependency on `generate`

Both `build-daemon` and `build-cli` depend on `generate`, which runs protobuf and sqlc code generation. mise tracks source file timestamps, so generation only re-runs when `.proto`, `buf.*`, or `query.sql` files change.

---

## Code Generation Workflow

### Protobuf

The IPC protocol is defined in `proto/tilbo/ipc/v1/ipc.proto`. Changes to this file require regenerating bindings for both Go and JavaScript:

```sh
mise run generate-proto   # Go + vtprotobuf → internal/ipc/gen/
mise run generate-js      # protobufjs → cmd/tilbo-quickshell/services/qml_ipc.mjs
```

Both generated outputs must be committed alongside proto changes.

**Go bindings** use buf (`buf.gen.yaml`) with two plugins:
- `protoc-gen-go` — standard Go protobuf
- `protoc-gen-go-vtproto` — vtprotobuf for fast marshal/unmarshal/size

**JS bindings** use a three-step pipeline:
1. `pbjs` generates a static ES6 module
2. `pbts` generates TypeScript declarations
3. `esbuild` bundles into a single ESM file for QML import

### sqlc

SQL queries in `internal/index/query.sql` are compiled to type-safe Go by sqlc:

```sh
mise run generate-sqlc    # Output: internal/index/dbgen/
```

The sqlc config (`internal/index/sqlc.yaml`) targets SQLite and emits JSON tags. Generated code lives in `internal/index/dbgen/` — do not edit these files manually.

### Adding a New Migration

SQL migrations live in `internal/index/migrations/` and are numbered sequentially (`0007_description.sql`). The daemon applies them in order on startup. After adding a migration, update `query.sql` if new tables or columns are involved, then run `mise run generate-sqlc`.

---

## Linting and Formatting

The project uses golangci-lint v2.11.3 with a strict configuration (`.golangci.yml`). Key rules to be aware of:

### Line Length

Maximum 120 characters, enforced by golines. Run `mise run format` to auto-fix.

### Import Ordering

Imports must be grouped as: stdlib, third-party, then `github.com/darkliquid/tilbo`. Enforced by goimports.

### Banned Packages

| Banned | Use instead | Scope |
|--------|-------------|-------|
| `github.com/golang/protobuf` | `google.golang.org/protobuf` | All files |
| `math/rand` | `math/rand/v2` | Non-test files |
| `log` | `log/slog` | Non-main files |

### `nolint` Directives

All `nolint` comments must specify the linter name and include an explanation, except for `funlen`, `gocognit`, and `golines` which are allowed without explanation.

### Exemptions

Files under `cmd/` are exempt from `forbidigo` (fmt.Print is legitimate terminal output), `gochecknoglobals` (Cobra requires global vars), and `gochecknoinits` (Cobra uses init() for wiring).

### Quick Fix Workflow

```sh
mise run lint       # Check for issues
mise run fixup      # Auto-fix what's possible (go fix + golangci-lint --fix)
mise run format     # Auto-format (goimports + golines)
```

---

## Testing

### Unit Tests

```sh
mise run test                                           # All unit tests
go test -v -run TestSpecificFunction ./internal/pkg/... # Single test
go test -v -count=1 ./internal/index/...                # Skip test cache
```

### Integration Tests

Integration tests live in `test/integration/` and run inside a privileged Docker container with real fanotify, FUSE, and loopback-device capabilities. They test the full daemon lifecycle across multiple filesystem types (ext4, btrfs, vfat, tmpfs).

```sh
mise run integration-test         # Standard Docker
mise run local-integration-test   # Colima Docker context
```

Integration tests use testcontainers-go to manage the container lifecycle. The test suite:
- Builds tilbo-daemon and tilbo-cli from source
- Creates loop-mounted ext4, btrfs, vfat, and tmpfs volumes
- Starts a daemon instance and runs CLI + FUSE tests against it

Environment variables for `local-integration-test`:
- `TILBO_TEST_WATCHER` — watcher backend override (`fanotify` or `inotify`, default from env)
- `TILBO_TEST_TMPDIR` — temp directory for test artifacts

### Test Package Convention

The linter allows white-box testing (same package name) for core internal packages: `builtin`, `fuse`, `graph`, `harvester`, `index`, `ipc`, `main`, `rules`, `sidecar`, `sync`, `watcher`, `xattr`. Other packages should use `_test` package names.

---

## Adding a New Harvester

### Built-in (Go)

1. Create a file in `internal/harvester/builtin/` following the existing pattern
2. Implement the harvester interface (receives file path + existing metadata, returns metadata map)
3. Register it in the harvester registry with a priority and MIME/glob filter
4. The daemon's `builtins.go` wires built-in harvesters at startup

### External (Subprocess)

Create a TOML file in `~/.config/tilbo/harvesters/`:

```toml
[harvester]
name        = "my-harvester"
command     = ["/path/to/binary"]
mime_filter = ["video/*"]
priority    = 50
timeout_ms  = 5000
async       = true
```

The binary receives JSON on stdin (`{"path": "...", "mime": "...", "existing": {...}}`) and writes a JSON metadata map to stdout. Exit 0 to merge results; non-zero to skip.

### WebAssembly

Same TOML config but with a `.wasm` path in the command field. WASI modules have stdio only — no filesystem or network access.

---

## Adding a New IPC Method

1. Define request/response messages in `proto/tilbo/ipc/v1/ipc.proto`
2. Add the new types to the `Request` and `Response` `oneof` blocks
3. Run `mise run generate-proto` and `mise run generate-js`
4. Implement the handler in `cmd/tilbo-daemon/handlers.go` (or `browser_handlers.go` for browser-specific methods)
5. Add the CLI command in `cmd/tilbo-cli/cmd_<domain>.go`
6. If the GUI needs it, add the RPC call in `cmd/tilbo-quickshell/services/TilboDaemon.qml`
7. Commit the proto file and all generated outputs together

---

## Adding a New Rule Operator

TOML rule condition operators are defined in `internal/rules/toml.go`. To add a new operator:

1. Add the operator case to the condition evaluation logic in `toml.go`
2. Document it in the README under "Condition operators"
3. Add test coverage in the rules package tests

---

## Project Layout

```
cmd/
  tilbo-daemon/         Daemon binary (main, handlers, processor, FUSE, GUI manager)
  tilbo-cli/            CLI binary (Cobra commands)
  tilbo-quickshell/     QML GUI (components, services, windows)
internal/
  bookmarks/            GTK bookmarks integration for virtual tag roots
  browser/              Browser operations interface for FUSE/UI
  config/               Configuration file parsing
  desktopfile/          .desktop file parsing for "Open With" support
  extension/            Extension/plugin mechanism for custom file actions
  fsutil/               Filesystem utilities
  fuse/                 FUSE mount implementation (tag-based virtual FS)
  graph/                Tag relationship graph for related-file queries
  harvester/            Metadata extraction pipeline + builtin extractors
  icontheme/            XDG icon theme detection
  index/                SQLite index (FTS5 + sqlite-vec), migrations, sqlc queries
  ipc/                  JSON-RPC client/server over Unix sockets
  rules/                Tag rule engine (TOML declarative + Lua scripted)
  sidecar/              Fallback metadata storage for non-xattr filesystems
  sync/                 Background filesystem-to-index synchronisation
  thumbnail/            Image thumbnail generation
  trash/                XDG trash/recycle bin integration
  vectorize/            ONNX embedding model integration for semantic search
  watcher/              Filesystem monitoring (fanotify + inotify fallback)
  xattr/                Extended attribute read/write for tag storage
proto/
  tilbo/ipc/v1/         Protobuf IPC definitions
test/
  integration/          Docker-based integration tests
contrib/
  scripts/              Build and install helper scripts
  systemd/              systemd service unit file
```
