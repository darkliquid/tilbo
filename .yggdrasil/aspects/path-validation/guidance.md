# Path Validation

## What must be satisfied

All file operations exposed via IPC (especially browser/GUI operations) must validate paths before touching the filesystem. Validation rejects:

- Empty paths
- Paths containing null bytes (which cause silent truncation in C-level syscalls)
- Relative paths (all operations require absolute paths)
- Filename components containing path separators (prevents directory traversal in rename/create)

## Why

The daemon accepts paths from external clients (CLI, GUI) over a Unix socket. Without validation, crafted paths could operate on unintended files. Null bytes are particularly dangerous as they silently truncate at the C syscall layer.

## Guidance

- Use `validatePath()` for all path arguments in IPC handlers
- Use `validateNewName()` for filename components in rename/create operations
- Apply `filepath.Clean()` after validation to normalize paths
- Validate early, before any filesystem interaction
