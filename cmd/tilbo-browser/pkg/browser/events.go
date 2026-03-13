package browser

// This file re-exports domain and event types from commandcore for backward
// compatibility. All concrete definitions live in the commandcore package.

import "github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commandcore"

// DirectoryEntry is a filesystem item in a rendered directory.
type DirectoryEntry = commandcore.DirectoryEntry

// SearchFile is a search result item.
type SearchFile = commandcore.SearchFile

// PlaceEntry is a sidebar place.
type PlaceEntry = commandcore.PlaceEntry

// EventType identifies a browser event kind.
type EventType = commandcore.EventType

// Event constant re-exports.
const (
	EventDirectoryLoaded      = commandcore.EventDirectoryLoaded
	EventSearchCompleted      = commandcore.EventSearchCompleted
	EventFileOperationDone    = commandcore.EventFileOperationDone
	EventPlacesRefreshed      = commandcore.EventPlacesRefreshed
	EventPortalOpened         = commandcore.EventPortalOpened
	EventPortalClosed         = commandcore.EventPortalClosed
	EventOperationCancelled   = commandcore.EventOperationCancelled
	EventOperationFailed      = commandcore.EventOperationFailed
	EventDaemonConnected      = commandcore.EventDaemonConnected
	EventDaemonDisconnected   = commandcore.EventDaemonDisconnected
	EventShutdownInitiated    = commandcore.EventShutdownInitiated
	EventAutocompleteUpdated  = commandcore.EventAutocompleteUpdated
	EventSelectionStateChange = commandcore.EventSelectionStateChange
)

// Event is the common interface for all controller events.
type Event = commandcore.Event

// EventBase stores shared event fields.
type EventBase = commandcore.EventBase

// DirectoryLoadedEvent reports directory listing completion.
type DirectoryLoadedEvent = commandcore.DirectoryLoadedEvent

// SearchCompletedEvent reports search completion.
type SearchCompletedEvent = commandcore.SearchCompletedEvent

// FileOperationDoneEvent reports file side-effect completion.
type FileOperationDoneEvent = commandcore.FileOperationDoneEvent

// PlacesRefreshedEvent reports places list refresh completion.
type PlacesRefreshedEvent = commandcore.PlacesRefreshedEvent

// PortalOpenedEvent reports portal mode open request.
type PortalOpenedEvent = commandcore.PortalOpenedEvent

// PortalClosedEvent reports portal result submission.
type PortalClosedEvent = commandcore.PortalClosedEvent

// OperationCancelledEvent reports operation cancellation.
type OperationCancelledEvent = commandcore.OperationCancelledEvent

// OperationFailedEvent reports an operation failure.
type OperationFailedEvent = commandcore.OperationFailedEvent

// DaemonConnectedEvent reports daemon connection.
type DaemonConnectedEvent = commandcore.DaemonConnectedEvent

// DaemonDisconnectedEvent reports daemon disconnection.
type DaemonDisconnectedEvent = commandcore.DaemonDisconnectedEvent

// ShutdownInitiatedEvent reports beginning of shutdown.
type ShutdownInitiatedEvent = commandcore.ShutdownInitiatedEvent

// AutocompleteUpdatedEvent reports autocomplete updates.
type AutocompleteUpdatedEvent = commandcore.AutocompleteUpdatedEvent

// SelectionStateChangeEvent reports selected item changes.
type SelectionStateChangeEvent = commandcore.SelectionStateChangeEvent
