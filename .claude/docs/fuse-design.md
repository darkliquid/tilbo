# FUSE Design

## Mount Point

Default: `~/tags` (symlinked from `/run/user/$UID/tags` for XDG compliance).
Configurable in `~/.config/tilbo/config.toml` as `fuse.mount_point`.

## Path Grammar

```
/tags/<expr>/
```

`<expr>` is a tag expression evaluated against the SQLite index:

| Syntax | Semantics |
|---|---|
| `python` | files tagged "python" |
| `python+work` | files tagged "python" AND "work" (intersection) |
| `python,work` | files tagged "python" OR "work" (union) |
| `python-draft` | files tagged "python" AND NOT "draft" |
| `python+work-draft` | python AND work AND NOT draft |
| `@recent` | built-in: files modified in last 7 days |
| `@recent:30d` | built-in: files modified in last 30 days |
| `@search:<q>` | FTS5 full-text search across metadata values |
| `@untagged` | files with no tags |
| `@similar:<abs_path>` | graph + vector similarity to given real path |
| `@meta:<k>:<v>` | files where metadata key k equals value v |
| `@meta:<k>:gte:<n>` | files where metadata key k ≥ n (numeric) |

## Operator Precedence

`+` (AND) binds tighter than `,` (OR). Nesting via `(` `)` is supported but discouraged
in FUSE paths (URL encoding required). Use the CLI for complex queries.

## File Entries in Virtual Directories

Files appear as their real filename. The path returned by `readlink` (or reported in
`stat`) is the real absolute path. This means `cp /tags/work/file.pdf ~/` copies the
real file — there is no indirection at the data level.

On Linux, entries in virtual directories are **symlinks** to real paths.
Writes go to the symlink target (real file). This is transparent to all applications.

## Rename Semantics

Renaming a file **within** a single virtual directory has no effect (the file stays tagged as-is).

Renaming a file **between** virtual directories applies tag-change semantics:
- `mv /tags/work/file.pdf /tags/personal/file.pdf`
  → removes tag "work", adds tag "personal", writes xattr, updates index.
- The file's real path does not change.

Renaming a file **out of** the FUSE mount entirely is not supported and returns `EXDEV`.

## Inode Assignment

```go
func stableInode(realAbsPath string) uint64 {
    h := fnv.New64a()
    h.Write([]byte(realAbsPath))
    ino := h.Sum64()
    if ino == 0 { ino = 1 }  // 0 is reserved
    return ino
}
```

Collision handling: maintain a collision map in daemon memory. On collision, linear probe
by appending a counter suffix to the hash input. Collisions are expected to be rare
(< 1 in 2^32 for typical collections).

## Caching Strategy

| Attribute | Cache TTL | Notes |
|---|---|---|
| Directory entries (readdir) | 2s | Short; tag index updates should be visible quickly |
| File attrs (getattr) | 30s | Stat data changes rarely |
| Symlink targets | 60s | Real paths are stable |
| Negative lookups | 1s | File may be tagged very soon after creation |

These are defaults. Expose `fuse.cache_ttl_dir`, `fuse.cache_ttl_attr` in config.

## Performance: High-Cardinality Tags

Tags with very high cardinality (e.g., "document" on 50k files) cause expensive readdir
operations. Mitigations:

1. **Result cap:** Default max 10,000 entries per virtual directory. Configurable.
   Return `ENOMEM` if cap would be exceeded (with a log message explaining why).
2. **Streaming readdir:** Use `go-fuse`'s `ReadDirPlus` with pagination — don't load all
   results into memory before returning the first entry.
3. **Tag-frequency weight:** When resolving `@similar` queries, penalise traversal through
   high-cardinality tags so they don't dominate results.

## Error Cases

| Condition | FUSE errno |
|---|---|
| Invalid tag expression in path | `ENOENT` |
| Tag expression valid but no results | Return empty directory (not error) |
| Daemon index not ready (STATE_SCANNING) | Serve stale results if available; return empty otherwise |
| Real file deleted after appearing in virtual dir | `ENOENT` on lookup |
| xattr write permission denied | `EPERM` |

## FUSE Mount Options

```
-o auto_unmount          # unmount if daemon exits (prevents hangs)
-o allow_other           # allow other users (optional, requires user_allow_other in /etc/fuse.conf)
-o default_permissions   # kernel enforces permission checks
-o ro                    # read-only mode (future: config option)
```

`auto_unmount` is mandatory. Without it, a daemon crash leaves the mount point in a broken
state and any application with open handles will hang indefinitely waiting for FUSE responses.
