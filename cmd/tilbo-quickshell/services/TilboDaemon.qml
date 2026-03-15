// TilboDaemon.qml — JSON socket service layer for the tilbo daemon.
//
// Connects to the daemon's UI socket (tilbo-ui.sock) using Quickshell.Io.Socket
// and exchanges newline-delimited JSON frames:
//
//   Client → daemon (call):
//     {"id":1,"method":"ListDirectory","args":["/path",false]}
//
//   Daemon → client (reply):
//     {"id":1,"result":[...]}       ← success
//     {"id":1,"error":"msg"}        ← failure
//
//   Daemon → client (push event, no id):
//     {"event":"FileTagged","args":{"path":"...","added":[...],"removed":[...]}}
//     {"event":"IndexUpdated","args":{"filesTotal":1234,"tagsTotal":56}}
//     {"event":"DaemonStateChanged","args":{"state":"ready"}}
//
// Method call convention
// ──────────────────────
// Every wrapper takes a `callback(result, error)` as the last argument.
//   • On success: callback(result, null)
//   • On failure: callback(null, errorString)
//
// JSON field names
// ────────────────
// Go's encoding/json uses capitalised field names for exported structs, so
// result objects use e.g. .Name, .Path, .IsDir, .MTime etc.
pragma Singleton

import Quickshell
import Quickshell.Io
import QtQuick

