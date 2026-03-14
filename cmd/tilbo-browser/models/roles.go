// Package models defines Qt/QML model types and shared role constants.
package models

import "github.com/mappu/miqt/qt6"

// RoleName mapping to QML context properties.
const (
	NameRole = int(qt6.UserRole) + iota
	PathRole
	IsDirRole
	SizeRole
	ModifiedRole
	MetadataRole
	TagsRole
	ActionOpenRole
	ActionRenameRole
	ActionDeleteRole
	ActionChmodRole
	ActionCDRole
	ActionToggleHiddenRole
	ActionSearchRole
	ActionPortalSubmitRole
	PlaceNameRole
	PlacePathRole
	ActionStatFileRole
)
