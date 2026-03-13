package browser

import (
	"context"
	"maps"
	"sync"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commandcore"
)

// ProjectionState holds a versioned state view driven by event subscribers.
type ProjectionState struct {
	mu      sync.RWMutex
	state   State
	version uint64
}

// NewProjectionState creates a projection state with a detached initial state.
func NewProjectionState(initial State) *ProjectionState {
	return &ProjectionState{state: cloneState(initial)}
}

// Version returns the current version without cloning state.
// Use this for a cheap version-change check before calling Snapshot.
func (p *ProjectionState) Version() uint64 {
	p.mu.RLock()
	defer p.mu.RUnlock()
	return p.version
}

// Snapshot returns a detached state copy and its version.
func (p *ProjectionState) Snapshot() (State, uint64) {
	p.mu.RLock()
	defer p.mu.RUnlock()

	return cloneState(p.state), p.version
}

func (p *ProjectionState) mutate(fn func(*State)) {
	if fn == nil {
		return
	}

	p.mu.Lock()
	fn(&p.state)
	p.version++
	p.mu.Unlock()
}

// NewDirectoryProjection returns a subscriber that projects directory events.
func NewDirectoryProjection() (commandcore.EventSubscriber, *ProjectionState) {
	ps := NewProjectionState(State{DirectoryEntries: []commandcore.DirectoryEntry{}})
	sub := func(_ context.Context, evt commandcore.Event) {
		e, ok := evt.(commandcore.DirectoryLoadedEvent)
		if !ok {
			return
		}

		ps.mutate(func(s *State) {
			s.CurrentPath = e.Path
			s.IsSearchMode = false
			s.DirectoryEntries = append([]commandcore.DirectoryEntry(nil), e.Entries...)
			s.LastDirectoryLoad = e.OccurredAt()
		})
	}

	return sub, ps
}

// NewSearchProjection returns a subscriber that projects search events.
func NewSearchProjection() (commandcore.EventSubscriber, *ProjectionState) {
	ps := NewProjectionState(State{SearchResults: []commandcore.SearchFile{}, SearchChips: []string{}})
	sub := func(_ context.Context, evt commandcore.Event) {
		e, ok := evt.(commandcore.SearchCompletedEvent)
		if !ok {
			return
		}

		ps.mutate(func(s *State) {
			s.IsSearchMode = true
			s.SearchChips = append([]string(nil), e.Chips...)
			s.SearchResults = append([]commandcore.SearchFile(nil), e.Files...)
			s.LastSearch = e.OccurredAt()
		})
	}

	return sub, ps
}

// NewAutocompleteProjection returns a subscriber that projects autocomplete events.
func NewAutocompleteProjection() (commandcore.EventSubscriber, *ProjectionState) {
	ps := NewProjectionState(State{Autocomplete: []string{}})
	sub := func(_ context.Context, evt commandcore.Event) {
		e, ok := evt.(commandcore.AutocompleteUpdatedEvent)
		if !ok {
			return
		}

		ps.mutate(func(s *State) {
			s.Autocomplete = append([]string(nil), e.Items...)
		})
	}

	return sub, ps
}

// NewPlacesProjection returns a subscriber that projects places events.
func NewPlacesProjection() (commandcore.EventSubscriber, *ProjectionState) {
	ps := NewProjectionState(State{Places: []commandcore.PlaceEntry{}})
	sub := func(_ context.Context, evt commandcore.Event) {
		e, ok := evt.(commandcore.PlacesRefreshedEvent)
		if !ok {
			return
		}

		ps.mutate(func(s *State) {
			s.Places = append([]commandcore.PlaceEntry(nil), e.Places...)
			s.LastPlacesRefresh = e.OccurredAt()
		})
	}

	return sub, ps
}

// NewPortalProjection returns a subscriber that projects portal mode events.
func NewPortalProjection() (commandcore.EventSubscriber, *ProjectionState) {
	ps := NewProjectionState(State{WindowMode: "browser"})
	sub := func(_ context.Context, evt commandcore.Event) {
		switch e := evt.(type) {
		case commandcore.PortalOpenedEvent:
			ps.mutate(func(s *State) {
				s.WindowMode = e.Mode
				s.PortalSelection = []string{}
			})
		case commandcore.PortalClosedEvent:
			ps.mutate(func(s *State) {
				s.WindowMode = "browser"
				s.PortalSelection = append([]string(nil), e.SelectedFiles...)
			})
		}
	}

	return sub, ps
}

// NewFailureProjection returns a subscriber that projects operation failures.
func NewFailureProjection() (commandcore.EventSubscriber, *ProjectionState) {
	ps := NewProjectionState(State{})
	sub := func(_ context.Context, evt commandcore.Event) {
		e, ok := evt.(commandcore.OperationFailedEvent)
		if !ok {
			return
		}

		ps.mutate(func(s *State) {
			if e.Err != nil {
				s.LastError = e.Err.Error()
			}
		})
	}

	return sub, ps
}

// Projections groups projection states by domain.
type Projections struct {
	Directory *ProjectionState
	Search    *ProjectionState
	Auto      *ProjectionState
	Places    *ProjectionState
	Portal    *ProjectionState
	Failures  *ProjectionState
}

// ProjectionSubscribers groups event subscribers by domain.
type ProjectionSubscribers struct {
	Directory commandcore.EventSubscriber
	Search    commandcore.EventSubscriber
	Auto      commandcore.EventSubscriber
	Places    commandcore.EventSubscriber
	Portal    commandcore.EventSubscriber
	Failures  commandcore.EventSubscriber
}

// NewProjectionSet creates a default projection state and subscriber set.
func NewProjectionSet() (ProjectionSubscribers, Projections) {
	dirSub, dir := NewDirectoryProjection()
	searchSub, search := NewSearchProjection()
	autoSub, auto := NewAutocompleteProjection()
	placesSub, places := NewPlacesProjection()
	portalSub, portal := NewPortalProjection()
	failSub, failures := NewFailureProjection()

	return ProjectionSubscribers{
			Directory: dirSub,
			Search:    searchSub,
			Auto:      autoSub,
			Places:    placesSub,
			Portal:    portalSub,
			Failures:  failSub,
		}, Projections{
			Directory: dir,
			Search:    search,
			Auto:      auto,
			Places:    places,
			Portal:    portal,
			Failures:  failures,
		}
}

func cloneState(s State) State {
	out := s
	out.SearchChips = append([]string(nil), s.SearchChips...)
	out.DirectoryEntries = append([]commandcore.DirectoryEntry(nil), s.DirectoryEntries...)
	out.SearchResults = append([]commandcore.SearchFile(nil), s.SearchResults...)
	out.Autocomplete = append([]string(nil), s.Autocomplete...)
	out.Places = append([]commandcore.PlaceEntry(nil), s.Places...)
	out.SelectedIndices = append([]int(nil), s.SelectedIndices...)
	out.PortalSelection = append([]string(nil), s.PortalSelection...)
	out.InFlightOps = make(map[string]OperationMeta, len(s.InFlightOps))
	maps.Copy(out.InFlightOps, s.InFlightOps)

	return out
}
