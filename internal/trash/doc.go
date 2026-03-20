// Package trash implements XDG Trash specification (freedesktop.org) support
// for the browser's delete-to-trash functionality.
//
// Files are moved to the user's trash directory (~/.local/share/Trash/) with
// metadata written to .trashinfo files that record the original path and
// deletion timestamp. The package supports listing trashed items, restoring
// them to their original location, and emptying the trash entirely.
//
// The trash directory structure follows the XDG spec:
//
//	~/.local/share/Trash/files/      — trashed file contents
//	~/.local/share/Trash/info/       — .trashinfo metadata files
package trash
