# Interface

## `meta` (parent command)

Groups metadata subcommands.

### `meta show <path>`
Shows all metadata for a file. Supports `--format json|human`.

- **human**: tabwriter-aligned key/value/source columns
- **json**: array of `{key, value, source}` objects, sorted by key

Uses `completeFilePathOnly` for path completion.

### `meta set <path> <key> <value>`
Sets a single metadata key-value pair. Exactly 3 args.
Sends `MetadataSetRequest` with the key-value pair.
Output: `set <key>=<value> on <path>`

### `meta delete <path> <key>` (alias: `del`)
Deletes a metadata key. Exactly 2 args.
Uses `completeMetaKey` for dynamic key completion (queries daemon for existing keys on the file).
Output: `deleted <key> from <path>`
