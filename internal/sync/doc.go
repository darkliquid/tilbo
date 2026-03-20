// Package sync performs background filesystem-to-index synchronisation.
//
// The [Syncer] walks the watched directory tree on daemon startup, reading
// tags and metadata from xattrs (or the sidecar store) and upserting them
// into the SQLite index. This ensures the index is consistent with the
// filesystem after the daemon has been offline.
//
// During the walk, files that have no harvested metadata yet (no "mime" xattr)
// are dispatched to the harvester pipeline via the OnFileSynced callback. A
// bounded semaphore pool (2x CPU count) prevents goroutine explosion on large
// libraries.
//
// The syncer also removes stale index entries for files that no longer exist
// on disk, keeping the index accurate.
package sync //nolint:revive,nolintlint // package path is stable API surface; nolintlint cannot infer revive hit location
