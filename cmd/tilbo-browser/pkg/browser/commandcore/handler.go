package commandcore

import (
	"context"
	"time"
)

// HandlerContext is the dependency injection surface provided to command handlers.
// It exposes state mutation, event publishing, operation lifecycle management,
// and domain service operations. The browser Controller implements this interface.
type HandlerContext interface {
	// Snapshot returns a consistent copy of the current state with its version.
	Snapshot() (State, uint64)
	// Mutate atomically applies a state mutation and bumps the state version.
	Mutate(fn func(*State))
	// Publish emits an event to all registered subscribers.
	Publish(ctx context.Context, evt Event)
	// OpContext creates a timeout context for one in-flight operation and registers
	// its cancel func so it can be cancelled via CancelOp.
	OpContext(opID string, timeout time.Duration) (context.Context, context.CancelFunc)
	// RegisterInFlight marks an operation as in-flight in the state map.
	RegisterInFlight(opID string, cmdType Type)
	// FinishOp removes an operation from in-flight tracking and cancels its context.
	FinishOp(opID string)
	// CancelOp cancels an in-flight operation; returns true if the operation was found.
	CancelOp(targetOpID string) bool

	// LoadDir lists a filesystem path. Returns directory entries, the absolute
	// paths of all entries (for tag hydration), and any error.
	LoadDir(path string, hidden bool) (entries []DirectoryEntry, paths []string, err error)
	// HydrateTags enriches paths with daemon tag data.
	// Returns nil, nil if no daemon is connected or paths is empty.
	HydrateTags(ctx context.Context, paths []string) (map[string][]string, error)
	// LocalSearch performs a local glob-based file search.
	LocalSearch(chips []string, limit uint32, allowHidden bool) ([]SearchFile, error)
	// SearchDaemon runs a daemon-backed search.
	// Returns nil, nil if no daemon is connected.
	SearchDaemon(ctx context.Context, chips []string, limit uint32) ([]SearchFile, error)
	// Autocomplete returns daemon tag suggestions for a prefix.
	// Returns empty slice, nil if no daemon is connected.
	Autocomplete(ctx context.Context, prefix string) ([]string, error)
	// BuildPlaces constructs the sidebar places list.
	BuildPlaces() ([]PlaceEntry, error)

	// FSOpen opens a file using the system default handler.
	FSOpen(ctx context.Context, path string) error
	// FSRename renames a file to a new sibling name and returns the new path.
	FSRename(oldPath, newName string) (string, error)
	// FSDelete removes a file tree.
	FSDelete(path string) error
	// FSChmod changes file mode bits.
	FSChmod(path string, mode uint32) error

	// CancelCtx cancels the controller's root context, initiating shutdown.
	CancelCtx()
}
