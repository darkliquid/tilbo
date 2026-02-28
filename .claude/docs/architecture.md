# Architecture Overview

## System Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        tilbo-daemon                          │
│                                                              │
│  fanotify watcher  ──►  harvester pipeline  ──►  rule engine │
│                                │                      │      │
│                         metadata map            tag writes   │
│                                │                      │      │
│                          SQLite index  ◄─────────────────────┘
│                          (FTS5 + vec)                        │
│                                │                             │
│                         graph cache                          │
│                      (dominikbraun/graph)                    │
│                                │                             │
│  FUSE server  ◄────────── index queries                      │
│  xattr sync   ◄──────────────────────────────────────────────┘
│                                                              │
│  exposes:  /run/user/$UID/tilbo.sock  (protobuf)            │
│            D-Bus: com.example.tilbo.Daemon                   │
└──────────────────────┬───────────────────────┬──────────────┘
                       │                       │
              Unix socket (bulk)        D-Bus (signals,
                       │                portal activation)
          ┌────────────┤                       │
          │            │                       │
   ┌──────▼──────┐  ┌──▼──────────────────────▼────────────┐
   │  tilbo-cli  │  │           tilbo-browser                │
   │             │  │                                        │
   │  search     │  │  resident (windowless when idle)       │
   │  tag mgmt   │  │  shows on D-Bus portal trigger         │
   │  xattr      │  │  or `tilbo-browser open` call          │
   │  config     │  │                                        │
   │  pipe-ready │  │  owns: org.freedesktop.impl.portal     │
   └─────────────┘  │         .FileChooser on session bus    │
                    └────────────────────────────────────────┘
