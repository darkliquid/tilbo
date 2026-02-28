---
paths:
  - "internal/**/*.go"
  - "cmd/tilbo-daemon/**/*.go"
  - "cmd/tilbo-cli/**/*.go"
---
# Go Package Rules (non-browser)

- No CGo. All packages outside `cmd/tilbo-browser` must be CGo-free.
- Use `modernc.org/sqlite` not `mattn/go-sqlite3`.
- Use `golang.org/x/sys/unix` for fanotify, not `fsnotify`.
- Use `log/slog` for structured logging throughout. Never `fmt.Print*` for log output.
- All exported functions must have godoc comments.
- Return errors; do not panic in library code. Only `main` packages may call `log.Fatal`.
- Context propagation: all functions that do I/O must accept `context.Context` as first arg.
- Tests go in `_test.go` files in the same package (white-box) or `<pkg>_test` (black-box).
- Use `t.Cleanup` not `defer` in tests that create temp files or start goroutines.
