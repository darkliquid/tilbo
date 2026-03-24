# IPC Envelope Pattern

## What must be satisfied

All daemon-client communication uses the protobuf-defined envelope model: `Request` and `Response` messages with `oneof Kind` fields containing typed request/response variants (e.g., `Request_Tag` / `Response_Tag`). Events use the `Event` message for server-to-client pushes. Communication is bidirectional over a Unix socket using JSON-RPC framing.

## Why

The envelope pattern provides type-safe, extensible IPC without separate method registries. Adding a new IPC method requires only adding a new variant to the proto `oneof` — the Go type switch in `buildIPCRequestHandler` routes automatically. vtprotobuf generates high-performance marshaling. JSON-RPC framing provides human-debuggable wire format while protobuf provides the schema.

## Guidance

- New IPC methods: add to `proto/tilbo/ipc/v1/ipc.proto`, regenerate Go + JS bindings
- Handler dispatch: add a new `case` to the type switch in `buildIPCRequestHandler`
- Events (server→client): use `Event` message with appropriate variant, broadcast via IPC server
- Request IDs in the envelope enable request-response correlation
- Two socket types: main IPC socket (CLI clients) and UI socket (browser/GUI operations)
