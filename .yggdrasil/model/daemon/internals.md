# Internals

## Logic

### Initialization sequence (`run()`)

1. Ensure parent directories exist for DB and socket paths
2. Open SQLite index database
3. Create xattr service, harvester pipeline, rule engine, graph, embedder
4. Register built-in harvesters via `registerBuiltins`
5. Load user/system harvester plugins and rules from config paths
6. Create Syncer and Processor
7. Start syncer loop in background goroutine
8. Create IPC server with wired request handler
9. Start FUSE mount in background goroutine
10. Start file watcher
11. Enter event loop (`runEventLoop`)

### Event loop (`runEventLoop`)

Select-based loop handling three channels:
- **FS events** (`events`) → `handleFSEvent` dispatches create/modify/rename/delete
- **Watcher errors** (`watchErrCh`) → triggers shutdown
- **SIGHUP** (`hupCh`) → reloads rules, clears non-retryable paths

### FS event dispatch (`handleFSEvent`)

- **Create/Modify**: clear non-retryable flag, stat file, sync to index, run M2 pipeline
- **Delete**: remove file from index
- **Rename**: delete old path, stat+sync+process new path

### Built-in harvester registration (`registerBuiltins`)

Two tiers:
- Always-on: stat, MIME, EXIF (pure Go), PDF, media, EPUB — registered unconditionally
- Optional: Magika (ML-based MIME), FFProbe, Calibre — registered only if external binary is found on PATH; nil harvesters silently skipped via `isNilHarvester` reflection check

## Decisions

- **`handleFSEvent` is a package-level function, not a Processor method**: candidate for refactor — rationale: unknown, inferred from code structure. The function coordinates between syncer and processor, so it sits above both.
- **Two socket types (main IPC + UI socket)**: the browser/GUI is a distinct application with capabilities that generic IPC clients don't have, so it gets its own socket and handler set. This mirrors the separation in handler code.
- **SIGHUP for rule reload**: follows Unix daemon convention (nginx, systemd). Avoids downtime for config changes.
- **Reflection-based nil harvester check**: chose `reflect.ValueOf(h).IsNil()` over type assertion because harvester constructors return concrete pointer types that satisfy the interface even when nil. A simple `h == nil` check fails for typed nil interfaces.
