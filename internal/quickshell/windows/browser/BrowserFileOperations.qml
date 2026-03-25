// BrowserFileOperations.qml — file selection, clipboard, delete, create, zoom, drag-drop.
//
// Non-visual QtObject. Owns selection state and file manipulation functions.
// Emits refreshNeeded()/trashRefreshNeeded() instead of calling load functions directly.

import QtQuick

import "../../services"

QtObject {
    id: root

    // ── External bindings (set by orchestrator) ─────────────────────────

    property string currentPath: "/"
    property bool   isTrashView: false
    property bool   isSearchMode: false

    // ── Selection state ─────────────────────────────────────────────────

    property var    selectedFile: null
    property var    selectedFileMeta: null
    property var    selectedPaths: []
    property bool   selectionMode: false

    // ── Display settings ────────────────────────────────────────────────

    property int    _gridIconSize: 48
    property bool   _useInlineThumbnails: false

    // ── Signals ─────────────────────────────────────────────────────────

    signal refreshNeeded()
    signal trashRefreshNeeded()

    // ── Selection ───────────────────────────────────────────────────────

    function selectFile(fileData) {
        selectedFile     = fileData
        selectedFileMeta = null

        if (!fileData) return

        TilboDaemon.statFile(fileData.path, function(stat, _err) {
            if (stat && root.selectedFile && root.selectedFile.path === fileData.path) {
                root.selectedFile = Object.assign({}, root.selectedFile,
                    { size: stat.size, mtime: stat.mtime })
            }
        })
        TilboDaemon.getMetadata(fileData.path, function(res, _err) {
            if (res && root.selectedFile && root.selectedFile.path === fileData.path) {
                root.selectedFileMeta = res.metadata || {}
            }
        })
    }

    function clearSelection() {
        selectedFile = null
        selectedFileMeta = null
        selectedPaths = []
    }

    // ── Delete ──────────────────────────────────────────────────────────

    function deleteSelected() {
        var targets = selectedPaths.length > 0
            ? selectedPaths
            : (selectedFile ? [selectedFile.path] : [])
        if (targets.length === 0) return

        targets.forEach(function(path) {
            TilboDaemon.deleteFile(path, function(err) {
                if (err) { console.warn("delete:", err); return }
                if (root.selectedFile && root.selectedFile.path === path)
                    root.selectedFile = null
                if (root.selectedPaths.indexOf(path) !== -1) {
                    var newPaths = root.selectedPaths.slice()
                    newPaths.splice(newPaths.indexOf(path), 1)
                    root.selectedPaths = newPaths
                }
                if (root.isTrashView) root.trashRefreshNeeded()
                else root.refreshNeeded()
            })
        })
    }

    function permanentDeleteSelected() {
        var targets = selectedPaths.length > 0
            ? selectedPaths
            : (selectedFile ? [selectedFile.path] : [])
        if (targets.length === 0) return

        targets.forEach(function(path) {
            TilboDaemon.deleteFile(path, function(err) {
                if (err) { console.warn("permanent delete:", err); return }
                if (root.selectedFile && root.selectedFile.path === path)
                    root.selectedFile = null
                if (root.selectedPaths.indexOf(path) !== -1) {
                    var newPaths = root.selectedPaths.slice()
                    newPaths.splice(newPaths.indexOf(path), 1)
                    root.selectedPaths = newPaths
                }
                if (root.isTrashView) root.trashRefreshNeeded()
                else root.refreshNeeded()
            })
        })
    }

    // ── Clipboard ───────────────────────────────────────────────────────

    function copySelected(isMove) {
        var targets = selectedPaths.length > 0
            ? selectedPaths
            : (selectedFile ? [selectedFile.path] : [])
        if (targets.length === 0) return

        TilboDaemon.copy(targets, isMove, function(err) {
            if (err) { console.warn("copy:", err); return }
        })
    }

    function paste() {
        if (isTrashView || isSearchMode) return
        TilboDaemon.paste(currentPath, function(res, err) {
            if (err) { console.warn("paste:", err); return }
            root.refreshNeeded()
        })
    }

    // ── Create ──────────────────────────────────────────────────────────

    function createNew(isDir) {
        if (isTrashView || isSearchMode) return
        var defaultName = isDir ? "New Folder" : "New File"
        if (isDir) {
            TilboDaemon.createDirectory(currentPath, defaultName, function(res, err) {
                if (err) { console.warn("mkdir:", err); return }
                root.refreshNeeded()
            })
        } else {
            TilboDaemon.createFile(currentPath, defaultName, function(res, err) {
                if (err) { console.warn("touch:", err); return }
                root.refreshNeeded()
            })
        }
    }

    // ── Drag & Drop ─────────────────────────────────────────────────────

    function handleFilesDropped(urls, targetPath, isCopy) {
        var paths = urls.map(function(u) {
            var s = u.toString()
            if (s.indexOf("file://") === 0) return s.substring(7)
            return s
        })
        var dest = targetPath || currentPath

        TilboDaemon.copy(paths, !isCopy, function(err) {
            if (err) { console.warn("drop error:", err); return }
            TilboDaemon.paste(dest, function(res, err2) {
                if (err2) { console.warn("paste error:", err2); return }
                root.refreshNeeded()
            })
        })
    }

    // ── Zoom ────────────────────────────────────────────────────────────

    function zoomIn() {
        if (_gridIconSize < 256) _gridIconSize += 16
    }
    function zoomOut() {
        if (_gridIconSize > 32) _gridIconSize -= 16
    }
    function zoomReset() {
        _gridIconSize = 48
    }
}
