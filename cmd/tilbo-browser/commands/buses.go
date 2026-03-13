package commands

import (
	"context"
	"errors"
	"fmt"
	"sync"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/core"
)

// CommandHandler handles one command.
type CommandHandler func(context.Context, core.Command) error

// CommandBus stores handlers and dispatches commands.
type CommandBus struct {
	mu       sync.RWMutex
	handlers map[core.Type][]CommandHandler
}

// NewCommandBus creates an empty command bus.
func NewCommandBus() *CommandBus {
	return &CommandBus{handlers: make(map[core.Type][]CommandHandler)}
}

// Register adds a handler for a command type.
func (b *CommandBus) Register(t core.Type, h CommandHandler) {
	if h == nil {
		return
	}
	b.mu.Lock()
	b.handlers[t] = append(b.handlers[t], h)
	b.mu.Unlock()
}

// Dispatch executes handlers for a command type in registration order.
func (b *CommandBus) Dispatch(ctx context.Context, cmd core.Command) error {
	if cmd == nil {
		return errors.New("command is nil")
	}

	b.mu.RLock()
	handlers := append([]CommandHandler(nil), b.handlers[cmd.Type()]...)
	b.mu.RUnlock()

	if len(handlers) == 0 {
		return fmt.Errorf("no handler registered for command %q", cmd.Type())
	}

	for _, h := range handlers {
		if err := h(ctx, cmd); err != nil {
			return err
		}
	}

	return nil
}

// EventBus stores subscribers and publishes events.
type EventBus struct {
	mu          sync.RWMutex
	subscribers map[core.EventType][]core.EventSubscriber
}

// NewEventBus creates an empty event bus.
func NewEventBus() *EventBus {
	return &EventBus{subscribers: make(map[core.EventType][]core.EventSubscriber)}
}

// Subscribe adds a subscriber for an event type.
func (b *EventBus) Subscribe(t core.EventType, sub core.EventSubscriber) {
	if sub == nil {
		return
	}
	b.mu.Lock()
	b.subscribers[t] = append(b.subscribers[t], sub)
	b.mu.Unlock()
}

// Publish emits one event to all current subscribers.
func (b *EventBus) Publish(ctx context.Context, evt core.Event) {
	if evt == nil {
		return
	}

	b.mu.RLock()
	subs := append([]core.EventSubscriber(nil), b.subscribers[evt.Type()]...)
	b.mu.RUnlock()

	for _, sub := range subs {
		sub(ctx, evt)
	}
}
