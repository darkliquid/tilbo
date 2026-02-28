# Milestones & Task Breakdown

Six milestones, each independently useful and shippable.
Estimated durations assume one focused developer.
M3 (FUSE) and M5 (CLI) can run in parallel with a second developer.
M6 requires M1–M3 complete; M4 and M5 can overlap with M6.

---

## M1 — Foundation: xattr, Index & Daemon Skeleton
**Duration:** 4–6 weeks

Establish the core data layer and daemon process. No FUSE, no UI.
Delivers a working metadata store, SQLite index, and Unix socket IPC skeleton.

| Task | Effort | P | Notes |
|---|---|---|---|
| Design xattr schema (`user.tags`, `user.meta.*`, `user.tags.source`) | 3d | P0 | Hard to change later. Defines on-disk contract. |
| Implement xattr read/write library (`pkg/xattr` wrapper with batch read) | 2d | P0 | |
| SQLite schema: files, tags, file_tags, metadata kv, tag_provenance, FTS5, tag-freq view | 3d | P0 | Include FTS5 virtual table from day one |

| Daemon skeleton: process lifecycle, signal handling, graceful shutdown | 2d | P0 | Use `log/slog`; write systemd user service unit |
| Unix socket IPC: protobuf framing, request/response skeleton | 4d | P0 | Define full proto schema upfront; see `ipc-schema.md` |
| xattr→index sync on startup (full scan, low `ionice` priority) | 3d | P0 | Report progress via `DaemonStateChanged` signal |
| Incremental index update on fanotify events | 3d | P0 | Handle create, modify, rename, delete, cross-mount move |
| Sidecar store for non-xattr filesystems | 3d | P1 | Detect xattr support per mount at startup |
| Unit tests: xattr lib and index sync | 3d | P0 | |

**Research callout:** Study Syncthing's watcher architecture for edge cases:
recursive add on new-directory creation, very large directory renames, watch limit tunables.

---

## M2 — Harvester Pipeline & Auto-Tag Rules
**Duration:** 6–8 weeks

Pluggable metadata enrichment and auto-tagging. The system becomes self-organising.

| Task | Effort | P | Notes |
|---|---|---|---|
| Harvester stdio JSON contract (input/output schema, version field) | 2d | P0 | Stabilise before writing any harvesters |
| Built-in: MIME via `h2non/filetype` (in-process, no subprocess) | 1d | P0 | |
| Built-in: media metadata via `ffprobe` subprocess (JSON mode) | 3d | P0 | Timeout, stderr capture, parse width/height/duration/codec/hdr |
| Built-in: EXIF via `exiv2` subprocess | 2d | P1 | |
| Built-in: audio tags via `taglib` subprocess | 2d | P1 | |
| Built-in: PDF metadata via `pdfinfo` subprocess | 1d | P2 | |
| Built-in: stat basics (size tiers, mtime buckets, permissions) | 1d | P0 | |
| Harvester registration via drop-in TOML (`mime_filter`, `path_glob`, `priority`, `timeout_ms`, `async`) | 3d | P0 | Drop-in dir: `~/.config/tilbo/harvesters/` |
| Subprocess harvester host (goroutine pool, timeout, JSON decode, error handling) | 4d | P0 | |
| WASM harvester host via wazero (WASI stdio, sandbox, module compilation cache) | 5d | P0 | Research wazero module caching to avoid per-file cold start cost |
| Native `.so` plugin interface (`dlopen`, vtable, `TILBO_PLUGIN_API_VERSION` guard) | 4d | P2 | Document C header as plugin SDK; see `plugin-sdk.md` |
| Harvester pipeline fan-out: concurrent execution, metadata map merge strategy | 3d | P0 | Key-conflict policy: higher priority harvester wins |
| Declarative TOML rule engine (`eq`, `glob`, `gte/lte`, `between`, `in`, `not`, date ops, `any` flag) | 5d | P0 | |
| Lua scripted rules via `gopher-lua` (sandboxed: metadata map in, tag list out) | 4d | P1 | No fs/network access in sandbox |
| WASM scripted rules via wazero (same sandbox model) | 3d | P1 | |
| Tag provenance tracking (source map in index; per-file rule overrides) | 3d | P0 | |
| Rule re-evaluation sweep on rule change (background, `ioprio_set` low priority) | 3d | P1 | Hash metadata map to skip files that haven't changed |
| Rule priority and conflict resolution | 2d | P1 | Higher priority rules run last; their tags win |
| Integration tests: full pipeline on fixture files (video, image, PDF, audio) | 4d | P0 | |