Singleton {
    id: root

    // ── Socket path ───────────────────────────────────────────────────────
    //
    // Derived from $XDG_RUNTIME_DIR which is always set on systemd-based
    // desktops.  Falls back to /run/user/<uid> if the env var is absent.

    readonly property string _socketPath: {
        var rt = Quickshell.env("XDG_RUNTIME_DIR")
        return (rt && rt.length > 0 ? rt : "/run/user/" + Quickshell.env("UID")) + "/tilbo-ui.sock"
    }

    // ── Connection state ──────────────────────────────────────────────────

    readonly property bool connected: _socket.connected

    // ── Signals forwarded from the daemon ────────────────────────────────

    /// Emitted when tags on a file change.
    signal fileTagged(string path, var added, var removed)

    /// Emitted after each index scan completes.
    signal indexUpdated(var filesTotal, var tagsTotal)

    /// Emitted when the daemon's internal state transitions.
    signal daemonStateChanged(string state)

    // ── Internal: pending call registry ──────────────────────────────────

    property var   _pending: ({})   // id → callback(result, err)
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
                // Reject all in-flight calls so callers don't hang.
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
            // Push event from daemon.
            var a = msg.args || {}
            switch (msg.event) {
                case "FileTagged":
                    root.fileTagged(String(a.path || ""), a.added || [], a.removed || [])
                    break
                case "IndexUpdated":
                    root.indexUpdated(a.filesTotal, a.tagsTotal)
                    break
                case "DaemonStateChanged":
                    root.daemonStateChanged(String(a.state || ""))
                    break
            }
            return
        }

        // Reply to a call.
        var id  = msg.id
        var cb  = root._pending[id]
        if (!cb) return
        delete root._pending[id]
        if (msg.error) {
            cb(null, String(msg.error))
        } else {
            cb(msg.result !== undefined ? msg.result : null, null)
        }
    }

    // ── Private: send a call frame ────────────────────────────────────────

    function _call(method, args, callback) {
        var id = root._nextID++
        root._pending[id] = callback
        var frame = JSON.stringify({ id: id, method: method, args: args }) + "\n"
        _socket.write(frame)
        _socket.flush()
    }

    // ── Public API ────────────────────────────────────────────────────────
    //
    // Go struct field names in JSON are capitalised (Name, Path, IsDir, …).
    // The parse helpers below normalise these into the camelCase shape that
    // BrowserWindow and the component files expect.

    function _parseDirEntry(e) {
        // e: {Name, Path, IsDir, Size, MTime, Mode, Hidden}
        return {
            name:   e.Name,
            path:   e.Path,
            isDir:  e.IsDir,
            size:   e.Size,
            mtime:  e.MTime,
            mode:   e.Mode,
            hidden: e.Hidden,
            tags:   []
        }
    }

    function _parseFileResult(f) {
        // f: {Path, Tags, Metadata, Score, MTime, Size}
        return {
            path:     f.Path,
            tags:     f.Tags     || [],
            metadata: f.Metadata || {},
            score:    f.Score,
            mtime:    f.MTime,
            size:     f.Size,
            name:     String(f.Path).split("/").pop(),
            isDir:    false
        }
    }

    function _parsePathTags(e) {
        // e: {Path, Tags}
        return { path: e.Path, tags: e.Tags || [] }
    }

    function _parsePlaceEntry(e) {
        // e: {Name, Path}
        return { name: e.Name, path: e.Path }
    }

    function _parseTagResult(r) {
        // r: {PathsOK, PathsError, Errors}
        return {
            pathsOK:    r.PathsOK    || [],
            pathsError: r.PathsError || [],
            errors:     r.Errors     || {}
        }
    }

    /// List a directory. callback receives ([{name,path,isDir,...}], error).
    function listDirectory(path, hidden, callback) {
        _call("ListDirectory", [path, hidden], function(result, err) {
            if (err) { callback([], err); return }
            callback((result || []).map(e => _parseDirEntry(e)), null)
        })
    }

    /// Stat a single path. callback receives ({size,mtime,mode}, error).
    function statFile(path, callback) {
        _call("StatFile", [path], function(result, err) {
            if (err) { callback(null, err); return }
            // result: {Size, MTime, Mode}
            callback({ size: result.Size, mtime: result.MTime, mode: result.Mode }, null)
        })
    }

    /// Indexed search. callback receives ({files, total}, error).
    function search(tags, tagsAny, tagExclude, metaFilters, ftsQuery, limit, offset, sortBy, callback) {
        _call("Search",
              [tags || [], tagsAny || false, tagExclude || [], metaFilters || {},
               ftsQuery || "", limit || 50, offset || 0, sortBy || []],
              function(result, err) {
                  if (err) { callback(null, err); return }
                  // result: {files: [...], total: N}
                  var r = result || {}
                  callback({ files: (r.files || []).map(f => _parseFileResult(f)), total: r.total || 0 }, null)
              })
    }

    /// Local filesystem glob search. callback receives ([{path,name,...}], error).
    function globSearch(patterns, limit, allowHidden, callback) {
        _call("GlobSearch", [patterns || [], limit || 1000, allowHidden || false],
              function(result, err) {
                  if (err) { callback([], err); return }
                  callback((result || []).map(f => _parseFileResult(f)), null)
              })
    }

    /// Get all metadata for a file. callback receives ({metadata, sources}, error).
    function getMetadata(path, callback) {
        _call("GetMetadata", [path], function(result, err) {
            if (err) { callback(null, err); return }
            // result: {metadata: {...}, sources: {...}}
            var r = result || {}
            callback({ metadata: r.metadata || {}, sources: r.sources || {} }, null)
        })
    }

    /// Set (or delete when value=="") a metadata key for a file.
    function setMetadata(path, key, value, callback) {
        _call("SetMetadata", [path, key, value || ""], function(_result, err) {
            if (callback) callback(err)
        })
    }

    /// Apply a tag operation to paths. operation is "add", "remove", or "set".
    /// callback receives ({pathsOK, pathsError, errors}, error).
    function modifyTags(paths, tags, operation, callback) {
        _call("ModifyTags", [paths || [], tags || [], operation],
              function(result, err) {
                  if (err) { callback(null, err); return }
                  callback(_parseTagResult(result || {}), null)
              })
    }

    /// Get current tags for a list of paths.
    /// callback receives ([{path, tags}], error).
    function hydrateTags(paths, callback) {
        _call("HydrateTags", [paths || []], function(result, err) {
            if (err) { callback([], err); return }
            callback((result || []).map(e => _parsePathTags(e)), null)
        })
    }

    /// List all known tags, optionally filtered by prefix.
    /// callback receives (string[], error).
    function listTags(prefix, callback) {
        _call("ListTags", [prefix || ""], function(result, err) {
            if (err) { callback([], err); return }
            callback(result || [], null)
        })
    }

    /// Rename a file to a new sibling name.
    /// callback receives (newPath: string, error).
    function renameFile(path, newName, callback) {
        _call("RenameFile", [path, newName], function(result, err) {
            if (callback) callback(result || "", err)
        })
    }

    /// Delete a file or directory tree.
    function deleteFile(path, callback) {
        _call("DeleteFile", [path], function(_result, err) {
            if (callback) callback(err)
        })
    }

    /// Change file permission bits (uint32 mode).
    function chmodFile(path, mode, callback) {
        _call("ChmodFile", [path, mode], function(_result, err) {
            if (callback) callback(err)
        })
    }

    /// List sidebar places. callback receives ([{name, path}], error).
    function listPlaces(callback) {
        _call("ListPlaces", [], function(result, err) {
            if (err) { callback([], err); return }
            callback((result || []).map(e => _parsePlaceEntry(e)), null)
        })
    }
}
