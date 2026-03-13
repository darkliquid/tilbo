package browser

import (
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commandcore"
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

// CommandType identifies a browser command kind.
type CommandType = commandcore.Type

const (
	CommandNavigate        = commandcore.Navigate
	CommandSearch          = commandcore.Search
	CommandOpenFile        = commandcore.OpenFile
	CommandRenameFile      = commandcore.RenameFile
	CommandDeleteFile      = commandcore.DeleteFile
	CommandChmodFile       = commandcore.ChmodFile
	CommandToggleHidden    = commandcore.ToggleHidden
	CommandAutocomplete    = commandcore.Autocomplete
	CommandRefreshPlaces   = commandcore.RefreshPlaces
	CommandOpenPortal      = commandcore.OpenPortal
	CommandSubmitPortal    = commandcore.SubmitPortal
	CommandCancelOperation = commandcore.CancelOperation
	CommandShutdown        = commandcore.Shutdown
)

// Command is the common interface for all controller commands.
type Command = commandcore.Command

// CommandBase provides shared operation identity fields.
type CommandBase = commandcore.Base

type NavigateCommand = navigate.Command
type SearchCommand = search.Command
type OpenFileCommand = openfile.Command
type RenameFileCommand = renamefile.Command
type DeleteFileCommand = deletefile.Command
type ChmodFileCommand = chmodfile.Command
type ToggleHiddenCommand = togglehidden.Command
type AutocompleteCommand = autocomplete.Command
type RefreshPlacesCommand = refreshplaces.Command
type OpenPortalCommand = openportal.Command
type SubmitPortalCommand = submitportal.Command
type CancelOperationCommand = canceloperation.Command
type ShutdownCommand = shutdown.Command
