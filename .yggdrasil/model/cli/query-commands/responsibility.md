# Responsibility

The Query Commands module is responsible for:

- **search**: full-text search, tag filtering, metadata filtering, vector similarity search, with sorting and pagination (`tilbo search`)
- **related**: finding files related to a given file via the tag relationship graph, with configurable hops and weighting (`tilbo related <path>`)

Both commands support multiple output formats (json, tsv, human-readable) via `--format`.

## Not responsible for

- Index queries or vector similarity computation (→ daemon/ipc-handlers)
- Tag graph traversal logic (→ daemon, internal/graph)
