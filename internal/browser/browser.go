// Package browser defines the method surface and data types shared between the
// daemon's browser-handler implementation and the UI socket server.
package browser

// DirEntry represents one filesystem item returned by ListDirectory.
type DirEntry struct {
	Name     string
	Path     string
	IsDir    bool
	Size     int64
	MTime    int64
	Mode     uint32
	Hidden   bool
	MimeType string
	IconName string
}

// FileStat holds the current size, mtime, and mode for a single path.
type FileStat struct {
	Size  int64
	MTime int64
	Mode  uint32
}

// FileResult is a search result item returned by Search and GlobSearch.
type FileResult struct {
	Path     string
	Tags     []string
	Metadata map[string]string
	Score    float64
	MTime    int64
	Size     int64
}

// TagResult holds the outcome of a ModifyTags call.
type TagResult struct {
	PathsOK    []string
	PathsError []string
	Errors     map[string]string
}

// PathTags holds the hydrated tags for a single filesystem path.
type PathTags struct {
	Path string
	Tags []string
}

// PlaceEntry is a sidebar/places entry.
type PlaceEntry struct {
	Name     string
	Path     string
	Pinned   bool
	IconName string
}

// TrashEntry is a file in the XDG trash.
type TrashEntry struct {
	Name         string
	OriginalPath string
	DeletionDate int64
	SizeBytes    int64
}

// AppEntry represents an installed application.
type AppEntry struct {
	ID       string
	Name     string
	IconName string
}

// FileAction is a context menu action provided by an extension.
type FileAction struct {
	ID    string
	Label string
}

// BrowserConfig holds browser-level config returned to the frontend.
type BrowserConfig struct {
	Keybindings map[string]string
	UseTrash    bool
}

// Methods is the complete callable method surface required by the Quickshell
// frontend.  Every method maps 1:1 to a UI socket method that the frontend
// will call via the JSON IPC transport.
//
// TagOperation strings: "add", "remove", "set".
type Methods interface {
	// ListDirectory lists a directory path. When hidden is false, dotfiles are
	// excluded. Returns entries with Name, Path, IsDir, Size, MTime, Mode, and
	// Hidden populated; Tags are empty and must be hydrated separately via
	// HydrateTags.
	ListDirectory(path string, hidden bool) ([]DirEntry, error)

	// StatFile returns current size, mtime, and mode for a single path.
	StatFile(path string) (FileStat, error)

	// Search executes an indexed search against the daemon index. tags uses AND
	// semantics by default; set tagsAny to true for OR. metaFilters keys map to
	// "op:value" strings (e.g. "width"→"gte:1280"). sortBy entries are
	// "field:asc|desc". Returns matched files and the total pre-limit count.
	Search(
		tags []string,
		tagsAny bool,
		tagExclude []string,
		metaFilters map[string]string,
		ftsQuery string,
		limit, offset uint32,
		sortBy []string,
	) (files []FileResult, total uint32, err error)

	// GlobSearch executes a local filesystem glob search. patterns are
	// standard filepath.Glob patterns. Hidden files are excluded unless
	// allowHidden is true.
	GlobSearch(patterns []string, limit uint32, allowHidden bool) ([]FileResult, error)

	// GetMetadata returns all metadata for a file as a values map and a
	// sources map (key → harvester name).
	GetMetadata(path string) (metadata map[string]string, sources map[string]string, err error)

	// SetMetadata sets a metadata key for a file. An empty value deletes the key.
	SetMetadata(path, key, value string) error

	// ModifyTags applies a tag operation ("add", "remove", or "set") to one or
	// more paths. Returns which paths succeeded and which failed.
	ModifyTags(paths, tags []string, operation string) (TagResult, error)

	// HydrateTags returns the current tags for each of the given paths.
	HydrateTags(paths []string) ([]PathTags, error)

	// ListTags returns all known tags, optionally filtered by a prefix string.
	ListTags(prefix string) ([]string, error)

	// RenameFile renames a file to a new sibling name within the same directory.
	// Returns the resulting absolute path.
	RenameFile(path, newName string) (newPath string, err error)

	// DeleteFile removes a file or directory tree.
	DeleteFile(path string) error

	// ChmodFile changes the permission bits of a file.
	ChmodFile(path string, mode uint32) error

	// ListPlaces returns the sidebar entries: home, configured XDG dirs, and
	// FUSE virtual dirs (@recent, @untagged, @browse) when the mount is active.
	// Pinned places (from config) are included after XDG dirs.
	ListPlaces() ([]PlaceEntry, error)

	// PinPlace adds a pinned place to the config. iconName is an XDG icon
	// theme name; if empty, a default "folder" icon is used.
	PinPlace(name, path, iconName string) error

	// UnpinPlace removes a pinned place from the config by path.
	UnpinPlace(path string) error

	// TrashFile moves path to the XDG trash.
	TrashFile(path string) error

	// ListTrash returns all entries in the home trash.
	ListTrash() ([]TrashEntry, error)

	// RestoreTrash moves the named trash entry back to its original location.
	RestoreTrash(trashName string) error

	// EmptyTrash permanently removes all entries from the home trash.
	EmptyTrash() error

	// ListAppsForFile returns installed applications that handle the file's MIME type.
	ListAppsForFile(path string) ([]AppEntry, error)

	// OpenWithApp launches an application (by ID) to open path.
	OpenWithApp(path, appID string) error

	// GetBrowserConfig returns browser configuration (keybindings, use_trash, etc.).
	GetBrowserConfig() (BrowserConfig, error)

	// GetFileBadges returns badge icon names for path from registered extensions.
	GetFileBadges(path string) ([]string, error)

	// GetFileActions returns context menu actions for path from registered extensions.
	GetFileActions(path string) ([]FileAction, error)

	// RunFileAction executes an extension action by ID for path.
	RunFileAction(path, actionID string) error
}
