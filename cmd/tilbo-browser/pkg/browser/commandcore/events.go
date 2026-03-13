package commandcore

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

// EventBase stores shared event fields.
type EventBase struct {
	OpID string
	At   time.Time
}

// OperationID returns the operation id for the event.
func (b EventBase) OperationID() string { return b.OpID }

// OccurredAt returns the event timestamp.
func (b EventBase) OccurredAt() time.Time { return b.At }

// DirectoryLoadedEvent reports directory listing completion.
type DirectoryLoadedEvent struct {
	EventBase

	Path    string
	Entries []DirectoryEntry
	Err     error
}

// Type returns the event type identifier.
func (e DirectoryLoadedEvent) Type() EventType { return EventDirectoryLoaded }

// SearchCompletedEvent reports search completion.
type SearchCompletedEvent struct {
	EventBase

	Chips []string
	Files []SearchFile
	Err   error
}

// Type returns the event type identifier.
func (e SearchCompletedEvent) Type() EventType { return EventSearchCompleted }

// FileOperationDoneEvent reports file side-effect completion.
type FileOperationDoneEvent struct {
	EventBase

	Command Type
	Path    string
	Err     error
}

// Type returns the event type identifier.
func (e FileOperationDoneEvent) Type() EventType { return EventFileOperationDone }

// PlacesRefreshedEvent reports places list refresh completion.
type PlacesRefreshedEvent struct {
	EventBase

	Places []PlaceEntry
	Err    error
}

// Type returns the event type identifier.
func (e PlacesRefreshedEvent) Type() EventType { return EventPlacesRefreshed }

// PortalOpenedEvent reports portal mode open request.
type PortalOpenedEvent struct {
	EventBase

	Mode string
}

// Type returns the event type identifier.
func (e PortalOpenedEvent) Type() EventType { return EventPortalOpened }

// PortalClosedEvent reports portal result submission.
type PortalClosedEvent struct {
	EventBase

	SelectedFiles []string
}

// Type returns the event type identifier.
func (e PortalClosedEvent) Type() EventType { return EventPortalClosed }

// OperationCancelledEvent reports operation cancellation.
type OperationCancelledEvent struct {
	EventBase

	TargetOpID string
}

// Type returns the event type identifier.
func (e OperationCancelledEvent) Type() EventType { return EventOperationCancelled }

// OperationFailedEvent reports an operation failure.
type OperationFailedEvent struct {
	EventBase

	Command Type
	Err     error
}

// Type returns the event type identifier.
func (e OperationFailedEvent) Type() EventType { return EventOperationFailed }

// DaemonConnectedEvent reports daemon connection.
type DaemonConnectedEvent struct {
	EventBase
}

// Type returns the event type identifier.
func (e DaemonConnectedEvent) Type() EventType { return EventDaemonConnected }

// DaemonDisconnectedEvent reports daemon disconnection.
type DaemonDisconnectedEvent struct {
	EventBase

	Reason string
}

// Type returns the event type identifier.
func (e DaemonDisconnectedEvent) Type() EventType { return EventDaemonDisconnected }

// ShutdownInitiatedEvent reports beginning of shutdown.
type ShutdownInitiatedEvent struct {
	EventBase

	Reason string
}

// Type returns the event type identifier.
func (e ShutdownInitiatedEvent) Type() EventType { return EventShutdownInitiated }

// AutocompleteUpdatedEvent reports autocomplete data updates.
type AutocompleteUpdatedEvent struct {
	EventBase

	Items []string
	Err   error
}

// Type returns the event type identifier.
func (e AutocompleteUpdatedEvent) Type() EventType { return EventAutocompleteUpdated }

// SelectionStateChangeEvent reports selected item changes.
type SelectionStateChangeEvent struct {
	EventBase

	Indices []int
}

// Type returns the event type identifier.
func (e SelectionStateChangeEvent) Type() EventType { return EventSelectionStateChange }
