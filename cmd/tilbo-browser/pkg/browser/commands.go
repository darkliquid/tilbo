package browser

// CommandType identifies a browser command kind.
type CommandType string

const (
	CommandNavigate        CommandType = "navigate"
	CommandSearch          CommandType = "search"
	CommandOpenFile        CommandType = "open_file"
	CommandRenameFile      CommandType = "rename_file"
	CommandDeleteFile      CommandType = "delete_file"
	CommandChmodFile       CommandType = "chmod_file"
	CommandToggleHidden    CommandType = "toggle_hidden"
	CommandAutocomplete    CommandType = "autocomplete"
	CommandRefreshPlaces   CommandType = "refresh_places"
	CommandOpenPortal      CommandType = "open_portal"
	CommandSubmitPortal    CommandType = "submit_portal"
	CommandCancelOperation CommandType = "cancel_operation"
	CommandShutdown        CommandType = "shutdown"
)

// Command is the common interface for all controller commands.
type Command interface {
	Type() CommandType
	OperationID() string
}

// CommandBase provides shared operation identity fields.
type CommandBase struct {
	OpID string
}

// OperationID returns the request/operation identifier.
func (b CommandBase) OperationID() string { return b.OpID }

// NavigateCommand requests loading a directory path.
type NavigateCommand struct {
	CommandBase

	Path string
}

func (c NavigateCommand) Type() CommandType { return CommandNavigate }

// SearchCommand requests a tag/path metadata search.
type SearchCommand struct {
	CommandBase

	Chips []string
	Limit uint32
}

func (c SearchCommand) Type() CommandType { return CommandSearch }

// OpenFileCommand requests opening a file with a local handler.
type OpenFileCommand struct {
	CommandBase

	Path string
}

func (c OpenFileCommand) Type() CommandType { return CommandOpenFile }

// RenameFileCommand requests renaming a file.
type RenameFileCommand struct {
	CommandBase

	OldPath string
	NewName string
}

func (c RenameFileCommand) Type() CommandType { return CommandRenameFile }

// DeleteFileCommand requests deleting a file tree.
type DeleteFileCommand struct {
	CommandBase

	Path string
}

func (c DeleteFileCommand) Type() CommandType { return CommandDeleteFile }

// ChmodFileCommand requests changing file mode bits.
type ChmodFileCommand struct {
	CommandBase

	Path string
	Mode uint32
}

func (c ChmodFileCommand) Type() CommandType { return CommandChmodFile }

// ToggleHiddenCommand requests hidden file visibility change.
type ToggleHiddenCommand struct {
	CommandBase

	Show bool
}

func (c ToggleHiddenCommand) Type() CommandType { return CommandToggleHidden }

// AutocompleteCommand requests autocomplete item refresh for a prefix.
type AutocompleteCommand struct {
	CommandBase

	Prefix string
}

func (c AutocompleteCommand) Type() CommandType { return CommandAutocomplete }

// RefreshPlacesCommand requests refreshing sidebar places.
type RefreshPlacesCommand struct {
	CommandBase
}

func (c RefreshPlacesCommand) Type() CommandType { return CommandRefreshPlaces }

// OpenPortalCommand requests opening portal mode.
type OpenPortalCommand struct {
	CommandBase

	Mode string
}

func (c OpenPortalCommand) Type() CommandType { return CommandOpenPortal }

// SubmitPortalCommand requests closing portal mode with selected URIs.
type SubmitPortalCommand struct {
	CommandBase

	SelectedFiles []string
}

func (c SubmitPortalCommand) Type() CommandType { return CommandSubmitPortal }

// CancelOperationCommand requests cancellation of another operation.
type CancelOperationCommand struct {
	CommandBase

	TargetOpID string
}

func (c CancelOperationCommand) Type() CommandType { return CommandCancelOperation }

// ShutdownCommand requests application shutdown.
type ShutdownCommand struct {
	CommandBase

	Reason string
}

func (c ShutdownCommand) Type() CommandType { return CommandShutdown }
