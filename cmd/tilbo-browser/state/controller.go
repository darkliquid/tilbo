package state

import (
	"context"
	"time"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/commands"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/commands/autocomplete"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/commands/canceloperation"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/commands/chmodfile"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/commands/deletefile"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/commands/navigate"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/commands/openfile"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/commands/openportal"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/commands/refreshplaces"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/commands/renamefile"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/commands/search"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/commands/shutdown"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/commands/submitportal"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/commands/togglehidden"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/core"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/daemon"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/operations"
)

const defaultOperationTimeout = 30 * time.Second

// Controller owns command dispatch, event publishing, state, and operation lifecycle.
type Controller struct {
	ctx    context.Context
	cancel context.CancelFunc

	commands *commands.CommandBus
	events   *commands.EventBus
	state    *Store
	ops      *operations.Registry
	fsOps    *operations.FileSystem
	daemon   *daemon.Adapter
}

// NewController creates a controller with default wiring.
func NewController(parent context.Context) *Controller {
	if parent == nil {
		parent = context.Background()
	}

	ctx, cancel := context.WithCancel(parent)
	c := &Controller{
		ctx:      ctx,
		cancel:   cancel,
		commands: commands.NewCommandBus(),
		events:   commands.NewEventBus(),
		state:    NewStore(),
		ops:      operations.NewRegistry(),
		fsOps:    operations.NewFileSystem(),
	}

	c.registerHandlers()

	return c
}

// CommandBus exposes the command bus for external wiring.
func (c *Controller) CommandBus() *commands.CommandBus { return c.commands }

// EventBus exposes the event bus for external wiring.
func (c *Controller) EventBus() *commands.EventBus { return c.events }

// StateStore exposes the state store for projection models.
func (c *Controller) StateStore() *Store { return c.state }

// SetDaemonAdapter sets or replaces the daemon adapter used by controller handlers.
func (c *Controller) SetDaemonAdapter(adapter *daemon.Adapter) { c.daemon = adapter }

// RegisterProjectionSubscribers wires projection subscribers to controller events.
func (c *Controller) RegisterProjectionSubscribers(subs ProjectionSubscribers) {
	if subs.Directory != nil {
		c.events.Subscribe(core.EventDirectoryLoaded, subs.Directory)
	}
	if subs.Search != nil {
		c.events.Subscribe(core.EventSearchCompleted, subs.Search)
	}
	if subs.Auto != nil {
		c.events.Subscribe(core.EventAutocompleteUpdated, subs.Auto)
	}
	if subs.Places != nil {
		c.events.Subscribe(core.EventPlacesRefreshed, subs.Places)
	}
	if subs.Portal != nil {
		c.events.Subscribe(core.EventPortalOpened, subs.Portal)
		c.events.Subscribe(core.EventPortalClosed, subs.Portal)
	}
	if subs.Failures != nil {
		c.events.Subscribe(core.EventOperationFailed, subs.Failures)
	}
}

// Done returns a channel that closes when the controller context is canceled.
func (c *Controller) Done() <-chan struct{} { return c.ctx.Done() }

// Dispatch sends one command into the controller.
func (c *Controller) Dispatch(cmd core.Command) error {
	return c.commands.Dispatch(c.ctx, cmd)
}

// Shutdown requests controller shutdown.
func (c *Controller) Shutdown(reason string) {
	_ = c.Dispatch(shutdown.Command{CommandBase: core.Base{OpID: "shutdown"}, Reason: reason})
}

// registerHandlers wires each command type to its package handler, passing the
// controller as the HandlerContext implementation.
func (c *Controller) registerHandlers() {
	c.commands.Register(core.Navigate, func(ctx context.Context, cmd core.Command) error {
		return navigate.Handle(ctx, cmd, c)
	})
	c.commands.Register(core.Search, func(ctx context.Context, cmd core.Command) error {
		return search.Handle(ctx, cmd, c)
	})
	c.commands.Register(core.Autocomplete, func(ctx context.Context, cmd core.Command) error {
		return autocomplete.Handle(ctx, cmd, c)
	})
	c.commands.Register(core.ToggleHidden, func(ctx context.Context, cmd core.Command) error {
		return togglehidden.Handle(ctx, cmd, c)
	})
	c.commands.Register(core.CancelOperation, func(ctx context.Context, cmd core.Command) error {
		return canceloperation.Handle(ctx, cmd, c)
	})
	c.commands.Register(core.Shutdown, func(ctx context.Context, cmd core.Command) error {
		return shutdown.Handle(ctx, cmd, c)
	})
	c.commands.Register(core.OpenFile, func(ctx context.Context, cmd core.Command) error {
		return openfile.Handle(ctx, cmd, c)
	})
	c.commands.Register(core.RenameFile, func(ctx context.Context, cmd core.Command) error {
		return renamefile.Handle(ctx, cmd, c)
	})
	c.commands.Register(core.DeleteFile, func(ctx context.Context, cmd core.Command) error {
		return deletefile.Handle(ctx, cmd, c)
	})
	c.commands.Register(core.ChmodFile, func(ctx context.Context, cmd core.Command) error {
		return chmodfile.Handle(ctx, cmd, c)
	})
	c.commands.Register(core.RefreshPlaces, func(ctx context.Context, cmd core.Command) error {
		return refreshplaces.Handle(ctx, cmd, c)
	})
	c.commands.Register(core.OpenPortal, func(ctx context.Context, cmd core.Command) error {
		return openportal.Handle(ctx, cmd, c)
	})
	c.commands.Register(core.SubmitPortal, func(ctx context.Context, cmd core.Command) error {
		return submitportal.Handle(ctx, cmd, c)
	})
}

func (c *Controller) registerInFlight(opID string, cmdType core.Type) {
	if opID == "" {
		return
	}

	c.state.Mutate(func(s *State) {
		s.InFlightOps[opID] = OperationMeta{
			ID:      opID,
			Command: cmdType,
			Started: time.Now(),
			Timeout: defaultOperationTimeout,
		}
	})
}

func (c *Controller) finishOperation(opID string) {
	if opID == "" {
		return
	}
	_ = c.ops.Cancel(opID)
	c.state.Mutate(func(s *State) {
		delete(s.InFlightOps, opID)
	})
}
