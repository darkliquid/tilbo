// Package browser defines the operations interface that the daemon exposes to
// browser-capable clients (the Quickshell GUI and the FUSE virtual filesystem).
//
// It contains the data types exchanged over IPC for file listing, search,
// clipboard, trash, extension actions, and tag management, as well as the
// [Methods] interface that the daemon implements to service these operations.
//
// The package is intentionally free of daemon-internal dependencies so that
// both cmd/tilbo-daemon (which implements the interface) and cmd/tilbo-quickshell
// (which consumes it via IPC) can share the same type definitions without
// import cycles.
package browser
