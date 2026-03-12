package browser

import "time"

// EventType identifies a browser event kind.
type EventType string

const (
	EventDirectoryLoaded      EventType = "directory_loaded"
	EventSearchCompleted      EventType = "search_completed"
	EventFileOperationDone    EventType = "file_operation_done"
	EventPlacesRefreshed      EventType = "places_refreshed"
	EventPortalOpened         EventType = "portal_opened"
	EventPortalClosed         EventType = "portal_closed"
	EventOperationCancelled   EventType = "operation_cancelled"
	EventOperationFailed      EventType = "operation_failed"
	EventDaemonConnected      EventType = "daemon_connected"
	EventDaemonDisconnected   EventType = "daemon_disconnected"
	EventShutdownInitiated    EventType = "shutdown_initiated"
	EventAutocompleteUpdated  EventType = "autocomplete_updated"
	EventSelectionStateChange EventType = "selection_state_change"
)

// Event is the common interface for all controller events.
type Event interface {
	Type() EventType
	OperationID() string
	OccurredAt() time.Time
}

// EventBase stores shared fields.
type EventBase struct {
	OpID string
	At   time.Time
}

// OperationID returns the operation id for the event.
func (b EventBase) OperationID() string { return b.OpID }

// OccurredAt returns the event timestamp.
func (b EventBase) OccurredAt() time.Time { return b.At }

// DirectoryEntry is a filesystem item in a rendered directory.
type DirectoryEntry struct {
	Name   string
	Path   string
	IsDir  bool
	Size   int64
	MTime  int64
	Tags   []string
	Hidden bool
}

// SearchFile is a search result item.
type SearchFile struct {
	Path  string
	Tags  []string
	Size  int64
	MTime int64
}

// PlaceEntry is a sidebar place.
type PlaceEntry struct {
	Name string
	Path string
}

// DirectoryLoadedEvent reports directory listing completion.
type DirectoryLoadedEvent struct {
	EventBase

	Path    string
	Entries []DirectoryEntry
	Err     error
}

func (e DirectoryLoadedEvent) Type() EventType { return EventDirectoryLoaded }

// SearchCompletedEvent reports search completion.
type SearchCompletedEvent struct {
	EventBase

	Chips []string
	Files []SearchFile
	Err   error
}

func (e SearchCompletedEvent) Type() EventType { return EventSearchCompleted }

// FileOperationDoneEvent reports file side-effect completion.
type FileOperationDoneEvent struct {
	EventBase

	Command CommandType
	Path    string
	Err     error
}

func (e FileOperationDoneEvent) Type() EventType { return EventFileOperationDone }

// PlacesRefreshedEvent reports places list refresh completion.
type PlacesRefreshedEvent struct {
	EventBase

	Places []PlaceEntry
	Err    error
}

func (e PlacesRefreshedEvent) Type() EventType { return EventPlacesRefreshed }

// PortalOpenedEvent reports portal mode open request completion.
type PortalOpenedEvent struct {
	EventBase

	Mode string
}

func (e PortalOpenedEvent) Type() EventType { return EventPortalOpened }

// PortalClosedEvent reports portal result submission.
type PortalClosedEvent struct {
	EventBase

	SelectedFiles []string
}

func (e PortalClosedEvent) Type() EventType { return EventPortalClosed }

// OperationCancelledEvent reports operation cancellation.
type OperationCancelledEvent struct {
	EventBase

	TargetOpID string
}

func (e OperationCancelledEvent) Type() EventType { return EventOperationCancelled }

// OperationFailedEvent reports an operation failure.
type OperationFailedEvent struct {
	EventBase

	Command CommandType
	Err     error
}

func (e OperationFailedEvent) Type() EventType { return EventOperationFailed }

// DaemonConnectedEvent reports daemon connection status.
type DaemonConnectedEvent struct {
	EventBase
}

func (e DaemonConnectedEvent) Type() EventType { return EventDaemonConnected }

// DaemonDisconnectedEvent reports daemon disconnection.
type DaemonDisconnectedEvent struct {
	EventBase

	Reason string
}

func (e DaemonDisconnectedEvent) Type() EventType { return EventDaemonDisconnected }

// ShutdownInitiatedEvent reports beginning of shutdown.
type ShutdownInitiatedEvent struct {
	EventBase

	Reason string
}

func (e ShutdownInitiatedEvent) Type() EventType { return EventShutdownInitiated }

// AutocompleteUpdatedEvent reports autocomplete data updates.
type AutocompleteUpdatedEvent struct {
	EventBase

	Items []string
	Err   error
}

func (e AutocompleteUpdatedEvent) Type() EventType { return EventAutocompleteUpdated }

// SelectionStateChangeEvent reports selected item changes.
type SelectionStateChangeEvent struct {
	EventBase

	Indices []int
}

func (e SelectionStateChangeEvent) Type() EventType { return EventSelectionStateChange }
