# File Indexing

## Business context

Tilbo continuously monitors the user's filesystem for changes and maintains an up-to-date index of file tags and metadata. When a file is created, modified, renamed, or deleted, the system must detect the change, extract metadata, apply tagging rules, and update the searchable index — all without user intervention.

## Trigger

A filesystem event (create, modify, rename, delete) is detected by the file watcher (fanotify/inotify).

## Goal

The index reflects the current state of the filesystem, with all metadata harvested and tagging rules applied.

## Participants

- **Daemon event loop** (`daemon`) — receives FS events from the watcher, dispatches to handler
- **Processor** (`daemon/processor`) — runs the M2 pipeline: harvest metadata → evaluate rules → update xattr + index

## Paths

### Happy path

1. File watcher detects a create/modify event
2. Event loop receives the event and calls `handleFSEvent`
3. For create/modify: file is stat'd, synced to the index via `syncer.SyncFile`, then processed via `proc.ProcessFile`
4. Processor runs the harvester pipeline (EXIF, PDF, audio, etc.) to extract metadata
5. Rule engine evaluates TOML/Lua rules against the harvested metadata
6. Tags and metadata are written to xattr and updated in the SQLite index
7. If tags changed, `OnFileTagged` callback notifies connected clients

### Rename path

1. Old path is deleted from the index
2. New path is stat'd, synced, and processed as a create

### Delete path

1. File record is removed from the index

### Non-retryable path

1. If a file causes a permission or context error during processing, the path is added to `nonRetryablePaths`
2. Subsequent events for that path are skipped to avoid repeated failures
3. The set is cleared on SIGHUP (rule reload)

## Invariants across all paths

- The index is always eventually consistent with the filesystem state
- A file is synced to the index before the M2 pipeline runs (record must exist)
- Non-retryable errors are tracked to prevent infinite retry loops
- All operations log via slog with context for traceability
