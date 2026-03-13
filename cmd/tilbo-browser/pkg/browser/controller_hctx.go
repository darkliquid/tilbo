package browser

import (
	"context"
	"time"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commandcore"
)

// Assert the controller satisfies the HandlerContext interface for use in command handlers.
var _ commandcore.HandlerContext = (*Controller)(nil)

// Snapshot returns a consistent copy of the current state with its version.
func (c *Controller) Snapshot() (State, uint64) {
	return c.state.Snapshot()
}

// Mutate atomically applies a state mutation.
func (c *Controller) Mutate(fn func(*State)) {
	c.state.Mutate(fn)
}

// Publish emits an event to all registered subscribers.
func (c *Controller) Publish(ctx context.Context, evt Event) {
	c.events.Publish(ctx, evt)
}

// OpContext creates a timeout context for one in-flight operation.
func (c *Controller) OpContext(opID string, timeout time.Duration) (context.Context, context.CancelFunc) {
	return c.ops.ContextFor(c.ctx, opID, timeout)
}

// RegisterInFlight marks an operation as in-flight in the state map.
func (c *Controller) RegisterInFlight(opID string, cmdType commandcore.Type) {
	c.registerInFlight(opID, cmdType)
}

// FinishOp removes an operation from in-flight tracking and cancels its context.
func (c *Controller) FinishOp(opID string) {
	c.finishOperation(opID)
}

// CancelOp cancels an in-flight operation's context; returns true if found.
func (c *Controller) CancelOp(targetOpID string) bool {
	return c.ops.Cancel(targetOpID)
}

// LoadDir lists a filesystem path. Returns entries, paths for hydration, and any error.
func (c *Controller) LoadDir(path string, hidden bool) ([]DirectoryEntry, []string, error) {
	return LoadDirectory(path, hidden)
}

// HydrateTags enriches paths with daemon tag data.
// Returns nil, nil if no daemon is connected or paths is empty.
func (c *Controller) HydrateTags(ctx context.Context, paths []string) (map[string][]string, error) {
	if c.daemon == nil {
		return map[string][]string{}, nil
	}
	return c.daemon.HydrateTags(ctx, paths)
}

// LocalSearch performs a local glob-based file search.
func (c *Controller) LocalSearch(chips []string, limit uint32, allowHidden bool) ([]SearchFile, error) {
	return LocalSearch(chips, limit, allowHidden)
}

// SearchDaemon runs a daemon-backed search.
// Returns nil, nil if no daemon is connected.
func (c *Controller) SearchDaemon(ctx context.Context, chips []string, limit uint32) ([]SearchFile, error) {
	if c.daemon == nil {
		return nil, nil
	}
	return c.daemon.Search(ctx, chips, limit)
}

// Autocomplete returns daemon tag suggestions for a prefix.
// Returns empty slice, nil if no daemon is connected.
func (c *Controller) Autocomplete(ctx context.Context, prefix string) ([]string, error) {
	if c.daemon == nil {
		return []string{}, nil
	}
	return c.daemon.Autocomplete(ctx, prefix)
}

// BuildPlaces constructs the sidebar places list.
func (c *Controller) BuildPlaces() ([]PlaceEntry, error) {
	return BuildPlaces()
}

// FSOpen opens a file using the system default handler.
func (c *Controller) FSOpen(ctx context.Context, path string) error {
	return c.fsOps.Open(ctx, path)
}

// FSRename renames a file to a new sibling name and returns the new path.
func (c *Controller) FSRename(oldPath, newName string) (string, error) {
	return c.fsOps.Rename(oldPath, newName)
}

// FSDelete removes a file tree.
func (c *Controller) FSDelete(path string) error {
	return c.fsOps.Delete(path)
}

// FSChmod changes file mode bits.
func (c *Controller) FSChmod(path string, mode uint32) error {
	return c.fsOps.Chmod(path, mode)
}

// CancelCtx cancels the controller's root context, initiating shutdown.
func (c *Controller) CancelCtx() {
	c.cancel()
}
