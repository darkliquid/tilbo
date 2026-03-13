package operations

import (
	"context"
	"sync"
	"time"
)

const defaultOperationContextTimeout = 30 * time.Second

// Registry tracks cancellation funcs for in-flight operations.
type Registry struct {
	mu      sync.Mutex
	cancels map[string]context.CancelFunc
}

// NewRegistry creates a new operation registry.
func NewRegistry() *Registry {
	return &Registry{cancels: make(map[string]context.CancelFunc)}
}

// Register adds a cancel func for an operation id.
func (r *Registry) Register(opID string, cancel context.CancelFunc) {
	if opID == "" || cancel == nil {
		return
	}
	r.mu.Lock()
	r.cancels[opID] = cancel
	r.mu.Unlock()
}

// Cancel requests cancellation for an operation id.
func (r *Registry) Cancel(opID string) bool {
	r.mu.Lock()
	cancel, ok := r.cancels[opID]
	if ok {
		delete(r.cancels, opID)
	}
	r.mu.Unlock()

	if !ok {
		return false
	}

	cancel()
	return true
}

// Done removes operation registration without canceling.
func (r *Registry) Done(opID string) {
	r.mu.Lock()
	delete(r.cancels, opID)
	r.mu.Unlock()
}

// ContextFor creates a timeout child context for one operation.
func (r *Registry) ContextFor(
	parent context.Context,
	opID string,
	timeout time.Duration,
) (context.Context, context.CancelFunc) {
	if timeout <= 0 {
		timeout = defaultOperationContextTimeout
	}
	ctx, cancel := context.WithTimeout(parent, timeout)
	r.Register(opID, cancel)

	wrappedCancel := func() {
		r.Done(opID)
		cancel()
	}

	return ctx, wrappedCancel
}
