// Package fuse implements the tag-based virtual filesystem mounted by the daemon.
//
// When the daemon's --fuse-mount flag is set, this package mounts a FUSE filesystem
// that presents files organised by tag queries rather than their physical directory
// structure. Each top-level directory name is parsed as a tag expression:
//
//	~/tags/work/                 — files tagged "work"
//	~/tags/work+project/         — files tagged both "work" AND "project"
//	~/tags/work+!draft/          — "work" AND NOT "draft"
//	~/tags/work,personal/        — "work" OR "personal"
//	~/tags/@recent/              — files modified in the last 7 days
//	~/tags/@browse/              — incremental tag browser
//	~/tags/@browse/work/@files/  — files matching accumulated query
//
// Directory entries are symlinks to the real files on disk. Reads and writes pass
// through to the actual file. Tag names containing special characters (+, !, %, ,)
// are percent-encoded in directory listings.
//
// # Rename Semantics
//
// Moving a file between virtual directories applies tag changes rather than a
// filesystem rename. For example, "mv ~/tags/work/f.pdf ~/tags/personal/" adds
// the "personal" tag and removes "work". This only works for simple +/- tag
// expressions; complex expressions return EPERM.
//
// # Inode Stability
//
// Inodes are derived from a 64-bit FNV hash of the real absolute path, ensuring
// stable directory listings across daemon restarts.
//
// # Caching
//
// Directory listings have a 2-second entry TTL. Index changes from other processes
// may take up to 2 seconds to appear in the virtual filesystem.
package fuse
