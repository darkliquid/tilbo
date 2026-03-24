# Internals

## Decisions

- **Quickshell over traditional Qt/QML app**: chose Quickshell because it's fast to develop with, provides a quick dev-feedback loop, and tilbo's GUI is designed to integrate into existing Quickshell desktop shells like DankMaterialLinux. Rejected: traditional Qt app (slower iteration, separate build toolchain), Electron (heavyweight, wrong platform fit), GTK (less compositing flexibility).
- **Singletons for services (TilboDaemon, Theme, I18n)**: follows the common Quickshell pattern for global services. Singletons are registered via `qmldir` and accessible from any QML component without prop drilling.
- **Mostly daemon-backed architecture**: keeping the UI separate and lightweight makes development faster and keeps complexity in one place in a language/system best suited for it (Go). Also avoids accidentally putting heavy work in the UI render thread. The GUI does almost no local computation — even directory listing, search, and sorting data preparation happen daemon-side.
- **Generated JS protobuf bindings (`qml_ipc.mjs`)**: exists to add type safety to the built-in Quickshell JSON-RPC support. Generated from `proto/tilbo/ipc/v1/ipc.proto` via protobufjs-cli and bundled with esbuild. The generation process is: `protobufjs-cli → ESM bundle → qml_ipc.mjs`.