```

## Logical Layers

### 1. Metadata & Index Layer (`internal/xattr`, `internal/index`, `internal/embed`)

- **xattr** is source of truth. Tags stored as `user.tags` (space-separated). Arbitrary metadata
  as `user.meta.<key>`. Tag provenance map as `user.tags.source` (JSON).
- **SQLite** (modernc.org/sqlite, CGo-free) holds:
  - `files` table with path, inode, device, mtime, content hash
  - `tags` table with name and cardinality
  - `file_tags` junction table (indexed on both columns)
  - `metadata` key-value table per file
  - `tag_overrides` per-file rule suppression records
  - FTS5 virtual table over metadata values
  - `embeddings` column (float32 blob) for sqlite-vec KNN
- **In-memory graph** (`dominikbraun/graph`) loaded from the junction table on startup.
  Incremental updates on index change events. Used for BFS/Dijkstra traversal.
- **Sidecar store**: for filesystems without xattr support (FAT32, some NFS mounts),
  a fallback SQLite db at `~/.local/share/tilbo/sidecar.db` keyed by inode+device.

### 2. Filesystem Event Layer (`internal/watcher`)

- **fanotify** mount-wide watcher via `golang.org/x/sys/unix`.
- Handles: `FAN_CREATE`, `FAN_MODIFY`, `FAN_CLOSE_WRITE`, `FAN_DELETE`,
  `FAN_MOVED_FROM`, `FAN_MOVED_TO`, `FAN_RENAME` (kernel ≥ 5.17).
- Event debounce: 200ms window per path before triggering pipeline.
- Detects kernel version at startup. Logs warning and falls back to inotify
  rename tracking if `FAN_RENAME` is unavailable.

### 3. Harvester Pipeline (`internal/harvester`)

Triggered per file event. Fan-out: all applicable harvesters run concurrently.
Results merged into a single metadata map before rule evaluation.

**Harvester types (in priority order):**
1. Built-in Go harvesters (MIME via h2non/filetype, stat basics) — in-process, no timeout needed
2. Subprocess harvesters — JSON stdio protocol, per-harvester timeout
3. WASM harvesters — wazero, WASI stdio, sandboxed, module compilation cache
4. Native `.so` plugin harvesters — dlopen, versioned vtable

**Harvester selection:** Each harvester declares `mime_filter` and/or `path_glob`.
Only matching harvesters run for a given file.

### 4. Rule Engine (`internal/rules`)

Runs after harvester pipeline produces a complete metadata map.

**Rule types:**
1. Declarative TOML rules — conditions: `eq`, `glob`, `gte/lte`, `between`, `in`, `not`, date ops
2. Lua scripted rules — gopher-lua VM, sandboxed (metadata map in → tag list out)
3. WASM scripted rules — wazero, same sandbox model

**Tag provenance:** Each applied tag records its source (`manual` or `rule:<name>`) in the index.
Manual removals create per-file rule override records; the rule will not reapply the tag until the
override is cleared. Rule definition changes trigger a background re-evaluation sweep at low I/O
priority (`ioprio_set`).

### 5. FUSE Layer (`internal/fuse`)

Virtual filesystem mounted at `~/tags` (configurable) or `/run/user/$UID/tags`.

**Path grammar:**
```
/tags/<expr>/           tag expression dir (readdir → index query)
/tags/python+work/      intersection
/tags/python,work/      union
/tags/python-draft/     python AND NOT draft
/tags/@recent/          built-in dynamic query: files modified in last 7 days
/tags/@search:<q>/      full-text search query
/tags/@untagged/        files with no tags
/tags/@similar:<path>/  graph + vector similarity to given real path
```

Files within virtual dirs are symlinks (or bind-mount style passthrough) to real paths.
Writes go to the real file. `setxattr` on a virtual path applies to the real file.
Renaming a file within a virtual dir applies tag semantics (retag, not filesystem rename).

**Inode stability:** `hash64(real_absolute_path) → inode`. Collision handling: linear probe.

### 6. IPC Layer (`internal/ipc`)

Unix domain socket at `/run/user/$UID/tilbo.sock`.
Protocol: 4-byte little-endian length prefix + protobuf-encoded message.

Key RPC methods (see `.claude/docs/ipc-schema.md` for full schema):
- `Search(tags, meta_filters, fts_query, limit, offset) → []FileResult`
- `TagFile(path, tags, operation) → TagResult`
- `GetMetadata(path) → MetadataMap`
- `RelatedFiles(seed_path, limit, max_hops, weights) → []ScoredFile`
- `DaemonStatus() → StatusResponse`
- `ReloadRules() → void`

### 7. D-Bus Layer (`internal/dbus`)

Session bus service: `com.example.tilbo.Daemon`

Signals emitted:
- `FileTagged(path, tags_added, tags_removed)`
- `IndexUpdated(stats)`
- `DaemonStateChanged(state)` — idle | scanning | ready | degraded

Portal interface (owned by `tilbo-browser`, not daemon):
`org.freedesktop.impl.portal.FileChooser` on `/org/freedesktop/portal/desktop`

## Data Flows

### File ingest flow
```
fanotify event
  → debounce (200ms)
  → read xattrs from file
  → run applicable harvesters (concurrent, timeout)
  → merge metadata map
  → evaluate matching rules
  → compute tag diff (new tags - existing tags)
  → write new tags to xattr
  → update SQLite index (file, tags, metadata, embeddings)
  → update in-memory graph
  → emit D-Bus FileTagged signal
```

### Search flow
```
IPC Search request
  → build SQL query (tag join + FTS5 + meta filters)
  → execute with sqlite-vec KNN if embedding filter present
  → return []FileResult with paths, tags, scores
```

### Related files flow
```
IPC RelatedFiles(seed, limit, hops, weights)
  → BFS/Dijkstra on in-memory graph from seed's tag nodes
  → collect reachable file nodes within hop limit
  → score: (1/(hop+1)) * tag_weight * hop_weight
  → optionally blend with sqlite-vec cosine similarity score
  → return top-N by blended score
```

### Portal flow
```
Application calls org.freedesktop.portal.FileChooser.OpenFile
  → xdg-desktop-portal routes to tilbo-browser
     (via /usr/share/xdg-desktop-portal/portals/tilbo.portal config)
  → tilbo-browser shows QML dialog in portal mode
  → user selects file(s) via tag search UI
  → tilbo-browser returns URIs via D-Bus portal reply
  → application receives file path, unaware of tag UI
```
