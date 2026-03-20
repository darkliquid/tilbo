// Package xattr provides the primary storage layer for tags and metadata using
// Linux extended filesystem attributes.
//
// Tags are stored in the "user.tags" attribute as a comma-separated list.
// Metadata key/value pairs are stored as individual attributes under
// "user.meta.<key>". Tag provenance (which rule or user action applied each tag)
// is stored in "user.tags.source" as JSON.
//
// # Sidecar Fallback
//
// For filesystems that do not support extended attributes (FAT32, exFAT, some
// NFS/SMB mounts), the read/write functions accept an optional sidecar store
// that transparently redirects operations to a SQLite database keyed by
// inode+device number. The daemon detects xattr support at startup and
// configures the fallback automatically.
//
// # Limitations
//
// Linux xattrs are typically capped at 64 KiB per namespace per file. Files
// with very large numbers of tags or long metadata values may hit this limit.
package xattr
