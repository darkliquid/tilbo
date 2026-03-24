# Interface

## `search` command

Searches the tilbo index with multiple query modes that can be combined.

### Flags

| Flag | Type | Default | Purpose |
|------|------|---------|---------|
| `--tags` | `[]string` | — | Filter by tags (AND by default) |
| `--any` | `bool` | `false` | Use OR for tag matching |
| `--exclude` | `[]string` | — | Exclude files with these tags |
| `--fts` | `string` | — | Full-text search query |
| `--vector` | `string` | — | Semantic vector similarity query |
| `--meta` | `map[string]string` | — | Metadata filters (`key:op:value`, ops: eq, gt, lt, gte, lte, like) |
| `--sort` | `[]string` | — | Sort fields |
| `--limit` | `uint32` | 50 | Maximum results |
| `--offset` | `uint32` | 0 | Pagination offset |
| `--format` | `string` | human | Output format: human, json, tsv |

### Output formats

- **human**: tabwriter-aligned columns (path, tags, mtime)
- **json**: array of `jsonFileResult` objects with path, tags, metadata, mtime
- **tsv**: tab-separated path and tags

## `related <path>` command

Finds files related via the tag graph.

### Flags

| Flag | Type | Default | Purpose |
|------|------|---------|---------|
| `--limit` | `uint32` | 20 | Maximum results |
| `--hops` | `uint32` | 3 | Max graph traversal hops |
| `--format` | `string` | human | Output format: human, json, tsv |
| `--hop-weight` | `float32` | — | Weight for graph hop distance |
| `--vec-weight` | `float32` | 0.4 | Weight for vector similarity |

### Helper functions

- `printRelatedJSON(files)` — JSON output for related results
- `printRelatedTSV(files)` — TSV output for related results
- `printRelatedHuman(files)` — tabwriter human output
