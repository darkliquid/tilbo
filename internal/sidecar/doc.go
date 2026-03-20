// Package sidecar provides fallback tag and metadata storage for filesystems
// that do not support extended attributes (FAT32, exFAT, some NFS/SMB mounts).
//
// Data is stored in a SQLite database at ~/.local/share/tilbo/sidecar.db,
// keyed by the file's inode and device number. This allows tags to survive
// file renames within the same filesystem but not cross-filesystem moves.
//
// The [Store] type implements the same read/write/remove interface expected
// by the xattr package, allowing transparent fallback when xattr operations
// return ENOTSUP.
package sidecar
