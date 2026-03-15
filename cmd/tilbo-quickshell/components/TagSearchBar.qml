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

    color: "#22252E"
    radius: 6
    border.color: searchInput.activeFocus ? "#5E81AC" : "#3B4252"
    border.width: 1
    clip: false  // autocomplete popup must be able to overflow

    // ── Autocomplete state ─────────────────────────────────────────────────

    property var _suggestions: []

    Timer {
        id: acTimer
        interval: 250
        onTriggered: _fetchSuggestions()
    }

    function _fetchSuggestions() {
        var text = searchInput.text.trim()
        // Only autocomplete bare strings (tag names); skip prefixed inputs.
        if (!text || text.startsWith("glob:") || text.startsWith("fts:")
                  || text.startsWith("hidden:") || !root.daemonConnected) {
            root._suggestions = []
            acPopup.close()
            return
        }
        TilboDaemon.listTags(text, function(tags, err) {
            if (err || !tags || tags.length === 0) {
                root._suggestions = []
                acPopup.close()
                return
            }
            // Exclude tags already added as chips.
            root._suggestions = tags.filter(function(t) {
                return root._chips.indexOf(t) === -1
            }).slice(0, 8)
            if (root._suggestions.length > 0)
                acPopup.open()
            else
                acPopup.close()
        })
    }

    // ── Chip helpers ───────────────────────────────────────────────────────

    function _addChip(raw) {
        var chip = raw.trim()
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
            color: "#ECEFF4"
            font.pixelSize: 13
            verticalAlignment: Text.AlignVCenter
            clip: true

            Text {
                anchors.fill: parent
                verticalAlignment: Text.AlignVCenter
                text: root.daemonConnected ? "Search tags, glob:*, fts:query…"
                                           : "Daemon not connected"
                color: "#4C566A"
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
            color: clearMA.containsMouse ? "#ECEFF4" : "#6B7280"
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
            color: "#22252E"; radius: 6
            border.color: "#3B4252"; border.width: 1
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
                        color: acItemMA.containsMouse ? "#2E3440" : "transparent"
                    }

                    Text {
                        anchors.verticalCenter: parent.verticalCenter
                        leftPadding: 8
                        text: modelData
                        color: "#ECEFF4"; font.pixelSize: 13
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
        if (chip.startsWith("glob:"))   return "~ " + chip.slice(5)
        if (chip.startsWith("fts:"))    return "fts " + chip.slice(4)
        if (chip === "hidden:any")      return "hidden"
        return "# " + chip
    }

    function _chipColor(chip) {
        if (chip.startsWith("glob:"))   return "#2D4A3E"
        if (chip.startsWith("fts:"))    return "#2D3A4A"
        if (chip === "hidden:any")      return "#3A2D4A"
        return "#2D3B28"
    }
}
