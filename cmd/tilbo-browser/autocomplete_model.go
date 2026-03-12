package main

import (
	"context"
	"path/filepath"
	"strings"

	"github.com/mappu/miqt/qt6"

	ipcv1 "github.com/darkliquid/tilbo/internal/ipc/gen/tilbo/ipc/v1"
)

type AutocompleteModel struct {
	*qt6.QStandardItemModel

	_ func() `constructor:"init"`

	daemonClient *DaemonClient
	mainThreadCh chan<- func()
	roleNamesMap map[int][]byte
}

const (
	AcTextRole = int(qt6.UserRole) + iota
	AcTriggerRole
)

func NewAutocompleteModel(parent *qt6.QObject, dc *DaemonClient, ch chan<- func()) *AutocompleteModel {
	m := &AutocompleteModel{
		QStandardItemModel: qt6.NewQStandardItemModel3(parent),
		daemonClient:       dc,
		mainThreadCh:       ch,
		roleNamesMap: map[int][]byte{
			AcTextRole: []byte("acText"),
			AcTriggerRole: []byte(
				"acTrigger",
			), // Used to manually trigger search from QML (QModelIndex(0) / dummy item)
		},
	}
	m.SetItemRoleNames(m.roleNamesMap)

	// Since we can't easily export complex methods, we intercept SetData
	// on a dummy index or root to fire events.
	m.OnSetData(
		func(super func(*qt6.QModelIndex, *qt6.QVariant, int) bool, index *qt6.QModelIndex, value *qt6.QVariant, role int) bool {
			if role == AcTriggerRole {
				prefix := value.ToString()
				m.fetchAutocomplete(prefix)
				return true
			}
			if super != nil {
				return super(index, value, role)
			}
			return false
		},
	)

	return m
}

func (m *AutocompleteModel) fetchAutocomplete(prefix string) {
	if m.daemonClient == nil {
		m.Clear()
		m.SetItemRoleNames(m.roleNamesMap)
		return
	}

	// 1. If prefix targets a path (glob: /path)
	if strings.HasPrefix(prefix, "glob:") {
		m.Clear()
		m.SetItemRoleNames(m.roleNamesMap)
		globStr := strings.TrimPrefix(prefix, "glob:")
		matches, err := filepath.Glob(globStr + "*")
		if err == nil {
			for _, match := range matches {
				item := qt6.NewQStandardItem()
				item.SetData(qt6.NewQVariant14("glob:"+match), AcTextRole)
				m.AppendRow([]*qt6.QStandardItem{item})
			}
		}
		return
	}

	// 2. Otherwise assume it's a tag or metadata prefix
	req := &ipcv1.ListTagsRequest{Prefix: prefix}
	m.daemonClient.ListTagsAsync(
		context.Background(),
		req,
		m.mainThreadCh,
		func(resp *ipcv1.ListTagsResponse, err error) {
			m.Clear()
			m.SetItemRoleNames(m.roleNamesMap)
			if err == nil && resp != nil {
				for _, tag := range resp.GetTags() {
					item := qt6.NewQStandardItem()
					item.SetData(qt6.NewQVariant14(tag), AcTextRole)
					m.AppendRow([]*qt6.QStandardItem{item})
				}
			}
		},
	)
}
