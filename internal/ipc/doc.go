// Package ipc implements the local request/response transport used for
// communication between tilbo processes over Unix sockets.
//
// The protocol uses newline-delimited JSON encoding of protobuf [Envelope]
// messages (defined in proto/tilbo/ipc/v1/ipc.proto). Each envelope carries
// a monotonically increasing request_id and a oneof payload:
//
//   - Request: sent by clients (CLI, GUI) and dispatched by the server
//   - Response: sent by the server, matched to pending requests by request_id
//   - Event: server-pushed notifications (FileTagged, IndexUpdated, etc.)
//     broadcast to all connected clients with no response expected
//
// The [Client] type provides a thread-safe multiplexed request/response API.
// The [Server] type accepts connections, dispatches requests to a [Handler],
// and supports event broadcasting.
//
// Framing uses [WriteEnvelope] which serialises to JSON with EmitUnpopulated
// (so the QML/JS client always sees all fields) and enforces a 4 MiB frame
// size limit.
package ipc
