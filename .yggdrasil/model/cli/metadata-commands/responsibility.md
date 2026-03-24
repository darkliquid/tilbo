# Responsibility

The Metadata Commands module is responsible for:

- **meta show**: displaying all metadata key-value pairs for a file, with optional source attribution (`tilbo meta show <path>`)
- **meta set**: setting a metadata key-value pair on a file (`tilbo meta set <path> <key> <value>`)
- **meta delete**: removing a metadata key from a file (`tilbo meta delete <path> <key>`, alias `del`)

The show command supports json and human-readable output formats via `--format`.

## Not responsible for

- Metadata storage or harvesting (→ daemon)
- Metadata key completion (→ cli/completions)
