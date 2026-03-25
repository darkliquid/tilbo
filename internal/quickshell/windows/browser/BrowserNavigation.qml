// BrowserNavigation.qml — navigation logic, history, directory/search loading, sorting.
//
// Non-visual QtObject. Owns all navigation state and data arrays.
// Emits navigationChanged() when navigation resets selection state.

import QtQuick

import "../../services"

QtObject {
    id: root

    // ── Navigation state ────────────────────────────────────────────────

    property string currentPath: "/"
    property bool   showHidden: false
    property bool   isSearchMode: false
    property var    searchChips: []
    property bool   isTrashView: false

    // ── History ─────────────────────────────────────────────────────────

    property var    _history: []
    property int    _historyIndex: -1
    readonly property bool canGoBack: _historyIndex > 0
    readonly property bool canGoForward: _historyIndex < _history.length - 1

    // ── Sorting ─────────────────────────────────────────────────────────

    property string _sortColumn: "name"
    property bool   _sortAscending: true

    // ── Data arrays ─────────────────────────────────────────────────────

    property var    dirEntries: []
    property var    searchResults: []
    property var    trashEntries: []

    readonly property var activeEntries: isSearchMode ? searchResults : dirEntries

    // ── External dependency ─────────────────────────────────────────────

    property var    places: []   // bound from sidebar, needed by goHome()

    // ── Signals ─────────────────────────────────────────────────────────

    signal navigationChanged()

    // ── Navigation functions ────────────────────────────────────────────

    function navigateTo(path) {
        if (!path || path === "") return
        isSearchMode = false
        isTrashView  = false
        searchChips  = []
        navigationChanged()

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
        navigationChanged()
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
        navigationChanged()
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
        navigationChanged()
        _loadTrash()
    }

    // ── Sorting ─────────────────────────────────────────────────────────

    function _sortEntries(arr) {
        if (!arr) return []
        var col = root._sortColumn
        var asc = root._sortAscending
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

    // ── Directory / Trash loading ───────────────────────────────────────

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
                dirEntries = dirEntries.map(function(e) {
                    return Object.assign({}, e, { tags: byPath[e.path] || [] })
                })
            })
        })
    }

    function _loadTrash() {
        TilboDaemon.listTrash(function(entries, err) {
            if (err) { trashEntries = []; return }
            trashEntries = _sortEntries(entries)
        })
    }

    // ── Search ──────────────────────────────────────────────────────────

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

    // ── Tag helpers ─────────────────────────────────────────────────────

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
}
