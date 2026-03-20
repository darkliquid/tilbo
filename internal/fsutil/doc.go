// Package fsutil provides filesystem utility functions shared across Tilbo packages.
//
// Currently it offers hidden-file detection: [IsHidden] checks whether a path
// component starts with a dot, which is the Unix convention for hidden files.
// The watcher and index packages use this to optionally skip hidden files during
// filesystem traversal and indexing.
package fsutil
