# Responsibility

The daemon node is the top-level entry point and orchestrator for tilbo-daemon. It is responsible for:

- **Daemon initialization**: wiring together all subsystems (index, syncer, watcher, pipeline, rule engine, FUSE, IPC server, GUI manager, embedder)
- **Event loop**: receiving filesystem events from the watcher and dispatching them via `handleFSEvent`
- **IPC request routing**: `buildIPCRequestHandler` dispatches incoming requests to the appropriate handler via protobuf type switch
- **FUSE mount setup**: starting the virtual tag filesystem mount in a goroutine
- **Syncer loop**: starting and monitoring the initial filesystem sync
- **Built-in harvester registration**: `registerBuiltins` adds all built-in metadata extractors to the pipeline
- **SIGHUP handling**: reloading rules and config without restart

## Not responsible for

- CLI flag parsing and cobra command setup (→ `daemon/cli`)
- Individual IPC handler logic (→ `daemon/ipc-handlers`, `daemon/browser-handlers`)
- The M2 processing pipeline logic (→ `daemon/processor`)
- GUI subprocess management (→ `daemon/gui-manager`)
