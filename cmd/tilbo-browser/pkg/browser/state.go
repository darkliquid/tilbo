package browser

import (
	"maps"
	"sync"
	"time"
)

// State is the authoritative controller state snapshot.
type State struct {
	CurrentPath string
	Hidden      bool

	IsSearchMode bool
	SearchChips  []string

	DirectoryEntries []DirectoryEntry
	SearchResults    []SearchFile
	Autocomplete     []string
	Places           []PlaceEntry

	SelectedIndices []int
	WindowMode      string
	PortalSelection []string

	DaemonConnected bool
	LastError       string

	InFlightOps map[string]OperationMeta

	LastDirectoryLoad time.Time
	LastSearch        time.Time
	LastPlacesRefresh time.Time
}

// OperationMeta tracks metadata for one in-flight operation.
type OperationMeta struct {
	ID      string
	Command CommandType
	Started time.Time
	Timeout time.Duration
}

// StateStore owns browser state and mutation/version tracking.
type StateStore struct {
	mu      sync.RWMutex
	state   State
	version uint64
}

// NewStateStore constructs a store with defaults.
func NewStateStore() *StateStore {
	return &StateStore{
		state: State{
			CurrentPath:      "/",
			SearchChips:      []string{},
			DirectoryEntries: []DirectoryEntry{},
			SearchResults:    []SearchFile{},
			Autocomplete:     []string{},
			Places:           []PlaceEntry{},
			SelectedIndices:  []int{},
			WindowMode:       "browser",
			PortalSelection:  []string{},
			InFlightOps:      make(map[string]OperationMeta),
		},
	}
}

// Snapshot returns a detached copy of state and current version.
func (s *StateStore) Snapshot() (State, uint64) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	copyState := s.state
	copyState.SearchChips = append([]string(nil), s.state.SearchChips...)
	copyState.DirectoryEntries = append([]DirectoryEntry(nil), s.state.DirectoryEntries...)
	copyState.SearchResults = append([]SearchFile(nil), s.state.SearchResults...)
	copyState.Autocomplete = append([]string(nil), s.state.Autocomplete...)
	copyState.Places = append([]PlaceEntry(nil), s.state.Places...)
	copyState.SelectedIndices = append([]int(nil), s.state.SelectedIndices...)
	copyState.PortalSelection = append([]string(nil), s.state.PortalSelection...)
	copyState.InFlightOps = make(map[string]OperationMeta, len(s.state.InFlightOps))
	maps.Copy(copyState.InFlightOps, s.state.InFlightOps)

	return copyState, s.version
}

// Mutate applies a mutation atomically and bumps the store version.
func (s *StateStore) Mutate(fn func(*State)) uint64 {
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
