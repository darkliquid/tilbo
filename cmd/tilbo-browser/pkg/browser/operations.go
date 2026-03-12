package browser

import (
	"context"
	"sync"
	"time"
)

const defaultOperationContextTimeout = 30 * time.Second

// OperationRegistry tracks cancellation funcs for in-flight operations.
type OperationRegistry struct {
	mu      sync.Mutex
	cancels map[string]context.CancelFunc
}

// NewOperationRegistry creates an operation registry.
func NewOperationRegistry() *OperationRegistry {
	return &OperationRegistry{cancels: make(map[string]context.CancelFunc)}
}

// Register adds a cancel func for an operation id.
func (r *OperationRegistry) Register(opID string, cancel context.CancelFunc) {
	if opID == "" || cancel == nil {
		return
	}
	r.mu.Lock()
	r.cancels[opID] = cancel
	r.mu.Unlock()
}

// Cancel requests cancellation for an operation id.
func (r *OperationRegistry) Cancel(opID string) bool {
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
func (r *OperationRegistry) Done(opID string) {
	r.mu.Lock()
	delete(r.cancels, opID)
	r.mu.Unlock()
}

// ContextFor creates a timeout child context for one operation.
func (r *OperationRegistry) ContextFor(
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
