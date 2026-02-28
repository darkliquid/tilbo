---
paths:
  - "cmd/tilbo-browser/**/*.go"
---
# Browser Package Rules (CGo / Qt)

- CGo is permitted here and only here.
- Never call Qt/miqt methods from a non-Qt goroutine. Use the mainThreadCh channel pattern.
  See `.claude/docs/portal-design.md` for the canonical pattern.
- Keep the Go↔QML boundary thin: pass only primitives and JSON strings. Never pass Go structs
  into QML properties directly.
- All daemon IPC calls from the browser must be asynchronous (goroutine + channel).
  Never block the Qt event loop waiting for a daemon response.
- QML files live in `qml/` and are embedded via `//go:embed qml`. Do not inline QML in Go strings.
- The browser process owns `org.freedesktop.impl.portal.FileChooser` on the session bus.
  The daemon does NOT own this interface.
