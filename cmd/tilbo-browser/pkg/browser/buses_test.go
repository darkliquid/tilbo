package browser_test

import (
	"context"
	"testing"
	"time"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser"
)

type testCommand struct {
	base browser.CommandBase
	t    browser.CommandType
}

func (c testCommand) Type() browser.CommandType { return c.t }
func (c testCommand) OperationID() string       { return c.base.OperationID() }

type testEvent struct {
	base browser.EventBase
	t    browser.EventType
}

func (e testEvent) Type() browser.EventType { return e.t }
func (e testEvent) OperationID() string     { return e.base.OperationID() }
func (e testEvent) OccurredAt() time.Time   { return e.base.OccurredAt() }

func TestCommandBusDispatchOrder(t *testing.T) {
	t.Parallel()

	bus := browser.NewCommandBus()
	order := make([]int, 0, 2)

	bus.Register(browser.CommandNavigate, func(context.Context, browser.Command) error {
		order = append(order, 1)
		return nil
	})
	bus.Register(browser.CommandNavigate, func(context.Context, browser.Command) error {
		order = append(order, 2)
		return nil
	})

	err := bus.Dispatch(
		context.Background(),
		testCommand{base: browser.CommandBase{OpID: "x"}, t: browser.CommandNavigate},
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

	bus := browser.NewEventBus()
	called := 0

	bus.Subscribe(browser.EventDirectoryLoaded, func(context.Context, browser.Event) { called++ })
	bus.Subscribe(browser.EventDirectoryLoaded, func(context.Context, browser.Event) { called++ })

	bus.Publish(context.Background(), testEvent{base: browser.EventBase{OpID: "y"}, t: browser.EventDirectoryLoaded})

	if called != 2 {
		t.Fatalf("expected 2 subscribers to fire, got %d", called)
	}
}
