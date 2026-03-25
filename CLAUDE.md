# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tilbo is a Linux filesystem tagging and metadata system. Instead of folder hierarchies, it uses metadata-driven, graph-aware file interaction. Tags and metadata are stored via extended filesystem attributes (xattrs) with SQLite fallback for unsupported filesystems.

Two main entrypoints:
- **tilbo** (`cmd/tilbo/`): Unified CLI binary for tagging, searching, file operations, and running the daemon via `tilbo daemon`
- **daemon command runtime** (`internal/daemon/`): Importable package that provides the `tilbo daemon` command and runtime implementation
- **tilbo-quickshell** (`internal/quickshell/`): QML-based GUI file browser using [Quickshell](https://quickshell.outfoxxed.me/)

## Build & Development Commands

This project uses **mise** as its task runner. All tools (Go, buf, golangci-lint, sqlc, node, esbuild, protobufjs-cli) are managed via mise.

```sh
mise run build              # Build the tilbo binary, runs code generation first
mise run build-daemon       # Build the tilbo binary
mise run build-cli          # Build the tilbo binary
mise run test               # Run unit tests (go test -v ./...)
mise run lint               # Lint with golangci-lint (v2.11.3, strict config)
mise run format             # Format with goimports + golines
mise run fixup              # go fix + golangci-lint --fix
mise run ci                 # Full pipeline: generate, lint, test, build
mise run clean              # Remove build artifacts and generated code
```

Run a single test:
```sh
go test -v -run TestName ./internal/package/...
```

Integration tests (require Docker):
```sh
mise run integration-test           # Uses default Docker context
mise run local-integration-test     # Uses Colima Docker context
```

### Code Generation

```sh
mise run generate           # Run all code generation (proto + sqlc)
mise run generate-proto     # buf generate (Go + vtprotobuf)
mise run generate-js        # protobufjs → ESM bundle for QML
mise run generate-sqlc      # sqlc generate (in internal/index/)
```

Generated code locations:
- Go protobuf: `internal/ipc/gen/tilbo/ipc/v1/`
- QML IPC bindings: `internal/quickshell/services/qml_ipc.mjs`
- SQL bindings: `internal/index/dbgen/`

### Running the GUI

```sh
mise run run-quickshell     # Daemon must be running first
```

## Architecture

### IPC Model

Daemon ↔ CLI/GUI communication uses JSON-RPC over a Unix socket (`/run/user/$UID/tilbo.sock`). The protocol is defined in `proto/tilbo/ipc/v1/ipc.proto` using an envelope model (Request/Response/Event with request IDs).

Go bindings use vtprotobuf for performance. QML bindings are generated via protobufjs-cli and bundled with esbuild.

### Key Internal Packages

| Package | Purpose |
|---------|---------|
| `index` | SQLite FTS indexing, searching, rule evaluation. Uses sqlc for type-safe SQL (`query.sql` → `dbgen/`) |
| `ipc` | JSON-RPC client/server, message envelope handling |
| `harvester` | Metadata extraction pipeline (EXIF, PDF, audio, video, MKV) |
| `rules` | Tag rule engine: TOML declarative rules + Lua scripted rules |
| `fuse` | Virtual filesystem mount exposing tag-based symlink browsing |
| `xattr` | Primary tag/metadata storage via extended filesystem attributes |
| `sidecar` | SQLite-based fallback storage for filesystems without xattr support |
| `watcher` | inotify/fanotify-based filesystem monitoring |
| `sync` | Index synchronization with filesystem state |
| `graph` | Tag relationship/dependency graph |
| `vectorize` | Semantic vector embeddings via sqlite-vec |

### Daemon Internals (`internal/daemon/`)

- `handlers.go`: IPC request/response handlers
- `browser_handlers.go`: FUSE mount and browser-specific handlers
- `processor.go`: Main event loop and file watcher integration
- `gui_manager.go`: GUI lifecycle management
- `builtins.go`: Built-in harvester implementations

### GUI (`internal/quickshell/`)

Pure QML application — no Go build step. Communicates with the daemon via the IPC Unix socket using generated JS protobuf bindings.

## Linting Notes

The golangci-lint config (`.golangci.yml`) is very strict. Key settings:
- Max line length: 120 (enforced by golines)
- Import grouping: stdlib, third-party, then `github.com/darkliquid/tilbo` (enforced by goimports)
- Banned packages: `github.com/golang/protobuf` (use `google.golang.org/protobuf`), `math/rand` in non-test (use `math/rand/v2`), `log` in non-main (use `log/slog`)
- `nolint` directives require specific linter name and explanation (except `funlen`, `gocognit`, `golines`)
- `cmd/` is exempt from `forbidigo`, `gochecknoglobals`, `gochecknoinits`

## Proto Changes

When modifying `proto/tilbo/ipc/v1/ipc.proto`:
1. Run `mise run generate-proto` to regenerate Go bindings
2. Run `mise run generate-js` to regenerate QML bindings
3. Both generated outputs must be committed together with the proto changes

---

# context-mode — MANDATORY routing rules

You have context-mode MCP tools available. These rules are NOT optional — they protect your context window from flooding. A single unrouted command can dump 56 KB into context and waste the entire session.

## BLOCKED commands — do NOT attempt these

### curl / wget — BLOCKED
Any Bash command containing `curl` or `wget` is intercepted and replaced with an error message. Do NOT retry.
Instead use:
- `ctx_fetch_and_index(url, source)` to fetch and index web pages
- `ctx_execute(language: "javascript", code: "const r = await fetch(...)")` to run HTTP calls in sandbox

### Inline HTTP — BLOCKED
Any Bash command containing `fetch('http`, `requests.get(`, `requests.post(`, `http.get(`, or `http.request(` is intercepted and replaced with an error message. Do NOT retry with Bash.
Instead use:
- `ctx_execute(language, code)` to run HTTP calls in sandbox — only stdout enters context

### WebFetch — BLOCKED
WebFetch calls are denied entirely. The URL is extracted and you are told to use `ctx_fetch_and_index` instead.
Instead use:
- `ctx_fetch_and_index(url, source)` then `ctx_search(queries)` to query the indexed content

## REDIRECTED tools — use sandbox equivalents

### Bash (>20 lines output)
Bash is ONLY for: `git`, `mkdir`, `rm`, `mv`, `cd`, `ls`, `npm install`, `pip install`, and other short-output commands.
For everything else, use:
- `ctx_batch_execute(commands, queries)` — run multiple commands + search in ONE call
- `ctx_execute(language: "shell", code: "...")` — run in sandbox, only stdout enters context

### Read (for analysis)
If you are reading a file to **Edit** it → Read is correct (Edit needs content in context).
If you are reading to **analyze, explore, or summarize** → use `ctx_execute_file(path, language, code)` instead. Only your printed summary enters context. The raw file content stays in the sandbox.

### Grep (large results)
Grep results can flood context. Use `ctx_execute(language: "shell", code: "grep ...")` to run searches in sandbox. Only your printed summary enters context.

## Tool selection hierarchy

1. **GATHER**: `ctx_batch_execute(commands, queries)` — Primary tool. Runs all commands, auto-indexes output, returns search results. ONE call replaces 30+ individual calls.
2. **FOLLOW-UP**: `ctx_search(queries: ["q1", "q2", ...])` — Query indexed content. Pass ALL questions as array in ONE call.
3. **PROCESSING**: `ctx_execute(language, code)` | `ctx_execute_file(path, language, code)` — Sandbox execution. Only stdout enters context.
4. **WEB**: `ctx_fetch_and_index(url, source)` then `ctx_search(queries)` — Fetch, chunk, index, query. Raw HTML never enters context.
5. **INDEX**: `ctx_index(content, source)` — Store content in FTS5 knowledge base for later search.

## Subagent routing

When spawning subagents (Agent/Task tool), the routing block is automatically injected into their prompt. Bash-type subagents are upgraded to general-purpose so they have access to MCP tools. You do NOT need to manually instruct subagents about context-mode.

## Output constraints

- Keep responses under 500 words.
- Write artifacts (code, configs, PRDs) to FILES — never return them as inline text. Return only: file path + 1-line description.
- When indexing content, use descriptive source labels so others can `ctx_search(source: "label")` later.

## ctx commands

| Command | Action |
|---------|--------|
| `ctx stats` | Call the `ctx_stats` MCP tool and display the full output verbatim |
| `ctx doctor` | Call the `ctx_doctor` MCP tool, run the returned shell command, display as checklist |
| `ctx upgrade` | Call the `ctx_upgrade` MCP tool, run the returned shell command, display as checklist |
@.yggdrasil/agent-rules.md
