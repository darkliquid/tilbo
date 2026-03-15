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

    // ── Daemon connection ─────────────────────────────────────────────────

    property bool daemonConnected: TilboDaemon.connected

    Connections {
        target: TilboDaemon

        function onDaemonStateChanged(state) {
            window.daemonConnected = TilboDaemon.connected
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
    }

    // ── Navigation ────────────────────────────────────────────────────────

    function navigateTo(path) {
        if (!path || path === "") return
        isSearchMode = false
        searchChips  = []
        currentPath  = path
        selectedFile = null
        showRightSidebar = false
        _loadDirectory(path)
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

    header: ToolBar {
        background: Rectangle { color: "#22252E" }
        height: 60
        RowLayout {
            anchors.fill: parent
            anchors.leftMargin: 16
            anchors.rightMargin: 16
            spacing: 16

            Label {
                text: "tilbo"
                font.pixelSize: 20
                font.bold: true
                color: "#88C0D0"
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
                    else                     _loadDirectory(window.currentPath)
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
                anchors.margins: 16
                spacing: 12
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
                        width: ListView.view.width
                        leftPadding: 12
                        rightPadding: 12 + (placesScrollBar.visible ? placesScrollBar.width + 8 : 0)
                        text: modelData.name
                        onClicked: window.navigateTo(modelData.path)
                        contentItem: Text {
                            text: parent.text
                            font.pixelSize: 14
                            color: "#ECEFF4"
                        }
                        background: Rectangle {
                            x: 8
                            width: parent.width - 16
                                   - (placesScrollBar.visible ? placesScrollBar.width + 8 : 0)
                            color: parent.hovered ? "#2E3440" : "transparent"
                            radius: 4
                        }
                    }
                }
            }
        }

        // Main file area
        Rectangle {
            Layout.fillWidth: true
            Layout.fillHeight: true
            color: "#111419"

            StackLayout {
                anchors.fill: parent
                currentIndex: window.isGridView ? 0 : 1

                FileGrid {
                    entries: window.activeEntries
                    onFileSelected: fileData => window.selectFile(fileData)
                    onDirectoryActivated: path => window.navigateTo(path)
                    onFileOpenRequested: path => {
                        // xdg-open via daemon is not exposed; keep it local for now.
                        // Phase 4 can wire daemon.OpenFile if needed.
                        Qt.openUrlExternally("file://" + path)
                    }
                    onRenameRequested: (path, newName) => {
                        TilboDaemon.renameFile(path, newName, function(newPath, err) {
                            if (err) { console.warn("rename:", err); return }
                            _loadDirectory(window.currentPath)
                        })
                    }
                    onDeleteRequested: path => {
                        TilboDaemon.deleteFile(path, function(err) {
                            if (err) { console.warn("delete:", err); return }
                            if (window.selectedFile && window.selectedFile.path === path) {
                                window.selectedFile = null
                            }
                            _loadDirectory(window.currentPath)
                        })
                    }
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
                        Rectangle {
                            Layout.alignment: Qt.AlignHCenter
                            Layout.preferredWidth: 64
                            Layout.preferredHeight: 64
                            radius: 8
                            color: window.selectedFile && window.selectedFile.isDir
                                   ? "#4A90E2" : "#555A64"
                            Text {
                                anchors.centerIn: parent
                                text: window.selectedFile && window.selectedFile.isDir
                                      ? "📁" : "📄"
                                font.pixelSize: 32
                            }
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