---

## M3 — FUSE Virtual Filesystem
**Duration:** 4–5 weeks

Virtual filesystem at `~/tags`. Existing software gets tag-aware browsing with zero changes.

| Task | Effort | P | Notes |
|---|---|---|---|
| Study `go-fuse` v2 low-level API; read rclone VFS layer as reference | 3d | P0 | Do this before writing any FUSE code |
| FUSE mount lifecycle: mount, health check, `auto_unmount`, remount on daemon restart | 3d | P0 | |
| Path parser: `/<expr>/` with intersection `+`, union `,`, negation `-` | 4d | P0 | See `fuse-design.md` for full grammar |
| Special virtual dirs: `@recent`, `@search:<q>`, `@untagged`, `@similar:<path>` | 3d | P1 | |
| Inode stability: `hash64(real_abs_path)` with linear-probe collision handling | 2d | P0 | |
| `Readdir`: query index for tag expression; stream results; handle 50k+ without blocking | 4d | P0 | Paginate via offset cursor |
| `Lookup` / `Getattr`: stat passthrough to real file | 2d | P0 | |
| `Read` / `Write`: passthrough to real file path | 2d | P0 | |
| `Setxattr` on virtual path: apply to real file and update index | 2d | P0 | |
| Rename in virtual dir: apply tag-change semantics (retag, not filesystem rename) | 3d | P1 | Moving `file` from `/tags/work/` to `/tags/personal/` = retag |
| Tag-frequency weighting to limit fan-out on high-cardinality tags | 3d | P1 | Prevents "document" tag triggering 50k-entry readdir |
| FUSE multithreading: concurrent request handling; shared index `RLock` | 2d | P0 | |
| Integration tests: mount in test harness; assert readdir/lookup/write results | 3d | P0 | |

**Research callout:** Read `go-fuse` `kernel_cache` and `EntryTimeout` docs carefully.
Aggressive caching improves performance but causes stale listings when the index updates.
Tune TTLs to balance responsiveness vs query load for the expected workload.

---

## M4 — Graph Navigation
**Duration:** 2–3 weeks

Relational file discovery ordered by tag-graph distance.

| Task | Effort | P | Notes |
|---|---|---|---|
| Load file-tag bipartite graph into `dominikbraun/graph` on daemon start | 3d | P0 | Incremental update on every index change |
| BFS/Dijkstra traversal: files ordered by hop distance from seed set | 3d | P0 | |
| Tag-frequency weighting: penalise traversal through high-cardinality tags | 4d | P1 | Analogous to IDF; prevents "pdf" dominating graph traversal |
| Hop limit and result cap (configurable, default: 3 hops, 100 results) | 1d | P0 | |
| IPC: `RelatedFiles(seed, limit, hops, weights)` RPC | 2d | P0 | |

| FUSE: `@similar:<path>` virtual dir backed by graph query | 3d | P1 | |
| Benchmark: graph traversal on 100k file corpus; target p99 < 50ms | 3d | P0 | |

**Research callout:** Profile SQLite recursive CTE vs in-memory BFS at 10k, 100k, 500k files
with realistic power-law tag distributions (few tags on many files; many tags on few files).
This determines whether the in-memory graph is required for v1 or can be deferred.

---

## M5 — CLI Client
**Duration:** 3–4 weeks

Composable, pipe-friendly terminal interface to all daemon capabilities.

