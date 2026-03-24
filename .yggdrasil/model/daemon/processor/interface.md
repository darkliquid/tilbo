# Interface

## `Processor` struct

Created via `newProcessor(idx, tags, pipeline, engine, g, embedder)`.

### Fields

| Field | Type | Purpose |
|-------|------|---------|
| `idx` | `*index.DB` | SQLite index for reading/writing file records |
| `tags` | `*xattr.Service` | Read/write tags via extended attributes |
| `pipeline` | `*harvester.Pipeline` | Metadata extraction pipeline |
| `engine` | `*rules.Engine` | TOML/Lua rule evaluation engine |
| `g` | `*graph.Graph` | Tag relationship graph |
| `embedder` | `*vectorize.ONNXEmbedder` | Semantic vector embedding (may be nil) |
| `nonRetryablePaths` | `map[string]struct{}` | Paths that caused non-retryable errors |
| `OnFileTagged` | `func(path, added, removed)` | Callback invoked when file tags change |

## `ProcessFile(ctx, path)`

Runs the full M2 pipeline for a single file:
1. Harvest metadata from all registered harvesters
2. Evaluate rules against metadata
3. Compute tag diff (added/removed)
4. Write tags to xattr, update index
5. Generate vector embedding if enabled
6. Call `OnFileTagged` if tags changed

Skips files in `nonRetryablePaths`. Adds files to the set on permission or context errors.

## `clearPathNonRetryable(path)`

Removes a single path from the non-retryable set (called on create/modify events as a signal the file may now be accessible).

## `clearNonRetryable()`

Clears the entire non-retryable set (called on SIGHUP rule reload).
