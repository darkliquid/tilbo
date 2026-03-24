# Internals

## Decisions

- **Separate from core IPC handlers**: the browser is a distinct application with capabilities that generic IPC clients don't have (file operations, thumbnails, desktop file integration). Keeping browser handlers separate mirrors this distinction and prevents the core handlers from accumulating GUI-specific logic.
- **Strict path validation before all operations**: all path arguments are validated via `validatePath`/`validateNewName` before any filesystem access. This is a security boundary — the daemon accepts paths from external clients over a Unix socket, and crafted paths (null bytes, relative paths, traversal) could operate on unintended files.
- **MIME-to-icon mapping via switch statement over lookup table**: chose a `switch` with `strings.HasPrefix` checks because the mapping is hierarchical (prefix-based) and the number of cases is small. A map would require exact matches or a separate prefix-matching layer.
