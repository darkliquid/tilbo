package qml

import _ "embed"

//go:embed windows/BrowserWindow.qml
var BrowserWindow string

//go:embed windows/PortalDialog.qml
var PortalDialog string

//go:embed components/TagSearchBar.qml
var TagSearchBar string

//go:embed components/FileGrid.qml
var FileGrid string

//go:embed components/FileList.qml
var FileList string
