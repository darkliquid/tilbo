package models

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync/atomic"

	"github.com/mappu/miqt/qt6"

	browserruntime "github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser"
)

// FileSystemModel provides a QML-compatible data bridge for traditional folder
// traversal, augmenting system paths with daemon tags where available.
type FileSystemModel struct {
	*qt6.QStandardItemModel

	_ func() `constructor:"init"`

	// Application state refs
	ctx          context.Context
	roleNamesMap map[int][]byte

	// Internal state
	currentPath  string
	hidden       bool
	isSearchMode bool
	entries      []folderEntry
	loadVersion  uint64
	controller   *browserruntime.Controller
}

const (
	defaultSearchLimit = 1000
)

type folderEntry struct {
	Name     string
	Path     string
	IsDir    bool
	Size     int64
	Modified int64
	Tags     []string
}

func NewFileSystemModel(ctx context.Context, parent *qt6.QObject) *FileSystemModel {
	m := &FileSystemModel{
		QStandardItemModel: qt6.NewQStandardItemModel3(parent),
		ctx:                ctx,
		currentPath:        "/",
		entries:            make([]folderEntry, 0),
		roleNamesMap: map[int][]byte{
			NameRole:               []byte("fileName"),
			PathRole:               []byte("filePath"),
			IsDirRole:              []byte("isDir"),
			SizeRole:               []byte("fileSize"),
			ModifiedRole:           []byte("fileModified"),
			TagsRole:               []byte("fileTags"),
			ActionOpenRole:         []byte("actionOpen"),
			ActionRenameRole:       []byte("actionRename"),
			ActionDeleteRole:       []byte("actionDelete"),
			ActionChmodRole:        []byte("actionChmod"),
			ActionCDRole:           []byte("actionCD"),
			ActionToggleHiddenRole: []byte("actionToggleHidden"),
			ActionSearchRole:       []byte("actionSearch"),
			ActionPortalSubmitRole: []byte("actionPortalSubmit"),
		},
	}

	m.SetItemRoleNames(m.roleNamesMap)

	// Intercept SetData requests to handle actions
	m.OnSetData(
		func(super func(index *qt6.QModelIndex, value *qt6.QVariant, role int) bool, index *qt6.QModelIndex, value *qt6.QVariant, role int) bool {
			return m.setData(super, index, value, role)
		},
	)

	return m
}

func (m *FileSystemModel) SetPath(path string) {
	m.isSearchMode = false
	m.currentPath = path
	m.Refresh()
}

func (m *FileSystemModel) ShowHidden(show bool) {
	m.hidden = show
	if m.controller == nil {
		return
	}

	_ = m.controller.Dispatch(browserruntime.ToggleHiddenCommand{
		CommandBase: browserruntime.CommandBase{OpID: m.nextOpID("toggle-hidden")},
		Show:        show,
	})
	m.Refresh()
}

// BindController enables controller/projection-driven navigation for this model.
func (m *FileSystemModel) BindController(controller *browserruntime.Controller) {
	m.controller = controller
}

func (m *FileSystemModel) Refresh() {
	if m.isSearchMode {
		return // Do not refresh search automatically, wait for search request
	}
	if m.controller == nil {
		return
	}

	_ = m.controller.Dispatch(browserruntime.NavigateCommand{
		CommandBase: browserruntime.CommandBase{OpID: m.nextOpID("navigate")},
		Path:        m.currentPath,
	})
}

func (m *FileSystemModel) nextOpID(prefix string) string {
	id := atomic.AddUint64(&m.loadVersion, 1)
	return fmt.Sprintf("%s-%d", prefix, id)
}

// ApplyProjectionDirectory updates the model using controller projection output.
func (m *FileSystemModel) ApplyProjectionDirectory(path string, entries []browserruntime.DirectoryEntry) {
	wasSearchMode := m.isSearchMode
	prevPath := m.currentPath

	converted := make([]folderEntry, 0, len(entries))
	for _, e := range entries {
		converted = append(converted, folderEntry{
			Name:     e.Name,
			Path:     e.Path,
			IsDir:    e.IsDir,
			Size:     e.Size,
			Modified: e.MTime,
			Tags:     append([]string(nil), e.Tags...),
		})
	}

	if prevPath == path && !wasSearchMode && folderEntriesEqual(m.entries, converted) {
		return
	}

	m.isSearchMode = false
	m.currentPath = path

	m.entries = append(m.entries[:0], converted...)
	m.renderEntries(converted)
}

// ApplyProjectionSearch updates the model using controller search projection output.
func (m *FileSystemModel) ApplyProjectionSearch(files []browserruntime.SearchFile) {
	wasSearchMode := m.isSearchMode

	converted := make([]folderEntry, 0, len(files))
	for _, f := range files {
		isDir := false
		info, err := os.Stat(f.Path)
		if err == nil {
			isDir = info.IsDir()
		}

		converted = append(converted, folderEntry{
			Name:     filepath.Base(f.Path),
			Path:     f.Path,
			IsDir:    isDir,
			Size:     f.Size,
			Modified: f.MTime,
			Tags:     append([]string(nil), f.Tags...),
		})
	}

	if wasSearchMode && folderEntriesEqual(m.entries, converted) {
		return
	}

	m.isSearchMode = true

	m.entries = append(m.entries[:0], converted...)
	m.renderEntries(converted)
}

