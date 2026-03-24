# Internals

## Logic

### M2 Pipeline (`ProcessFile`)

1. Check non-retryable set — skip if path is marked
2. Run harvester pipeline: each harvester extracts metadata for the file (fan-out)
3. Merge harvested metadata into the index record
4. Evaluate rule engine: TOML declarative rules and Lua scripted rules compute tags
5. Diff current tags against computed tags to find additions and removals
6. Write updated tags to xattr via `xattr.Service`
7. Update the index record with new tags and metadata
8. If embedder is non-nil, generate/update vector embedding
9. If tags changed, invoke `OnFileTagged` callback

### Non-retryable path tracking

- Protected by `nonRetryableMu` (RWMutex) for concurrent access safety
- Paths are added when processing fails with `EACCES`, `EPERM`, or context cancellation
- Individual paths are cleared on new create/modify events (file may have become accessible)
- Entire set is cleared on SIGHUP to allow retry after config change

## Constraints

- `ProcessFile` must be called after `syncer.SyncFile` — the file record must exist in the index
- Harvester pipeline ordering is determined by harvester priority (set at registration)
- The `OnFileTagged` callback must be safe for concurrent invocation

## Decisions

- **Non-retryable tracking over retry loops**: chose tracking + skip over retry-with-backoff because permission errors on watched files are typically persistent (e.g., root-owned files in user home). SIGHUP clears the set as an escape hatch. Rationale: avoids CPU waste on files that will consistently fail.
