# Architecture Decision Records

---

## ADR-1: SQLite as Primary Store
**Status:** Accepted | **Risk:** Medium

Use `modernc.org/sqlite` (CGo-free port) with FTS5 for full-text search and a junction
table (`file_tags`) for tag-file relationships. Load `sqlite-vec` extension for vector
similarity (KNN queries).

**Rationale:** Zero deployment friction — single embedded database file, no separate
process. FTS5 handles the full-text search case. sqlite-vec handles embedding similarity.
Both work via Go's standard database/sql interface.

**Escalation path:** If recursive CTE performance degrades on large collections (> 500k files
with power-law tag distributions), move graph traversal to the in-memory graph
(`dominikbraun/graph`). See ADR-8.

**Do not use:** `mattn/go-sqlite3` (requires CGo). `blevesearch/bleve` (heavier, separate
process not needed). DuckDB (good analytics but breaks the embedded single-process model).

---

## ADR-2: fanotify over inotify
**Status:** Accepted | **Risk:** High

Use fanotify with `FAN_RENAME` (kernel ≥ 5.17) for mount-wide filesystem watching.
Implement as a thin wrapper in `internal/watcher` via `golang.org/x/sys/unix`.

**Rationale:** `fsnotify` uses inotify, which requires recursive watch trees that don't
scale beyond ~8k watched directories (default kernel limit). fanotify watches entire
mount points with a single file descriptor and receives rename events atomically.

**Fallback:** Detect kernel version at startup. If < 5.17, log a warning and fall back to
inotify-based rename tracking (accept that cross-directory renames may briefly appear as
delete+create). Do not fail hard.

**Do not use:** `github.com/fsnotify/fsnotify` for production watch on large trees.
`github.com/containerd/fanotify` (too minimal; write own wrapper).

---

## ADR-3: WASM Plugin ABI via WASI stdio
**Status:** Accepted | **Risk:** Low

Plugin contract: host writes JSON to WASM module's stdin; module writes JSON to stdout;
exits 0 on success, non-zero to signal no contribution. Use `tetratelabs/wazero` as the
WASM runtime (pure Go, zero CGo, zero external deps).

**Rationale:** The stdio JSON contract is trivially implementable in any language (shell
scripts, Go, Rust, Python compiled to WASM, etc.) and is identical to the subprocess
harvester contract — one plugin binary works as both a subprocess and a WASM module.
The performance overhead (JSON serialisation) is dominated by file I/O at the scale of
a tagging daemon.

**Defer:** Shared-memory ABI (offset/length passing into linear memory) until profiling
shows it is needed. The WebAssembly Component Model may be worth revisiting at that point.

**Implementation note:** Use wazero's module compilation cache to avoid cold-start overhead.
Consider keeping long-lived WASM module instances for frequently-triggered rules.

---

## ADR-4: xattr as Source of Truth
**Status:** Accepted | **Risk:** Medium

Tags and metadata stored directly in `user.*` xattr namespace on files. The SQLite index
is a cache that must be fully rebuildable from xattrs alone. Tag provenance map stored in
`user.tags.source` (JSON object mapping tag→source).

**xattr namespace:**
- `user.tags` — space-separated tag list (canonical)
- `user.meta.<key>` — arbitrary harvested metadata values
- `user.tags.source` — JSON: `{"HD": "rule:hd-video", "work": "manual"}`

**Fallback:** For filesystems without xattr support (FAT32, some NFS/SMB mounts), maintain
a sidecar SQLite DB at `~/.local/share/tilbo/sidecar.db`, keyed by inode+device. Detect
per-mount at startup using a probe write; switch transparently.

**Do not store** tag provenance in xattrs — only the index tracks it. This avoids bloating
the xattr namespace with internal bookkeeping.

---

## ADR-5: Tag Provenance Tracking
**Status:** Accepted | **Risk:** Medium

Track per-tag source in the SQLite index (`tag_provenance` table). Manual tag removals
recorded as per-file rule override records (`tag_overrides` table). Rules will not reapply
a suppressed tag until the override is explicitly cleared by the user.