func folderEntriesEqual(a, b []folderEntry) bool {
	if len(a) != len(b) {
		return false
	}

	for i := range a {
		if a[i].Name != b[i].Name ||
			a[i].Path != b[i].Path ||
			a[i].IsDir != b[i].IsDir ||
			a[i].Size != b[i].Size ||
			a[i].Modified != b[i].Modified ||
			!stringSlicesEqual(a[i].Tags, b[i].Tags) {
			return false
		}
	}

	return true
}

func stringSlicesEqual(a, b []string) bool {
	if len(a) != len(b) {
		return false
	}

	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}

	return true
}

func (m *FileSystemModel) renderEntries(entries []folderEntry) {
	m.Clear()
	m.SetItemRoleNames(m.roleNamesMap)

	items := make([]*qt6.QStandardItem, 0, len(entries))
	for _, entry := range entries {
		item := qt6.NewQStandardItem()
		item.SetData(qt6.NewQVariant14(entry.Name), NameRole)
		item.SetData(qt6.NewQVariant14(entry.Path), PathRole)
		item.SetData(qt6.NewQVariant8(entry.IsDir), IsDirRole)
		item.SetData(qt6.NewQVariant4(int(entry.Size)), SizeRole)
		item.SetData(qt6.NewQVariant4(int(entry.Modified)), ModifiedRole)
		item.SetData(qt6.NewQVariant15(entry.Tags), TagsRole)
		items = append(items, item)
	}

	// Bulk append emits a single rowsInserted signal for all rows instead of
	// N individual signals, which avoids repeated QML delegate re-evaluation.
	if len(items) > 0 {
		m.InvisibleRootItem().AppendRows(items)
	}
}

//nolint:funlen,gocognit,gocyclo,cyclop // action dispatch is intentionally centralized for QML role handling
func (m *FileSystemModel) setData(
	super func(*qt6.QModelIndex, *qt6.QVariant, int) bool,
	index *qt6.QModelIndex,
	value *qt6.QVariant,
	role int,
) bool {
	var row = -1
	if index != nil && index.IsValid() {
		row = index.Row()
	}

	// For per-item actions, validate the row index
	isItemAction := role == ActionOpenRole || role == ActionRenameRole || role == ActionDeleteRole ||
		role == ActionChmodRole

	if isItemAction {
		if row < 0 || row >= len(m.entries) {
			return false
		}
	}

	switch role {
	case ActionOpenRole:
		if m.controller == nil {
			return false
		}
		entry := m.entries[row]
		err := m.controller.Dispatch(browserruntime.OpenFileCommand{
			CommandBase: browserruntime.CommandBase{OpID: m.nextOpID("open")},
			Path:        entry.Path,
		})
		return err == nil

	case ActionRenameRole:
		if m.controller == nil {
			return false
		}
		entry := m.entries[row]
		newName := value.ToString()
		if newName == "" || newName == entry.Name {
			return false
		}

		err := m.controller.Dispatch(browserruntime.RenameFileCommand{
			CommandBase: browserruntime.CommandBase{OpID: m.nextOpID("rename")},
			OldPath:     entry.Path,
			NewName:     newName,
		})
		return err == nil

	case ActionDeleteRole:
		if m.controller == nil {
			return false
		}
		entry := m.entries[row]
		err := m.controller.Dispatch(browserruntime.DeleteFileCommand{
			CommandBase: browserruntime.CommandBase{OpID: m.nextOpID("delete")},
			Path:        entry.Path,
		})
		return err == nil

	case ActionChmodRole:
		if m.controller == nil {
			return false
		}
		entry := m.entries[row]
		mode := value.ToInt()
		if mode < 0 || mode > 0o7777 {
			return false
		}
		err := m.controller.Dispatch(browserruntime.ChmodFileCommand{
			CommandBase: browserruntime.CommandBase{OpID: m.nextOpID("chmod")},
			Path:        entry.Path,
			Mode:        uint32(mode),
		})
		return err == nil

	case ActionCDRole:
		path := value.ToString()
		if path != "" {
			m.SetPath(path)
			return true
		}
		return false

	case ActionToggleHiddenRole:
		show := value.ToBool()
		m.ShowHidden(show)
		return true

	case ActionSearchRole:
		chipsJSON := value.ToString()
		if chipsJSON == "" {
			return false
		}

		var chips []string
		if err := json.Unmarshal([]byte(chipsJSON), &chips); err != nil {
			return false
		}

		if len(chips) == 0 {
			m.isSearchMode = false
			m.Refresh()
			return true
		}

		m.isSearchMode = true
		m.executeSearch(chips)
		return true

	case ActionPortalSubmitRole:
		if m.controller == nil {
			return false
		}

		selectedJSON := value.ToString()
		selected := []string{}
		if selectedJSON != "" {
			if err := json.Unmarshal([]byte(selectedJSON), &selected); err != nil {
				return false
			}
		}

		err := m.controller.Dispatch(browserruntime.SubmitPortalCommand{
			CommandBase:   browserruntime.CommandBase{OpID: m.nextOpID("portal-submit")},
			SelectedFiles: append([]string(nil), selected...),
		})
		return err == nil
	}

	if super != nil {
		return super(index, value, role)
	}
	return false
}

func (m *FileSystemModel) executeSearch(chips []string) {
	if m.controller == nil {
		return
	}

	_ = m.controller.Dispatch(browserruntime.SearchCommand{
		CommandBase: browserruntime.CommandBase{OpID: m.nextOpID("search")},
		Chips:       append([]string(nil), chips...),
		Limit:       defaultSearchLimit,
	})
}
