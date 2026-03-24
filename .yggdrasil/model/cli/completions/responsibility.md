# Responsibility

The Shell Completions module is responsible for:

- **Dynamic tag completion** (`completeTagsVariadic`): queries the daemon for all known tags and suggests them as completion candidates, supporting variadic tag arguments
- **File-specific tag completion** (`completeFileTags`): queries the daemon for tags on a specific file (used by `tag remove` to only suggest tags the file has)
- **File path completion** (`completeFilePathOnly`): standard filesystem path completion with no additional suggestions
- **Metadata key completion** (`completeMetaKey`): queries the daemon for metadata keys on a specific file (used by `meta delete`)
- **Static completion scripts** (`completion` command): generates shell completion scripts for bash, zsh, fish, and powershell

## Not responsible for

- IPC communication mechanics (→ cli via `call()`)
- Tag or metadata storage (→ daemon)
