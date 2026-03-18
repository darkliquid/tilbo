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
    color: Theme.bgDark

    // ── State ─────────────────────────────────────────────────────────────

    property string currentPath: "/"
    property bool   showHidden: false
    property bool   isGridView: true
    property bool   isSearchMode: false
    property var    searchChips: []

    // Currently selected file object {name, path, isDir, size, mtime, tags, ...}
    property var    selectedFile: null
    property var    selectedFileMeta: null   // metadata map from daemon
    property var    selectedPaths: []

    property string _sortColumn: "name"
    property bool   _sortAscending: true

    property bool   showLeftSidebar: true
    property bool   showRightSidebar: false
    property bool   pathEditMode: false

    property bool   _useInlineThumbnails: false
    property int    _gridIconSize: 48

    // Model arrays (plain JS objects — no QAbstractItemModel needed)
    property var    dirEntries: []   // [{name,path,isDir,size,mtime,mode,hidden,tags}]
    property var    searchResults: []
    property var    places: []
    property var    mounts: []
    property var    savedSearches: []

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
        _loadMounts()
        _loadSavedSearches()
        navigateTo(currentPath)
        TilboDaemon.getBrowserConfig(function(cfg, _err) {
            if (cfg) {
                _keybindings = cfg.keybindings || {}
                _useTrash = cfg.useTrash !== undefined ? cfg.useTrash : true
                _useInlineThumbnails = cfg.inlineThumbnails !== undefined ? cfg.inlineThumbnails : false
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
        selectedPaths = []
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
        selectedPaths = []
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
        selectedPaths = []
        showRightSidebar = false
        currentPath = path
        _loadDirectory(path)
    }

    function goUp() {
        if (currentPath === "/") return
        var lastSlash = currentPath.lastIndexOf("/")
        var parent = currentPath.substring(0, lastSlash)
        if (parent === "") parent = "/"
        navigateTo(parent)
    }

    function goHome() {
        // We'll rely on the daemon to tell us HOME if needed, but usually we can just ask JS environment
        // or a common path. Tilbo stores config in user config dir, so let's assume ~ exists.
        // Actually, let's just use /home/user or whatever is in environment if possible.
        // For now, let's just navigate to "/" if we don't know HOME, or we can add a way to get it.
        // TilboDaemon could provide it. Let's assume most users want their home dir.
        // For now, let's jump to "/" as a placeholder or we can use a known path.
        // Better: add a GetHome call to the daemon? No, let's just use a simple approach.
        // Most linux users have /home/username. 
        // We'll just hardcode "~" and see if Qt.openUrlExternally handles it? No, we need a path.
        // Let's just go to "/" for now until we have a better way to get $HOME.
        // Actually, places usually contains Home.
        for (var i = 0; i < places.length; i++) {
            if (places[i].name === "Home") {
                navigateTo(places[i].path)
                return
            }
        }
        navigateTo("/")
    }

    function navigateToTrash() {
        isSearchMode = false
        isTrashView  = true
        searchChips  = []
        selectedFile = null
        selectedPaths = []
        showRightSidebar = false
        _loadTrash()
    }

    function _sortEntries(arr) {
        if (!arr) return []
        var col = window._sortColumn
        var asc = window._sortAscending
        return arr.slice().sort(function(a, b) {
            // Folders always first
            if (a.isDir && !b.isDir) return -1
            if (!a.isDir && b.isDir) return 1

            var valA, valB
            if (col === "name") {
                valA = a.name.toLowerCase(); valB = b.name.toLowerCase()
            } else if (col === "size") {
                valA = a.size; valB = b.size
            } else if (col === "mtime") {
                valA = a.mtime; valB = b.mtime
            } else if (col === "tags") {
                valA = (a.tags || []).join(","); valB = (b.tags || []).join(",")
            } else {
                valA = a.name.toLowerCase(); valB = b.name.toLowerCase()
            }

            if (valA < valB) return asc ? -1 : 1
            if (valA > valB) return asc ? 1 : -1
            return 0
        })
    }

    function _loadTrash() {
        TilboDaemon.listTrash(function(entries, err) {
            if (err) { trashEntries = []; return }
            trashEntries = _sortEntries(entries)
        })
    }

    function _loadDirectory(path) {
        TilboDaemon.listDirectory(path, showHidden, function(entries, err) {
            if (err) {
                console.warn("tilbo: listDirectory error:", err)
                dirEntries = []
                return
            }
            dirEntries = _sortEntries(entries)
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

    function _loadMounts() {
        TilboDaemon.listMounts(function(ms, err) {
            if (!err) mounts = ms || []
        })
    }

    function _loadSavedSearches() {
        TilboDaemon.listSavedSearches(function(ss, err) {
            if (!err) savedSearches = ss || []
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
        var metaFilters = {}
        var allowHid  = showHidden

        for (var i = 0; i < chips.length; i++) {
            var c = chips[i]
            if (c.startsWith("glob:"))    globPats.push(c.slice(5))
            else if (c === "hidden:any") allowHid = true
            else if (c.startsWith("fts:")) ftsChips.push(c.slice(4))
            else if (c.startsWith("meta:")) {
                var pair = c.slice(5).split("=")
                if (pair.length === 2) {
                    metaFilters[pair[0]] = pair[1]
                }
            }
            else                          tagChips.push(c)
        }

        if (tagChips.length > 0 || ftsChips.length > 0 || Object.keys(metaFilters).length > 0) {
            TilboDaemon.search(
                tagChips, false, [], metaFilters, ftsChips.join(" "), 1000, 0, [],
                function(res, err) {
                    if (!err && res && res.files.length > 0) {
                        searchResults = _sortEntries(res.files)
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
            searchResults = err ? [] : _sortEntries(files)
        })
    }

    // ── File selection & metadata ─────────────────────────────────────────

    function selectFile(fileData) {
        selectedFile     = fileData
        selectedFileMeta = null

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
        var targets = window.selectedPaths.length > 0 ? window.selectedPaths : (window.selectedFile ? [window.selectedFile.path] : [])
        if (targets.length === 0) return

        targets.forEach(path => {
            TilboDaemon.deleteFile(path, function(err) {
                if (err) { console.warn("delete:", err); return }
                if (window.selectedFile && window.selectedFile.path === path)
                    window.selectedFile = null
                if (window.selectedPaths.indexOf(path) !== -1) {
                    var newPaths = window.selectedPaths.slice()
                    newPaths.splice(newPaths.indexOf(path), 1)
                    window.selectedPaths = newPaths
                }
                if (window.isTrashView) _loadTrash()
                else _loadDirectory(window.currentPath)
            })
        })
    }

    function _permanentDeleteSelected() {
        var targets = window.selectedPaths.length > 0 ? window.selectedPaths : (window.selectedFile ? [window.selectedFile.path] : [])
        if (targets.length === 0) return

        targets.forEach(path => {
            TilboDaemon.deleteFile(path, function(err) {
                if (err) { console.warn("permanent delete:", err); return }
                if (window.selectedFile && window.selectedFile.path === path)
                    window.selectedFile = null
                if (window.selectedPaths.indexOf(path) !== -1) {
                    var newPaths = window.selectedPaths.slice()
                    newPaths.splice(newPaths.indexOf(path), 1)
                    window.selectedPaths = newPaths
                }
                if (window.isTrashView) _loadTrash()
                else _loadDirectory(window.currentPath)
            })
        })
    }

    function _copySelected(isMove) {
        var targets = window.selectedPaths.length > 0 ? window.selectedPaths : (window.selectedFile ? [window.selectedFile.path] : [])
        if (targets.length === 0) return

        TilboDaemon.copy(targets, isMove, function(err) {
            if (err) { console.warn("copy:", err); return }
            // Sync with system clipboard (best effort)
            var pathsStr = targets.join("\n")
            var cmd = Qt.createQmlObject(
                'import QtQuick; SystemCommand { command: "bash"; arguments: ["-c", "echo \\"' + pathsStr + '\\" | (wl-copy --type text/uri-list || xclip -selection clipboard -t text/uri-list)"] }',
                window, "clipCmd")
        })
    }

    function _paste() {
        if (window.isTrashView || window.isSearchMode) return
        TilboDaemon.paste(window.currentPath, function(res, err) {
            if (err) { console.warn("paste:", err); return }
            _loadDirectory(window.currentPath)
        })
    }

    function _createNew(isDir) {
        if (window.isTrashView || window.isSearchMode) return
        var defaultName = isDir ? "New Folder" : "New File"
        // TODO: ideally we'd show an inline editor, but for now let's just create and refresh.
        // The user can then rename it.
        if (isDir) {
            TilboDaemon.createDirectory(window.currentPath, defaultName, function(res, err) {
                if (err) { console.warn("mkdir:", err); return }
                _loadDirectory(window.currentPath)
            })
        } else {
            TilboDaemon.createFile(window.currentPath, defaultName, function(res, err) {
                if (err) { console.warn("touch:", err); return }
                _loadDirectory(window.currentPath)
            })
        }
    }

    function zoomIn() {
        if (window._gridIconSize < 256) window._gridIconSize += 16
    }
    function zoomOut() {
        if (window._gridIconSize > 32) window._gridIconSize -= 16
    }
    function zoomReset() {
        window._gridIconSize = 48
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
        sequence: "Alt+Up"
        onActivated: window.goUp()
    }
    Shortcut {
        sequence: "Alt+Home"
        onActivated: window.goHome()
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
            if (window.selectedFile || window.selectedPaths.length > 0) window._deleteSelected()
        }
    }
    Shortcut {
        sequence: "Shift+Delete"
        onActivated: {
            if (window.selectedFile || window.selectedPaths.length > 0) window._permanentDeleteSelected()
        }
    }
    Shortcut {
        sequence: "Ctrl+C"
        onActivated: window._copySelected(false)
    }
    Shortcut {
        sequence: "Ctrl+X"
        onActivated: window._copySelected(true)
    }
    Shortcut {
        sequence: "Ctrl+V"
        onActivated: window._paste()
    }
    Shortcut {
        sequence: "Ctrl+Shift+N"
        onActivated: window._createNew(true)
    }
    Shortcut {
        sequence: "Ctrl++"
        onActivated: window.zoomIn()
    }
    Shortcut {
        sequence: "Ctrl+="
        onActivated: window.zoomIn()
    }
    Shortcut {
        sequence: "Ctrl+-"
        onActivated: window.zoomOut()
    }
    Shortcut {
        sequence: "Ctrl+0"
        onActivated: window.zoomReset()
    }

    header: ToolBar {
        background: Rectangle { color: Theme.bgLight }
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
                color: Theme.accent
                leftPadding: 8
            }

            // Back / Forward buttons (Feature 1)
            ToolButton {
                text: "←"
                font.pixelSize: 16
                enabled: window.canGoBack
                opacity: enabled ? 1.0 : 0.4
                onClicked: window.goBack()
                ToolTip.text: I18n.tr("toolbar.back")
                ToolTip.visible: hovered
                ToolTip.delay: 500
            }

            ToolButton {
                text: "→"
                font.pixelSize: 16
                enabled: window.canGoForward
                opacity: enabled ? 1.0 : 0.4
                onClicked: window.goForward()
                ToolTip.text: I18n.tr("toolbar.forward")
                ToolTip.visible: hovered
                ToolTip.delay: 500
            }

            ToolButton {
                text: "↑"
                font.pixelSize: 16
                enabled: window.currentPath !== "/"
                opacity: enabled ? 1.0 : 0.4
                onClicked: window.goUp()
                ToolTip.text: I18n.tr("toolbar.up")
                ToolTip.visible: hovered
                ToolTip.delay: 500
            }

            ToolButton {
                text: "🏠"
                font.pixelSize: 16
                onClicked: window.goHome()
                ToolTip.text: I18n.tr("toolbar.home")
                ToolTip.visible: hovered
                ToolTip.delay: 500
            }

            TagSearchBar {
                id: tagSearchBar
                Layout.fillWidth: true
                Layout.preferredHeight: 40
                daemonConnected: window.daemonConnected
                onSearchRequested: chips => window.executeSearch(chips)
                onFilterRequested: filterDialog.open()
            }

            ThemeButton {
                text: I18n.tr("toolbar.pin")
                Layout.preferredHeight: 40
                visible: window.isSearchMode
                onClicked: pinSearchDialog.open()
                ToolTip.text: "Pin this search to sidebar"
                ToolTip.visible: hovered
            }

            Dialog {
                id: pinSearchDialog
                title: I18n.tr("search.pin_title")
                modal: true
                standardButtons: Dialog.Ok | Dialog.Cancel
                anchors.centerIn: parent
                onAccepted: {
                    var name = pinSearchNameField.text.trim() || "New Search"
                    TilboDaemon.pinSearch(name, window.searchChips, "folder-saved-search", function(err) {
                        if (!err) window._loadSavedSearches()
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

            Dialog {
                id: filterDialog
                title: I18n.tr("search.filter_title")
                modal: true
                standardButtons: Dialog.Cancel
                anchors.centerIn: parent
                width: 300

                ColumnLayout {
                    width: parent.width
                    spacing: 12

                    Text { text: I18n.tr("search.filter.mime"); color: Theme.accent; font.bold: true }
                    Flow {
                        Layout.fillWidth: true; spacing: 4
                        Button { text: I18n.tr("search.filter.images"); onClicked: { tagSearchBar.addChip("glob:*.{jpg,jpeg,png,gif,webp}"); filterDialog.close() } }
                        Button { text: I18n.tr("search.filter.videos"); onClicked: { tagSearchBar.addChip("glob:*.{mp4,mkv,avi,mov}"); filterDialog.close() } }
                        Button { text: I18n.tr("search.filter.docs"); onClicked: { tagSearchBar.addChip("glob:*.{pdf,doc,docx,txt,odt}"); filterDialog.close() } }
                    }

                    Text { text: I18n.tr("search.filter.size"); color: Theme.accent; font.bold: true }
                    Flow {
                        Layout.fillWidth: true; spacing: 4
                        Button { text: "> 10MB"; onClicked: { tagSearchBar.addChip("fts:size > 10485760"); filterDialog.close() } }
                        Button { text: "> 100MB"; onClicked: { tagSearchBar.addChip("fts:size > 104857600"); filterDialog.close() } }
                        Button { text: "> 1GB"; onClicked: { tagSearchBar.addChip("fts:size > 1073741824"); filterDialog.close() } }
                    }

                    Text { text: I18n.tr("search.filter.date"); color: Theme.accent; font.bold: true }
                    Flow {
                        Layout.fillWidth: true; spacing: 4
                        Button { text: I18n.tr("search.filter.2026"); onClicked: { tagSearchBar.addChip("fts:mtime > 1767225600"); filterDialog.close() } }
                    }
                }
            }

            ThemeButton {
                text: window.isGridView ? I18n.tr("toolbar.view.list") : I18n.tr("toolbar.view.grid")
                Layout.preferredHeight: 40
                onClicked: window.isGridView = !window.isGridView
            }

            ThemeButton {
                text: I18n.tr("toolbar.hidden")
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
            color: Theme.bgMedium

            Rectangle {
                anchors.fill: parent
                color: maLeftToggle.containsMouse ? Theme.bgHover : "transparent"
            }

            Text {
                text: I18n.tr("sidebar.places")
                color: Theme.accent
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
            color: Theme.bgMedium
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
                    visible: window.mounts.length > 0
                }

                ListView {
                    id: mountsList
                    Layout.fillWidth: true
                    Layout.preferredHeight: Math.min(window.mounts.length * 36, 200)
                    clip: true
                    model: window.mounts
                    visible: window.mounts.length > 0

                    delegate: ItemDelegate {
                        required property var modelData
                        width: ListView.view.width
                        leftPadding: 8
                        height: 36
                        onClicked: window.navigateTo(modelData.path)
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
                    visible: window.savedSearches.length > 0
                }

                ListView {
                    id: savedSearchesList
                    Layout.fillWidth: true
                    Layout.preferredHeight: Math.min(window.savedSearches.length * 36, 200)
                    clip: true
                    model: window.savedSearches
                    visible: window.savedSearches.length > 0

                    delegate: ItemDelegate {
                        required property var modelData
                        width: ListView.view.width
                        leftPadding: 8
                        height: 36
                        onClicked: window.executeSearch(modelData.chips)
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
                            color: parent.hovered ? "#2E3440" : "transparent"
                            radius: 4
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
                            text: I18n.tr("sidebar.trash")
                            font.pixelSize: 14
                            color: window.isTrashView ? Theme.accent : Theme.fgMain
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
                            text: I18n.tr("sidebar.pin_current")
                            font.pixelSize: 12; color: Theme.accent
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
                            if (!err) window._loadPlaces()
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
                            if (!err) window._loadSavedSearches()
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
                        color: Theme.bgMedium
                        RowLayout {
                            anchors.fill: parent
                            anchors.leftMargin: 12; anchors.rightMargin: 12
                            Text {
                                text: I18n.tr("gen.trash_count", window.trashEntries.length)
                                color: Theme.accent; font.pixelSize: 14; font.bold: true
                            }
                            Item { Layout.fillWidth: true }
                            ThemeButton {
                                text: "Empty Trash"
                                isDanger: true
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

                WheelHandler {
                    acceptedModifiers: Qt.ControlModifier
                    onWheel: (event) => {
                        if (event.angleDelta.y > 0) window.zoomIn()
                        else                        window.zoomOut()
                    }
                }

                FileGrid {
                    entries: window.activeEntries
                    inlineThumbnails: window._useInlineThumbnails
                    iconSize: window._gridIconSize
                    selection: window.selectedPaths
                    onSelectionChanged: window.selectedPaths = selection
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
                    onGetThumbnail: (path, size, cb) => TilboDaemon.getThumbnail(path, size, cb)
                    onCopyRequested: isMove => window._copySelected(isMove)
                    onPasteRequested: () => window._paste()
                    onCreateFileRequested: () => window._createNew(false)
                    onCreateDirectoryRequested: () => window._createNew(true)
                }

                FileList {
                    entries: window.activeEntries
                    inlineThumbnails: window._useInlineThumbnails
                    selection: window.selectedPaths
                    sortColumn: window._sortColumn
                    sortAscending: window._sortAscending
                    onSortRequested: (col, asc) => {
                        window._sortColumn = col
                        window._sortAscending = asc
                        if (window.isTrashView) trashEntries = _sortEntries(trashEntries)
                        else if (window.isSearchMode) searchResults = _sortEntries(searchResults)
                        else dirEntries = _sortEntries(dirEntries)
                    }
                    onSelectionChanged: window.selectedPaths = selection
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
                    onGetThumbnail: (path, size, cb) => TilboDaemon.getThumbnail(path, size, cb)
                    onOpenInTerminalRequested: dir => Qt.openUrlExternally("file://" + dir)
                    onCopyRequested: isMove => window._copySelected(isMove)
                    onPasteRequested: () => window._paste()
                    onCreateFileRequested: () => window._createNew(false)
                    onCreateDirectoryRequested: () => window._createNew(true)
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
            color: Theme.bgMedium
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
                    visible: !!window.selectedFile
                    clip: true
                    ScrollBar.horizontal.policy: ScrollBar.AlwaysOff
                    contentWidth: availableWidth

                    ColumnLayout {
                        width: parent.width
                        spacing: 12

                        // Preview / Icon — shows thumbnail for media, icon for other files
                        Item {
                            Layout.alignment: Qt.AlignHCenter
                            Layout.preferredWidth: 228
                            Layout.preferredHeight: _previewImg.visible ? Math.min(_previewImg.implicitHeight * (228 / Math.max(1, _previewImg.implicitWidth)), 228) : 64

                            property string _previewSource: ""
                            property bool _isMedia: {
                                var f = window.selectedFile
                                return f && f.mimeType && (f.mimeType.indexOf("image/") === 0 || f.mimeType.indexOf("video/") === 0)
                            }

                            ThemeIcon {
                                anchors.centerIn: parent
                                width: 64; height: 64
                                iconName: window.selectedFile
                                        ? (window.selectedFile.iconName
                                           || (window.selectedFile.isDir ? "inode-directory" : "application-x-generic"))
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
                                    if (window.selectedFile) {
                                        imagePreview.filePath = window.selectedFile.path
                                        imagePreview.mimeType = window.selectedFile.mimeType || ""
                                        imagePreview.visible = true
                                    }
                                }
                            }

                            // Request large thumbnail when file changes
                            Connections {
                                target: window
                                function onSelectedFileChanged() {
                                    parent._previewSource = ""
                                    var f = window.selectedFile
                                    if (f && !f.isDir && parent._isMedia) {
                                        TilboDaemon.getThumbnail(f.path, 1, function(result, _err) {
                                            if (result && result.thumbnailPath && window.selectedFile && window.selectedFile.path === f.path)
                                                parent._previewSource = "file://" + result.thumbnailPath
                                        })
                                    }
                                }
                            }
                        }

                        // Name
                        Text {
                            Layout.fillWidth: true
                            text: window.selectedFile ? window.selectedFile.name : ""
                            color: Theme.fgMain
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

                            Text { text: "Path:";     color: Theme.accent; font.pixelSize: 13 }
                            Text {
                                text: window.selectedFile ? window.selectedFile.path : ""
                                color: Theme.fgDim; font.pixelSize: 12
                                Layout.fillWidth: true; elide: Text.ElideMiddle
                            }

                            Text { text: "Size:";     color: Theme.accent; font.pixelSize: 13 }
                            Text {
                                text: window.selectedFile
                                      ? (window.selectedFile.isDir ? "--"
                                         : (window.selectedFile.size / 1024).toFixed(1) + " KB")
                                      : ""
                                color: Theme.fgDim; font.pixelSize: 13
                                Layout.fillWidth: true; elide: Text.ElideRight
                            }

                            Text { text: "Modified:"; color: Theme.accent; font.pixelSize: 13 }
                            Text {
                                text: window.selectedFile && window.selectedFile.mtime
                                      ? new Date(window.selectedFile.mtime * 1000)
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
                            visible: window.selectedFileMeta !== null
                                     && Object.keys(window.selectedFileMeta || {}).length > 0
                        }

                        Rectangle {
                            Layout.fillWidth: true
                            Layout.preferredHeight: 220
                            visible: window.selectedFileMeta !== null
                                     && Object.keys(window.selectedFileMeta || {}).length > 0
                            color: Theme.bgInput
                            border.color: Theme.border; border.width: 1; radius: 6

                            Column {
                                anchors.fill: parent; anchors.margins: 8; spacing: 6

                                Text {
                                    text: "Metadata (" + Object.keys(window.selectedFileMeta || {}).length + ")"
                                    color: Theme.accent; font.pixelSize: 13; font.bold: true
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
                                            color: Theme.accent; font.pixelSize: 11
                                            elide: Text.ElideRight
                                        }
                                        Text {
                                            text: (window.selectedFileMeta && window.selectedFileMeta[parent.modelData])
                                                  ? window.selectedFileMeta[parent.modelData] : ""
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

        // Right strip toggle
        Rectangle {
            Layout.preferredWidth: 36
            Layout.fillHeight: true
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
                        color: Theme.fgDim
                        background: Rectangle {
                            color: Theme.bgInput; radius: 4; border.width: 1
                            border.color: parent.activeFocus ? Theme.borderFocus : Theme.border
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
                    color: editMouse.containsMouse ? Theme.accent : Theme.fgDim
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

    // ── Fullsize image preview overlay ────────────────────────────────────
    ImagePreview {
        id: imagePreview
    }
}
