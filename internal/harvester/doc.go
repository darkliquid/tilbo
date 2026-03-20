// Package harvester implements the metadata extraction pipeline that runs on
// every file detected by the filesystem watcher.
//
// # Pipeline
//
// When the daemon's processor receives a filesystem event, it passes the file
// through the harvester pipeline:
//
//  1. All registered harvesters whose MIME or glob filters match the file are
//     selected for execution.
//  2. Matching harvesters run concurrently, each producing a map of key/value
//     metadata pairs (e.g. width, height, duration, codec, EXIF fields).
//  3. Results are merged into a single metadata map. Later harvesters (higher
//     priority number) can overwrite keys from earlier ones.
//  4. The merged map is passed to the rule engine for tag evaluation.
//
// # Harvester Types
//
// Three execution modes are supported:
//
//   - Built-in: Pure-Go extractors in the builtin/ subdirectory that run
//     in-process. These handle common formats (EXIF/IPTC images, PDF, MP4/MKV,
//     EPUB, audio tags, MIME detection, file stat).
//
//   - Subprocess: External binaries invoked with JSON on stdin and JSON on
//     stdout. Configured via TOML drop-in files in ~/.config/tilbo/harvesters/.
//     Each subprocess has a configurable timeout.
//
//   - WebAssembly: WASI modules executed in a wazero sandbox with the same
//     JSON stdin/stdout protocol. Modules are compiled once and cached in
//     $TMPDIR/tilbo-wasm-cache to avoid per-invocation overhead.
//
// # Registry
//
// Harvesters are registered in a priority-ordered registry. Lower priority
// numbers run first; built-in harvesters use priority 0. The registry is
// rebuilt when the daemon receives SIGHUP or a reload-rules request.
//
// # Metadata Keys
//
// Keys beginning with "_" are treated as internal and not written to xattrs.
// All other keys are stored as "user.meta.<key>" extended attributes and
// indexed in the SQLite FTS5 table.
package harvester
