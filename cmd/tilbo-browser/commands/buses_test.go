package commands_test

import (
	"context"
	"testing"
	"time"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/commands"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/core"
)

type testCommand struct {
	base core.Base
	t    core.Type
}

func (c testCommand) Type() core.Type { return c.t }
func (c testCommand) OperationID() string    { return c.base.OperationID() }

type testEvent struct {
	base core.EventBase
	t    core.EventType
}

func (e testEvent) Type() core.EventType { return e.t }
func (e testEvent) OperationID() string         { return e.base.OperationID() }
func (e testEvent) OccurredAt() time.Time       { return e.base.OccurredAt() }

func TestCommandBusDispatchOrder(t *testing.T) {
	t.Parallel()

	bus := commands.NewCommandBus()
	order := make([]int, 0, 2)

	bus.Register(core.Navigate, func(context.Context, core.Command) error {
		order = append(order, 1)
		return nil
	})
	bus.Register(core.Navigate, func(context.Context, core.Command) error {
		order = append(order, 2)
		return nil
	})

	err := bus.Dispatch(
		context.Background(),
		testCommand{base: core.Base{OpID: "x"}, t: core.Navigate},
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

	bus.Subscribe(core.EventDirectoryLoaded, func(context.Context, core.Event) { called++ })
	bus.Subscribe(core.EventDirectoryLoaded, func(context.Context, core.Event) { called++ })

	bus.Publish(
		context.Background(),
		testEvent{base: core.EventBase{OpID: "y"}, t: core.EventDirectoryLoaded},
	)

	if called != 2 {
		t.Fatalf("expected 2 subscribers to fire, got %d", called)
	}
}
