// TagSearchBar.qml — chip-based search input for tilbo.
//
// Chip format recognised by BrowserWindow._executeSearch:
//   "photo"         → indexed tag search (bare string)
//   "glob:*.jpg"    → filesystem glob search
//   "fts:sunset"    → full-text search
//   "hidden:any"    → include hidden files
//
// For bare strings, autocomplete suggestions are fetched from the daemon via
// TilboDaemon.listTags(prefix, callback).
//
// Signal:
//   searchRequested(chips: string[])  — emitted whenever the chip list changes
//
// Usage:
//   TagSearchBar {
//       Layout.fillWidth: true
//       Layout.preferredHeight: 40
//       daemonConnected: window.daemonConnected
//       onSearchRequested: chips => window.executeSearch(chips)
//   }
import QtQuick
import QtQuick.Controls
import "../services"

Rectangle {
    id: root

    property bool daemonConnected: true

    signal searchRequested(var chips)

    // Internal chip list (array of strings in the format BrowserWindow expects)
    property var _chips: []

    function addChip(chip) {
        _addChip(chip)
    }

    color: Theme.bgLight
    radius: 6
    border.color: searchInput.activeFocus ? Theme.borderFocus : Theme.border
    border.width: 1
    clip: false  // autocomplete popup must be able to overflow

    // ── Autocomplete state ─────────────────────────────────────────────────

    property var _suggestions: []
    // Optional descriptive labels for suggestions
    property var _suggestionLabels: ({})

    Timer {
        id: acTimer
        interval: 250
        onTriggered: _fetchSuggestions()
    }

    function _fetchSuggestions() {
        var text = searchInput.text.trim()
        if (!text && root._chips.length === 0) {
            // Show initial suggestions for discovery
            root._suggestions = ["is:", "size:", "mtime:", "glob:", "fts:", "hidden:", "meta:"]
            root._suggestionLabels = {
                "is:":     I18n.tr("ac.label.is"),
                "size:":   I18n.tr("ac.label.size"),
                "mtime:":  I18n.tr("ac.label.mtime"),
                "glob:":   I18n.tr("ac.label.glob"),
                "fts:":    I18n.tr("ac.label.fts"),
                "hidden:": I18n.tr("ac.label.hidden"),
                "meta:":   I18n.tr("ac.label.meta")
            }
            acPopup.open()
            return
        }

        if (!text) {
            root._suggestions = []
            acPopup.close()
            return
        }

        // Discovery for prefixes if typing starts
        var discoveries = ["is:", "glob:", "fts:", "hidden:", "size:", "mtime:", "meta:"]
        var discoveryMatches = discoveries.filter(function(d) {
            return d.startsWith(text) && d !== text
        })

        if (discoveryMatches.length > 0) {
            root._suggestions = discoveryMatches
            root._suggestionLabels = {
                "is:":     I18n.tr("ac.label.is"),
                "glob:":   I18n.tr("ac.label.glob"),
                "fts:":    I18n.tr("ac.label.fts"),
                "hidden:": I18n.tr("ac.label.hidden"),
                "size:":   I18n.tr("ac.label.size"),
                "mtime:":  I18n.tr("ac.label.mtime"),
                "meta:":   I18n.tr("ac.label.meta")
            }
            acPopup.open()
            return
        }

        // Metadata key suggestions
        if (text.startsWith("meta:")) {
            var sub = text.slice(5)
            if (sub.indexOf("=") === -1) {
                var keys = ["width", "height", "duration", "artist", "album", "title", "codec", "format"]
                root._suggestions = keys.map(k => "meta:" + k + "=").filter(k => k.startsWith(text))
                root._suggestionLabels = {
                    "meta:width=":    I18n.tr("ac.meta.width"),
                    "meta:height=":   I18n.tr("ac.meta.height"),
                    "meta:duration=": I18n.tr("ac.meta.duration"),
                    "meta:artist=":   I18n.tr("ac.meta.artist"),
                    "meta:album=":    I18n.tr("ac.meta.album"),
                    "meta:title=":    I18n.tr("ac.meta.title"),
                    "meta:codec=":    I18n.tr("ac.meta.codec"),
                    "meta:format=":   I18n.tr("ac.meta.format")
                }
                if (root._suggestions.length > 0) acPopup.open()
                else                             acPopup.close()
                return
            } else {
                // Key is chosen, suggest operators for numeric keys
                var parts = sub.split("=")
                var key = parts[0]
                var val = parts[1]
                var numericKeys = ["width", "height", "duration"]
                if (numericKeys.indexOf(key) !== -1 && !val.startsWith("gte:") && !val.startsWith("lte:")) {
                    root._suggestions = ["meta:" + key + "=gte:", "meta:" + key + "=lte:"]
                    root._suggestionLabels = {}
                    root._suggestionLabels["meta:" + key + "=gte:"] = I18n.tr("ac.op.gte")
                    root._suggestionLabels["meta:" + key + "=lte:"] = I18n.tr("ac.op.lte")
                    acPopup.open()
                    return
                }
            }
        }

        // Sub-suggestions for specific prefixes
        if (text === "is:") {
            root._suggestions = ["is:images", "is:videos", "is:docs"]
            root._suggestionLabels = {
                "is:images": I18n.tr("search.filter.images"),
                "is:videos": I18n.tr("search.filter.videos"),
                "is:docs":   I18n.tr("search.filter.docs")
            }
            acPopup.open()
            return
        }

        if (text === "hidden:") {
            root._suggestions = ["hidden:any"]
            root._suggestionLabels = { "hidden:any": I18n.tr("ac.hidden_any") }
            acPopup.open()
            return
        }

        if (text === "size:") {
            root._suggestions = ["size:>10MB", "size:>100MB", "size:>1GB"]
            root._suggestionLabels = {}
            acPopup.open()
            return
        }

        if (text === "mtime:") {
            root._suggestions = ["mtime:2026", "mtime:<1d", "mtime:<1w", "mtime:<1m", "mtime:<1y"]
            root._suggestionLabels = {
                "mtime:2026": I18n.tr("search.filter.2026"),
                "mtime:<1d": I18n.tr("ac.mtime.1d"),
                "mtime:<1w": I18n.tr("ac.mtime.1w"),
                "mtime:<1m": I18n.tr("ac.mtime.1m"),
                "mtime:<1y": I18n.tr("ac.mtime.1y")
            }
            acPopup.open()
            return
        }

        // Only autocomplete bare strings (tag names) from daemon
        if (text.indexOf(":") === -1) {
            TilboDaemon.listTags(text, function(tags, err) {
                if (err || !tags || tags.length === 0) {
                    root._suggestions = []
                    acPopup.close()
                    return
                }
                root._suggestions = tags.filter(function(t) {
                    return root._chips.indexOf(t) === -1
                }).slice(0, 8)
                root._suggestionLabels = {}
                if (root._suggestions.length > 0)
                    acPopup.open()
                else
                    acPopup.close()
            })
        } else {
            // If typing inside a prefix, just stay quiet or close
            // unless we add specific value completions later.
            if (root._suggestions.indexOf(text) === -1) {
                // acPopup.close()
            }
        }
    }

    // ── Chip helpers ───────────────────────────────────────────────────────

    function _addChip(raw) {
        var chip = raw.trim()

        // Semantic mappings from autocomplete
        if (chip === "is:images") chip = "glob:*.{jpg,jpeg,png,gif,webp}"
        if (chip === "is:videos") chip = "glob:*.{mp4,mkv,avi,mov}"
        if (chip === "is:docs")   chip = "glob:*.{pdf,doc,docx,txt,odt}"

        if (chip === "size:>10MB")  chip = "fts:size > 10485760"
        if (chip === "size:>100MB") chip = "fts:size > 104857600"
        if (chip === "size:>1GB")   chip = "fts:size > 1073741824"

        if (chip === "mtime:2026")  chip = "fts:mtime > 1767225600"

        if (!chip || root._chips.indexOf(chip) !== -1) return
        var newChips = root._chips.concat([chip])
        root._chips = newChips
        searchInput.text = ""
        acPopup.close()
        root.searchRequested(root._chips)
    }

    function _removeChip(index) {
        var newChips = root._chips.slice()
        newChips.splice(index, 1)
        root._chips = newChips
        root.searchRequested(root._chips)
    }

    function _clearAll() {
        root._chips = []
        searchInput.text = ""
        acPopup.close()
        root.searchRequested([])
    }

    // ── Layout ─────────────────────────────────────────────────────────────

    Row {
        anchors.fill: parent
        anchors.leftMargin: 8
        anchors.rightMargin: 8
        spacing: 4

        // Chip strip — scrolls horizontally when chips overflow
        Flickable {
            id: chipFlick
            height: parent.height
            width: Math.min(parent.width - searchInput.implicitWidth - 36,
                            chipRow.implicitWidth + 4)
            contentWidth: chipRow.implicitWidth
            contentHeight: height
            clip: true
            boundsBehavior: Flickable.StopAtBounds
            visible: root._chips.length > 0

            Row {
                id: chipRow
                height: parent.height
                spacing: 4

                Repeater {
                    model: root._chips

                    Rectangle {
                        height: 26
                        width: chipText.width + closeBtn.width + 14
                        anchors.verticalCenter: parent.verticalCenter
                        radius: 4
                        color: _chipColor(modelData)
                        border.color: Qt.darker(_chipColor(modelData), 1.3)
                        border.width: 1

                        Row {
                            anchors.fill: parent
                            anchors.leftMargin: 6; anchors.rightMargin: 4
                            spacing: 2

                            Text {
                                id: chipText
                                anchors.verticalCenter: parent.verticalCenter
                                text: _chipLabel(modelData)
                                color: "#ECEFF4"; font.pixelSize: 12
                            }

                            Text {
                                id: closeBtn
                                anchors.verticalCenter: parent.verticalCenter
                                text: "×"
                                color: "#9099A3"; font.pixelSize: 14

                                MouseArea {
                                    anchors.fill: parent
                                    cursorShape: Qt.PointingHandCursor
                                    onClicked: root._removeChip(index)
                                }
                            }
                        }
                    }
                }
            }
        }
// Text input
TextInput {
    id: searchInput
    width: parent.width - (chipFlick.visible ? chipFlick.width + 4 : 0)
           - (clearBtn.visible ? clearBtn.width + 4 : 0)
    height: parent.height
    color: Theme.fgMain
    font.pixelSize: 13
    verticalAlignment: Text.AlignVCenter
    clip: true

    Text {
        anchors.fill: parent
        verticalAlignment: Text.AlignVCenter
        text: root.daemonConnected ? I18n.tr("search.placeholder")
                                   : I18n.tr("search.no_daemon")
        color: Theme.fgPlaceholder
        font.pixelSize: 13
        visible: !searchInput.text && !searchInput.activeFocus
    }
            onTextChanged: {
                acTimer.restart()
            }

            Keys.onReturnPressed: {
                var t = text.trim()
                if (t) _addChip(t)
            }

            Keys.onTabPressed: {
                if (root._suggestions.length > 0) {
                    _addChip(root._suggestions[0])
                }
            }

            Keys.onPressed: event => {
                if (event.key === Qt.Key_Backspace && !text && root._chips.length > 0) {
                    _removeChip(root._chips.length - 1)
                    event.accepted = true
                }
            }

            Keys.onEscapePressed: {
                acPopup.close()
                text = ""
            }
        }

        // Clear-all button
        Text {
            id: clearBtn
            anchors.verticalCenter: parent.verticalCenter
            text: "✕"
            color: clearMA.containsMouse ? Theme.fgMain : Theme.fgDeemphasized
            font.pixelSize: 14
            visible: root._chips.length > 0 || searchInput.text.length > 0

            MouseArea {
                id: clearMA
                anchors.fill: parent
                hoverEnabled: true
                cursorShape: Qt.PointingHandCursor
                onClicked: root._clearAll()
            }
        }
    }

    // ── Autocomplete dropdown ──────────────────────────────────────────────

    Popup {
        id: acPopup
        parent: root
        x: 0
        y: root.height + 2
        width: root.width
        padding: 4
        background: Rectangle {
            color: Theme.bgLight; radius: 6
            border.color: Theme.border; border.width: 1
        }
        contentItem: Column {
            spacing: 2
            Repeater {
                model: root._suggestions
                delegate: Item {
                    required property string modelData
                    required property int    index
                    width: acPopup.width - 8
                    height: 30

                    Rectangle {
                        anchors.fill: parent; radius: 4
                        color: acItemMA.containsMouse ? Theme.bgHover : "transparent"
                    }

                    Text {
                        anchors.verticalCenter: parent.verticalCenter
                        leftPadding: 8
                        text: modelData
                        color: Theme.fgMain; font.pixelSize: 13
                    }

                    Text {
                        anchors.verticalCenter: parent.verticalCenter
                        anchors.right: parent.right
                        rightPadding: 8
                        text: root._suggestionLabels[modelData] || ""
                        color: Theme.fgDeemphasized; font.pixelSize: 11
                        visible: text !== ""
                    }

                    MouseArea {
                        id: acItemMA
                        anchors.fill: parent
                        hoverEnabled: true
                        cursorShape: Qt.PointingHandCursor
                        onClicked: root._addChip(modelData)
                    }
                }
            }
        }
        // Dynamic height based on suggestion count
        height: Math.min(root._suggestions.length * 34 + 8, 250)
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    function _chipLabel(chip) {
        if (chip === "glob:*.{jpg,jpeg,png,gif,webp}") return "images"
        if (chip === "glob:*.{mp4,mkv,avi,mov}")        return "videos"
        if (chip === "glob:*.{pdf,doc,docx,txt,odt}")  return "documents"

        if (chip === "fts:size > 10485760")  return "size > 10MB"
        if (chip === "fts:size > 104857600") return "size > 100MB"
        if (chip === "fts:size > 1073741824") return "size > 1GB"

        if (chip === "fts:mtime > 1767225600") return "2026"

        if (chip.startsWith("glob:"))   return "~ " + chip.slice(5)
        if (chip.startsWith("fts:"))    return "fts " + chip.slice(4)
        if (chip.startsWith("hidden:")) return "hidden"
        if (chip.startsWith("size:"))   return "size " + chip.slice(5)
        if (chip.startsWith("mtime:"))  return "age " + chip.slice(6)
        if (chip.startsWith("is:"))     return "is " + chip.slice(3)
        if (chip.startsWith("meta:"))   return "meta " + chip.slice(5)
        return "# " + chip
    }

    function _chipColor(chip) {
        if (chip.startsWith("glob:"))   return Qt.darker(Theme.success, 1.5)
        if (chip.startsWith("fts:"))    return Qt.darker(Theme.accent, 1.5)
        if (chip.startsWith("hidden:")) return Qt.darker(Theme.danger, 1.5)
        if (chip.startsWith("size:"))   return Qt.darker(Theme.accentDim, 1.5)
        if (chip.startsWith("mtime:"))  return Qt.darker(Theme.warning, 1.5)
        if (chip.startsWith("is:"))     return Qt.darker(Theme.success, 1.2)
        if (chip.startsWith("meta:"))   return Qt.darker(Theme.accent, 1.2)
        return Qt.darker(Theme.accentDim, 1.5)
    }
}
