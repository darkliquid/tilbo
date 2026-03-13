// Package commandcore defines browser command types for commandcore operations.
package commandcore

// Type identifies a browser command kind.
type Type string

const (
	Navigate        Type = "navigate"
	Search          Type = "search"
	OpenFile        Type = "open_file"
	RenameFile      Type = "rename_file"
	DeleteFile      Type = "delete_file"
	ChmodFile       Type = "chmod_file"
	ToggleHidden    Type = "toggle_hidden"
	Autocomplete    Type = "autocomplete"
	RefreshPlaces   Type = "refresh_places"
	OpenPortal      Type = "open_portal"
	SubmitPortal    Type = "submit_portal"
	CancelOperation Type = "cancel_operation"
	Shutdown        Type = "shutdown"
)

// Command is the common interface for all controller commands.
type Command interface {
	Type() Type
	OperationID() string
}

// Base provides shared operation identity fields.
type Base struct {
	OpID string
}

// OperationID returns the request/operation identifier.
func (b Base) OperationID() string { return b.OpID }
