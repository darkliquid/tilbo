# IPC Communication

## Business context

The daemon is the central engine — CLI tools and the GUI browser interact with it over Unix domain sockets using JSON-RPC with protobuf-defined message envelopes. Communication is bidirectional: clients send requests and receive responses, but the server also pushes events to connected clients (e.g., file tagged, index updated).

## Trigger

A client connects to the Unix socket and sends a JSON-RPC request, or the daemon raises an internal event that needs to be broadcast.

## Goal

Clients can query and modify the tag index, search files, manage metadata, and perform file operations. The daemon can notify clients of state changes in real time.

## Participants

- **Daemon** (`daemon`) — hosts the IPC server, wires the request handler, manages sockets
- **IPC Handlers** (`daemon/ipc-handlers`) — handle core requests (tag, search, metadata, status, rules)
- **Browser Handlers** (`daemon/browser-handlers`) — handle GUI-specific file manager operations (directory listing, rename, trash, open, thumbnails)

## Paths

### Request-response path (client → daemon → client)

1. Client connects to the Unix socket
2. Client sends a protobuf `Request` envelope with a typed `Kind` variant
3. `buildIPCRequestHandler` dispatches to the appropriate handler function via type switch
4. Handler performs the operation and returns a `Response` envelope
5. Response is sent back to the client

### Event broadcast path (daemon → clients)

1. An internal event occurs (file tagged, index updated, GUI state change)
2. Daemon constructs a protobuf `Event` envelope
3. Event is broadcast to all connected clients on the socket

### Browser-specific path

1. GUI client connects to a separate UI socket
2. Requests are handled by `daemonBrowserMethods` which provides file-manager operations
3. The GUI receives both responses and broadcast events (e.g., `ShowWindow`, `fileTagged`)

### Two socket types

- **Main IPC socket** (`/run/user/$UID/tilbo.sock`) — used by CLI and generic clients
- **UI socket** (`/run/user/$UID/tilbo-ui.sock`) — used by the Quickshell GUI browser

## Invariants across all paths

- All requests use the protobuf envelope model with typed variants
- Request IDs enable correlation between requests and responses
- Path arguments in browser operations are validated before filesystem access
- Events are broadcast to all connected clients, not just the requester
