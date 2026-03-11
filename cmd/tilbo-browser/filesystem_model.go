package main

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"

	ipcv1 "github.com/darkliquid/tilbo/internal/ipc/gen/tilbo/ipc/v1"
	"github.com/mappu/miqt/qt6"
)

// FileSystemModel provides a QML-compatible data bridge for traditional folder
// traversal, augmenting system paths with daemon tags where available.
type FileSystemModel struct {
	*qt6.QStandardItemModel

	_ func() `constructor:"init"`

	// Application state refs
	daemonClient *DaemonClient
	mainThreadCh chan<- func()
	roleNamesMap map[int][]byte

	// Internal state
	currentPath string
	hidden      bool
	entries     []folderEntry
}

type folderEntry struct {
	Name     string
	Path     string
	IsDir    bool
	Size     int64
	Modified int64
	Tags     []string
}

func NewFileSystemModel(parent *qt6.QObject, dc *DaemonClient, ch chan<- func()) *FileSystemModel {
	m := &FileSystemModel{
		QStandardItemModel: qt6.NewQStandardItemModel3(parent),
		daemonClient:       dc,
		mainThreadCh:       ch,
		currentPath:        "/",
		entries:            make([]folderEntry, 0),
		roleNamesMap: map[int][]byte{
			NameRole:         []byte("fileName"),
			PathRole:         []byte("filePath"),
			IsDirRole:        []byte("isDir"),
			SizeRole:         []byte("fileSize"),
			ModifiedRole:     []byte("fileModified"),
			TagsRole:         []byte("fileTags"),
			ActionOpenRole:   []byte("actionOpen"),
			ActionRenameRole: []byte("actionRename"),
			ActionDeleteRole: []byte("actionDelete"),
			ActionChmodRole:  []byte("actionChmod"),
		},
	}

	m.SetItemRoleNames(m.roleNamesMap)

	// Intercept SetData requests to handle actions
	m.OnSetData(func(super func(index *qt6.QModelIndex, value *qt6.QVariant, role int) bool, index *qt6.QModelIndex, value *qt6.QVariant, role int) bool {
		return m.setData(super, index, value, role)
	})

	m.refresh()

	return m
}

func (m *FileSystemModel) SetPath(path string) {
	m.currentPath = path
	m.refresh()
}

func (m *FileSystemModel) ShowHidden(show bool) {
	m.hidden = show
	m.refresh()
}

func (m *FileSystemModel) refresh() {
	m.loadEntries()
}

func (m *FileSystemModel) loadEntries() {
	m.Clear()
	m.SetItemRoleNames(m.roleNamesMap)
	m.entries = m.entries[:0]

	dirEntries, err := os.ReadDir(m.currentPath)
	if err != nil {
		return
	}

	// Prepare list of paths to bulk-fetch tags for
	pathsToTagFetch := make([]string, 0, len(dirEntries))

	var items []*qt6.QStandardItem

	for _, de := range dirEntries {
		name := de.Name()

		// Filter hidden files if not enabled
		if !m.hidden && name != "" && name[0] == '.' {
			continue
		}

		info, err := de.Info()
		if err != nil {
			continue
		}

		fullPath := filepath.Join(m.currentPath, name)
		pathsToTagFetch = append(pathsToTagFetch, fullPath)

		entry := folderEntry{
			Name:     name,
			Path:     fullPath,
			IsDir:    de.IsDir(),
			Size:     info.Size(),
			Modified: info.ModTime().Unix(),
			Tags:     []string{}, // Populated asynchronously later
		}
		m.entries = append(m.entries, entry)

		item := qt6.NewQStandardItem()
		item.SetData(qt6.NewQVariant14(entry.Name), NameRole)
		item.SetData(qt6.NewQVariant14(entry.Path), PathRole)
		item.SetData(qt6.NewQVariant8(entry.IsDir), IsDirRole)
		item.SetData(qt6.NewQVariant4(int(entry.Size)), SizeRole)
		item.SetData(qt6.NewQVariant4(int(entry.Modified)), ModifiedRole)
		item.SetData(qt6.NewQVariant15(entry.Tags), TagsRole)
		
		items = append(items, item)
	}

	for _, item := range items {
		m.AppendRow([]*qt6.QStandardItem{item})
	}

	// Initiate an async query to fetch any matching daemon metadata for
	// the paths currently visible in the folder.
	if m.daemonClient != nil && len(pathsToTagFetch) > 0 {
		m.fetchTagsAsync(pathsToTagFetch)
	}
}

