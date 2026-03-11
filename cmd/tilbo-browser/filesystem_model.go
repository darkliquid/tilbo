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
	qt6.QAbstractListModel

	_ func() `constructor:"init"`

	// Application state refs
	daemonClient *DaemonClient
	mainThreadCh chan<- func()

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

func NewFileSystemModel(dc *DaemonClient, ch chan<- func()) *FileSystemModel {
	m := &FileSystemModel{
		QAbstractListModel: *qt6.NewQAbstractListModel(),
		daemonClient:       dc,
		mainThreadCh:       ch,
		currentPath:        "/",
		entries:            make([]folderEntry, 0),
	}

	m.OnRoleNames(func(super func() map[int][]byte) map[int][]byte {
		return m.roleNames()
	})
	m.OnRowCount(func(parent *qt6.QModelIndex) int {
		return m.rowCount(parent)
	})
	m.OnData(func(index *qt6.QModelIndex, role int) *qt6.QVariant {
		return m.data(index, role)
	})
	m.OnSetData(func(super func(index *qt6.QModelIndex, value *qt6.QVariant, role int) bool, index *qt6.QModelIndex, value *qt6.QVariant, role int) bool {
		return m.setData(index, value, role)
	})

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
	// Let the Qt model know we're going to wipe and replace the rows
	m.BeginResetModel()
	defer m.EndResetModel()

	m.entries = m.entries[:0]

	dirEntries, err := os.ReadDir(m.currentPath)
	if err != nil {
		return
	}

	// Prepare list of paths to bulk-fetch tags for
	pathsToTagFetch := make([]string, 0, len(dirEntries))

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

		m.entries = append(m.entries, folderEntry{
			Name:     name,
			Path:     fullPath,
			IsDir:    de.IsDir(),
			Size:     info.Size(),
			Modified: info.ModTime().Unix(),
			Tags:     []string{}, // Populated asynchronously later
		})
	}

	// Initiate an async query to fetch any matching daemon metadata for
	// the paths currently visible in the folder.
	if m.daemonClient != nil && len(pathsToTagFetch) > 0 {
		m.fetchTagsAsync(pathsToTagFetch)
	}
}

func (m *FileSystemModel) fetchTagsAsync(paths []string) {
	// The search query syntax expects `path:x` for direct path lookups
	req := &ipcv1.SearchRequest{
		Limit:       1000,
		MetaFilters: make(map[string]string),
	}
	
	// Create an OR search containing all our paths
	// In tilbo FTS schema, path matching natively works via tags API or queries.
	// We'll use the Related() or Search() endpoints. Since FTS has path indexed,
	// checking against the daemon will return any tracked files matching those paths.
	// NOTE: this is a naive sync. In a fully optimized production build we'd probably
	// have a dedicated batch path-lookup IPC call instead of building a massive search query.
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

		// Re-apply tags to our in-memory slice
		for i, entry := range m.entries {
			if matchedTags, ok := tagMap[entry.Path]; ok {
				m.entries[i].Tags = matchedTags
			}
		}

		// Tell QML the data has changed for all indices so the view repaints tag badges
		startIdx := m.Index(0, 0, qt6.NewQModelIndex())
		endIdx := m.Index(len(m.entries)-1, 0, qt6.NewQModelIndex())
		m.DataChanged(startIdx, endIdx)
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

func (m *FileSystemModel) roleNames() map[int][]byte {
	return map[int][]byte{
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
	}
}

func (m *FileSystemModel) rowCount(parent *qt6.QModelIndex) int {
	if parent != nil && parent.IsValid() {
		return 0
	}
	return len(m.entries)
}

func (m *FileSystemModel) data(index *qt6.QModelIndex, role int) *qt6.QVariant {
	if index == nil || !index.IsValid() {
		return qt6.NewQVariant()
	}

	row := index.Row()
	if row < 0 || row >= len(m.entries) {
		return qt6.NewQVariant()
	}

	entry := m.entries[row]

	switch role {
	case NameRole:
		return qt6.NewQVariant14(entry.Name)
	case PathRole:
		return qt6.NewQVariant14(entry.Path)
	case IsDirRole:
		return qt6.NewQVariant8(entry.IsDir)
	case SizeRole:
		return qt6.NewQVariant4(int(entry.Size))
	case ModifiedRole:
		return qt6.NewQVariant4(int(entry.Modified))
	case TagsRole:
		// Convert Go slice []string to Qt stringlist QVariant
		return qt6.NewQVariant15(entry.Tags)
	}

	return qt6.NewQVariant()
}

func (m *FileSystemModel) setData(index *qt6.QModelIndex, value *qt6.QVariant, role int) bool {
	if index == nil || !index.IsValid() {
		return false
	}
	row := index.Row()
	if row < 0 || row >= len(m.entries) {
		return false
	}
	entry := m.entries[row]

	switch role {
	case ActionOpenRole:
		cmd := exec.Command("xdg-open", entry.Path)
		if err := cmd.Start(); err == nil {
			go cmd.Wait() // release async
			return true
		}
		return false

	case ActionRenameRole:
		newName := value.ToString()
		if newName == "" || newName == entry.Name {
			return false
		}
		newPath := filepath.Join(filepath.Dir(entry.Path), newName)
		if err := os.Rename(entry.Path, newPath); err == nil {
			m.entries[row].Name = newName
			m.entries[row].Path = newPath
			m.DataChanged(index, index) // Trigger QML update natively
			return true
		}
		return false

	case ActionDeleteRole:
		if err := os.RemoveAll(entry.Path); err == nil {
			m.refresh() // Simplest route: refresh rather than computing BeginRemoveRows
			return true
		}
		return false

	case ActionChmodRole:
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
	return false
}
