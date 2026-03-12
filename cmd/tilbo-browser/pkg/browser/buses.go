package browser

import (
	"context"
	"errors"
	"fmt"
	"sync"
)

// CommandHandler handles one command.
type CommandHandler func(context.Context, Command) error

// CommandBus stores handlers and dispatches commands.
type CommandBus struct {
	mu       sync.RWMutex
	handlers map[CommandType][]CommandHandler
}

// NewCommandBus creates an empty command bus.
func NewCommandBus() *CommandBus {
	return &CommandBus{handlers: make(map[CommandType][]CommandHandler)}
}

// Register adds a handler for a command type.
func (b *CommandBus) Register(t CommandType, h CommandHandler) {
	if h == nil {
		return
	}
	b.mu.Lock()
	b.handlers[t] = append(b.handlers[t], h)
	b.mu.Unlock()
}

// Dispatch executes handlers for a command type in registration order.
func (b *CommandBus) Dispatch(ctx context.Context, cmd Command) error {
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

// EventSubscriber consumes one event.
type EventSubscriber func(context.Context, Event)

// EventBus stores subscribers and publishes events.
type EventBus struct {
	mu          sync.RWMutex
	subscribers map[EventType][]EventSubscriber
}

// NewEventBus creates an empty event bus.
func NewEventBus() *EventBus {
	return &EventBus{subscribers: make(map[EventType][]EventSubscriber)}
}

// Subscribe adds a subscriber for an event type.
func (b *EventBus) Subscribe(t EventType, sub EventSubscriber) {
	if sub == nil {
		return
	}
	b.mu.Lock()
	b.subscribers[t] = append(b.subscribers[t], sub)
	b.mu.Unlock()
}

// Publish emits one event to all current subscribers.
func (b *EventBus) Publish(ctx context.Context, evt Event) {
	if evt == nil {
		return
	}

	b.mu.RLock()
	subs := append([]EventSubscriber(nil), b.subscribers[evt.Type()]...)
	b.mu.RUnlock()

	for _, sub := range subs {
		sub(ctx, evt)
	}
}