func (m *FileSystemModel) fetchTagsAsync(paths []string) {
	req := &ipcv1.SearchRequest{
		Limit:       1000,
		MetaFilters: make(map[string]string),
	}
	
	var tags []string
	for _, p := range paths {
		tags = append(tags, fmt.Sprintf("path:%s", p))
	}
	req.Tags = tags
	req.TagsAny = true

	m.daemonClient.SearchAsync(context.Background(), req, m.mainThreadCh, func(resp *ipcv1.SearchResponse, err error) {
		if err != nil || resp == nil {
			return
		}

		// Update our local model entries with fetched tags
		tagMap := make(map[string][]string)
		for _, f := range resp.Files {
			tagMap[f.Path] = f.Tags
		}

		// Re-apply tags to our in-memory slice and QStandardItems
		for i, entry := range m.entries {
			if matchedTags, ok := tagMap[entry.Path]; ok {
				m.entries[i].Tags = matchedTags
				
				// Update QStandardItem directly
				idx := m.Index(i, 0, qt6.NewQModelIndex())
				item := m.ItemFromIndex(idx)
				if item != nil {
					item.SetData(qt6.NewQVariant15(matchedTags), TagsRole)
				}
			}
		}
	})
}

// RoleName mapping to QML context properties
const (
	NameRole = int(qt6.UserRole) + iota
	PathRole
	IsDirRole
	SizeRole
	ModifiedRole
	TagsRole
	ActionOpenRole
	ActionRenameRole
	ActionDeleteRole
	ActionChmodRole
	ActionCDRole
	ActionToggleHiddenRole
)

func (m *FileSystemModel) setData(super func(*qt6.QModelIndex, *qt6.QVariant, int) bool, index *qt6.QModelIndex, value *qt6.QVariant, role int) bool {
	var row int = -1
	if index != nil && index.IsValid() {
		row = index.Row()
	}

	// For per-item actions, validate the row index
	isItemAction := role == ActionOpenRole || role == ActionRenameRole || role == ActionDeleteRole || role == ActionChmodRole
	
	if isItemAction {
		if row < 0 || row >= len(m.entries) {
			return false
		}
	}

	switch role {
	case ActionOpenRole:
		entry := m.entries[row]
		cmd := exec.Command("xdg-open", entry.Path)
		if err := cmd.Start(); err == nil {
			go cmd.Wait() // release async
			return true
		}
		return false

	case ActionRenameRole:
		entry := m.entries[row]
		newName := value.ToString()
		if newName == "" || newName == entry.Name {
			return false
		}
		newPath := filepath.Join(filepath.Dir(entry.Path), newName)
		if err := os.Rename(entry.Path, newPath); err == nil {
			m.entries[row].Name = newName
			m.entries[row].Path = newPath
			
			// Update the QStandardItem directly
			item := m.ItemFromIndex(index)
			if item != nil {
				item.SetData(qt6.NewQVariant14(newName), NameRole)
				item.SetData(qt6.NewQVariant14(newPath), PathRole)
			}
			return true
		}
		return false

	case ActionDeleteRole:
		entry := m.entries[row]
		if err := os.RemoveAll(entry.Path); err == nil {
			m.refresh() // Simplest route: refresh
			return true
		}
		return false

	case ActionChmodRole:
		entry := m.entries[row]
		mode := value.ToInt()
		if err := os.Chmod(entry.Path, os.FileMode(mode)); err == nil {
			return true
		}
		return false
	
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
	}
	
	if super != nil {
		return super(index, value, role)
	}
	return false
}
