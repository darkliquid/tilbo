package models

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"maps"
	"os"
	"path/filepath"
	"sync"
	"sync/atomic"
	"time"

	"github.com/mappu/miqt/qt6"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/commands/chmodfile"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/commands/deletefile"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/commands/navigate"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/commands/openfile"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/commands/renamefile"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/commands/search"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/commands/submitportal"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/commands/togglehidden"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/core"
	browserruntime "github.com/darkliquid/tilbo/cmd/tilbo-browser/state"
	"github.com/darkliquid/tilbo/internal/xattr"
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
	mainThreadFn func(func())
	metadataMu   sync.Mutex
	metadataOut  map[string]string
	metadataWork map[string]struct{}
	xattrs       *xattr.Service
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
		metadataOut:        make(map[string]string),
		metadataWork:       make(map[string]struct{}),
		xattrs:             xattr.New(nil),
		roleNamesMap: map[int][]byte{
			NameRole:               []byte("fileName"),
			PathRole:               []byte("filePath"),
			IsDirRole:              []byte("isDir"),
			SizeRole:               []byte("fileSize"),
			ModifiedRole:           []byte("fileModified"),
			MetadataRole:           []byte("fileMetadata"),
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
	slog.Debug("fs.setPath", "path", path)
	m.isSearchMode = false
	m.currentPath = path
	m.Refresh()
}

