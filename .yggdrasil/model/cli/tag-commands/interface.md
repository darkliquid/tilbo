# Interface

## Cobra commands

### `tag` (parent)
Groups all tag subcommands.

### `tag add <path> <tag>...`
Adds tags to a file. Minimum 2 args (path + at least one tag). Uses `completeTagsVariadic` for dynamic completion.
Output: `tagged <path>: +tag1 +tag2`

### `tag remove <path> <tag>...` (alias: `rm`)
Removes tags from a file. Uses `completeFileTags` for completion (only suggests tags the file already has).
Output: `untagged <path>: -tag1 -tag2`

### `tag set <path> <tag>...`
Replaces all tags on a file. Uses `completeTagsVariadic` for completion.
Output: `set tags on <path>: tag1, tag2`

### `tag list <path>` (alias: `ls`)
Lists all tags on a file. Single arg.
Output: one tag per line, or `<path>: (no tags)` if empty.

### `tag clear <path>`
Removes all tags from a file. Uses `TAG_OPERATION_SET` with empty tag list.
Output: `cleared tags on <path>`

## Error handling

All commands check `daemonError(resp)` for server-side errors and `resp.GetTag().GetErrors()` for per-path tag operation errors.
