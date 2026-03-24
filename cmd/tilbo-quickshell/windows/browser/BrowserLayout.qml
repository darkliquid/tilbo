// BrowserLayout.qml — top-level visual structure: toolbar, footer, keyboard shortcuts,
// file area (grid/list/trash), and image preview overlay.
//
// Manages its own top/bottom toolbars via anchoring (not ApplicationWindow header/footer).

import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

import "../../services"
import "../../components"

Item {
    id: root
    anchors.fill: parent

    // ── External references ─────────────────────────────────────────────

    required property QtObject nav      // BrowserNavigation
    required property QtObject fileOps  // BrowserFileOperations

    // ── Layout state ────────────────────────────────────────────────────

    property bool   isGridView: true
    property bool   pathEditMode: false
    property var    _keybindings: ({})
    property bool   _useTrash: true
    property bool   daemonConnected: false

    // ── Expose sidebar for orchestrator access ──────────────────────────

    property alias sidebar: sidebar

    // ── Keyboard shortcuts ──────────────────────────────────────────────

    Shortcut {
        sequence: root._keybindings["back"] || "Alt+Left"
        onActivated: nav.goBack()
    }
    Shortcut {
        sequence: root._keybindings["forward"] || "Alt+Right"
        onActivated: nav.goForward()
    }
    Shortcut {
        sequence: "Alt+Up"
        onActivated: nav.goUp()
    }
    Shortcut {
        sequence: "Alt+Home"
        onActivated: nav.goHome()
    }
    Shortcut {
        sequence: root._keybindings["toggle_hidden"] || "Ctrl+H"
        onActivated: {
            nav.showHidden = !nav.showHidden
            if (nav.isSearchMode) nav._executeSearch(nav.searchChips)
            else if (!nav.isTrashView) nav._loadDirectory(nav.currentPath)
        }
    }
    Shortcut {
        sequence: root._keybindings["toggle_grid"] || "Ctrl+G"
        onActivated: root.isGridView = !root.isGridView
    }
    Shortcut {
        sequence: root._keybindings["refresh"] || "F5"
        onActivated: {
            if (nav.isTrashView) nav._loadTrash()
            else if (nav.isSearchMode) nav._executeSearch(nav.searchChips)
            else nav._loadDirectory(nav.currentPath)
        }
    }
    Shortcut {
        sequence: root._keybindings["focus_path"] || "Ctrl+L"
        onActivated: { root.pathEditMode = true; pathEditor.forceActiveFocus() }
    }
    Shortcut {
        sequence: root._keybindings["delete"] || "Delete"
        onActivated: {
            if (fileOps.selectedFile || fileOps.selectedPaths.length > 0) fileOps.deleteSelected()
        }
    }
    Shortcut {
        sequence: "Shift+Delete"
        onActivated: {
            if (fileOps.selectedFile || fileOps.selectedPaths.length > 0) fileOps.permanentDeleteSelected()
        }
    }
    Shortcut {
        sequence: "Ctrl+C"
        onActivated: fileOps.copySelected(false)
    }
    Shortcut {
        sequence: "Ctrl+X"
        onActivated: fileOps.copySelected(true)
    }
    Shortcut {
        sequence: "Ctrl+V"
        onActivated: fileOps.paste()
    }
    Shortcut {
        sequence: "Ctrl+Shift+N"
        onActivated: fileOps.createNew(true)
    }
    Shortcut {
        sequence: "Ctrl+A"
        onActivated: {
            if (root.isGridView) fileGrid.selectAll()
            else                 fileList.selectAll()
        }
    }
    Shortcut {
        sequence: "Ctrl++"
        onActivated: fileOps.zoomIn()
    }
    Shortcut {
        sequence: "Ctrl+="
        onActivated: fileOps.zoomIn()
    }
    Shortcut {
        sequence: "Ctrl+-"
        onActivated: fileOps.zoomOut()
    }
    Shortcut {
        sequence: "Ctrl+0"
        onActivated: fileOps.zoomReset()
    }

    // ── Breadcrumb helpers ──────────────────────────────────────────────

    function breadcrumbModel(path) {
        var crumbs = [{ label: "/", path: "/" }]
        if (!path || path === "/") return crumbs
        var parts = path.split("/")
        var acc = ""
        for (var i = 0; i < parts.length; i++) {
            if (!parts[i]) continue
            acc += "/" + parts[i]
            crumbs.push({ label: parts[i], path: acc })
        }
        return crumbs
    }

    function scrollBreadcrumbsToEnd() {
        breadcrumbFlick.contentX =
            Math.max(0, breadcrumbFlick.contentWidth - breadcrumbFlick.width)
    }

    // ── Header toolbar ──────────────────────────────────────────────────

    Rectangle {
        id: headerBar
        anchors.top: parent.top
        anchors.left: parent.left
        anchors.right: parent.right
        height: 60
        color: Theme.bgLight

        RowLayout {
            anchors.fill: parent
            anchors.leftMargin: 8
            anchors.rightMargin: 16
            spacing: 8

            Label {
                text: "tilbo"
                font.pixelSize: 20
                font.bold: true
                color: Theme.accent
                leftPadding: 8
            }

            ItemDelegate {
                id: backBtn
                Layout.preferredWidth: 40; Layout.preferredHeight: 40
                onClicked: nav.goBack()
                enabled: nav.canGoBack
                padding: 10
                contentItem: ThemeIcon {
                    iconName: "go-previous-symbolic"
                    useTintColor: true
                    tintColor: backBtn.enabled ? Theme.iconTint : Theme.fgDeemphasized
                }
                background: Rectangle {
                    color: parent.hovered ? Theme.bgHover : "transparent"
                    radius: 4
                    border.color: parent.hovered ? Theme.border : "transparent"
                    border.width: 1
                }
                ToolTip.text: I18n.tr("toolbar.back")
                ToolTip.visible: hovered
            }

            ItemDelegate {
                id: forwardBtn
                Layout.preferredWidth: 40; Layout.preferredHeight: 40
                onClicked: nav.goForward()
                enabled: nav.canGoForward
                padding: 10
                contentItem: ThemeIcon {
                    iconName: "go-next-symbolic"
                    useTintColor: true
                    tintColor: forwardBtn.enabled ? Theme.iconTint : Theme.fgDeemphasized
                }
                background: Rectangle {
                    color: parent.hovered ? Theme.bgHover : "transparent"
                    radius: 4
                    border.color: parent.hovered ? Theme.border : "transparent"
                    border.width: 1
                }
                ToolTip.text: I18n.tr("toolbar.forward")
                ToolTip.visible: hovered
            }

            ItemDelegate {
                id: upBtn
                Layout.preferredWidth: 40; Layout.preferredHeight: 40
                onClicked: nav.goUp()
                enabled: nav.currentPath !== "/"
                padding: 10
                contentItem: ThemeIcon {
                    iconName: "go-up-symbolic"
                    useTintColor: true
                    tintColor: upBtn.enabled ? Theme.iconTint : Theme.fgDeemphasized
                }
                background: Rectangle {
                    color: parent.hovered ? Theme.bgHover : "transparent"
                    radius: 4
                    border.color: parent.hovered ? Theme.border : "transparent"
                    border.width: 1
                }
                ToolTip.text: I18n.tr("toolbar.up")
                ToolTip.visible: hovered
            }
            ItemDelegate {
                Layout.preferredWidth: 40; Layout.preferredHeight: 40
                onClicked: nav.goHome()
                padding: 10
                contentItem: ThemeIcon {
                    iconName: "user-home-symbolic"
                    useTintColor: true
                    tintColor: Theme.iconTint
                }
                background: Rectangle {
                    color: parent.hovered ? Theme.bgHover : "transparent"
                    radius: 4
                    border.color: parent.hovered ? Theme.border : "transparent"
                    border.width: 1
                }
                ToolTip.text: I18n.tr("toolbar.home")
                ToolTip.visible: hovered
            }

            TagSearchBar {
                id: tagSearchBar
                Layout.fillWidth: true
                Layout.preferredHeight: 40
                daemonConnected: root.daemonConnected
                onSearchRequested: chips => nav.executeSearch(chips)
            }

            ThemeButton {
                text: I18n.tr("toolbar.pin")
                iconName: "bookmark-new-symbolic"
                isAccent: true
                Layout.preferredHeight: 40
                visible: nav.isSearchMode
                onClicked: pinSearchDialog.open()
                ToolTip.text: "Pin this search to sidebar"
                ToolTip.visible: hovered
            }

            Dialog {
                id: pinSearchDialog
                title: I18n.tr("search.pin_title")
                modal: true
                standardButtons: Dialog.Ok | Dialog.Cancel
                anchors.centerIn: Overlay.overlay
                onAccepted: {
                    var name = pinSearchNameField.text.trim() || "New Search"
                    TilboDaemon.pinSearch(name, nav.searchChips, "folder-saved-search", function(err) {
                        if (!err) sidebar.loadSavedSearches()
                    })
                }
                ColumnLayout {
                    spacing: 8
                    Text { text: I18n.tr("search.pin_prompt"); color: Theme.fgDim }
                    TextField {
                        id: pinSearchNameField
                        Layout.fillWidth: true
                        placeholderText: I18n.tr("search.pin_placeholder")
                        color: Theme.fgMain
                        background: Rectangle {
                            color: Theme.bgInput; radius: 4; border.width: 1
                            border.color: parent.activeFocus ? Theme.borderFocus : Theme.border
                        }
                    }
                }
            }

            ItemDelegate {
                Layout.preferredWidth: 40; Layout.preferredHeight: 40
                onClicked: root.isGridView = !root.isGridView
                padding: 10
                contentItem: ThemeIcon {
                    iconName: root.isGridView ? "view-list-symbolic" : "view-grid-symbolic"
                    useTintColor: true
                    tintColor: Theme.iconTint
                }
                background: Rectangle {
                    color: parent.hovered ? Theme.bgHover : "transparent"
                    radius: 4
                    border.color: parent.hovered ? Theme.border : "transparent"
                    border.width: 1
                }
                ToolTip.text: root.isGridView ? I18n.tr("toolbar.view.list") : I18n.tr("toolbar.view.grid")
                ToolTip.visible: hovered
            }

            ItemDelegate {
                Layout.preferredWidth: 40; Layout.preferredHeight: 40
                checkable: true
                checked: fileOps.selectionMode
                onClicked: fileOps.selectionMode = !fileOps.selectionMode
                padding: 10
                contentItem: ThemeIcon {
                    iconName: "edit-select-all-symbolic"
                    useTintColor: true
                    tintColor: parent.checked ? Theme.accent : Theme.iconTint
                }
                background: Rectangle {
                    color: parent.hovered ? Theme.bgHover : "transparent"
                    radius: 4
                    border.color: parent.hovered ? Theme.border : "transparent"
                    border.width: 1
                }
                ToolTip.text: I18n.tr("toolbar.selection")
                ToolTip.visible: hovered
            }

            ItemDelegate {
                Layout.preferredWidth: 40; Layout.preferredHeight: 40
                checkable: true
                checked: nav.showHidden
                onClicked: {
                    nav.showHidden = !nav.showHidden
                    if (nav.isSearchMode) nav._executeSearch(nav.searchChips)
                    else if (!nav.isTrashView) nav._loadDirectory(nav.currentPath)
                }
                padding: 10
                contentItem: ThemeIcon {
                    iconName: nav.showHidden ? "visibility-symbolic" : "visibility-off-symbolic"
                    useTintColor: true
                    tintColor: parent.checked ? Theme.accent : Theme.iconTint
                }
                background: Rectangle {
                    color: parent.hovered ? Theme.bgHover : "transparent"
                    radius: 4
                    border.color: parent.hovered ? Theme.border : "transparent"
                    border.width: 1
                }
                ToolTip.text: I18n.tr("toolbar.hidden")
                ToolTip.visible: hovered
            }
        }
    }

    // ── Main content area ───────────────────────────────────────────────

    BrowserSidebar {
        id: sidebar
        anchors.top: headerBar.bottom
        anchors.bottom: footerBar.top
        anchors.left: parent.left
        anchors.right: parent.right
        selectedFile: fileOps.selectedFile
        selectedFileMeta: fileOps.selectedFileMeta
        isTrashView: nav.isTrashView

        onPreviewRequested: (filePath, mimeType) => {
            imagePreview.filePath = filePath
            imagePreview.mimeType = mimeType
            imagePreview.visible = true
        }

        // ── File area (default content slot) ────────────────────────
        Rectangle {
            anchors.fill: parent
            color: "#111419"

            // Trash view
            Rectangle {
                anchors.fill: parent
                color: "transparent"
                visible: nav.isTrashView

                ColumnLayout {
                    anchors.fill: parent
                    spacing: 0

                    // Trash toolbar
                    Rectangle {
                        Layout.fillWidth: true
                        height: 40
                        color: Theme.bgMedium
                        RowLayout {
                            anchors.fill: parent
                            anchors.leftMargin: 12; anchors.rightMargin: 12
                            Text {
                                text: I18n.tr("gen.trash_count", nav.trashEntries.length)
                                color: Theme.accent; font.pixelSize: 14; font.bold: true
                            }
                            Item { Layout.fillWidth: true }
                            ThemeButton {
                                text: "Empty Trash"
                                isDanger: true
                                enabled: nav.trashEntries.length > 0
                                onClicked: {
                                    TilboDaemon.emptyTrash(function(err) {
                                        if (!err) nav._loadTrash()
                                    })
                                }
                            }
                        }
                    }

                    ListView {
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        clip: true
                        model: nav.trashEntries
                        ScrollBar.vertical: ScrollBar { policy: ScrollBar.AsNeeded }

                        delegate: Rectangle {
                            required property var modelData
                            width: ListView.view.width
                            height: 48
                            color: trashRowMA.containsMouse ? "#2E3440" : "transparent"

                            Row {
                                anchors.fill: parent; anchors.leftMargin: 12; anchors.rightMargin: 12
                                spacing: 8
                                Text {
                                    anchors.verticalCenter: parent.verticalCenter
                                    text: "\u{1F5D1}"
                                    font.pixelSize: 18
                                }
                                Column {
                                    anchors.verticalCenter: parent.verticalCenter
                                    spacing: 2
                                    Text {
                                        text: modelData.name
                                        color: "#ECEFF4"; font.pixelSize: 13
                                    }
                                    Text {
                                        text: modelData.originalPath
                                        color: "#9099A3"; font.pixelSize: 11
                                        elide: Text.ElideMiddle
                                        width: 300
                                    }
                                }
                                Item { width: 1; height: 1; Layout.fillWidth: true }
                                Button {
                                    anchors.verticalCenter: parent.verticalCenter
                                    text: "Restore"
                                    onClicked: {
                                        TilboDaemon.restoreTrash(modelData.name, function(err) {
                                            if (!err) nav._loadTrash()
                                        })
                                    }
                                }
                                Button {
                                    anchors.verticalCenter: parent.verticalCenter
                                    text: "Delete"
                                    onClicked: {
                                        var trashBase = Qt.resolvedUrl("~/.local/share/Trash/files/" + modelData.name).toString()
                                        TilboDaemon.deleteFile(trashBase, function(_err) {
                                            nav._loadTrash()
                                        })
                                    }
                                }
                            }

                            MouseArea {
                                id: trashRowMA
                                anchors.fill: parent
                                hoverEnabled: true
                            }
                        }
                    }
                }
            }

            // Normal file area (grid/list)
            StackLayout {
                anchors.fill: parent
                currentIndex: root.isGridView ? 0 : 1
                visible: !nav.isTrashView

                WheelHandler {
                    acceptedModifiers: Qt.ControlModifier
                    onWheel: (event) => {
                        if (event.angleDelta.y > 0) fileOps.zoomIn()
                        else                        fileOps.zoomOut()
                    }
                }

                FileGrid {
                    id: fileGrid
                    entries: nav.activeEntries
                    inlineThumbnails: fileOps._useInlineThumbnails
                    iconSize: fileOps._gridIconSize
                    selection: fileOps.selectedPaths
                    selectionMode: fileOps.selectionMode
                    onSelectionChanged: fileOps.selectedPaths = selection
                    onFileSelected: fileData => fileOps.selectFile(fileData)
                    onDirectoryActivated: path => nav.navigateTo(path)
                    onFileOpenRequested: path => Qt.openUrlExternally("file://" + path)
                    onRenameRequested: (path, newName) => {
                        TilboDaemon.renameFile(path, newName, function(newPath, err) {
                            if (err) { console.warn("rename:", err); return }
                            nav._loadDirectory(nav.currentPath)
                        })
                    }
                    onDeleteRequested: path => {
                        TilboDaemon.deleteFile(path, function(err) {
                            if (err) { console.warn("delete:", err); return }
                            if (fileOps.selectedFile && fileOps.selectedFile.path === path)
                                fileOps.selectedFile = null
                            nav._loadDirectory(nav.currentPath)
                        })
                    }
                    onOpenWithRequested: path => {
                        TilboDaemon.listAppsForFile(path, function(apps, _err) {
                            openWithDialog.filePath = path
                            openWithDialog.apps = apps || []
                            openWithDialog.open()
                        })
                    }
                    onOpenInTerminalRequested: path => {
                        var dir = path
                        var cmd = Qt.createQmlObject(
                            'import QtQuick; SystemCommand { command: "xdg-terminal-exec"; arguments: [dir] }',
                            root, "terminalCmd")
                    }
                    onGetFileActions: (path, cb) => TilboDaemon.getFileActions(path, cb)
                    onRunFileAction: (path, actionId) => TilboDaemon.runFileAction(path, actionId, null)
                    onGetFileBadges: (path, cb) => TilboDaemon.getFileBadges(path, cb)
                    onGetThumbnail: (path, size, cb) => TilboDaemon.getThumbnail(path, size, cb)
                    onCopyRequested: isMove => fileOps.copySelected(isMove)
                    onPasteRequested: () => fileOps.paste()
                    onCreateFileRequested: () => fileOps.createNew(false)
                    onCreateDirectoryRequested: () => fileOps.createNew(true)
                    onFilesDropped: (urls, target, isCopy) => fileOps.handleFilesDropped(urls, target, isCopy)
                }

                FileList {
                    id: fileList
                    entries: nav.activeEntries
                    inlineThumbnails: fileOps._useInlineThumbnails
                    selection: fileOps.selectedPaths
                    selectionMode: fileOps.selectionMode
                    sortColumn: nav._sortColumn
                    sortAscending: nav._sortAscending
                    onSortRequested: (col, asc) => {
                        nav._sortColumn = col
                        nav._sortAscending = asc
                        if (nav.isTrashView) nav.trashEntries = nav._sortEntries(nav.trashEntries)
                        else if (nav.isSearchMode) nav.searchResults = nav._sortEntries(nav.searchResults)
                        else nav.dirEntries = nav._sortEntries(nav.dirEntries)
                    }
                    onSelectionChanged: fileOps.selectedPaths = selection
                    onFileSelected: fileData => fileOps.selectFile(fileData)
                    onDirectoryActivated: path => nav.navigateTo(path)
                    onFileOpenRequested: path => Qt.openUrlExternally("file://" + path)
                    onRenameRequested: (path, newName) => {
                        TilboDaemon.renameFile(path, newName, function(newPath, err) {
                            if (err) return
                            nav._loadDirectory(nav.currentPath)
                        })
                    }
                    onDeleteRequested: path => {
                        TilboDaemon.deleteFile(path, function(err) {
                            if (err) return
                            if (fileOps.selectedFile && fileOps.selectedFile.path === path)
                                fileOps.selectedFile = null
                            nav._loadDirectory(nav.currentPath)
                        })
                    }
                    onOpenWithRequested: path => {
                        TilboDaemon.listAppsForFile(path, function(apps, _err) {
                            openWithDialog.filePath = path
                            openWithDialog.apps = apps || []
                            openWithDialog.open()
                        })
                    }
                    onGetFileActions: (path, cb) => TilboDaemon.getFileActions(path, cb)
                    onRunFileAction: (path, actionId) => TilboDaemon.runFileAction(path, actionId, null)
                    onGetFileBadges: (path, cb) => TilboDaemon.getFileBadges(path, cb)
                    onGetThumbnail: (path, size, cb) => TilboDaemon.getThumbnail(path, size, cb)
                    onOpenInTerminalRequested: dir => Qt.openUrlExternally("file://" + dir)
                    onCopyRequested: isMove => fileOps.copySelected(isMove)
                    onPasteRequested: () => fileOps.paste()
                    onCreateFileRequested: () => fileOps.createNew(false)
                    onCreateDirectoryRequested: () => fileOps.createNew(true)
                    onFilesDropped: (urls, target, isCopy) => fileOps.handleFilesDropped(urls, target, isCopy)
                }
            }
        }
    }

    // ── Open With dialog ────────────────────────────────────────────────

    Dialog {
        id: openWithDialog
        title: "Open With..."
        property string filePath: ""
        property var apps: []
        modal: true
        standardButtons: Dialog.Cancel
        anchors.centerIn: Overlay.overlay
        width: 360

        ListView {
            width: parent.width
            height: Math.min(openWithDialog.apps.length * 48, 300)
            model: openWithDialog.apps
            clip: true
            delegate: ItemDelegate {
                required property var modelData
                width: ListView.view.width
                height: 48
                contentItem: Row {
                    spacing: 8
                    ThemeIcon {
                        iconName: modelData.iconName || ""
                        width: 32; height: 32
                        anchors.verticalCenter: parent.verticalCenter
                        visible: modelData.iconName !== ""
                    }
                    Text {
                        text: modelData.name
                        color: "#ECEFF4"; font.pixelSize: 14
                        anchors.verticalCenter: parent.verticalCenter
                    }
                }
                onClicked: {
                    TilboDaemon.openWithApp(openWithDialog.filePath, modelData.id, null)
                    openWithDialog.close()
                }
            }
        }
    }

    // ── Footer toolbar ──────────────────────────────────────────────────

    Rectangle {
        id: footerBar
        anchors.bottom: parent.bottom
        anchors.left: parent.left
        anchors.right: parent.right
        height: 42
        color: "#1E212A"

        RowLayout {
            anchors.fill: parent
            anchors.leftMargin: 12; anchors.rightMargin: 12; spacing: 8

            ThemeButton {
                Layout.preferredWidth: 32
                Layout.preferredHeight: 32
                iconName: "folder-new"
                iconSize: 18
                isGhost: true
                visible: !nav.isSearchMode && !nav.isTrashView
                onClicked: {
                    var name = nav.currentPath.split("/").pop() || nav.currentPath
                    TilboDaemon.pinPlace(name, nav.currentPath, "folder", function(err) {
                        if (!err) sidebar.loadPlaces()
                    })
                }
                ToolTip.text: I18n.tr("sidebar.pin_current")
                ToolTip.visible: hovered
            }

            Item {
                Layout.fillWidth: true; Layout.fillHeight: true

                StackLayout {
                    anchors.fill: parent
                    currentIndex: root.pathEditMode ? 1 : 0

                    // Breadcrumb strip
                    Flickable {
                        id: breadcrumbFlick
                        clip: true
                        contentWidth: breadcrumbRow.implicitWidth
                        contentHeight: height
                        boundsBehavior: Flickable.StopAtBounds
                        onContentWidthChanged: Qt.callLater(root.scrollBreadcrumbsToEnd)
                        onWidthChanged:        Qt.callLater(root.scrollBreadcrumbsToEnd)

                        Row {
                            id: breadcrumbRow
                            height: parent.height; spacing: 4

                            Repeater {
                                id: breadcrumbRepeater
                                model: root.breadcrumbModel(nav.currentPath)
                                delegate: Row {
                                    height: parent.height; spacing: 4

                                    Text {
                                        visible: index > 0; text: "\u203A"
                                        color: Theme.fgDeemphasized; font.pixelSize: 13
                                        anchors.verticalCenter: parent.verticalCenter
                                    }
                                    Item {
                                        height: parent.height
                                        width: Math.min(220, breadcrumbLabel.implicitWidth)

                                        Text {
                                            id: breadcrumbLabel
                                            width: parent.width
                                            anchors.verticalCenter: parent.verticalCenter
                                            text: modelData.label
                                            color: bcMouse.containsMouse ? Theme.accent : Theme.fgDim
                                            font.pixelSize: 13; elide: Text.ElideRight
                                        }

                                        MouseArea {
                                            id: bcMouse
                                            anchors.fill: parent; hoverEnabled: true
                                            cursorShape: Qt.PointingHandCursor
                                            onClicked: {
                                                if (index === breadcrumbRepeater.count - 1)
                                                    root.pathEditMode = true
                                                else
                                                    nav.navigateTo(modelData.path)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // Path editor
                    TextField {
                        id: pathEditor
                        Layout.fillWidth: true; Layout.preferredHeight: 30
                        text: nav.currentPath
                        color: Theme.fgDim
                        background: Rectangle {
                            color: Theme.bgInput; radius: 4; border.width: 1
                            border.color: parent.activeFocus ? Theme.borderFocus : Theme.border
                        }
                        onAccepted: { nav.navigateTo(text); root.pathEditMode = false }
                        Keys.onEscapePressed: {
                            text = nav.currentPath; root.pathEditMode = false
                        }
                    }
                }
            }

            Item {
                Layout.preferredWidth: 22; Layout.fillHeight: true
                Text {
                    anchors.centerIn: parent
                    text: root.pathEditMode ? "\u2713" : "\u270E"
                    color: editMouse.containsMouse ? Theme.accent : Theme.fgDim
                    font.pixelSize: 15
                }
                MouseArea {
                    id: editMouse; anchors.fill: parent; hoverEnabled: true
                    cursorShape: Qt.PointingHandCursor
                    onClicked: {
                        if (root.pathEditMode) {
                            nav.navigateTo(pathEditor.text)
                            root.pathEditMode = false
                        } else {
                            root.pathEditMode = true
                            pathEditor.text = nav.currentPath
                            pathEditor.forceActiveFocus()
                        }
                    }
                }
            }
        }
    }

    // ── Fullsize image preview overlay ───────────────────────────────────

    ImagePreview {
        id: imagePreview
    }

    // ── React to currentPath changes ────────────────────────────────────

    Connections {
        target: nav
        function onCurrentPathChanged() {
            fileOps.selectedFile = null
            Qt.callLater(root.scrollBreadcrumbsToEnd)
        }
    }
}
