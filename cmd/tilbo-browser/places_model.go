package main

import (
	"bufio"
	"os"
	"strings"
	"time"

	"github.com/mappu/miqt/qt6"
)

type placeEntry struct {
	Name string
	Path string
}

// PlacesModel provides the left-sidebar places list to QML.
// It exposes two roles: placeName and placePath.
// FUSE-backed virtual directories (@recent, @untagged, @browse) are included
// only when a fuse.tilbo filesystem is mounted at the expected mount point.
type PlacesModel struct {
	*qt6.QStandardItemModel

	_ func() `constructor:"init"`

	roleNamesMap map[int][]byte
	lastRefresh  time.Time
}

func NewPlacesModel(parent *qt6.QObject) *PlacesModel {
	m := &PlacesModel{
		QStandardItemModel: qt6.NewQStandardItemModel3(parent),
		roleNamesMap: map[int][]byte{
			PlaceNameRole: []byte("placeName"),
			PlacePathRole: []byte("placePath"),
		},
	}
	m.SetItemRoleNames(m.roleNamesMap)
	m.Refresh()
	return m
}

// fuseMountPath returns the default FUSE mount point (mirrors daemon default).
func fuseMountPath() string {
	home, err := os.UserHomeDir()
	if err != nil {
		return ""
	}
	return home + "/tags"
}

// isFUSEMounted returns true if a fuse.tilbo filesystem is mounted at mountPoint.
func isFUSEMounted(mountPoint string) bool {
	f, err := os.Open("/proc/mounts")
	if err != nil {
		return false
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		fields := strings.Fields(scanner.Text())
		if len(fields) < 3 {
			continue
		}
		// fields[1] = mountpoint, fields[2] = fstype
		if fields[1] == mountPoint && strings.Contains(fields[2], "fuse.tilbo") {
			return true
		}
	}
	return false
}

// xdgDir returns the value of envVar if set and non-empty, otherwise fallback.
func xdgDir(envVar, fallback string) string {
	if v := os.Getenv(envVar); v != "" {
		return v
	}
	return fallback
}

// Refresh rebuilds the places list. Call from the Qt main thread only.
func (m *PlacesModel) Refresh() {
	m.lastRefresh = time.Now()

	home, err := os.UserHomeDir()
	if err != nil {
		return
	}

	fuseMount := fuseMountPath()
	fuseActive := isFUSEMounted(fuseMount)

	var places []placeEntry

	// Standard filesystem places — included only if the path exists.
	for _, p := range []placeEntry{
		{"Home", home},
		{"Documents", xdgDir("XDG_DOCUMENTS_DIR", home+"/Documents")},
		{"Downloads", xdgDir("XDG_DOWNLOAD_DIR", home+"/Downloads")},
	} {
		if _, err := os.Stat(p.Path); err == nil {
			places = append(places, p)
		}
	}

	// FUSE-backed virtual directories — only when the mount is active.
	if fuseActive {
		places = append(places,
			placeEntry{"@recent", fuseMount + "/@recent"},
			placeEntry{"@untagged", fuseMount + "/@untagged"},
			placeEntry{"@browse", fuseMount + "/@browse"},
		)
	}

	m.Clear()
	m.SetItemRoleNames(m.roleNamesMap)

	for _, p := range places {
		item := qt6.NewQStandardItem()
		item.SetData(qt6.NewQVariant14(p.Name), PlaceNameRole)
		item.SetData(qt6.NewQVariant14(p.Path), PlacePathRole)
		m.AppendRow([]*qt6.QStandardItem{item})
	}
}
