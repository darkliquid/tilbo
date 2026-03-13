package models

import (
	"time"

	"github.com/mappu/miqt/qt6"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commandcore"
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
	entries      []placeEntry
}

func NewPlacesModel(parent *qt6.QObject) *PlacesModel {
	m := &PlacesModel{
		QStandardItemModel: qt6.NewQStandardItemModel3(parent),
		roleNamesMap: map[int][]byte{
			PlaceNameRole: []byte("placeName"),
			PlacePathRole: []byte("placePath"),
		},
		entries: make([]placeEntry, 0),
	}
	m.SetItemRoleNames(m.roleNamesMap)
	return m
}

// Refresh rebuilds the places list. Call from the Qt main thread only.
func (m *PlacesModel) Refresh() {
	m.lastRefresh = time.Now()
	entries, err := browser.BuildPlaces()
	if err != nil {
		m.entries = m.entries[:0]
		m.Clear()
		m.SetItemRoleNames(m.roleNamesMap)
		return
	}

	places := make([]placeEntry, 0, len(entries))
	for _, e := range entries {
		places = append(places, placeEntry{Name: e.Name, Path: e.Path})
	}

	m.Clear()
	m.SetItemRoleNames(m.roleNamesMap)
	m.entries = append(m.entries[:0], places...)
	applyPlaceEntries(m, places)
}

// ApplyProjectionPlaces updates the model from controller projection state.
func (m *PlacesModel) ApplyProjectionPlaces(entries []commandcore.PlaceEntry) {
	places := make([]placeEntry, 0, len(entries))
	for _, e := range entries {
		places = append(places, placeEntry{Name: e.Name, Path: e.Path})
	}

	if placeEntriesEqual(m.entries, places) {
		m.lastRefresh = time.Now()
		return
	}

	m.lastRefresh = time.Now()
	m.entries = append(m.entries[:0], places...)
	m.Clear()
	m.SetItemRoleNames(m.roleNamesMap)
	applyPlaceEntries(m, places)
}

func placeEntriesEqual(a, b []placeEntry) bool {
	if len(a) != len(b) {
		return false
	}

	for i := range a {
		if a[i].Name != b[i].Name || a[i].Path != b[i].Path {
			return false
		}
	}

	return true
}

func applyPlaceEntries(m *PlacesModel, places []placeEntry) {
	for _, p := range places {
		item := qt6.NewQStandardItem()
		item.SetData(qt6.NewQVariant14(p.Name), PlaceNameRole)
		item.SetData(qt6.NewQVariant14(p.Path), PlacePathRole)
		m.AppendRow([]*qt6.QStandardItem{item})
	}
}