func (m *FileSystemModel) ShowHidden(show bool) {
	m.hidden = show
	if m.controller == nil {
		return
	}

	_ = m.controller.Dispatch(togglehidden.Command{
		CommandBase: core.Base{OpID: m.nextOpID("toggle-hidden")},
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

	_ = m.controller.Dispatch(navigate.Command{
		CommandBase: core.Base{OpID: m.nextOpID("navigate")},
		Path:        m.currentPath,
	})
}

func (m *FileSystemModel) nextOpID(prefix string) string {
	id := atomic.AddUint64(&m.loadVersion, 1)
	return fmt.Sprintf("%s-%d", prefix, id)
}

// ApplyProjectionDirectory updates the model using controller projection output.
func (m *FileSystemModel) ApplyProjectionDirectory(path string, entries []core.DirectoryEntry) {
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
func (m *FileSystemModel) ApplyProjectionSearch(files []core.SearchFile) {
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
	t0 := time.Now()
	m.Clear()
	slog.Debug("renderEntries.clear", "dur", time.Since(t0).Round(time.Millisecond))

	m.SetItemRoleNames(m.roleNamesMap)

	items := make([]*qt6.QStandardItem, 0, len(entries))
	for _, entry := range entries {
		item := qt6.NewQStandardItem()
		item.SetData(qt6.NewQVariant14(entry.Name), NameRole)
		item.SetData(qt6.NewQVariant14(entry.Path), PathRole)
		item.SetData(qt6.NewQVariant8(entry.IsDir), IsDirRole)
		item.SetData(qt6.NewQVariant4(int(entry.Size)), SizeRole)
		item.SetData(qt6.NewQVariant4(int(entry.Modified)), ModifiedRole)
		item.SetData(qt6.NewQVariant14("{}"), MetadataRole)
		item.SetData(qt6.NewQVariant15(entry.Tags), TagsRole)
		items = append(items, item)
	}

	// Bulk append emits a single rowsInserted signal for all rows instead of
	// N individual signals, which avoids repeated QML delegate re-evaluation.
	if len(items) > 0 {
		t1 := time.Now()
		m.InvisibleRootItem().AppendRows(items)
		slog.Debug("renderEntries.appendRows", "n", len(items), "dur", time.Since(t1).Round(time.Millisecond))
	}
	slog.Debug("renderEntries.total", "n", len(entries), "dur", time.Since(t0).Round(time.Millisecond))
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
		role == ActionChmodRole || role == ActionStatFileRole

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
		err := m.controller.Dispatch(openfile.Command{
			CommandBase: core.Base{OpID: m.nextOpID("open")},
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

		err := m.controller.Dispatch(renamefile.Command{
			CommandBase: core.Base{OpID: m.nextOpID("rename")},
			OldPath:     entry.Path,
			NewName:     newName,
		})
		return err == nil

	case ActionDeleteRole:
		if m.controller == nil {
			return false
		}
		entry := m.entries[row]
		err := m.controller.Dispatch(deletefile.Command{
			CommandBase: core.Base{OpID: m.nextOpID("delete")},
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
		err := m.controller.Dispatch(chmodfile.Command{
			CommandBase: core.Base{OpID: m.nextOpID("chmod")},
			Path:        entry.Path,
			Mode:        uint32(mode),
		})
		return err == nil

	case ActionStatFileRole:
		if m.mainThreadFn == nil {
			return false
		}
		entry := m.entries[row]
		go func(path string, itemRow int) {
			info, err := os.Lstat(path)
			if err != nil {
				return
			}
			size := info.Size()
			mtime := info.ModTime().Unix()
			metadataPayload := "{}"
			payload := map[string]any{
				"userMeta": m.collectUserMeta(path),
			}
			if data, err := json.Marshal(payload); err == nil {
				metadataPayload = string(data)
			}
			m.mainThreadFn(func() {
				if itemRow >= len(m.entries) || m.entries[itemRow].Path != path {
					return
				}
				m.entries[itemRow].Size = size
				m.entries[itemRow].Modified = mtime
				item := m.InvisibleRootItem().Child(itemRow)
				if item == nil {
					return
				}
				item.SetData(qt6.NewQVariant4(int(size)), SizeRole)
				item.SetData(qt6.NewQVariant4(int(mtime)), ModifiedRole)
				item.SetData(qt6.NewQVariant14(metadataPayload), MetadataRole)
				slog.DebugContext(m.ctx, "browser: ActionStatFileRole updated metadata role", "path", path, "bytes", len(metadataPayload))
			})
		}(entry.Path, row)
		return true

	case ActionCDRole:
		path := value.ToString()
		if path != "" {
			slog.Debug("fs.actionCD", "path", path)
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

		err := m.controller.Dispatch(submitportal.Command{
			CommandBase:   core.Base{OpID: m.nextOpID("portal-submit")},
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

	_ = m.controller.Dispatch(search.Command{
		CommandBase: core.Base{OpID: m.nextOpID("search")},
		Chips:       append([]string(nil), chips...),
		Limit:       defaultSearchLimit,
	})
}

// BindMainThread sets a function that posts work onto the Qt main thread.
// Must be called before any file selection can trigger stat enrichment.
func (m *FileSystemModel) BindMainThread(fn func(func())) {
	m.mainThreadFn = fn
}

// LoadMetadata returns JSON metadata for one path so QML can enrich the
// properties sidebar lazily when an item is selected.
func (m *FileSystemModel) LoadMetadata(path string, knownModified int64) string {
	if path == "" {
		return "{}"
	}

	slog.DebugContext(m.ctx, "browser: loadMetadata start", "path", path, "knownModified", knownModified)

	// First, consume any async-enriched metadata result.
	m.metadataMu.Lock()
	if data, ok := m.metadataOut[path]; ok && data != "" {
		delete(m.metadataOut, path)
		m.metadataMu.Unlock()
		slog.DebugContext(m.ctx, "browser: loadMetadata using async payload", "path", path, "bytes", len(data))
		return data
	}
	m.metadataMu.Unlock()

	entry, ok := m.findEntry(path)
	if knownModified > 0 && ok && entry.Modified > 0 && entry.Modified != knownModified {
		// Keep rendering with the freshest known entry rather than returning an
		// empty payload, so metadata remains visible during projection churn.
		slog.DebugContext(m.ctx,
			"browser: metadata modified mismatch",
			"path", path,
			"known", knownModified,
			"entry", entry.Modified,
		)
	}

	if !ok {
		info, err := os.Lstat(path)
		if err != nil {
			slog.DebugContext(m.ctx, "browser: loadMetadata lstat failed", "path", path, "err", err)
			return "{}"
		}
		entry = folderEntry{
			Name:     info.Name(),
			Path:     path,
			IsDir:    info.IsDir(),
			Size:     info.Size(),
			Modified: info.ModTime().Unix(),
			Tags:     []string{},
		}
	}

	payload := map[string]any{
		"path":     entry.Path,
		"name":     entry.Name,
		"isDir":    entry.IsDir,
		"size":     entry.Size,
		"modified": entry.Modified,
		"tags":     append([]string(nil), entry.Tags...),
		"userMeta": m.collectUserMeta(path),
	}
	if userMeta, ok := payload["userMeta"].(map[string]string); ok {
		slog.DebugContext(m.ctx, "browser: loadMetadata payload ready",
			"path", path,
			"tagCount", len(entry.Tags),
			"metaKeys", len(userMeta),
		)
	}
	data, err := json.Marshal(payload)
	if err != nil {
		slog.DebugContext(m.ctx, "browser: loadMetadata marshal failed", "path", path, "err", err)
		return "{}"
	}

	return string(data)
}

func (m *FileSystemModel) findEntry(path string) (folderEntry, bool) {
	for _, e := range m.entries {
		if e.Path == path {
			return e, true
		}
	}

	return folderEntry{}, false
}

func (m *FileSystemModel) collectUserMeta(path string) map[string]string {
	meta := make(map[string]string)
	slog.DebugContext(m.ctx, "browser: collectUserMeta start", "path", path)

	if m.xattrs != nil {
		localMeta, localErr := m.xattrs.ReadAllMeta(m.ctx, path)
		if localErr != nil {
			slog.DebugContext(m.ctx, "browser: local xattr metadata read failed", "path", path, "err", localErr)
		} else {
			maps.Copy(meta, localMeta)
			slog.DebugContext(m.ctx, "browser: local xattr metadata collected", "path", path, "keys", len(localMeta), "meta", localMeta)
		}
	}

	if m.controller != nil {
		ctx, cancel := context.WithTimeout(m.ctx, 5*time.Second)
		defer cancel()
		daemonMeta, daemonErr := m.controller.GetFileMeta(ctx, path)
		if daemonErr != nil {
			slog.DebugContext(ctx, "browser: daemon metadata fetch failed", "path", path, "err", daemonErr)
		} else {
			maps.Copy(meta, daemonMeta)
			slog.DebugContext(ctx, "browser: daemon metadata collected", "path", path, "keys", len(daemonMeta), "meta", daemonMeta)
		}
	}

	slog.DebugContext(m.ctx, "browser: collectUserMeta done", "path", path, "keys", len(meta), "meta", meta)

	return meta
}

// RequestMetadata starts async metadata loading for one path.
func (m *FileSystemModel) RequestMetadata(path string) {
	if path == "" {
		return
	}

	slog.DebugContext(m.ctx, "browser: RequestMetadata queued", "path", path)

	entry, ok := m.findEntry(path)
	knownTags := []string{}
	if ok {
		knownTags = append(knownTags, entry.Tags...)
	}

	m.metadataMu.Lock()
	if _, busy := m.metadataWork[path]; busy {
		m.metadataMu.Unlock()
		return
	}
	m.metadataWork[path] = struct{}{}
	m.metadataMu.Unlock()

	go func(target string, tags []string) {
		defer func() {
			m.metadataMu.Lock()
			delete(m.metadataWork, target)
			m.metadataMu.Unlock()
		}()

		slog.DebugContext(m.ctx, "browser: RequestMetadata start", "path", target)

		info, err := os.Lstat(target)
		if err != nil {
			slog.DebugContext(m.ctx, "browser: RequestMetadata lstat failed", "path", target, "err", err)
			return
		}

		userMeta := m.collectUserMeta(target)
		slog.DebugContext(m.ctx, "browser: RequestMetadata collected meta", "path", target, "keys", len(userMeta), "meta", userMeta)

		payload := map[string]any{
			"path":     target,
			"name":     info.Name(),
			"isDir":    info.IsDir(),
			"size":     info.Size(),
			"modified": info.ModTime().Unix(),
			"tags":     tags,
			"userMeta": userMeta,
		}
		data, err := json.Marshal(payload)
		if err != nil {
			slog.DebugContext(m.ctx, "browser: RequestMetadata marshal failed", "path", target, "err", err)
			return
		}

		m.metadataMu.Lock()
		m.metadataOut[target] = string(data)
		m.metadataMu.Unlock()
		slog.DebugContext(m.ctx, "browser: RequestMetadata stored payload", "path", target, "bytes", len(data))
	}(path, knownTags)
}

// TakeMetadata returns one async metadata result for a path if available.
func (m *FileSystemModel) TakeMetadata(path string) string {
	m.metadataMu.Lock()
	defer m.metadataMu.Unlock()

	data := m.metadataOut[path]
	if data != "" {
		delete(m.metadataOut, path)
	}

	slog.DebugContext(m.ctx, "browser: TakeMetadata", "path", path, "bytes", len(data))

	return data
}
