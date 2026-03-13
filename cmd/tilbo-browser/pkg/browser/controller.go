package browser

import (
	"context"
	"time"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commandcore"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commands"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commands/autocomplete"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commands/canceloperation"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commands/chmodfile"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commands/deletefile"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commands/navigate"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commands/openfile"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commands/openportal"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commands/refreshplaces"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commands/renamefile"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commands/search"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commands/shutdown"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commands/submitportal"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commands/togglehidden"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/daemon"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/operations"
)

const defaultOperationTimeout = 30 * time.Second

// Controller owns command dispatch, event publishing, state, and operation lifecycle.
type Controller struct {
	ctx    context.Context
	cancel context.CancelFunc

	commands *commands.CommandBus
	events   *commands.EventBus
	state    *StateStore
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
		state:    NewStateStore(),
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
func (c *Controller) StateStore() *StateStore { return c.state }

// SetDaemonAdapter sets or replaces the daemon adapter used by controller handlers.
func (c *Controller) SetDaemonAdapter(adapter *daemon.Adapter) { c.daemon = adapter }

// RegisterProjectionSubscribers wires projection subscribers to controller events.
func (c *Controller) RegisterProjectionSubscribers(subs ProjectionSubscribers) {
	if subs.Directory != nil {
		c.events.Subscribe(commandcore.EventDirectoryLoaded, subs.Directory)
	}
	if subs.Search != nil {
		c.events.Subscribe(commandcore.EventSearchCompleted, subs.Search)
	}
	if subs.Auto != nil {
		c.events.Subscribe(commandcore.EventAutocompleteUpdated, subs.Auto)
	}
	if subs.Places != nil {
		c.events.Subscribe(commandcore.EventPlacesRefreshed, subs.Places)
	}
	if subs.Portal != nil {
		c.events.Subscribe(commandcore.EventPortalOpened, subs.Portal)
		c.events.Subscribe(commandcore.EventPortalClosed, subs.Portal)
	}
	if subs.Failures != nil {
		c.events.Subscribe(commandcore.EventOperationFailed, subs.Failures)
	}
}

// Done returns a channel that closes when the controller context is canceled.
func (c *Controller) Done() <-chan struct{} { return c.ctx.Done() }

// Dispatch sends one command into the controller.
func (c *Controller) Dispatch(cmd commandcore.Command) error {
	return c.commands.Dispatch(c.ctx, cmd)
}

// Shutdown requests controller shutdown.
func (c *Controller) Shutdown(reason string) {
	_ = c.Dispatch(shutdown.Command{CommandBase: commandcore.Base{OpID: "shutdown"}, Reason: reason})
}

// registerHandlers wires each command type to its package handler, passing the
// controller as the HandlerContext implementation.
func (c *Controller) registerHandlers() {
	c.commands.Register(commandcore.Navigate, func(ctx context.Context, cmd commandcore.Command) error {
		return navigate.Handle(ctx, cmd, c)
	})
	c.commands.Register(commandcore.Search, func(ctx context.Context, cmd commandcore.Command) error {
		return search.Handle(ctx, cmd, c)
	})
	c.commands.Register(commandcore.Autocomplete, func(ctx context.Context, cmd commandcore.Command) error {
		return autocomplete.Handle(ctx, cmd, c)
	})
	c.commands.Register(commandcore.ToggleHidden, func(ctx context.Context, cmd commandcore.Command) error {
		return togglehidden.Handle(ctx, cmd, c)
	})
	c.commands.Register(commandcore.CancelOperation, func(ctx context.Context, cmd commandcore.Command) error {
		return canceloperation.Handle(ctx, cmd, c)
	})
	c.commands.Register(commandcore.Shutdown, func(ctx context.Context, cmd commandcore.Command) error {
		return shutdown.Handle(ctx, cmd, c)
	})
	c.commands.Register(commandcore.OpenFile, func(ctx context.Context, cmd commandcore.Command) error {
		return openfile.Handle(ctx, cmd, c)
	})
	c.commands.Register(commandcore.RenameFile, func(ctx context.Context, cmd commandcore.Command) error {
		return renamefile.Handle(ctx, cmd, c)
	})
	c.commands.Register(commandcore.DeleteFile, func(ctx context.Context, cmd commandcore.Command) error {
		return deletefile.Handle(ctx, cmd, c)
	})
	c.commands.Register(commandcore.ChmodFile, func(ctx context.Context, cmd commandcore.Command) error {
		return chmodfile.Handle(ctx, cmd, c)
	})
	c.commands.Register(commandcore.RefreshPlaces, func(ctx context.Context, cmd commandcore.Command) error {
		return refreshplaces.Handle(ctx, cmd, c)
	})
	c.commands.Register(commandcore.OpenPortal, func(ctx context.Context, cmd commandcore.Command) error {
		return openportal.Handle(ctx, cmd, c)
	})
	c.commands.Register(commandcore.SubmitPortal, func(ctx context.Context, cmd commandcore.Command) error {
		return submitportal.Handle(ctx, cmd, c)
	})
}

func (c *Controller) registerInFlight(opID string, cmdType commandcore.Type) {
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
