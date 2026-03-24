# Interface

## `run(ctx, hupCh, watchPath, dbPath, fuseMount, sockPath, cfgPath, watcherBackend, watchHidden, embedModelPath, embedModelName, embedDisabled) error`

Main daemon lifecycle function. Initializes all subsystems, starts background goroutines, and enters the event loop. Returns nil on clean shutdown, non-nil on unexpected failure.

### Parameters

| Parameter | Type | Purpose |
|-----------|------|---------|
| `ctx` | `context.Context` | Cancellation context (SIGTERM/SIGINT) |
| `hupCh` | `<-chan os.Signal` | SIGHUP channel for live reload |
| `watchPath` | `string` | Directory to watch for filesystem events |
| `dbPath` | `string` | SQLite index database path |
| `fuseMount` | `string` | FUSE virtual filesystem mount point (empty to disable) |
| `sockPath` | `string` | Unix socket path for IPC |
| `cfgPath` | `string` | Config file path |
| `watcherBackend` | `watcher.Backend` | File watcher backend (fanotify/inotify) |
| `watchHidden` | `bool` | Whether to watch hidden files |
| `embedModelPath` | `string` | ONNX model path for vector embeddings |
| `embedModelName` | `string` | Model name for embedding |
| `embedDisabled` | `bool` | Disable vector embeddings |

## `buildIPCRequestHandler(...) func(context.Context, *ipcv1.Request) (*ipcv1.Response, error)`

Creates the IPC request dispatch function. Routes requests to handler functions via protobuf type switch on `req.GetKind()`.

## `handleFSEvent(ctx, ev, syncer, idx, proc)`

Package-level function dispatching filesystem events. Routes create/modify/rename/delete to appropriate index and processor operations.

## `runEventLoop(ctx, events, watchErrCh, hupCh, syncer, idx, proc, engine, ruleReg, sweeper, wasmCache, cfgPath) error`

Select-based event loop handling FS events, watcher errors, and SIGHUP signals.

## `registerBuiltins(p *harvester.Pipeline)`

Registers all built-in harvesters (stat, MIME, EXIF, PDF, media, EPUB, and optional external-binary harvesters).

## Failure modes

- Database open failure: returns error immediately
- FUSE mount failure: logs warning, continues without FUSE
- Watcher failure: returns error (triggers shutdown)
- IPC server failure: returns error (triggers shutdown)