**Schema sketch:**
```sql
CREATE TABLE tag_provenance (
    file_id   INTEGER REFERENCES files(id),
    tag_id    INTEGER REFERENCES tags(id),
    source    TEXT NOT NULL,  -- 'manual' or 'rule:<rule_name>'
    PRIMARY KEY (file_id, tag_id)
);

CREATE TABLE tag_overrides (
    file_id   INTEGER REFERENCES files(id),
    tag_id    INTEGER REFERENCES tags(id),
    rule_name TEXT NOT NULL,
    suppressed_at INTEGER NOT NULL,  -- unix timestamp
    PRIMARY KEY (file_id, tag_id, rule_name)
);
```

**Rule re-evaluation:** On rule definition change, trigger a background sweep across all
indexed files. Hash the metadata map per file to skip files whose inputs haven't changed.
Run at `IOPRIO_CLASS_IDLE` priority.

---

## ADR-6: Browser Residency and Portal Integration
**Status:** Accepted | **Risk:** High

`tilbo-browser` registers `com.example.tilbo.Browser` on the session D-Bus on first launch.
Subsequent invocations of `tilbo-browser open` detect the existing instance, call its `Open`
D-Bus method, and exit. The browser process hides its window (does not quit) on close.

The browser (not the daemon) owns `org.freedesktop.impl.portal.FileChooser` on the session
bus. A portal config file routes `xdg-desktop-portal` to this backend:

```ini
# /usr/share/xdg-desktop-portal/portals/tilbo.portal
[portal]
DBusName=com.example.tilbo.Browser
Interfaces=org.freedesktop.impl.portal.FileChooser
UseIn=gnome;kde;sway;
```

**Startup latency target:** < 150ms warm show time (Qt/QML pre-warmed). Cold start is
acceptable to be slower; document the expectation. Keep the process resident after first
launch to ensure warm shows on all subsequent activations.

**Single-instance pattern:**
```go
reply, _ := conn.RequestName("com.example.tilbo.Browser", dbus.NameFlagDoNotQueue)
if reply == dbus.RequestNameReplyExists {
    obj := conn.Object("com.example.tilbo.Browser", "/com/example/tilbo/Browser")
    obj.Call("com.example.tilbo.Browser.Open", 0, args)
    os.Exit(0)
}
```

---

## ADR-7: Qt/QML via miqt
**Status:** Accepted with caveat | **Risk:** Medium

Use `mappu/miqt` for Go↔Qt6 bindings. This reintroduces CGo, but **only** in
`cmd/tilbo-browser`. All other packages must be CGo-free.

**Qt↔Go boundary rules:**
- Pass only primitive types and JSON blobs across the boundary. Never push complex Go structs into QML.
- All daemon I/O from the browser runs in goroutines. Results are delivered to the Qt main thread via a channel → `QTimer.singleShot` queued connection pattern. **Never call Qt methods directly from a non-Qt goroutine.**
- QML components live in `qml/` and are loaded as Qt resources.

**Mitigation for miqt gaps:** Audit the miqt issues tracker before starting M6. Budget 1 week
for upstreaming fixes if critical `QAbstractItemModel` or signal/slot functionality is missing.

**Fallback:** `gotk4 + Blueprint` (GNOME-native, better portal integration, same CGo dependency).
If miqt binding gaps are severe (> 2 weeks remediation), switch to gotk4 for M6.

**Nuclear escape hatch (portal window only):** A ~200-line Python/PyGObject helper can render
the portal file chooser window, with Go communicating over a local socket. Pragmatic, not ideal.

---

## ADR-8: In-Memory Graph for Large Collections
**Status:** Deferred to M4 (implement if benchmarks justify)

Load the file-tag bipartite graph into `dominikbraun/graph` in the daemon process.
At 1M files × 10 tags average, the adjacency structure is ~200–400MB RAM — acceptable
for a resident daemon.

**Trigger condition:** Profile SQLite recursive CTE traversal at 10k / 100k / 500k files.
If p99 latency for a 3-hop BFS exceeds 200ms at 100k files, implement in-memory graph.

**Memory estimation:**
```
1M files × 10 tags = 10M edges
Each edge: ~48 bytes (two uint64 node IDs + map overhead)
Total: ~480MB worst case; ~200MB typical with Go map internals
```

**Tag-frequency weighting:** Assign edge weights inversely proportional to tag cardinality
(analogous to IDF). This prevents high-cardinality tags like "document" from dominating
traversal and producing irrelevant results.

**Blended score formula:**
```
score = (1 / (hop_distance + 1)) * tag_weight * hop_weight
      + cosine_similarity * vector_weight
```
Default weights: `hop_weight=0.6`, `vector_weight=0.4`. Expose in daemon config.
