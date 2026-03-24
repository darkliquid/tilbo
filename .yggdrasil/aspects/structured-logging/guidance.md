# Structured Logging

## What must be satisfied

All daemon components must use `log/slog` with context (`slog.InfoContext`, `slog.DebugContext`, etc.) for logging. The `log` package is banned outside `cmd/` main packages (enforced by golangci-lint `forbidigo`).

## Why

Structured logging enables consistent, machine-parseable log output across all daemon subsystems. Context propagation ensures request-scoped metadata (e.g. IPC request IDs) flows through the call chain. The daemon supports configurable log format (`text` or `json`) and level via CLI flags or config file.

## Guidance

- Always pass `ctx` to slog methods when available
- Use `slog.Debug` for high-frequency events (FS events, per-file processing)
- Use `slog.Info` for lifecycle events (startup, shutdown, component registration)
- Use `slog.Warn` for recoverable issues (config load failures, optional component unavailable)
- Use `slog.Error` for unexpected failures
- Include structured key-value pairs, not formatted strings
