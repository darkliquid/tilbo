package commands_test

import (
	"context"
	"testing"
	"time"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commandcore"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commands"
)

type testCommand struct {
	base commandcore.Base
	t    commandcore.Type
}

func (c testCommand) Type() commandcore.Type { return c.t }
func (c testCommand) OperationID() string    { return c.base.OperationID() }

type testEvent struct {
	base commandcore.EventBase
	t    commandcore.EventType
}

func (e testEvent) Type() commandcore.EventType { return e.t }
func (e testEvent) OperationID() string         { return e.base.OperationID() }
func (e testEvent) OccurredAt() time.Time       { return e.base.OccurredAt() }

func TestCommandBusDispatchOrder(t *testing.T) {
	t.Parallel()

	bus := commands.NewCommandBus()
	order := make([]int, 0, 2)

	bus.Register(commandcore.Navigate, func(context.Context, commandcore.Command) error {
		order = append(order, 1)
		return nil
	})
	bus.Register(commandcore.Navigate, func(context.Context, commandcore.Command) error {
		order = append(order, 2)
		return nil
	})

	err := bus.Dispatch(
		context.Background(),
		testCommand{base: commandcore.Base{OpID: "x"}, t: commandcore.Navigate},
	)
	if err != nil {
		t.Fatalf("dispatch returned error: %v", err)
	}
	if len(order) != 2 || order[0] != 1 || order[1] != 2 {
		t.Fatalf("unexpected handler order: %#v", order)
	}
}

func TestEventBusPublishesToSubscribers(t *testing.T) {
	t.Parallel()

	bus := commands.NewEventBus()
	called := 0

	bus.Subscribe(commandcore.EventDirectoryLoaded, func(context.Context, commandcore.Event) { called++ })
	bus.Subscribe(commandcore.EventDirectoryLoaded, func(context.Context, commandcore.Event) { called++ })

	bus.Publish(
		context.Background(),
		testEvent{base: commandcore.EventBase{OpID: "y"}, t: commandcore.EventDirectoryLoaded},
	)

	if called != 2 {
		t.Fatalf("expected 2 subscribers to fire, got %d", called)
	}
}
