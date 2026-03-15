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
                isDir: false
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
                isDir: false
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
            callback(places.map(p => ({ name: p.name, path: p.path })), null)
        })
    }
}