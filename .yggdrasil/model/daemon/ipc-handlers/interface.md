# Interface

All handler functions follow the pattern: `handle*(ctx, *ipcv1.XxxRequest, dependencies...) (*ipcv1.Response, error)`.

## Handler functions

### `handleSearch(ctx, req, idx, embedder) (*ipcv1.Response, error)`
Full-text search with optional vector similarity. Returns matched file paths with scores.

### `handleTagReq(ctx, req) (*ipcv1.Response, error)`
Note: this is constructed as a closure in `run()` capturing `tags`, `idx`, and `proc`. Supports operations: `add`, `remove`, `set`. Applies tags via xattr, syncs to index, then runs M2 pipeline to trigger rule re-evaluation.

### `handleMetadata(ctx, req, idx) (*ipcv1.Response, error)`
Retrieves metadata for a file from the index.

### `handleMetadataSet(ctx, req, idx) (*ipcv1.Response, error)`
Sets metadata key-value pairs on a file in the index.

### `handleListTags(ctx, req, idx) (*ipcv1.Response, error)`
Lists all known tags. Supports optional prefix filtering.

### `handleHydrateTags(ctx, req, idx) (*ipcv1.Response, error)`
Batch operation: given a list of file paths, returns the tag list for each.

### `handleRelated(ctx, req, fileGraph, idx) (*ipcv1.Response, error)`
Finds files related to a given file via the tag relationship graph.

### `handleListDirectory(ctx, req, idx, tags) (*ipcv1.Response, error)`
Lists directory contents with tag enrichment. Shared between CLI and GUI clients.

## Internal helpers

### `applyTagsXattr(ctx, path, tagNames, op, store) error`
Applies tag add/remove/set operations to xattr storage. Reads existing tags, computes the merged set, writes back.

## Failure modes

- File not found: returns error (not wrapped in response)
- Index query failure: returns error
- xattr write failure: returns error (tag operation is not partially applied — xattr is atomic)
