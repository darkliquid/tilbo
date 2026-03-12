package main

import (
	"fmt"
	"sync/atomic"

	"github.com/mappu/miqt/qt6"

	browserruntime "github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser"
)

type AutocompleteModel struct {
	*qt6.QStandardItemModel

	_ func() `constructor:"init"`

	roleNamesMap map[int][]byte
	controller   *browserruntime.Controller
	reqVersion   uint64
}

const (
	AcTextRole = int(qt6.UserRole) + iota
	AcTriggerRole
)

func NewAutocompleteModel(parent *qt6.QObject) *AutocompleteModel {
	m := &AutocompleteModel{
		QStandardItemModel: qt6.NewQStandardItemModel3(parent),
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
				if m.controller == nil {
					return false
				}

				prefix := value.ToString()
				err := m.controller.Dispatch(browserruntime.AutocompleteCommand{
					CommandBase: browserruntime.CommandBase{OpID: m.nextOpID("autocomplete")},
					Prefix:      prefix,
				})
				return err == nil
			}
			if super != nil {
				return super(index, value, role)
			}
			return false
		},
	)

	return m
}

func (m *AutocompleteModel) nextOpID(prefix string) string {
	id := atomic.AddUint64(&m.reqVersion, 1)
	return fmt.Sprintf("%s-%d", prefix, id)
}

// BindController enables controller-driven autocomplete requests for this model.
func (m *AutocompleteModel) BindController(controller *browserruntime.Controller) {
	m.controller = controller
}

// ApplyProjectionAutocomplete updates the model from autocomplete projection items.
func (m *AutocompleteModel) ApplyProjectionAutocomplete(items []string) {
	m.Clear()
	m.SetItemRoleNames(m.roleNamesMap)
	for _, itemText := range items {
		item := qt6.NewQStandardItem()
		item.SetData(qt6.NewQVariant14(itemText), AcTextRole)
		m.AppendRow([]*qt6.QStandardItem{item})
	}
}
