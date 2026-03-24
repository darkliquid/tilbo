# Responsibility

The Daemon Service module is responsible for:

- **Socket connection**: connecting to the daemon's Unix socket at `$XDG_RUNTIME_DIR/tilbo.sock`, with auto-reconnect on 3-second timer
- **JSON-RPC client**: sending requests with auto-incrementing IDs, tracking pending callbacks in a registry, dispatching responses to the correct callback
- **Event dispatch**: parsing daemon-pushed events (fileTagged, indexUpdated, daemonStateChanged, showWindow) and re-emitting them as QML signals
- **API surface**: providing typed method wrappers for all daemon operations (listDirectory, search, modifyTags, hydrateTags, listTags, getMetadata, setMetadata, rename, delete, trash, restore, copy, paste, open, getThumbnail, createFile, createDirectory, getBrowserConfig, pinSearch, listTrash, restoreTrash, getOpenWith, openWith)
- **Connection state**: exposing `connected` property for UI binding
- **Module registration**: `qmldir` registers TilboDaemon, Theme, and I18n as singletons

## Not responsible for

- UI rendering or user interaction (→ browser-window, components)
- Protocol definition (→ proto/ipc.proto, qml_ipc.mjs is generated)
