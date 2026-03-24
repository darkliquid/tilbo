# Responsibility

The IPC Handlers module is responsible for:

- **Tag operations**: adding, removing, and setting tags on files via xattr, with index sync
- **Search**: full-text and metadata search against the SQLite index, with optional vector similarity
- **Metadata queries**: retrieving and setting file metadata from the index
- **Tag listing**: listing all known tags, with optional prefix filtering
- **Tag hydration**: batch-resolving tags for multiple file paths
- **Related files**: finding files related via the tag graph
- **Directory listing**: listing directory contents with tag and metadata enrichment (used by both CLI and GUI)

## Not responsible for

- Request dispatch/routing (→ `daemon` via `buildIPCRequestHandler`)
- Browser-specific file operations (rename, trash, open, thumbnails) (→ `daemon/browser-handlers`)
- Rule management (reload handled in event loop, sweep in `buildIPCRequestHandler`)
