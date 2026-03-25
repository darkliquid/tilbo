// BrowserSidebar.qml — left places/mounts/searches sidebar + right properties panel.
//
// Visual Item. Wraps a content slot (default property) between left and right panels.
// Both panels are user-resizable via drag handles; widths are stored in _leftWidth /
// _rightWidth. The properties action bar collapses to icon-only when _rightWidth < 220.

import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

import "../../services"
import "../../components"

Item {
    id: root

    // ── Content slot ────────────────────────────────────────────────────
    // Children passed to this component are placed in the center of the RowLayout.
    default property alias contentItem: contentSlot.data

    // ── Sidebar state ───────────────────────────────────────────────────

    property bool   showLeftSidebar: true
    property bool   showRightSidebar: false

    // ── Data arrays ─────────────────────────────────────────────────────

    property var    places: []
    property var    mounts: []
    property var    savedSearches: []

    // ── External bindings ───────────────────────────────────────────────

    property var    selectedFile: null
    property var    selectedFileMeta: null
    property bool   isTrashView: false

    // ── Signals ─────────────────────────────────────────────────────────

    signal placeActivated(string path)
    signal trashActivated()
    signal searchActivated(var chips)

    // ── Data loading ────────────────────────────────────────────────────

    function loadPlaces() {
        TilboDaemon.listPlaces(function(ps, err) {
            if (!err) places = ps
        })
    }

    function loadMounts() {
        TilboDaemon.listMounts(function(ms, err) {
            if (!err) mounts = ms || []
        })
    }

    function loadSavedSearches() {
        TilboDaemon.listSavedSearches(function(ss, err) {
            if (!err) savedSearches = ss || []
        })
    }

    // ── Sidebar widths (user-resizable) ─────────────────────────────────

    property int _leftWidth:  200
    property int _rightWidth: 260

    // When the properties panel is narrower than this threshold the action bar
    // switches to icon-only mode to avoid overflow.
    readonly property bool _actionsCompact: _rightWidth < 220

    // ── Layout ──────────────────────────────────────────────────────────

    Item {
        anchors.fill: parent

        // ── Left toggle strip (36 px, fixed) ────────────────────────────
        Rectangle {
            id: leftToggleStrip
            anchors.left: parent.left; anchors.top: parent.top; anchors.bottom: parent.bottom
            width: 36
            color: Theme.bgMedium

            Rectangle {
                anchors.fill: parent
                color: maLeftToggle.containsMouse ? Theme.bgHover : "transparent"
            }

            Text {
                text: I18n.tr("sidebar.places")
                color: Theme.accent
                font.pixelSize: 14; font.bold: true; font.letterSpacing: 2
                rotation: -90; anchors.centerIn: parent
            }

            MouseArea {
                id: maLeftToggle
                anchors.fill: parent; hoverEnabled: true; cursorShape: Qt.PointingHandCursor
                onClicked: root.showLeftSidebar = !root.showLeftSidebar
            }
        }

        // ── Left sidebar panel (places / mounts / searches) ─────────────
        Rectangle {
            id: leftPanel
            anchors.left: leftToggleStrip.right; anchors.top: parent.top; anchors.bottom: parent.bottom
            width: root.showLeftSidebar ? root._leftWidth : 0
            color: Theme.bgMedium; clip: true
            Behavior on width { NumberAnimation { duration: 250; easing.type: Easing.InOutQuad } }

            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 8
                spacing: 4
                visible: root.showLeftSidebar

                ListView {
                    id: placesList
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    clip: true
                    model: root.places

                    ScrollBar.vertical: ScrollBar {
                        id: placesScrollBar
                        policy: ScrollBar.AsNeeded
                    }

                    delegate: ItemDelegate {
                        required property var modelData
                        required property int index
                        width: ListView.view.width
                        leftPadding: 12; rightPadding: 12
                        topPadding: 8; bottomPadding: 8
                        height: 40
                        onClicked: root.placeActivated(modelData.path)
                        contentItem: Row {
                            spacing: 8
                            ThemeIcon {
                                iconName: modelData.iconName || "folder"
                                width: 20; height: 20
                                anchors.verticalCenter: parent.verticalCenter
                            }
                            Text {
                                text: modelData.name
                                font.pixelSize: 14
                                color: Theme.fgMain
                                anchors.verticalCenter: parent.verticalCenter
                            }
                        }
                        background: Rectangle {
                            x: 4
                            width: parent.width - 8
                                   - (placesScrollBar.visible ? placesScrollBar.width + 4 : 0)
                            color: parent.hovered ? Theme.bgHover : "transparent"
                            radius: 4
                            border.color: parent.hovered ? Theme.border : "transparent"
                            border.width: 1
                        }

                        MouseArea {
                            anchors.fill: parent
                            acceptedButtons: Qt.RightButton
                            onClicked: (mouse) => {
                                if (mouse.button === Qt.RightButton && modelData.pinned) {
                                    placesCtxMenu.targetPath    = modelData.path
                                    placesCtxMenu.targetIcon    = modelData.iconName || "folder"
                                    placesCtxMenu.targetName    = modelData.name
                                    placesCtxMenu.popup()
                                }
                            }
                        }
                    }
                }

                // Mounts section
                Text {
                    text: I18n.tr("sidebar.mounts")
                    color: Theme.fgPlaceholder
                    font.pixelSize: 10
                    font.bold: true
                    leftPadding: 12
                    topPadding: 8; bottomPadding: 4
                    visible: root.mounts.length > 0
                }

                ListView {
                    id: mountsList
                    Layout.fillWidth: true
                    Layout.preferredHeight: Math.min(root.mounts.length * 36, 200)
                    clip: true
                    model: root.mounts
                    visible: root.mounts.length > 0

                    delegate: ItemDelegate {
                        required property var modelData
                        width: ListView.view.width
                        leftPadding: 12; rightPadding: 12
                        topPadding: 8; bottomPadding: 8
                        height: 40
                        onClicked: root.placeActivated(modelData.path)
                        contentItem: Row {
                            spacing: 8
                            ThemeIcon {
                                iconName: modelData.iconName || "drive-removable-media"
                                width: 20; height: 20
                                anchors.verticalCenter: parent.verticalCenter
                            }
                            Text {
                                text: modelData.label
                                font.pixelSize: 14
                                color: Theme.fgMain
                                anchors.verticalCenter: parent.verticalCenter
                                elide: Text.ElideRight
                                width: parent.width - 28
                            }
                        }
                        background: Rectangle {
                            x: 4; width: parent.width - 8
                            color: parent.hovered ? Theme.bgHover : "transparent"
                            radius: 4
                            border.color: parent.hovered ? Theme.border : "transparent"
                            border.width: 1
                        }
                    }
                }

                // Saved Searches section
                Text {
                    text: I18n.tr("sidebar.searches")
                    color: Theme.fgPlaceholder
                    font.pixelSize: 10
                    font.bold: true
                    leftPadding: 12
                    topPadding: 8; bottomPadding: 4
                    visible: root.savedSearches.length > 0
                }

                ListView {
                    id: savedSearchesList
                    Layout.fillWidth: true
                    Layout.preferredHeight: Math.min(root.savedSearches.length * 36, 200)
                    clip: true
                    model: root.savedSearches
                    visible: root.savedSearches.length > 0

                    delegate: ItemDelegate {
                        required property var modelData
                        width: ListView.view.width
                        leftPadding: 12; rightPadding: 12
                        topPadding: 8; bottomPadding: 8
                        height: 40
                        onClicked: root.searchActivated(modelData.chips)
                        contentItem: Row {
                            spacing: 8
                            ThemeIcon {
                                iconName: modelData.iconName || "folder-saved-search"
                                width: 20; height: 20
                                anchors.verticalCenter: parent.verticalCenter
                            }
                            Text {
                                text: modelData.name
                                font.pixelSize: 14
                                color: Theme.fgMain
                                anchors.verticalCenter: parent.verticalCenter
                                elide: Text.ElideRight
                                width: parent.width - 28
                            }
                        }
                        background: Rectangle {
                            x: 4; width: parent.width - 8
                            color: parent.hovered ? Theme.bgHover : "transparent"
                            radius: 4
                            border.color: parent.hovered ? Theme.border : "transparent"
                            border.width: 1
                        }

                        MouseArea {
                            anchors.fill: parent
                            acceptedButtons: Qt.RightButton
                            onClicked: (mouse) => {
                                if (mouse.button === Qt.RightButton) {
                                    searchCtxMenu.targetId = modelData.id
                                    searchCtxMenu.popup()
                                }
                            }
                        }
                    }
                }

                // Trash entry
                ItemDelegate {
                    Layout.fillWidth: true
                    leftPadding: 12; rightPadding: 12
                    topPadding: 8; bottomPadding: 8
                    height: 40
                    onClicked: root.trashActivated()
                    contentItem: Row {
                        spacing: 8
                        ThemeIcon {
                            iconName: "user-trash"
                            width: 20; height: 20
                            anchors.verticalCenter: parent.verticalCenter
                        }
                        Text {
                            text: I18n.tr("sidebar.trash")
                            font.pixelSize: 14
                            color: root.isTrashView ? Theme.accent : Theme.fgMain
                            anchors.verticalCenter: parent.verticalCenter
                        }
                    }
                    background: Rectangle {
                        x: 4; width: parent.width - 8
                        color: parent.hovered ? Theme.bgHover : "transparent"
                        radius: 4
                        border.color: parent.hovered ? Theme.border : "transparent"
                        border.width: 1
                    }
                }
            }

            // Context menu for pinned places
            Menu {
                id: placesCtxMenu
                property string targetPath: ""
                property string targetIcon: "folder"
                property string targetName: ""

                MenuItem {
                    text: I18n.tr("prop.change_icon")
                    onTriggered: {
                        iconPickerDialog.targetPath = placesCtxMenu.targetPath
                        iconPickerDialog.targetName = placesCtxMenu.targetName
                        iconPickerField.text        = placesCtxMenu.targetIcon
                        iconPickerDialog.open()
                    }
                }
                MenuItem {
                    text: I18n.tr("sidebar.remove")
                    onTriggered: {
                        TilboDaemon.unpinPlace(placesCtxMenu.targetPath, function(err) {
                            if (!err) root.loadPlaces()
                        })
                    }
                }
            }

            // Context menu for saved searches
            Menu {
                id: searchCtxMenu
                property string targetId: ""
                MenuItem {
                    text: I18n.tr("sidebar.remove")
                    onTriggered: {
                        TilboDaemon.unpinSearch(searchCtxMenu.targetId, function(err) {
                            if (!err) root.loadSavedSearches()
                        })
                    }
                }
            }

            // Icon picker dialog for pinned places
            Dialog {
                id: iconPickerDialog
                title: I18n.tr("prop.change_icon_title")
                property string targetPath: ""
                property string targetName: ""
                modal: true
                standardButtons: Dialog.Ok | Dialog.Cancel
                anchors.centerIn: Overlay.overlay
                width: 320

                onAccepted: {
                    var icon = iconPickerField.text.trim() || "folder"
                    TilboDaemon.pinPlace(targetName, targetPath, icon, function(err) {
                        if (!err) root.loadPlaces()
                    })
                }

                ColumnLayout {
                    width: parent.width
                    spacing: 12

                    Text {
                        text: I18n.tr("prop.icon_prompt", iconPickerDialog.targetName)
                        color: Theme.fgDim; font.pixelSize: 13
                        Layout.fillWidth: true
                    }

                    Row {
                        Layout.fillWidth: true
                        spacing: 12

                        ThemeIcon {
                            id: iconPickerPreview
                            iconName: iconPickerField.text.trim()
                            width: 48; height: 48
                        }

                        TextField {
                            id: iconPickerField
                            Layout.fillWidth: true
                            width: parent.width - 60
                            placeholderText: "e.g. folder, user-home, tag…"
                            color: Theme.fgMain
                            background: Rectangle {
                                color: Theme.bgInput; radius: 4
                                border.color: parent.activeFocus ? Theme.borderFocus : Theme.border
                                border.width: 1
                            }
                        }
                    }

                    Text {
                        text: "Common names: folder, user-home, user-trash, tag,\nfolder-documents, folder-download, folder-recent"
                        color: Theme.fgDeemphasized; font.pixelSize: 11
                        Layout.fillWidth: true; wrapMode: Text.WordWrap
                    }
                }
            }
        }

        // ── Left resize handle ───────────────────────────────────────────
        Item {
            id: leftHandle
            anchors.left: leftPanel.right; anchors.top: parent.top; anchors.bottom: parent.bottom
            width: leftPanel.width > 0 ? 4 : 0

            Rectangle {
                anchors.fill: parent
                color: leftHandleMA.containsMouse || leftHandleMA.pressed ? Theme.accent : Theme.border
                opacity: leftHandleMA.containsMouse || leftHandleMA.pressed ? 1.0 : 0.4
            }
            MouseArea {
                id: leftHandleMA
                anchors.fill: parent; hoverEnabled: true; cursorShape: Qt.SizeHorCursor
                property real _globalPressX: 0; property int _pressWidth: 0
                onPressed:         (m) => { _globalPressX = mapToGlobal(m.x, m.y).x; _pressWidth = root._leftWidth }
                onPositionChanged: (m) => {
                    if (!pressed) return
                    root._leftWidth = Math.max(120, Math.min(600,
                        _pressWidth + (mapToGlobal(m.x, m.y).x - _globalPressX)))
                }
            }
        }

        // ── Right toggle strip (36 px, fixed) ────────────────────────────
        Rectangle {
            id: rightToggleStrip
            anchors.right: parent.right; anchors.top: parent.top; anchors.bottom: parent.bottom
            width: 36
            color: Theme.bgMedium

            Rectangle {
                anchors.fill: parent
                color: maRightToggle.containsMouse ? Theme.bgHover : "transparent"
            }

            Text {
                text: "PROPERTIES"
                color: Theme.accent; font.pixelSize: 14; font.bold: true
                font.letterSpacing: 2; rotation: -90; anchors.centerIn: parent
            }

            MouseArea {
                id: maRightToggle
                anchors.fill: parent; hoverEnabled: true; cursorShape: Qt.PointingHandCursor
                onClicked: root.showRightSidebar = !root.showRightSidebar
            }
        }

        // ── Right sidebar panel (properties) ─────────────────────────────
        Rectangle {
            id: rightPanel
            anchors.right: rightToggleStrip.left; anchors.top: parent.top; anchors.bottom: parent.bottom
            width: root.showRightSidebar ? root._rightWidth : 0
            color: Theme.bgMedium; clip: true
            Behavior on width { NumberAnimation { duration: 250; easing.type: Easing.InOutQuad } }

            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 16
                spacing: 12
                visible: rightPanel.width > 4

                // No file selected
                Item {
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    visible: !root.selectedFile

                    Text {
                        anchors.centerIn: parent
                        text: "Select a file to view properties"
                        color: Theme.fgDeemphasized
                        font.pixelSize: 13
                        wrapMode: Text.WordWrap
                        horizontalAlignment: Text.AlignHCenter
                        width: parent.width - 20
                    }
                }

                // File selected
                ScrollView {
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    visible: !!root.selectedFile
                    clip: true
                    ScrollBar.horizontal.policy: ScrollBar.AlwaysOff
                    contentWidth: availableWidth

                    ColumnLayout {
                        width: parent.width
                        spacing: 12

                        // Preview / Icon
                        Item {
                            id: previewItem
                            Layout.alignment: Qt.AlignHCenter
                            Layout.preferredWidth: 228
                            Layout.preferredHeight: _previewImg.visible ? Math.min(_previewImg.implicitHeight * (228 / Math.max(1, _previewImg.implicitWidth)), 228) : 64

                            property string _previewSource: ""
                            property bool _isMedia: {
                                var f = root.selectedFile
                                return f && f.mimeType && (f.mimeType.indexOf("image/") === 0 || f.mimeType.indexOf("video/") === 0)
                            }

                            function requestThumbnail() {
                                var f = root.selectedFile
                                if (!f || f.isDir || !_isMedia) return
                                _previewSource = ""
                                TilboDaemon.getThumbnail(f.path, 1, function(result, _err) {
                                    if (result && result.thumbnailPath && root.selectedFile && root.selectedFile.path === f.path)
                                        _previewSource = "file://" + result.thumbnailPath
                                })
                            }

                            ThemeIcon {
                                anchors.centerIn: parent
                                width: 64; height: 64
                                iconName: root.selectedFile
                                        ? (root.selectedFile.iconName
                                           || (root.selectedFile.isDir ? "inode-directory" : "application-x-generic"))
                                        : ""
                                visible: parent._previewSource === ""
                            }

                            Image {
                                id: _previewImg
                                anchors.fill: parent
                                source: parent._previewSource
                                visible: parent._previewSource !== ""
                                fillMode: Image.PreserveAspectFit
                                smooth: true
                                cache: true
                            }

                            MouseArea {
                                anchors.fill: parent
                                cursorShape: parent._previewSource !== "" ? Qt.PointingHandCursor : Qt.ArrowCursor
                                enabled: parent._isMedia
                                onClicked: {
                                    if (root.selectedFile) {
                                        root.previewRequested(root.selectedFile.path, root.selectedFile.mimeType || "")
                                    }
                                }
                            }

                            // Request large thumbnail when file changes
                            Connections {
                                target: root
                                function onSelectedFileChanged() {
                                    previewItem.requestThumbnail()
                                }
                            }
                        }

                        // Name
                        Text {
                            Layout.fillWidth: true
                            text: root.selectedFile ? root.selectedFile.name : ""
                            color: Theme.fgMain
                            font.pixelSize: 16
                            font.bold: true
                            wrapMode: Text.WrapAnywhere
                            horizontalAlignment: Text.AlignHCenter
                        }

                        // ── Action bar ──────────────────────────────
                        Row {
                            Layout.alignment: Qt.AlignHCenter
                            spacing: 6

                            // Open / Navigate
                            ThemeButton {
                                property bool _isDir: root.selectedFile && root.selectedFile.isDir
                                text: root._actionsCompact ? ""
                                      : (_isDir ? I18n.tr("prop.action.navigate")
                                                : I18n.tr("prop.action.open"))
                                iconName: _isDir ? "folder-open-symbolic" : "document-open-symbolic"
                                visible: !!root.selectedFile
                                ToolTip.text: _isDir ? I18n.tr("prop.action.navigate")
                                                     : I18n.tr("prop.action.open")
                                ToolTip.visible: root._actionsCompact && hovered
                                onClicked: {
                                    if (root.selectedFile)
                                        root.openRequested(root.selectedFile.path, root.selectedFile.isDir)
                                }
                            }

                            // Preview (media only)
                            ThemeButton {
                                text: root._actionsCompact ? "" : I18n.tr("prop.action.preview")
                                iconName: "media-playback-start-symbolic"
                                visible: root.selectedFile && !root.selectedFile.isDir
                                         && root.selectedFile.mimeType
                                         && (root.selectedFile.mimeType.indexOf("image/") === 0
                                             || root.selectedFile.mimeType.indexOf("video/") === 0)
                                ToolTip.text: I18n.tr("prop.action.preview")
                                ToolTip.visible: root._actionsCompact && hovered
                                onClicked: {
                                    if (root.selectedFile)
                                        root.previewRequested(root.selectedFile.path,
                                                              root.selectedFile.mimeType || "")
                                }
                            }

                            // Refresh / Reindex
                            ThemeButton {
                                id: reindexBtn
                                text: root._actionsCompact ? "" : I18n.tr("prop.action.refresh")
                                iconName: "view-refresh-symbolic"
                                visible: root.selectedFile && !root.selectedFile.isDir
                                property bool _busy: false
                                enabled: !_busy
                                ToolTip.text: I18n.tr("prop.action.refresh")
                                ToolTip.visible: (root._actionsCompact || _busy) && hovered
                                onClicked: {
                                    if (!root.selectedFile) return
                                    _busy = true
                                    var targetPath = root.selectedFile.path
                                    TilboDaemon.reindexFile(targetPath, function(err) {
                                        reindexBtn._busy = false
                                        if (err) { console.warn("reindex:", err); return }
                                        previewItem.requestThumbnail()
                                        root.reindexRequested(targetPath)
                                    })
                                }
                            }
                        }

                        // Key-value details
                        GridLayout {
                            Layout.fillWidth: true
                            columns: 2
                            rowSpacing: 8
                            columnSpacing: 8

                            Text { text: "Path:";     color: Theme.accent; font.pixelSize: 13 }
                            Text {
                                text: root.selectedFile ? root.selectedFile.path : ""
                                color: Theme.fgDim; font.pixelSize: 12
                                Layout.fillWidth: true; elide: Text.ElideMiddle
                            }

                            Text { text: "Size:";     color: Theme.accent; font.pixelSize: 13 }
                            Text {
                                text: root.selectedFile
                                      ? (root.selectedFile.isDir ? "--"
                                         : (root.selectedFile.size / 1024).toFixed(1) + " KB")
                                      : ""
                                color: Theme.fgDim; font.pixelSize: 13
                                Layout.fillWidth: true; elide: Text.ElideRight
                            }

                            Text { text: "Modified:"; color: Theme.accent; font.pixelSize: 13 }
                            Text {
                                text: root.selectedFile && root.selectedFile.mtime
                                      ? new Date(root.selectedFile.mtime * 1000)
                                            .toLocaleString(Qt.locale(), Locale.ShortFormat)
                                      : ""
                                color: Theme.fgDim; font.pixelSize: 13
                                Layout.fillWidth: true; elide: Text.ElideRight
                            }
                        }

                        // Metadata section
                        Rectangle {
                            Layout.fillWidth: true
                            Layout.preferredHeight: 1
                            Layout.topMargin: 8
                            color: Theme.border
                            visible: root.selectedFileMeta !== null
                                     && Object.keys(root.selectedFileMeta || {}).length > 0
                        }

                        Rectangle {
                            Layout.fillWidth: true
                            Layout.preferredHeight: 220
                            visible: root.selectedFileMeta !== null
                                     && Object.keys(root.selectedFileMeta || {}).length > 0
                            color: Theme.bgInput
                            border.color: Theme.border; border.width: 1; radius: 6

                            Column {
                                anchors.fill: parent; anchors.margins: 8; spacing: 6

                                Text {
                                    text: "Metadata (" + Object.keys(root.selectedFileMeta || {}).length + ")"
                                    color: Theme.accent; font.pixelSize: 13; font.bold: true
                                }

                                ListView {
                                    width: parent.width
                                    height: parent.height - 28
                                    clip: true
                                    model: {
                                        var m = root.selectedFileMeta
                                        return m ? Object.keys(m).sort() : []
                                    }
                                    delegate: Row {
                                        required property string modelData
                                        width: ListView.view ? ListView.view.width : 0
                                        spacing: 6
                                        Text {
                                            text: parent.modelData; width: 90
                                            color: Theme.accent; font.pixelSize: 11
                                            elide: Text.ElideRight
                                        }
                                        Text {
                                            text: (root.selectedFileMeta && root.selectedFileMeta[parent.modelData])
                                                  ? root.selectedFileMeta[parent.modelData] : ""
                                            width: parent.width - 96
                                            color: Theme.fgDim; font.pixelSize: 11
                                            wrapMode: Text.WrapAnywhere
                                        }
                                    }
                                    ScrollBar.vertical: ScrollBar { policy: ScrollBar.AsNeeded }
                                }
                            }
                        }

                        // Tags
                        Label {
                            text: "Tags"
                            color: Theme.accent; font.pixelSize: 13; Layout.topMargin: 8
                            visible: root.selectedFile
                                     && root.selectedFile.tags
                                     && root.selectedFile.tags.length > 0
                        }

                        Flow {
                            Layout.fillWidth: true; spacing: 4
                            visible: root.selectedFile
                                     && root.selectedFile.tags
                                     && root.selectedFile.tags.length > 0
                            Repeater {
                                model: root.selectedFile && root.selectedFile.tags
                                       ? root.selectedFile.tags : []
                                Rectangle {
                                    height: 22; width: propTagTxt.width + 16; radius: 4
                                    color: Theme.bgActive; border.color: Theme.fgDeemphasized; border.width: 1
                                    Text {
                                        id: propTagTxt
                                        anchors.centerIn: parent; text: modelData
                                        color: Theme.success; font.pixelSize: 12
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // ── Right resize handle ───────────────────────────────────────────
        Item {
            id: rightHandle
            anchors.right: rightPanel.left; anchors.top: parent.top; anchors.bottom: parent.bottom
            width: rightPanel.width > 0 ? 4 : 0

            Rectangle {
                anchors.fill: parent
                color: rightHandleMA.containsMouse || rightHandleMA.pressed ? Theme.accent : Theme.border
                opacity: rightHandleMA.containsMouse || rightHandleMA.pressed ? 1.0 : 0.4
            }
            MouseArea {
                id: rightHandleMA
                anchors.fill: parent; hoverEnabled: true; cursorShape: Qt.SizeHorCursor
                property real _globalPressX: 0; property int _pressWidth: 0
                onPressed:         (m) => { _globalPressX = mapToGlobal(m.x, m.y).x; _pressWidth = root._rightWidth }
                onPositionChanged: (m) => {
                    if (!pressed) return
                    root._rightWidth = Math.max(140, Math.min(600,
                        _pressWidth - (mapToGlobal(m.x, m.y).x - _globalPressX)))
                }
            }
        }

        // ── Content slot (file area goes here) ───────────────────────────
        Item {
            id: contentSlot
            anchors.left: leftHandle.right; anchors.right: rightHandle.left
            anchors.top: parent.top; anchors.bottom: parent.bottom
        }
    }

    // ── Signals for file actions (handled by layout) ────────────────────
    signal previewRequested(string filePath, string mimeType)
    signal openRequested(string filePath, bool isDir)
    signal reindexRequested(string filePath)
}
