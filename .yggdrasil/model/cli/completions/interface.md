# Interface

## Dynamic completion functions

All dynamic completion functions follow the cobra `ValidArgsFunction` signature:
`func(cmd *cobra.Command, args []string, toComplete string) ([]string, cobra.ShellCompDirective)`

### `completeTagsVariadic`
Queries daemon for all known tags via `ListTagsRequest`. Returns tags as completion candidates. Used by `tag add`, `tag set`. Silently returns empty on daemon connection failure.

### `completeFileTags`
Queries daemon for tags on the file specified in `args[0]` via `HydrateTagsRequest`. Returns only tags that the file currently has. Used by `tag remove`.

### `completeFilePathOnly`
Returns `ShellCompDirectiveFilterFileExt` for standard filesystem path completion. No daemon query needed.

### `completeMetaKey`
Queries daemon for metadata keys on the file specified in `args[0]` via `MetadataRequest`. Returns key names as completion candidates. Used by `meta delete`.

## Static completion command

### `completion [bash|zsh|fish|powershell]`
Generates shell completion scripts to stdout. Users pipe output to their shell's completion directory. Exactly 1 arg required, validated against `["bash", "zsh", "fish", "powershell"]`.

## Failure modes

- All dynamic completion functions silently return empty results on daemon connection failure — completion must never block the shell or produce error output
