package browser

import (
	"context"
	"errors"
	"fmt"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

const (
	defaultOperationTimeout = 30 * time.Second
	defaultSearchLimit      = 1000
)

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

func (c *Controller) registerHandlers() {
	c.commands.Register(CommandNavigate, c.handleNavigate)
	c.commands.Register(CommandSearch, c.handleSearch)
	c.commands.Register(CommandAutocomplete, c.handleAutocomplete)
	c.commands.Register(CommandToggleHidden, c.handleToggleHidden)
	c.commands.Register(CommandCancelOperation, c.handleCancelOperation)
	c.commands.Register(CommandShutdown, c.handleShutdown)

	c.commands.Register(CommandOpenFile, c.handleOpenFile)
	c.commands.Register(CommandRenameFile, c.handleRenameFile)
	c.commands.Register(CommandDeleteFile, c.handleDeleteFile)
	c.commands.Register(CommandChmodFile, c.handleChmodFile)
	c.commands.Register(CommandRefreshPlaces, c.handleRefreshPlaces)
	c.commands.Register(CommandOpenPortal, c.handlePortalOpen)
	c.commands.Register(CommandSubmitPortal, c.handlePortalSubmit)
}

func (c *Controller) handleNavigate(ctx context.Context, cmd Command) error {
	nav, ok := cmd.(NavigateCommand)
	if !ok {
		return fmt.Errorf("navigate handler received %T", cmd)
	}
	if nav.Path == "" {
		return errors.New("navigate path is empty")
	}

	state, _ := c.state.Snapshot()
	hidden := state.Hidden

	c.registerInFlight(nav.OperationID(), nav.Type())
	c.state.Mutate(func(s *State) {
		s.IsSearchMode = false
		s.CurrentPath = nav.Path
	})

	opCtx, cancel := c.ops.ContextFor(c.ctx, nav.OperationID(), defaultOperationTimeout)
	go func() {
		defer cancel()
		defer c.finishOperation(nav.OperationID())

		entries, paths, err := LoadDirectory(nav.Path, hidden)
		if err != nil {
			c.state.Mutate(func(s *State) {
				s.LastError = err.Error()
			})
			c.events.Publish(ctx, OperationFailedEvent{
				EventBase: EventBase{OpID: nav.OperationID(), At: time.Now()},
				Command:   nav.Type(),
				Err:       err,
			})
			return
		}

		select {
		case <-opCtx.Done():
			return
		default:
		}

		if c.daemon != nil {
			tagMap, hydrateErr := c.daemon.HydrateTags(opCtx, paths)
			if hydrateErr != nil {
				c.events.Publish(ctx, OperationFailedEvent{
					EventBase: EventBase{OpID: nav.OperationID(), At: time.Now()},
					Command:   nav.Type(),
					Err:       hydrateErr,
				})
			} else {
				entries = mergeEntryTags(entries, tagMap)
			}
		}

		c.state.Mutate(func(s *State) {
			s.DirectoryEntries = append([]DirectoryEntry(nil), entries...)
			s.LastDirectoryLoad = time.Now()
		})

		c.events.Publish(ctx, DirectoryLoadedEvent{
			EventBase: EventBase{OpID: nav.OperationID(), At: time.Now()},
			Path:      nav.Path,
			Entries:   entries,
		})
	}()

	return nil
}

func (c *Controller) handleSearch(ctx context.Context, cmd Command) error {
	search, ok := cmd.(SearchCommand)
	if !ok {
		return fmt.Errorf("search handler received %T", cmd)
	}

	if search.Limit == 0 {
		search.Limit = defaultSearchLimit
	}

	c.registerInFlight(search.OperationID(), search.Type())
	c.state.Mutate(func(s *State) {
		s.IsSearchMode = true
		s.SearchChips = append([]string(nil), search.Chips...)
	})

	state, _ := c.state.Snapshot()
	opCtx, cancel := c.ops.ContextFor(c.ctx, search.OperationID(), defaultOperationTimeout)
	go func() {
		defer cancel()
		defer c.finishOperation(search.OperationID())

		localFiles, localErr := LocalSearch(search.Chips, search.Limit, SearchAllowHidden(search.Chips, state.Hidden))
		files := localFiles
		err := localErr

		if c.daemon != nil {
			daemonFiles, daemonErr := c.daemon.Search(opCtx, search.Chips, search.Limit)
			files = ensureSearchSource(daemonFiles, search.Chips, localFiles)
			err = buildSearchError(daemonErr, localErr)
			if len(files) > 0 {
				err = nil
			}
		}
		if err != nil {
			c.state.Mutate(func(s *State) {
				s.LastError = err.Error()
			})
			c.events.Publish(ctx, OperationFailedEvent{
				EventBase: EventBase{OpID: search.OperationID(), At: time.Now()},
				Command:   search.Type(),
				Err:       err,
			})
			return
		}

		select {
		case <-opCtx.Done():
			return
		default:
		}

		c.state.Mutate(func(s *State) {
			s.SearchResults = append([]SearchFile(nil), files...)
			s.LastSearch = time.Now()
		})

		c.events.Publish(ctx, SearchCompletedEvent{
			EventBase: EventBase{OpID: search.OperationID(), At: time.Now()},
			Chips:     append([]string(nil), search.Chips...),
			Files:     append([]SearchFile(nil), files...),
		})
	}()

	return nil
}

func (c *Controller) handleAutocomplete(ctx context.Context, cmd Command) error {
	auto, ok := cmd.(AutocompleteCommand)
	if !ok {
		return fmt.Errorf("autocomplete handler received %T", cmd)
	}

	c.registerInFlight(auto.OperationID(), auto.Type())
	opCtx, cancel := c.ops.ContextFor(c.ctx, auto.OperationID(), defaultOperationTimeout)
	go func() {
		defer cancel()
		defer c.finishOperation(auto.OperationID())

		items := []string{}
		var err error

		if strings.HasPrefix(auto.Prefix, "glob:") {
			items, err = autocompleteGlobItems(auto.Prefix)
		} else if c.daemon != nil {
			items, err = c.daemon.Autocomplete(opCtx, auto.Prefix)
		}

		if err != nil {
			c.state.Mutate(func(s *State) {
				s.LastError = err.Error()
			})
			c.events.Publish(ctx, OperationFailedEvent{
				EventBase: EventBase{OpID: auto.OperationID(), At: time.Now()},
				Command:   auto.Type(),
				Err:       err,
			})
			return
		}

		select {
		case <-opCtx.Done():
			return
		default:
		}

		c.state.Mutate(func(s *State) {
			s.Autocomplete = append([]string(nil), items...)
		})

		c.events.Publish(ctx, AutocompleteUpdatedEvent{
			EventBase: EventBase{OpID: auto.OperationID(), At: time.Now()},
			Items:     append([]string(nil), items...),
		})
	}()

	return nil
}

func autocompleteGlobItems(prefix string) ([]string, error) {
	globStr := strings.TrimPrefix(prefix, "glob:")
	if globStr == "" {
		return []string{}, nil
	}

	matches, err := filepath.Glob(globStr + "*")
	if err != nil {
		return nil, err
	}
	sort.Strings(matches)

	items := make([]string, 0, len(matches))
	for _, match := range matches {
		items = append(items, "glob:"+match)
	}

	return items, nil
}

func (c *Controller) handleToggleHidden(_ context.Context, cmd Command) error {
	toggle, ok := cmd.(ToggleHiddenCommand)
	if !ok {
		return fmt.Errorf("toggle hidden handler received %T", cmd)
	}

	c.state.Mutate(func(s *State) {
		s.Hidden = toggle.Show
	})

	return nil
}

func (c *Controller) handleCancelOperation(ctx context.Context, cmd Command) error {
	cancelCmd, ok := cmd.(CancelOperationCommand)
	if !ok {
		return fmt.Errorf("cancel handler received %T", cmd)
	}

	if cancelCmd.TargetOpID == "" {
		return nil
	}

	if c.ops.Cancel(cancelCmd.TargetOpID) {
		c.state.Mutate(func(s *State) {
			delete(s.InFlightOps, cancelCmd.TargetOpID)
		})
		c.events.Publish(ctx, OperationCancelledEvent{
			EventBase:  EventBase{OpID: cancelCmd.OperationID(), At: time.Now()},
			TargetOpID: cancelCmd.TargetOpID,
		})
	}

	return nil
}

func (c *Controller) handleShutdown(ctx context.Context, cmd Command) error {
	shutdown, ok := cmd.(ShutdownCommand)
	if !ok {
		return fmt.Errorf("shutdown handler received %T", cmd)
	}

	c.events.Publish(ctx, ShutdownInitiatedEvent{
		EventBase: EventBase{OpID: shutdown.OperationID(), At: time.Now()},
		Reason:    shutdown.Reason,
	})

	c.cancel()
	return nil
}

func (c *Controller) handleOpenFile(ctx context.Context, cmd Command) error {
	op, ok := cmd.(OpenFileCommand)
	if !ok {
		return fmt.Errorf("open file handler received %T", cmd)
	}

	if op.Path == "" {
		return errors.New("open file path is empty")
	}

	c.registerInFlight(op.OperationID(), op.Type())
	opCtx, cancel := c.ops.ContextFor(c.ctx, op.OperationID(), defaultOperationTimeout)
	go func() {
		defer cancel()
		defer c.finishOperation(op.OperationID())

		err := c.fsOps.Open(opCtx, op.Path)
		if err != nil {
			c.state.Mutate(func(s *State) {
				s.LastError = err.Error()
			})
			c.events.Publish(ctx, OperationFailedEvent{
				EventBase: EventBase{OpID: op.OperationID(), At: time.Now()},
				Command:   op.Type(),
				Err:       err,
			})
			return
		}

		c.events.Publish(ctx, FileOperationDoneEvent{
			EventBase: EventBase{OpID: op.OperationID(), At: time.Now()},
			Command:   op.Type(),
			Path:      op.Path,
		})
	}()

	return nil
}

func (c *Controller) handleRenameFile(ctx context.Context, cmd Command) error {
	op, ok := cmd.(RenameFileCommand)
	if !ok {
		return fmt.Errorf("rename file handler received %T", cmd)
	}
	if op.OldPath == "" || op.NewName == "" {
		return errors.New("rename input is empty")
	}

	c.registerInFlight(op.OperationID(), op.Type())
	opCtx, cancel := c.ops.ContextFor(c.ctx, op.OperationID(), defaultOperationTimeout)
	go func() {
		defer cancel()
		defer c.finishOperation(op.OperationID())

		newPath, err := c.fsOps.Rename(op.OldPath, op.NewName)
		if err != nil {
			c.state.Mutate(func(s *State) {
				s.LastError = err.Error()
			})
			c.events.Publish(ctx, OperationFailedEvent{
				EventBase: EventBase{OpID: op.OperationID(), At: time.Now()},
				Command:   op.Type(),
				Err:       err,
			})
			return
		}

		select {
		case <-opCtx.Done():
			return
		default:
		}

		c.events.Publish(ctx, FileOperationDoneEvent{
			EventBase: EventBase{OpID: op.OperationID(), At: time.Now()},
			Command:   op.Type(),
			Path:      newPath,
		})
	}()

	return nil
}

func (c *Controller) handleDeleteFile(ctx context.Context, cmd Command) error {
	op, ok := cmd.(DeleteFileCommand)
	if !ok {
		return fmt.Errorf("delete file handler received %T", cmd)
	}
	if op.Path == "" {
		return errors.New("delete file path is empty")
	}

	c.registerInFlight(op.OperationID(), op.Type())
	opCtx, cancel := c.ops.ContextFor(c.ctx, op.OperationID(), defaultOperationTimeout)
	go func() {
		defer cancel()
		defer c.finishOperation(op.OperationID())

		err := c.fsOps.Delete(op.Path)
		if err != nil {
			c.state.Mutate(func(s *State) {
				s.LastError = err.Error()
			})
			c.events.Publish(ctx, OperationFailedEvent{
				EventBase: EventBase{OpID: op.OperationID(), At: time.Now()},
				Command:   op.Type(),
				Err:       err,
			})
			return
		}

		select {
		case <-opCtx.Done():
			return
		default:
		}

		c.events.Publish(ctx, FileOperationDoneEvent{
			EventBase: EventBase{OpID: op.OperationID(), At: time.Now()},
			Command:   op.Type(),
			Path:      op.Path,
		})
	}()

	return nil
}

func (c *Controller) handleChmodFile(ctx context.Context, cmd Command) error {
	op, ok := cmd.(ChmodFileCommand)
	if !ok {
		return fmt.Errorf("chmod file handler received %T", cmd)
	}
	if op.Path == "" {
		return errors.New("chmod file path is empty")
	}

	c.registerInFlight(op.OperationID(), op.Type())
	opCtx, cancel := c.ops.ContextFor(c.ctx, op.OperationID(), defaultOperationTimeout)
	go func() {
		defer cancel()
		defer c.finishOperation(op.OperationID())

		err := c.fsOps.Chmod(op.Path, op.Mode)
		if err != nil {
			c.state.Mutate(func(s *State) {
				s.LastError = err.Error()
			})
			c.events.Publish(ctx, OperationFailedEvent{
				EventBase: EventBase{OpID: op.OperationID(), At: time.Now()},
				Command:   op.Type(),
				Err:       err,
			})
			return
		}

		select {
		case <-opCtx.Done():
			return
		default:
		}

		c.events.Publish(ctx, FileOperationDoneEvent{
			EventBase: EventBase{OpID: op.OperationID(), At: time.Now()},
			Command:   op.Type(),
			Path:      op.Path,
		})
	}()

	return nil
}

func (c *Controller) handleRefreshPlaces(ctx context.Context, cmd Command) error {
	c.registerInFlight(cmd.OperationID(), cmd.Type())
	opCtx, cancel := c.ops.ContextFor(c.ctx, cmd.OperationID(), defaultOperationTimeout)
	go func() {
		defer cancel()
		defer c.finishOperation(cmd.OperationID())

		places, err := BuildPlaces()
		if err != nil {
			c.state.Mutate(func(s *State) {
				s.LastError = err.Error()
			})
			c.events.Publish(ctx, OperationFailedEvent{
				EventBase: EventBase{OpID: cmd.OperationID(), At: time.Now()},
				Command:   cmd.Type(),
				Err:       err,
			})
			return
		}

		select {
		case <-opCtx.Done():
			return
		default:
		}

		c.state.Mutate(func(s *State) {
			s.Places = append([]PlaceEntry(nil), places...)
			s.LastPlacesRefresh = time.Now()
		})

		c.events.Publish(ctx, PlacesRefreshedEvent{
			EventBase: EventBase{OpID: cmd.OperationID(), At: time.Now()},
			Places:    append([]PlaceEntry(nil), places...),
		})
	}()

	return nil
}

func (c *Controller) handlePortalOpen(ctx context.Context, cmd Command) error {
	op, ok := cmd.(OpenPortalCommand)
	if !ok {
		return fmt.Errorf("open portal handler received %T", cmd)
	}

	c.state.Mutate(func(s *State) {
		s.WindowMode = op.Mode
	})

	c.events.Publish(ctx, PortalOpenedEvent{
		EventBase: EventBase{OpID: op.OperationID(), At: time.Now()},
		Mode:      op.Mode,
	})

	return nil
}

func (c *Controller) handlePortalSubmit(ctx context.Context, cmd Command) error {
	submit, ok := cmd.(SubmitPortalCommand)
	if !ok {
		return fmt.Errorf("submit portal handler received %T", cmd)
	}

	c.events.Publish(ctx, PortalClosedEvent{
		EventBase:     EventBase{OpID: submit.OperationID(), At: time.Now()},
		SelectedFiles: append([]string(nil), submit.SelectedFiles...),
	})

	return nil
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
