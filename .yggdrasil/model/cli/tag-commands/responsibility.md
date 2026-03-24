# Responsibility

The Tag Commands module is responsible for:

- **tag add**: adding one or more tags to a file (`tilbo tag add <path> <tag>...`)
- **tag remove**: removing tags from a file (`tilbo tag remove <path> <tag>...`, alias `rm`)
- **tag set**: replacing all tags on a file (`tilbo tag set <path> <tag>...`)
- **tag list**: listing all tags on a file (`tilbo tag list <path>`, alias `ls`)
- **tag clear**: removing all tags from a file (`tilbo tag clear <path>`)

Each subcommand constructs a `TagRequest` with the appropriate `TagOperation` enum, sends it via `call()`, and prints the result.

## Not responsible for

- Tag storage or xattr manipulation (→ daemon/ipc-handlers)
- Shell completion for tag names (→ cli/completions)
