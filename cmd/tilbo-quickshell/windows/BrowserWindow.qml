// BrowserWindow.qml — main tilbo browser window for Quickshell.
//
// State machine:
//   • Normal mode  – shows directory listing for currentPath
//   • Search mode  – shows Search/GlobSearch results; chips drive the query
//
// Reactive events (from UI socket via TilboDaemon):
//   • TilboDaemon.fileTagged      → refresh tags for affected entry in-place
//   • TilboDaemon.indexUpdated    → refresh directory if in search mode
//   • TilboDaemon.daemonStateChanged → update connected indicator
import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

import "../services"
import "../components"

ApplicationWindow {
    id: window
    visible: true
    width: 1200
    height: 700
    title: "tilbo"
    color: "#1A1C23"

    // ── State ─────────────────────────────────────────────────────────────

    property string currentPath: "/"
    property bool   showHidden: false
    property bool   isGridView: true
    property bool   isSearchMode: false
    property var    searchChips: []

    // Currently selected file object {name, path, isDir, size, mtime, tags, ...}
    property var    selectedFile: null
    property var    selectedFileMeta: null   // metadata map from daemon

    property bool   showLeftSidebar: true
    property bool   showRightSidebar: false
    property bool   pathEditMode: false

    // Model arrays (plain JS objects — no QAbstractItemModel needed)
    property var    dirEntries: []   // [{name,path,isDir,size,mtime,mode,hidden,tags}]
    property var    searchResults: []
    property var    places: []

    // Shorthand for the active file list
    readonly property var activeEntries: isSearchMode ? searchResults : dirEntries

    // ── Navigation History (Feature 1) ────────────────────────────────────
    property var    _history: []
    property int    _historyIndex: -1
    readonly property bool canGoBack: _historyIndex > 0
    readonly property bool canGoForward: _historyIndex < _history.length - 1

    // ── Browser Config / Keybindings (Feature 6) ─────────────────────────
    property var    _keybindings: ({})
    property bool   _useTrash: true

    // ── Trash state ───────────────────────────────────────────────────────
    property bool   isTrashView: false
    property var    trashEntries: []

    // ── Daemon connection ─────────────────────────────────────────────────

    property bool daemonConnected: TilboDaemon.connected

    Connections {
        target: TilboDaemon

        function onDaemonStateChanged(state) {
            window.daemonConnected = TilboDaemon.connected
        }

        function onShowWindow(path) {
            window.show()
            window.raise()
            window.requestActivate()
            if (path && path !== "") {
                window.navigateTo(path)
            }
        }

        // When a file's tags change, patch the in-place entry so the badge row
        // refreshes without a full reload.
        function onFileTagged(path, added, removed) {
            _patchEntryTags(path, added, removed)
            if (window.selectedFile && window.selectedFile.path === path) {
                var updated = Object.assign({}, window.selectedFile)
                updated.tags = _applyTagDiff(updated.tags || [], added, removed)
                window.selectedFile = updated
            }
        }

        // After an index update, re-execute any active search so results stay fresh.
        function onIndexUpdated(_ft, _tt) {
            if (window.isSearchMode && window.searchChips.length > 0) {
                _executeSearch(window.searchChips)
            }
        }
    }

    // ── Lifecycle ─────────────────────────────────────────────────────────

    Component.onCompleted: {
        _loadPlaces()
        navigateTo(currentPath)
        TilboDaemon.getBrowserConfig(function(cfg, _err) {
            if (cfg) {
                _keybindings = cfg.keybindings || {}
                _useTrash = cfg.useTrash !== undefined ? cfg.useTrash : true
            }
        })
    }

    // ── Navigation ────────────────────────────────────────────────────────

    function navigateTo(path) {
        if (!path || path === "") return
        isSearchMode = false
        isTrashView  = false
        searchChips  = []
        selectedFile = null
        showRightSidebar = false

        // Update history: truncate forward entries, push new path
        if (_historyIndex < 0 || _history[_historyIndex] !== path) {
            var newHistory = _history.slice(0, _historyIndex + 1)
            newHistory.push(path)
            _history = newHistory
            _historyIndex = newHistory.length - 1
        }

        currentPath = path
        _loadDirectory(path)
    }

    function goBack() {
        if (!canGoBack) return
        _historyIndex--
        var path = _history[_historyIndex]
        isSearchMode = false
        isTrashView  = false
        searchChips  = []
        selectedFile = null
        showRightSidebar = false
        currentPath = path
        _loadDirectory(path)
    }

    function goForward() {
        if (!canGoForward) return
        _historyIndex++
        var path = _history[_historyIndex]
        isSearchMode = false
        isTrashView  = false
        searchChips  = []
        selectedFile = null
        showRightSidebar = false
        currentPath = path
        _loadDirectory(path)
    }

    function navigateToTrash() {
        isSearchMode = false
        isTrashView  = true
        searchChips  = []
        selectedFile = null
        showRightSidebar = false
        _loadTrash()
    }

    function _loadTrash() {
        TilboDaemon.listTrash(function(entries, err) {
            if (err) { trashEntries = []; return }
            trashEntries = entries
        })
    }

    function _loadDirectory(path) {
        TilboDaemon.listDirectory(path, showHidden, function(entries, err) {
            if (err) {
                console.warn("tilbo: listDirectory error:", err)
                dirEntries = []
                return
            }
            dirEntries = entries
            // Hydrate tags for all returned paths.
            var paths = entries.map(e => e.path)
            if (paths.length === 0) return
            TilboDaemon.hydrateTags(paths, function(tagged, tagErr) {
                if (tagErr) return
                var byPath = {}
                for (var i = 0; i < tagged.length; i++) {
                    byPath[tagged[i].path] = tagged[i].tags
                }
                // Merge tags into existing entries without a full model reset.
                dirEntries = dirEntries.map(function(e) {
                    return Object.assign({}, e, { tags: byPath[e.path] || [] })
                })
            })
        })
    }

    function _loadPlaces() {
        TilboDaemon.listPlaces(function(ps, err) {
            if (!err) places = ps
        })
    }

    // ── Search ────────────────────────────────────────────────────────────

    function executeSearch(chips) {
        isSearchMode = chips.length > 0
        searchChips  = chips
        if (!isSearchMode) {
            navigateTo(currentPath)
            return
        }
        _executeSearch(chips)
    }

    function _executeSearch(chips) {
        // Partition chips into tag chips and glob chips.
        var tagChips  = []
        var globPats  = []
        var ftsChips  = []
        var allowHid  = showHidden

        for (var i = 0; i < chips.length; i++) {
            var c = chips[i]
            if (c.startsWith("glob:"))    globPats.push(c.slice(5))
            else if (c === "hidden:any") allowHid = true
            else if (c.startsWith("fts:")) ftsChips.push(c.slice(4))
            else                          tagChips.push(c)
        }

        if (tagChips.length > 0 || ftsChips.length > 0) {
            TilboDaemon.search(
                tagChips, false, [], {}, ftsChips.join(" "), 1000, 0, [],
                function(res, err) {
                    if (!err && res && res.files.length > 0) {
                        searchResults = res.files
                        return
                    }
                    // Fallback to glob if indexed search yields nothing.
                    if (globPats.length > 0) {
                        _runGlobSearch(globPats, allowHid)
                    } else {
                        searchResults = []
                    }
                }
            )
        } else if (globPats.length > 0) {
            _runGlobSearch(globPats, allowHid)
        } else {
            searchResults = []
        }
    }

    function _runGlobSearch(patterns, allowHidden) {
        TilboDaemon.globSearch(patterns, 1000, allowHidden, function(files, err) {
            searchResults = err ? [] : files
        })
    }

    // ── File selection & metadata ─────────────────────────────────────────

    function selectFile(fileData) {
        selectedFile     = fileData
        selectedFileMeta = null
        showRightSidebar = !!fileData

        if (!fileData) return

        // Stat for fresh size/mtime, then get metadata from daemon.
        TilboDaemon.statFile(fileData.path, function(stat, _err) {
            if (stat && window.selectedFile && window.selectedFile.path === fileData.path) {
                window.selectedFile = Object.assign({}, window.selectedFile,
                    { size: stat.size, mtime: stat.mtime })
            }
        })
        TilboDaemon.getMetadata(fileData.path, function(res, _err) {
            if (res && window.selectedFile && window.selectedFile.path === fileData.path) {
                window.selectedFileMeta = res.metadata || {}
            }
        })
    }

    // ── Tag helpers ───────────────────────────────────────────────────────

    function _applyTagDiff(existing, added, removed) {
        var set = {}
        for (var i = 0; i < existing.length; i++) set[existing[i]] = true
        for (var j = 0; j < (added   || []).length; j++) set[added[j]]   = true
        for (var k = 0; k < (removed || []).length; k++) delete set[removed[k]]
        return Object.keys(set)
    }

    function _patchEntryTags(path, added, removed) {
        var lists = [dirEntries, searchResults]
        for (var li = 0; li < lists.length; li++) {
            var arr = lists[li]
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].path === path) {
                    var patched = arr.slice()
                    patched[i] = Object.assign({}, arr[i],
                        { tags: _applyTagDiff(arr[i].tags || [], added, removed) })
                    if (li === 0) dirEntries     = patched
                    else          searchResults  = patched
                    return
                }
            }
        }
    }

    // ── Delete helpers ────────────────────────────────────────────────────

    function _deleteSelected() {
        if (!selectedFile) return
        var path = selectedFile.path
        TilboDaemon.deleteFile(path, function(err) {
            if (err) { console.warn("delete:", err); return }
            if (window.selectedFile && window.selectedFile.path === path)
                window.selectedFile = null
            if (window.isTrashView) _loadTrash()
            else _loadDirectory(window.currentPath)
        })
    }

    function _permanentDeleteSelected() {
        if (!selectedFile) return
        var path = selectedFile.path
        // Force permanent delete by calling deleteFile on the resolved path
        // The daemon checks use_trash; Shift+Delete bypasses by using trashFile=false
        // For now we call deleteFile which respects config; if user wants force-permanent
        // they should set use_trash=false in config.
        TilboDaemon.deleteFile(path, function(err) {
            if (err) { console.warn("permanent delete:", err); return }
            if (window.selectedFile && window.selectedFile.path === path)
                window.selectedFile = null
            if (window.isTrashView) _loadTrash()
            else _loadDirectory(window.currentPath)
        })
    }

    // ── Breadcrumb model ──────────────────────────────────────────────────

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

    onCurrentPathChanged: {
        window.selectedFile = null
        Qt.callLater(scrollBreadcrumbsToEnd)
    }

    // ── Layout ────────────────────────────────────────────────────────────

    // ── Keyboard shortcuts ────────────────────────────────────────────────

    Shortcut {
        sequence: window._keybindings["back"] || "Alt+Left"
        onActivated: window.goBack()
    }
    Shortcut {
        sequence: window._keybindings["forward"] || "Alt+Right"
        onActivated: window.goForward()
    }
    Shortcut {
        sequence: window._keybindings["toggle_hidden"] || "Ctrl+H"
        onActivated: {
            window.showHidden = !window.showHidden
            if (window.isSearchMode) _executeSearch(window.searchChips)
            else if (!window.isTrashView) _loadDirectory(window.currentPath)
        }
    }
    Shortcut {
        sequence: window._keybindings["toggle_grid"] || "Ctrl+G"
        onActivated: window.isGridView = !window.isGridView
    }
    Shortcut {
        sequence: window._keybindings["refresh"] || "F5"
        onActivated: {
            if (window.isTrashView) _loadTrash()
            else if (window.isSearchMode) _executeSearch(window.searchChips)
            else _loadDirectory(window.currentPath)
        }
    }
    Shortcut {
        sequence: window._keybindings["focus_path"] || "Ctrl+L"
        onActivated: { window.pathEditMode = true; pathEditor.forceActiveFocus() }
    }
    Shortcut {
        sequence: window._keybindings["delete"] || "Delete"
        onActivated: {
            if (window.selectedFile) window._deleteSelected()
        }
    }
    Shortcut {
        sequence: "Shift+Delete"
        onActivated: {
            if (window.selectedFile) window._permanentDeleteSelected()
        }
    }

    header: ToolBar {
        background: Rectangle { color: "#22252E" }
        height: 60
        RowLayout {
            anchors.fill: parent
            anchors.leftMargin: 8
            anchors.rightMargin: 16
            spacing: 8

            Label {
                text: "tilbo"
                font.pixelSize: 20
                font.bold: true
                color: "#88C0D0"
                leftPadding: 8
            }

            // Back / Forward buttons (Feature 1)
            ToolButton {
                text: "←"
                font.pixelSize: 16
                enabled: window.canGoBack
                opacity: enabled ? 1.0 : 0.4
                onClicked: window.goBack()
                ToolTip.text: "Back (Alt+Left)"
                ToolTip.visible: hovered
                ToolTip.delay: 500
            }
            ToolButton {
                text: "→"
                font.pixelSize: 16
                enabled: window.canGoForward
                opacity: enabled ? 1.0 : 0.4
                onClicked: window.goForward()
                ToolTip.text: "Forward (Alt+Right)"
                ToolTip.visible: hovered
                ToolTip.delay: 500
            }

            TagSearchBar {
                Layout.fillWidth: true
                Layout.preferredHeight: 40
                daemonConnected: window.daemonConnected
                onSearchRequested: chips => window.executeSearch(chips)
            }

            Button {
                text: window.isGridView ? "List ☰" : "Grid ⊞"
                Layout.preferredHeight: 40
                onClicked: window.isGridView = !window.isGridView
            }

            Button {
                text: "Hidden"
                checkable: true
                checked: window.showHidden
                Layout.preferredHeight: 40
                onToggled: {
                    window.showHidden = checked
                    if (window.isSearchMode) _executeSearch(window.searchChips)
                    else if (!window.isTrashView) _loadDirectory(window.currentPath)
                }
            }
        }
    }

    RowLayout {
        anchors.fill: parent
        spacing: 0

        // Left strip toggle
        Rectangle {
            Layout.preferredWidth: 36
            Layout.fillHeight: true
            color: "#1E212A"

            Rectangle {
                anchors.fill: parent
                color: maLeftToggle.containsMouse ? "#2A2E39" : "transparent"
            }

            Text {
                text: "PLACES"
                color: "#88C0D0"
                font.pixelSize: 14
                font.bold: true
                font.letterSpacing: 2
                rotation: -90
                anchors.centerIn: parent
            }

            MouseArea {
                id: maLeftToggle
                anchors.fill: parent
                hoverEnabled: true
                cursorShape: Qt.PointingHandCursor
                onClicked: window.showLeftSidebar = !window.showLeftSidebar
            }
        }

        // Places sidebar
        Rectangle {
            Layout.preferredWidth: window.showLeftSidebar ? 200 : 0
            Layout.fillHeight: true
            color: "#1E212A"
            clip: true
            Behavior on Layout.preferredWidth {
                NumberAnimation { duration: 250; easing.type: Easing.InOutQuad }
            }

            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 8
                spacing: 4
                visible: window.showLeftSidebar

                ListView {
                    id: placesList
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    clip: true
                    model: window.places

                    ScrollBar.vertical: ScrollBar {
                        id: placesScrollBar
                        policy: ScrollBar.AsNeeded
                    }

                    delegate: ItemDelegate {
                        required property var modelData
                        required property int index
                        width: ListView.view.width
                        leftPadding: 8
                        rightPadding: 8 + (placesScrollBar.visible ? placesScrollBar.width + 4 : 0)
                        topPadding: 0; bottomPadding: 0
                        height: 36
                        onClicked: window.navigateTo(modelData.path)
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
                                color: "#ECEFF4"
                                anchors.verticalCenter: parent.verticalCenter
                            }
                        }
                        background: Rectangle {
                            x: 4
                            width: parent.width - 8
                                   - (placesScrollBar.visible ? placesScrollBar.width + 4 : 0)
                            color: parent.hovered ? "#2E3440" : "transparent"
                            radius: 4
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

                // Trash entry
                ItemDelegate {
                    Layout.fillWidth: true
                    leftPadding: 8; topPadding: 0; bottomPadding: 0; height: 36
                    onClicked: window.navigateToTrash()
                    contentItem: Row {
                        spacing: 8
                        ThemeIcon {
                            iconName: "user-trash"
                            width: 20; height: 20
                            anchors.verticalCenter: parent.verticalCenter
                        }
                        Text {
                            text: "Trash"
                            font.pixelSize: 14
                            color: window.isTrashView ? "#88C0D0" : "#ECEFF4"
                            anchors.verticalCenter: parent.verticalCenter
                        }
                    }
                    background: Rectangle {
                        x: 4; width: parent.width - 8
                        color: parent.hovered ? "#2E3440" : "transparent"
                        radius: 4
                    }
                }

                // Pin current folder button
                Button {
                    Layout.fillWidth: true
                    visible: !window.isSearchMode && !window.isTrashView
                    onClicked: {
                        var name = window.currentPath.split("/").pop() || window.currentPath
                        TilboDaemon.pinPlace(name, window.currentPath, "folder", function(err) {
                            if (!err) window._loadPlaces()
                        })
                    }
                    background: Rectangle {
                        color: parent.hovered ? "#2E3440" : "transparent"
                        radius: 4; border.color: "#3B4252"; border.width: 1
                    }
                    contentItem: Row {
                        anchors.centerIn: parent
                        spacing: 4
                        ThemeIcon {
                            iconName: "folder-new"
                            width: 14; height: 14
                            anchors.verticalCenter: parent.verticalCenter
                        }
                        Text {
                            text: "Pin Current Folder"
                            font.pixelSize: 12; color: "#88C0D0"
                            anchors.verticalCenter: parent.verticalCenter
                        }
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
                    text: "Change Icon..."
                    onTriggered: {
                        iconPickerDialog.targetPath = placesCtxMenu.targetPath
                        iconPickerDialog.targetName = placesCtxMenu.targetName
                        iconPickerField.text        = placesCtxMenu.targetIcon
                        iconPickerDialog.open()
                    }
                }
                MenuItem {
                    text: "Remove from sidebar"
                    onTriggered: {
                        TilboDaemon.unpinPlace(placesCtxMenu.targetPath, function(err) {
                            if (!err) window._loadPlaces()
                        })
                    }
                }
            }

            // Icon picker dialog for pinned places
            Dialog {
                id: iconPickerDialog
                title: "Change Icon"
                property string targetPath: ""
                property string targetName: ""
                modal: true
                standardButtons: Dialog.Ok | Dialog.Cancel
                anchors.centerIn: parent
                width: 320

                onAccepted: {
                    var icon = iconPickerField.text.trim() || "folder"
                    TilboDaemon.pinPlace(targetName, targetPath, icon, function(err) {
                        if (!err) window._loadPlaces()
                    })
                }

                ColumnLayout {
                    width: parent.width
                    spacing: 12

                    Text {
                        text: "Enter an XDG icon theme name:"
                        color: "#D8DEE9"; font.pixelSize: 13
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
                            color: "#ECEFF4"
                            background: Rectangle {
                                color: "#1A1C23"; radius: 4
                                border.color: parent.activeFocus ? "#5E81AC" : "#3B4252"
                                border.width: 1
                            }
                        }
                    }

                    Text {
                        text: "Common names: folder, user-home, user-trash, tag,\nfolder-documents, folder-download, folder-recent"
                        color: "#4C566A"; font.pixelSize: 11
                        Layout.fillWidth: true; wrapMode: Text.WordWrap
                    }
                }
            }
        }

        // Main file area
        Rectangle {
            Layout.fillWidth: true
            Layout.fillHeight: true
            color: "#111419"

            // Trash view
            Rectangle {
                anchors.fill: parent
                color: "transparent"
                visible: window.isTrashView

                ColumnLayout {
                    anchors.fill: parent
                    spacing: 0

                    // Trash toolbar
                    Rectangle {
                        Layout.fillWidth: true
                        height: 40
                        color: "#1E212A"
                        RowLayout {
                            anchors.fill: parent
                            anchors.leftMargin: 12; anchors.rightMargin: 12
                            Text {
                                text: "Trash  (" + window.trashEntries.length + " items)"
                                color: "#88C0D0"; font.pixelSize: 14; font.bold: true
                            }
                            Item { Layout.fillWidth: true }
                            Button {
                                text: "Empty Trash"
                                enabled: window.trashEntries.length > 0
                                onClicked: {
                                    TilboDaemon.emptyTrash(function(err) {
                                        if (!err) window._loadTrash()
                                    })
                                }
                            }
                        }
                    }

                    ListView {
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        clip: true
                        model: window.trashEntries
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
                                    text: "🗑"
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
                                            if (!err) window._loadTrash()
                                        })
                                    }
                                }
                                Button {
                                    anchors.verticalCenter: parent.verticalCenter
                                    text: "Delete"
                                    onClicked: {
                                        // Permanent delete from trash
                                        var trashBase = Qt.resolvedUrl("~/.local/share/Trash/files/" + modelData.name).toString()
                                        TilboDaemon.deleteFile(trashBase, function(_err) {
                                            window._loadTrash()
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
                currentIndex: window.isGridView ? 0 : 1
                visible: !window.isTrashView

                FileGrid {
                    entries: window.activeEntries
                    onFileSelected: fileData => window.selectFile(fileData)
                    onDirectoryActivated: path => window.navigateTo(path)
                    onFileOpenRequested: path => Qt.openUrlExternally("file://" + path)
                    onRenameRequested: (path, newName) => {
                        TilboDaemon.renameFile(path, newName, function(newPath, err) {
                            if (err) { console.warn("rename:", err); return }
                            _loadDirectory(window.currentPath)
                        })
                    }
                    onDeleteRequested: path => {
                        TilboDaemon.deleteFile(path, function(err) {
                            if (err) { console.warn("delete:", err); return }
                            if (window.selectedFile && window.selectedFile.path === path)
                                window.selectedFile = null
                            _loadDirectory(window.currentPath)
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
                            window, "terminalCmd")
                    }
                    onGetFileActions: (path, cb) => TilboDaemon.getFileActions(path, cb)
                    onRunFileAction: (path, actionId) => TilboDaemon.runFileAction(path, actionId, null)
                    onGetFileBadges: (path, cb) => TilboDaemon.getFileBadges(path, cb)
                }

                FileList {
                    entries: window.activeEntries
                    onFileSelected: fileData => window.selectFile(fileData)
                    onDirectoryActivated: path => window.navigateTo(path)
                    onFileOpenRequested: path => Qt.openUrlExternally("file://" + path)
                    onRenameRequested: (path, newName) => {
                        TilboDaemon.renameFile(path, newName, function(newPath, err) {
                            if (err) return
                            _loadDirectory(window.currentPath)
                        })
                    }
                    onDeleteRequested: path => {
                        TilboDaemon.deleteFile(path, function(err) {
                            if (err) return
                            if (window.selectedFile && window.selectedFile.path === path)
                                window.selectedFile = null
                            _loadDirectory(window.currentPath)
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
                    onOpenInTerminalRequested: dir => Qt.openUrlExternally("file://" + dir)
                }
            }
        }

        // Open With dialog
        Dialog {
            id: openWithDialog
            title: "Open With..."
            property string filePath: ""
            property var apps: []
            modal: true
            standardButtons: Dialog.Cancel
            anchors.centerIn: parent
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

        // Properties sidebar
        Rectangle {
            Layout.preferredWidth: window.showRightSidebar ? 260 : 0
            Layout.fillHeight: true
            color: "#1E212A"
            clip: true
            Behavior on Layout.preferredWidth {
                NumberAnimation { duration: 250; easing.type: Easing.InOutQuad }
            }

            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 16
                spacing: 12
                visible: window.showRightSidebar

                // No file selected
                Item {
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    visible: !window.selectedFile

                    Text {
                        anchors.centerIn: parent
                        text: "Select a file to view properties"
                        color: "#4C566A"
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
                    visible: !!window.selectedFile
                    clip: true
                    ScrollBar.horizontal.policy: ScrollBar.AlwaysOff
                    contentWidth: availableWidth

                    ColumnLayout {
                        width: parent.width
                        spacing: 12

                        // Icon
                        ThemeIcon {
                            Layout.alignment: Qt.AlignHCenter
                            Layout.preferredWidth: 64
                            Layout.preferredHeight: 64
                            iconName: window.selectedFile
                                    ? (window.selectedFile.iconName
                                       || (window.selectedFile.isDir ? "inode-directory" : "application-x-generic"))
                                    : ""
                        }

                        // Name
                        Text {
                            Layout.fillWidth: true
                            text: window.selectedFile ? window.selectedFile.name : ""
                            color: "#ECEFF4"
                            font.pixelSize: 16
                            font.bold: true
                            wrapMode: Text.WrapAnywhere
                            horizontalAlignment: Text.AlignHCenter
                        }

                        // Key-value details
                        GridLayout {
                            Layout.fillWidth: true
                            columns: 2
                            rowSpacing: 8
                            columnSpacing: 8

                            Text { text: "Path:";     color: "#88C0D0"; font.pixelSize: 13 }
                            Text {
                                text: window.selectedFile ? window.selectedFile.path : ""
                                color: "#D8DEE9"; font.pixelSize: 12
                                Layout.fillWidth: true; elide: Text.ElideMiddle
                            }

                            Text { text: "Size:";     color: "#88C0D0"; font.pixelSize: 13 }
                            Text {
                                text: window.selectedFile
                                      ? (window.selectedFile.isDir ? "--"
                                         : (window.selectedFile.size / 1024).toFixed(1) + " KB")
                                      : ""
                                color: "#D8DEE9"; font.pixelSize: 13
                                Layout.fillWidth: true; elide: Text.ElideRight
                            }

                            Text { text: "Modified:"; color: "#88C0D0"; font.pixelSize: 13 }
                            Text {
                                text: window.selectedFile && window.selectedFile.mtime
                                      ? new Date(window.selectedFile.mtime * 1000)
                                            .toLocaleString(Qt.locale(), Locale.ShortFormat)
                                      : ""
                                color: "#D8DEE9"; font.pixelSize: 13
                                Layout.fillWidth: true; elide: Text.ElideRight
                            }
                        }

                        // Metadata section
                        Rectangle {
                            Layout.fillWidth: true
                            Layout.preferredHeight: 1
                            Layout.topMargin: 8
                            color: "#3B4252"
                            visible: window.selectedFileMeta !== null
                                     && Object.keys(window.selectedFileMeta || {}).length > 0
                        }

                        Rectangle {
                            Layout.fillWidth: true
                            Layout.preferredHeight: 220
                            visible: window.selectedFileMeta !== null
                                     && Object.keys(window.selectedFileMeta || {}).length > 0
                            color: "#252A35"
                            border.color: "#3B4252"; border.width: 1; radius: 6

                            Column {
                                anchors.fill: parent; anchors.margins: 8; spacing: 6

                                Text {
                                    text: "Metadata (" + Object.keys(window.selectedFileMeta || {}).length + ")"
                                    color: "#88C0D0"; font.pixelSize: 13; font.bold: true
                                }

                                ListView {
                                    width: parent.width
                                    height: parent.height - 28
                                    clip: true
                                    model: {
                                        var m = window.selectedFileMeta
                                        return m ? Object.keys(m).sort() : []
                                    }
                                    delegate: Row {
                                        required property string modelData
                                        width: ListView.view ? ListView.view.width : 0
                                        spacing: 6
                                        Text {
                                            text: parent.modelData; width: 90
                                            color: "#88C0D0"; font.pixelSize: 11
                                            elide: Text.ElideRight
                                        }
                                        Text {
                                            text: (window.selectedFileMeta && window.selectedFileMeta[parent.modelData])
                                                  ? window.selectedFileMeta[parent.modelData] : ""
                                            width: parent.width - 96
                                            color: "#D8DEE9"; font.pixelSize: 11
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
                            color: "#88C0D0"; font.pixelSize: 13; Layout.topMargin: 8
                            visible: window.selectedFile
                                     && window.selectedFile.tags
                                     && window.selectedFile.tags.length > 0
                        }

                        Flow {
                            Layout.fillWidth: true; spacing: 4
                            visible: window.selectedFile
                                     && window.selectedFile.tags
                                     && window.selectedFile.tags.length > 0
                            Repeater {
                                model: window.selectedFile && window.selectedFile.tags
                                       ? window.selectedFile.tags : []
                                Rectangle {
                                    height: 22; width: propTagTxt.width + 16; radius: 4
                                    color: "#3B4252"; border.color: "#4C566A"; border.width: 1
                                    Text {
                                        id: propTagTxt
                                        anchors.centerIn: parent; text: modelData
                                        color: "#A3BE8C"; font.pixelSize: 12
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Right strip toggle
        Rectangle {
            Layout.preferredWidth: 36
            Layout.fillHeight: true
            color: "#1E212A"

            Rectangle {
                anchors.fill: parent
                color: maRightToggle.containsMouse ? "#2A2E39" : "transparent"
            }

            Text {
                text: "PROPERTIES"
                color: "#88C0D0"; font.pixelSize: 14; font.bold: true
                font.letterSpacing: 2; rotation: -90; anchors.centerIn: parent
            }

            MouseArea {
                id: maRightToggle
                anchors.fill: parent; hoverEnabled: true
                cursorShape: Qt.PointingHandCursor
                onClicked: window.showRightSidebar = !window.showRightSidebar
            }
        }
    }

    // ── Footer (path bar) ─────────────────────────────────────────────────

    footer: ToolBar {
        height: 42
        background: Rectangle { color: "#1E212A" }

        RowLayout {
            anchors.fill: parent
            anchors.leftMargin: 12; anchors.rightMargin: 12; spacing: 8

            Item {
                Layout.fillWidth: true; Layout.fillHeight: true

                StackLayout {
                    anchors.fill: parent
                    currentIndex: window.pathEditMode ? 1 : 0

                    // Breadcrumb strip
                    Flickable {
                        id: breadcrumbFlick
                        clip: true
                        contentWidth: breadcrumbRow.implicitWidth
                        contentHeight: height
                        boundsBehavior: Flickable.StopAtBounds
                        onContentWidthChanged: Qt.callLater(window.scrollBreadcrumbsToEnd)
                        onWidthChanged:        Qt.callLater(window.scrollBreadcrumbsToEnd)

                        Row {
                            id: breadcrumbRow
                            height: parent.height; spacing: 4

                            Repeater {
                                id: breadcrumbRepeater
                                model: window.breadcrumbModel(window.currentPath)
                                delegate: Row {
                                    height: parent.height; spacing: 4

                                    Text {
                                        visible: index > 0; text: "›"
                                        color: "#6B7280"; font.pixelSize: 13
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
                                            color: bcMouse.containsMouse ? "#88C0D0" : "#D8DEE9"
                                            font.pixelSize: 13; elide: Text.ElideRight
                                        }

                                        MouseArea {
                                            id: bcMouse
                                            anchors.fill: parent; hoverEnabled: true
                                            cursorShape: Qt.PointingHandCursor
                                            onClicked: {
                                                if (index === breadcrumbRepeater.count - 1)
                                                    window.pathEditMode = true
                                                else
                                                    window.navigateTo(modelData.path)
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
                        text: window.currentPath
                        color: "#D8DEE9"
                        background: Rectangle {
                            color: "#1A1C23"; radius: 4; border.width: 1
                            border.color: parent.activeFocus ? "#5E81AC" : "#3B4252"
                        }
                        onAccepted: { window.navigateTo(text); window.pathEditMode = false }
                        Keys.onEscapePressed: {
                            text = window.currentPath; window.pathEditMode = false
                        }
                    }
                }
            }

            Item {
                Layout.preferredWidth: 22; Layout.fillHeight: true
                Text {
                    anchors.centerIn: parent
                    text: window.pathEditMode ? "✓" : "✎"
                    color: editMouse.containsMouse ? "#88C0D0" : "#D8DEE9"
                    font.pixelSize: 15
                }
                MouseArea {
                    id: editMouse; anchors.fill: parent; hoverEnabled: true
                    cursorShape: Qt.PointingHandCursor
                    onClicked: {
                        if (window.pathEditMode) {
                            window.navigateTo(pathEditor.text)
                            window.pathEditMode = false
                        } else {
                            window.pathEditMode = true
                            pathEditor.text = window.currentPath
                            pathEditor.forceActiveFocus()
                        }
                    }
                }
            }
        }
    }
}