| Task | Effort | P | Notes |
|---|---|---|---|
| CLI framework + top-level command structure (cobra) | 1d | P0 | |
| `tilbo tag add/remove/list <path> [tags…]` | 2d | P0 | |
| `tilbo search --tags <expr> --meta <k=v> --format [json\|tsv\|human]` | 3d | P0 | json is default for pipe-friendliness |
| `tilbo meta show/set/delete <path> [key] [value]` | 2d | P0 | |
| `tilbo related <path> --limit N --hops N` | 2d | P1 | |
| `tilbo daemon status/stop/reload-rules` | 2d | P0 | |
| `tilbo rule list/validate/test <file>` | 2d | P1 | `test` runs harvesters on file and shows which rules fire |
| `tilbo harvester list/test <file>` | 2d | P1 | |
| `tilbo config get/set` | 1d | P2 | |
| Shell completions: bash, zsh, fish (cobra generates; add custom tag-name completion) | 2d | P1 | |
| Man page generation | 1d | P2 | |
| Daemon auto-start if socket absent (systemd socket activation preferred) | 2d | P0 | |
| Document `fzf` integration pattern (not built-in) | 1d | P2 | `tilbo search … \| fzf \| xargs open` |

---

## M6 — Qt/QML Browser & XDG Portal Backend
**Duration:** 8–12 weeks

Resident file manager + transparent portal integration for all portal-aware apps.

| Task | Effort | P | Notes |
|---|---|---|---|
| miqt build system integration (CGo, Qt6 detection, cross-compilation notes) | 3d | P0 | Document build requirements; hardest build step |
| Daemon socket client (async, goroutine-per-request, result channels) | 3d | P0 | |
| Qt main-thread delivery bridge: goroutine → channel → `QTimer.singleShot` | 3d | P0 | **Critical**: Qt methods cannot be called from non-Qt threads |
| Single-instance enforcement via D-Bus name ownership | 2d | P0 | Second instance calls `Open` on existing instance and exits |
| Windowless residency: hide on close, show on D-Bus activation | 2d | P0 | |
| QML component: `TagSearchBar` (autocomplete tag names from index) | 4d | P0 | |
| QML component: `FileGrid` / `FileList` (thumbnail, name, tag chips) | 5d | P0 | |
| QML component: `MetadataPanel` (sidebar, xattr display, inline tag editing) | 4d | P1 | |
| QML component: `GraphView` (force-directed, related files, hop-ring layout) | 7d | P1 | Canvas-based; research d3-force algorithm for QML reimplementation |
| Browser mode: full window, tag nav, graph view, drag-and-drop tagging | 5d | P0 | |
| Portal mode: constrained dialog; returns path via D-Bus portal reply | 4d | P0 | |
| Register as `org.freedesktop.impl.portal.FileChooser` on session bus | 3d | P0 | |
| Install portal config file (`/usr/share/xdg-desktop-portal/portals/tilbo.portal`) | 1d | P0 | Routes xdg-desktop-portal to tilbo-browser |
| Measure portal startup latency; target < 150ms warm show | 2d | P0 | Pre-warm Qt/QML; keep process resident |
| GTK bookmark injection for non-portal apps (`~/.config/gtk-4.0/bookmarks`) | 1d | P1 | Adds FUSE virtual dirs as GTK sidebar entries |
| Thumbnail generation: request from daemon harvester; display in grid | 3d | P1 | |
| Settings UI: harvester config, rule editor | 4d | P2 | |
| Keyboard navigation and accessibility | 3d | P1 | |
| Packaging: `.desktop` file, autostart entry, portal config | 2d | P0 | |

**Research callout (do before starting M6):** Audit `mappu/miqt` issues tracker for
`QAbstractItemModel` and signal/slot gaps. If critical functionality is missing, budget
1 week to upstream fixes. `gotk4 + Blueprint` is the fallback path if miqt gaps are severe.

**Escape hatch:** If Go+CGo portal window drawing proves too difficult, a small Python/PyGObject
helper (~200 lines) can render the window with Go communicating over a local socket.
This is pragmatic, not a design failure.

---

## Timeline Summary

| Milestone | Duration | Cumulative |
|---|---|---|
| M1 Foundation | 4–6w | 4–6w |
| M2 Harvester & Rules | 6–8w | 10–14w |
| M3 FUSE | 4–5w | 14–19w |
| M4 Graph | 3–4w | 17–22w |
| M5 CLI | 3–4w | 21–29w |
| M6 Browser & Portal | 8–12w | 29–41w |

M3 and M5 have no inter-dependency and can run in parallel.
M4 requires M1+M2. M6 requires M1–M3; M4 and M5 can overlap with M6.
