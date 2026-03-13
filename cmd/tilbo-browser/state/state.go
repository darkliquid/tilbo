package state

import (
	"maps"
	"sync"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/core"
)

// State is the authoritative controller state snapshot.
type State = core.State

// OperationMeta tracks metadata for one in-flight operation.
type OperationMeta = core.OperationMeta

// Store owns browser state and mutation/version tracking.
type Store struct {
	mu      sync.RWMutex
	state   State
	version uint64
}

// NewStore constructs a store with defaults.
func NewStore() *Store {
	return &Store{
		state: State{
			CurrentPath:      "/",
			SearchChips:      []string{},
			DirectoryEntries: []core.DirectoryEntry{},
			SearchResults:    []core.SearchFile{},
			Autocomplete:     []string{},
			Places:           []core.PlaceEntry{},
			SelectedIndices:  []int{},
			WindowMode:       "browser",
			PortalSelection:  []string{},
			InFlightOps:      make(map[string]OperationMeta),
		},
	}
}

// Snapshot returns a detached copy of state and current version.
func (s *Store) Snapshot() (State, uint64) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	copyState := s.state
	copyState.SearchChips = append([]string(nil), s.state.SearchChips...)
	copyState.DirectoryEntries = append([]core.DirectoryEntry(nil), s.state.DirectoryEntries...)
	copyState.SearchResults = append([]core.SearchFile(nil), s.state.SearchResults...)
	copyState.Autocomplete = append([]string(nil), s.state.Autocomplete...)
	copyState.Places = append([]core.PlaceEntry(nil), s.state.Places...)
	copyState.SelectedIndices = append([]int(nil), s.state.SelectedIndices...)
	copyState.PortalSelection = append([]string(nil), s.state.PortalSelection...)
	copyState.InFlightOps = make(map[string]OperationMeta, len(s.state.InFlightOps))
	maps.Copy(copyState.InFlightOps, s.state.InFlightOps)

	return copyState, s.version
}

// Mutate applies a mutation atomically and bumps the store version.
func (s *Store) Mutate(fn func(*State)) uint64 {
	if fn == nil {
		s.mu.RLock()
		defer s.mu.RUnlock()
		return s.version
	}

	s.mu.Lock()
	fn(&s.state)
	s.version++
	v := s.version
	s.mu.Unlock()

	return v
}
