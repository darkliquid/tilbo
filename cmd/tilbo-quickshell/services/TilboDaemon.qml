// TilboDaemon.qml — JSON socket service layer for the tilbo daemon.
pragma Singleton

import Quickshell
import Quickshell.Io
import QtQuick

Singleton {
    id: root

    // ── Socket path ───────────────────────────────────────────────────────
    readonly property string _socketPath: {
        var rt = Quickshell.env("XDG_RUNTIME_DIR")
        return (rt && rt.length > 0 ? rt : "/run/user/" + Quickshell.env("UID")) + "/tilbo.sock"
    }

    // ── Connection state ──────────────────────────────────────────────────
    readonly property bool connected: _socket.connected

    // ── Signals forwarded from the daemon ────────────────────────────────
    signal fileTagged(string path, var added, var removed)
    signal indexUpdated(var filesTotal, var tagsTotal)
    signal daemonStateChanged(string state)
    signal showWindow(string path)

    // ── Internal: pending call registry ──────────────────────────────────
    property var   _pending: ({})   // string(id) → callback(result, err)
    property int   _nextID:  1

    // ── Socket ────────────────────────────────────────────────────────────
    Socket {
        id: _socket
        path: root._socketPath
        connected: true

        parser: SplitParser {
            onRead: line => root._handleLine(line)
        }

        onConnectionStateChanged: {
            if (!_socket.connected) {
                var pending = root._pending
                root._pending = {}
                for (var id in pending) {
                    pending[id](null, "daemon disconnected")
                }
                _reconnectTimer.restart()
            }
        }
    }

    Timer {
        id: _reconnectTimer
        interval: 3000
        repeat: false
        onTriggered: _socket.connected = true
    }

    // ── Frame handling ────────────────────────────────────────────────────
    function _handleLine(line) {
        if (!line || line.trim() === "") return
        var msg
        try { msg = JSON.parse(line) } catch (_e) { return }

        if (msg.event !== undefined) {
            var ev = msg.event
            if (ev.fileTagged) {
                root.fileTagged(ev.fileTagged.path || "", ev.fileTagged.added || [], ev.fileTagged.removed || [])
            } else if (ev.indexUpdated) {
                root.indexUpdated(Number(ev.indexUpdated.filesTotal || 0), Number(ev.indexUpdated.tagsTotal || 0))
            } else if (ev.daemonStateChanged) {
                root.daemonStateChanged(ev.daemonStateChanged.state || "")
            } else if (ev.showWindow) {
                root.showWindow(ev.showWindow.path || "")
            }
            return
        }

        if (msg.requestId !== undefined) {
            var id = String(msg.requestId)
            var cb = root._pending[id]
            if (!cb) return
            delete root._pending[id]

            var resp = msg.response || {}
            if (resp.error) {
                cb(null, resp.error.message || "unknown error")
            } else {
                cb(resp, null)
            }
        }
    }

    // ── Private: send a call frame ────────────────────────────────────────
    function _call(requestPayload, callback) {
        var id = String(root._nextID++)
        root._pending[id] = callback
        var envelope = {
            requestId: id,
            request: requestPayload
        }
        var frame = JSON.stringify(envelope) + "\n"
        _socket.write(frame)
        _socket.flush()
    }

    // ── Public API ────────────────────────────────────────────────────────

    function listDirectory(path, hidden, callback) {
        _call({ listDirectory: { path: path, hidden: hidden } }, function(resp, err) {
            if (err) { callback([], err); return }
            var entries = (resp.listDirectory && resp.listDirectory.entries) ? resp.listDirectory.entries : []
            callback(entries.map(e => ({
                name: e.name,
                path: e.path,
                isDir: e.isDir,
                size: Number(e.sizeBytes || 0),
                mtime: Number(e.mtime || 0),
                mode: e.mode,
                hidden: e.hidden,
                mimeType: e.mimeType || "",
                iconName: e.iconName || (e.isDir ? "inode-directory" : "application-x-generic"),
                isLink: !!e.isLink,
                linkTarget: e.linkTarget || "",
                tags: []
            })), null)
        })
    }

    function statFile(path, callback) {
        _call({ statFile: { path: path } }, function(resp, err) {
            if (err) { callback(null, err); return }
            var s = resp.statFile ? resp.statFile.stat : {}
            callback({ size: Number(s.sizeBytes || 0), mtime: Number(s.mtime || 0), mode: s.mode || 0 }, null)
        })
    }

    function search(tags, tagsAny, tagExclude, metaFilters, ftsQuery, limit, offset, sortBy, callback) {
        _call({
            search: {
                tags: tags || [],
                tagsAny: tagsAny || false,
                tagExclude: tagExclude || [],
                metaFilters: metaFilters || {},
                ftsQuery: ftsQuery || "",
                limit: limit || 50,
                offset: offset || 0,
                sortBy: sortBy || []
            }
        }, function(resp, err) {
            if (err) { callback(null, err); return }
            var s = resp.search || {}
            var files = (s.files || []).map(f => ({
                path: f.path,
                tags: f.tags || [],
                metadata: f.metadata || {},
                score: f.score || 0,
                mtime: Number(f.mtime || 0),
                size: Number(f.sizeBytes || 0),
                name: String(f.path).split("/").pop(),
                isDir: false,
                isLink: !!f.isLink,
                linkTarget: f.linkTarget || ""
            }))
            callback({ files: files, total: Number(s.total || 0) }, null)
        })
    }

    function globSearch(patterns, limit, allowHidden, callback) {
        _call({ globSearch: { patterns: patterns || [], limit: limit || 1000, allowHidden: allowHidden || false } }, function(resp, err) {
            if (err) { callback([], err); return }
            var files = (resp.globSearch && resp.globSearch.files) ? resp.globSearch.files : []
            callback(files.map(f => ({
                path: f.path,
                tags: f.tags || [],
                metadata: f.metadata || {},
                score: f.score || 0,
                mtime: Number(f.mtime || 0),
                size: Number(f.sizeBytes || 0),
                name: String(f.path).split("/").pop(),
                isDir: false,
                isLink: !!f.isLink,
                linkTarget: f.linkTarget || ""
            })), null)
        })
    }

    function getMetadata(path, callback) {
        _call({ metadata: { path: path } }, function(resp, err) {
            if (err) { callback(null, err); return }
            var m = resp.metadata || {}
            callback({ metadata: m.metadata || {}, sources: m.sources || {} }, null)
        })
    }

    function setMetadata(path, key, value, callback) {
        _call({ metadataSet: { path: path, key: key, value: value || "" } }, function(_resp, err) {
            if (callback) callback(err)
        })
    }

    function modifyTags(paths, tags, operation, callback) {
        var opMap = { "add": "TAG_OPERATION_ADD", "remove": "TAG_OPERATION_REMOVE", "set": "TAG_OPERATION_SET" }
        var opStr = opMap[operation] || "TAG_OPERATION_UNSPECIFIED"
        _call({ tag: { paths: paths || [], tags: tags || [], operation: opStr } }, function(resp, err) {
            if (err) { callback(null, err); return }
            var t = resp.tag || {}
            callback({ pathsOK: t.pathsOk || [], pathsError: t.pathsError || [], errors: t.errors || {} }, null)
        })
    }

    function hydrateTags(paths, callback) {
        _call({ hydrateTags: { paths: paths || [] } }, function(resp, err) {
            if (err) { callback([], err); return }
            var entries = (resp.hydrateTags && resp.hydrateTags.entries) ? resp.hydrateTags.entries : []
            callback(entries.map(e => ({ path: e.path, tags: e.tags || [] })), null)
        })
    }

    function listTags(prefix, callback) {
        _call({ listTags: { prefix: prefix || "" } }, function(resp, err) {
            if (err) { callback([], err); return }
            callback((resp.listTags && resp.listTags.tags) ? resp.listTags.tags : [], null)
        })
    }

    function renameFile(path, newName, callback) {
        _call({ renameFile: { path: path, newName: newName } }, function(resp, err) {
            if (callback) callback(resp && resp.renameFile ? resp.renameFile.newPath : "", err)
        })
    }

    function deleteFile(path, callback) {
        _call({ deleteFile: { path: path } }, function(_resp, err) {
            if (callback) callback(err)
        })
    }

    function chmodFile(path, mode, callback) {
        _call({ chmodFile: { path: path, mode: mode } }, function(_resp, err) {
            if (callback) callback(err)
        })
    }

    function listPlaces(callback) {
        _call({ listPlaces: {} }, function(resp, err) {
            if (err) { callback([], err); return }
            var places = (resp.listPlaces && resp.listPlaces.places) ? resp.listPlaces.places : []
            callback(places.map(p => ({
                name: p.name,
                path: p.path,
                pinned: !!p.pinned,
                iconName: p.iconName || "folder"
            })), null)
        })
    }

    function pinPlace(name, path, iconName, callback) {
        _call({ pinPlace: { name: name, path: path, iconName: iconName || "folder" } }, function(_resp, err) {
            if (callback) callback(err)
        })
    }

    function unpinPlace(path, callback) {
        _call({ unpinPlace: { path: path } }, function(_resp, err) {
            if (callback) callback(err)
        })
    }

    function trashFile(path, callback) {
        _call({ trashFile: { path: path } }, function(_resp, err) {
            if (callback) callback(err)
        })
    }

    function listTrash(callback) {
        _call({ listTrash: {} }, function(resp, err) {
            if (err) { callback([], err); return }
            var entries = (resp.listTrash && resp.listTrash.entries) ? resp.listTrash.entries : []
            callback(entries.map(e => ({
                name: e.name,
                originalPath: e.originalPath || "",
                deletionDate: Number(e.deletionDate || 0),
                sizeBytes: Number(e.sizeBytes || 0)
            })), null)
        })
    }

    function restoreTrash(trashName, callback) {
        _call({ restoreTrash: { trashName: trashName } }, function(_resp, err) {
            if (callback) callback(err)
        })
    }

    function emptyTrash(callback) {
        _call({ emptyTrash: {} }, function(_resp, err) {
            if (callback) callback(err)
        })
    }

    function listAppsForFile(path, callback) {
        _call({ listAppsForFile: { path: path } }, function(resp, err) {
            if (err) { callback([], err); return }
            var apps = (resp.listAppsForFile && resp.listAppsForFile.apps) ? resp.listAppsForFile.apps : []
            callback(apps.map(a => ({ id: a.id, name: a.name, iconName: a.iconName || "" })), null)
        })
    }

    function openWithApp(path, appId, callback) {
        _call({ openWithApp: { path: path, appId: appId } }, function(_resp, err) {
            if (callback) callback(err)
        })
    }

    function getBrowserConfig(callback) {
        _call({ getBrowserConfig: {} }, function(resp, err) {
            if (err) { callback(null, err); return }
            var cfg = resp.getBrowserConfig || {}
            callback({
                keybindings: cfg.keybindings || {},
                useTrash: !!cfg.useTrash,
                inlineThumbnails: cfg.inlineThumbnails !== undefined ? !!cfg.inlineThumbnails : true,
                autoPropertiesSlideout: !!cfg.autoPropertiesSlideout,
                theme: cfg.theme || ""
            }, null)
        })
    }

    function getFileBadges(path, callback) {
        _call({ getFileBadges: { path: path } }, function(resp, err) {
            if (err) { callback([], err); return }
            callback((resp.getFileBadges && resp.getFileBadges.badges) ? resp.getFileBadges.badges : [], null)
        })
    }

    function getFileActions(path, callback) {
        _call({ getFileActions: { path: path } }, function(resp, err) {
            if (err) { callback([], err); return }
            var actions = (resp.getFileActions && resp.getFileActions.actions) ? resp.getFileActions.actions : []
            callback(actions.map(a => ({ id: a.id, label: a.label })), null)
        })
    }

    function runFileAction(path, actionId, callback) {
        _call({ runFileAction: { path: path, actionId: actionId } }, function(_resp, err) {
            if (callback) callback(err)
        })
    }

    // getThumbnail requests an on-demand thumbnail for the file at path.
    // size: 0 = normal (128×128), 1 = large (256×256).
    // callback(result, err) where result = { thumbnailPath, width, height }.
    function getThumbnail(path, size, callback) {
        _call({ getThumbnail: { path: path, size: size === 1 ? "THUMBNAIL_SIZE_LARGE" : "THUMBNAIL_SIZE_NORMAL" } }, function(resp, err) {
            if (err) { callback(null, err); return }
            var t = resp.getThumbnail || {}
            callback({
                thumbnailPath: t.thumbnailPath || "",
                width: Number(t.width || 0),
                height: Number(t.height || 0)
            }, null)
        })
    }

    function listMounts(callback) {
        _call({ listMounts: {} }, function(resp, err) {
            if (err) { callback([], err); return }
            var mounts = (resp.listMounts && resp.listMounts.mounts) ? resp.listMounts.mounts : []
            callback(mounts.map(m => ({
                path: m.path,
                label: m.label,
                iconName: m.iconName || "drive-removable-media"
            })), null)
        })
    }

    function listSavedSearches(callback) {
        _call({ listSavedSearches: {} }, function(resp, err) {
            if (err) { callback([], err); return }
            var searches = (resp.listSavedSearches && resp.listSavedSearches.searches) ? resp.listSavedSearches.searches : []
            callback(searches.map(s => ({
                id: s.id,
                name: s.name,
                chips: s.chips || [],
                iconName: s.iconName || "folder-saved-search"
            })), null)
        })
    }

    function pinSearch(name, chips, iconName, callback) {
        _call({ pinSearch: { name: name, chips: chips || [], iconName: iconName || "folder-saved-search" } }, function(resp, err) {
            if (callback) callback(err)
        })
    }

    function unpinSearch(id, callback) {
        _call({ unpinSearch: { id: id } }, function(_resp, err) {
            if (callback) callback(err)
        })
    }

    function copy(paths, isMove, callback) {
        _call({ copy: { paths: paths || [], isMove: !!isMove } }, function(_resp, err) {
            if (callback) callback(err)
        })
    }

    function paste(destinationDir, callback) {
        _call({ paste: { destinationDir: destinationDir } }, function(resp, err) {
            if (callback) callback(resp && resp.paste ? resp.paste.newPaths : [], err)
        })
    }

    function createFile(destinationDir, name, callback) {
        _call({ createFile: { destinationDir: destinationDir, name: name } }, function(resp, err) {
            if (callback) callback(resp && resp.createFile ? resp.createFile.path : "", err)
        })
    }

    function createDirectory(destinationDir, name, callback) {
        _call({ createDirectory: { destinationDir: destinationDir, name: name } }, function(resp, err) {
            if (callback) callback(resp && resp.createDirectory ? resp.createDirectory.path : "", err)
        })
    }
}
