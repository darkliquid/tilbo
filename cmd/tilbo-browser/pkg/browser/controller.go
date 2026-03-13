package browser

import (
	"context"
	"time"

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
)

const defaultOperationTimeout = 30 * time.Second

// Controller owns command dispatch, event publishing, state, and operation lifecycle.
type Controller struct {
	ctx    context.Context
	cancel context.CancelFunc

	commands *CommandBus
	events   *EventBus
	state    *StateStore
	ops      *OperationRegistry
	fsOps    *FileSystemOps
	daemon   *DaemonAdapter
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
		commands: NewCommandBus(),
		events:   NewEventBus(),
		state:    NewStateStore(),
		ops:      NewOperationRegistry(),
		fsOps:    NewFileSystemOps(),
	}

	c.registerHandlers()

	return c
}

// CommandBus exposes the command bus for external wiring.
func (c *Controller) CommandBus() *CommandBus { return c.commands }

// EventBus exposes the event bus for external wiring.
func (c *Controller) EventBus() *EventBus { return c.events }

// StateStore exposes the state store for projection models.
func (c *Controller) StateStore() *StateStore { return c.state }

// SetDaemonAdapter sets or replaces the daemon adapter used by controller handlers.
func (c *Controller) SetDaemonAdapter(adapter *DaemonAdapter) { c.daemon = adapter }

// RegisterProjectionSubscribers wires projection subscribers to controller events.
func (c *Controller) RegisterProjectionSubscribers(subs ProjectionSubscribers) {
	if subs.Directory != nil {
		c.events.Subscribe(EventDirectoryLoaded, subs.Directory)
	}
	if subs.Search != nil {
		c.events.Subscribe(EventSearchCompleted, subs.Search)
	}
	if subs.Auto != nil {
		c.events.Subscribe(EventAutocompleteUpdated, subs.Auto)
	}
	if subs.Places != nil {
		c.events.Subscribe(EventPlacesRefreshed, subs.Places)
	}
	if subs.Portal != nil {
		c.events.Subscribe(EventPortalOpened, subs.Portal)
		c.events.Subscribe(EventPortalClosed, subs.Portal)
	}
	if subs.Failures != nil {
		c.events.Subscribe(EventOperationFailed, subs.Failures)
	}
}

// Done returns a channel that closes when the controller context is canceled.
func (c *Controller) Done() <-chan struct{} { return c.ctx.Done() }

// Dispatch sends one command into the controller.
func (c *Controller) Dispatch(cmd Command) error {
	return c.commands.Dispatch(c.ctx, cmd)
}

// Shutdown requests controller shutdown.
func (c *Controller) Shutdown(reason string) {
	_ = c.Dispatch(ShutdownCommand{CommandBase: CommandBase{OpID: "shutdown"}, Reason: reason})
}

// registerHandlers wires each command type to its package handler, passing the
// controller as the HandlerContext implementation.
func (c *Controller) registerHandlers() {
	c.commands.Register(CommandNavigate, func(ctx context.Context, cmd Command) error {
		return navigate.Handle(ctx, cmd, c)
	})
	c.commands.Register(CommandSearch, func(ctx context.Context, cmd Command) error {
		return search.Handle(ctx, cmd, c)
	})
	c.commands.Register(CommandAutocomplete, func(ctx context.Context, cmd Command) error {
		return autocomplete.Handle(ctx, cmd, c)
	})
	c.commands.Register(CommandToggleHidden, func(ctx context.Context, cmd Command) error {
		return togglehidden.Handle(ctx, cmd, c)
	})
	c.commands.Register(CommandCancelOperation, func(ctx context.Context, cmd Command) error {
		return canceloperation.Handle(ctx, cmd, c)
	})
	c.commands.Register(CommandShutdown, func(ctx context.Context, cmd Command) error {
		return shutdown.Handle(ctx, cmd, c)
	})
	c.commands.Register(CommandOpenFile, func(ctx context.Context, cmd Command) error {
		return openfile.Handle(ctx, cmd, c)
	})
	c.commands.Register(CommandRenameFile, func(ctx context.Context, cmd Command) error {
		return renamefile.Handle(ctx, cmd, c)
	})
	c.commands.Register(CommandDeleteFile, func(ctx context.Context, cmd Command) error {
		return deletefile.Handle(ctx, cmd, c)
	})
	c.commands.Register(CommandChmodFile, func(ctx context.Context, cmd Command) error {
		return chmodfile.Handle(ctx, cmd, c)
	})
	c.commands.Register(CommandRefreshPlaces, func(ctx context.Context, cmd Command) error {
		return refreshplaces.Handle(ctx, cmd, c)
	})
	c.commands.Register(CommandOpenPortal, func(ctx context.Context, cmd Command) error {
		return openportal.Handle(ctx, cmd, c)
	})
	c.commands.Register(CommandSubmitPortal, func(ctx context.Context, cmd Command) error {
		return submitportal.Handle(ctx, cmd, c)
	})
}

func (c *Controller) registerInFlight(opID string, cmdType CommandType) {
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
