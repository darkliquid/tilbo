// Package index manages the SQLite database that caches file tags, metadata,
// and embeddings for fast search and graph queries.
//
// # Architecture
//
// The index uses a CGo-free SQLite driver (ncruces/go-sqlite3 backed by wazero)
// with three search mechanisms:
//
//   - Tag queries: Standard SQL joins across files, tags, and file_tags tables
//   - Full-text search: FTS5 virtual table over metadata values
//   - Vector search: sqlite-vec extension for approximate nearest-neighbor queries
//     on embedding vectors
//
// The index is a rebuildable cache — the source of truth for tags and metadata
// lives in extended filesystem attributes (xattrs) or the sidecar store. The
// daemon performs a background sync on startup to ensure consistency.
//
// # Schema
//
// The schema is defined across six sequential migrations in the migrations/
// subdirectory. Core tables include:
//
//   - files — indexed file paths with inode, device, mtime, and size
//   - tags — unique tag names with cardinality counters (maintained by triggers)
//   - file_tags — many-to-many join between files and tags
//   - metadata — key/value pairs per file with source attribution
//   - tag_provenance — records which rule or action applied each tag
//   - tag_overrides — records manual tag removals to prevent rule reapplication
//
// # Concurrency
//
// The [Index] type serialises write operations (upsert, delete, tag changes)
// through a single write connection while allowing concurrent reads via a
// separate read pool. All public methods are safe for concurrent use.
//
// # Code Generation
//
// Hand-written SQL queries in query.sql are compiled to type-safe Go by sqlc.
// The generated code lives in the dbgen/ subdirectory and should not be edited
// manually. Run "mise run generate-sqlc" after modifying query.sql.
package index
