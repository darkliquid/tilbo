// FileList.qml — table/list view for the tilbo browser.
//
// Same entry contract and signal set as FileGrid.qml; only the visual layout
// changes.  Columns: icon | name | size | modified | tags.
import QtQuick
import QtQuick.Controls

Item {
    id: root

    property var entries: []

    signal fileSelected(var fileData)
    signal directoryActivated(string path)
    signal fileOpenRequested(string path)
    signal renameRequested(string path, string newName)
    signal deleteRequested(string path)

    property int _renamingIndex: -1

    // ── Column widths (pixels) ─────────────────────────────────────────────

    readonly property int _colIcon:  32
    readonly property int _colSize:  80
    readonly property int _colMtime: 130
    readonly property int _colTags:  100
    // Name fills the remainder after margins + fixed columns.
    readonly property int _colName: Math.max(60, width - _colIcon - _colSize
                                             - _colMtime - _colTags - 20)

    // ── Column header ──────────────────────────────────────────────────────

    Rectangle {
        id: header
        anchors.top: parent.top
        anchors.left: parent.left
        anchors.right: parent.right
        height: 28
        color: "#1E212A"

        Row {
            anchors.fill: parent
            anchors.leftMargin: 8
            anchors.rightMargin: 8
            spacing: 0

            Item   { width: root._colIcon;  height: parent.height }
            Text   { width: root._colName;  height: parent.height; text: "Name";     color: "#88C0D0"; font.pixelSize: 12; verticalAlignment: Text.AlignVCenter }
            Text   { width: root._colSize;  height: parent.height; text: "Size";     color: "#88C0D0"; font.pixelSize: 12; verticalAlignment: Text.AlignVCenter; horizontalAlignment: Text.AlignRight }
            Text   { width: root._colMtime; height: parent.height; text: "Modified"; color: "#88C0D0"; font.pixelSize: 12; verticalAlignment: Text.AlignVCenter; leftPadding: 8 }
            Text   { width: root._colTags;  height: parent.height; text: "Tags";     color: "#88C0D0"; font.pixelSize: 12; verticalAlignment: Text.AlignVCenter; leftPadding: 8 }
        }
    }

    // ── File list ──────────────────────────────────────────────────────────

    ListView {
        id: listView
        anchors.top: header.bottom
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.bottom: parent.bottom
        model: root.entries
        clip: true
        ScrollBar.vertical: ScrollBar { policy: ScrollBar.AsNeeded }

        delegate: Item {
            id: row
            required property var modelData
            required property int index
            width: listView.width
            height: 40

            property bool renaming: root._renamingIndex === row.index

            // Hover / selection background
            Rectangle {
                anchors.fill: parent
                anchors.leftMargin: 4; anchors.rightMargin: 4
                radius: 4
                color: rowMA.containsMouse ? "#2E3440" : "transparent"
            }

            Row {
                anchors.fill: parent
                anchors.leftMargin: 8; anchors.rightMargin: 8
                spacing: 0

                // Icon
                Text {
                    width: root._colIcon; height: parent.height
                    text: row.modelData.isDir ? "📁" : "📄"
                    font.pixelSize: 18
                    verticalAlignment: Text.AlignVCenter
                }

                // Name / rename editor
                Item {
                    width: root._colName; height: parent.height

                    Text {
                        anchors.fill: parent
                        visible: !row.renaming
                        text: row.modelData.name
                        color: "#ECEFF4"; font.pixelSize: 13
                        elide: Text.ElideRight
                        verticalAlignment: Text.AlignVCenter
                    }

                    TextField {
                        id: renameField
                        anchors.verticalCenter: parent.verticalCenter
                        width: parent.width
                        height: 28
                        visible: row.renaming
                        text: row.modelData.name
                        color: "#ECEFF4"; font.pixelSize: 13
                        background: Rectangle {
                            color: "#1A1C23"; radius: 3
                            border.color: "#5E81AC"; border.width: 1
                        }
                        onVisibleChanged: {
                            if (visible) { selectAll(); forceActiveFocus() }
                        }
                        onAccepted: {
                            var n = text.trim()
                            if (n && n !== row.modelData.name)
                                root.renameRequested(row.modelData.path, n)
                            root._renamingIndex = -1
                        }
                        Keys.onEscapePressed: root._renamingIndex = -1
                    }
                }

                // Size
                Text {
                    width: root._colSize; height: parent.height
                    text: row.modelData.isDir ? "--"
                          : (row.modelData.size > 1048576
                             ? (row.modelData.size / 1048576).toFixed(1) + " MB"
                             : (row.modelData.size / 1024).toFixed(1) + " KB")
                    color: "#9099A3"; font.pixelSize: 12
                    horizontalAlignment: Text.AlignRight
                    verticalAlignment: Text.AlignVCenter
                }

                // Modified date
                Text {
                    width: root._colMtime; height: parent.height
                    leftPadding: 8
                    text: row.modelData.mtime
                          ? new Date(row.modelData.mtime * 1000)
                                .toLocaleString(Qt.locale(), Locale.ShortFormat)
                          : ""
                    color: "#9099A3"; font.pixelSize: 12
                    verticalAlignment: Text.AlignVCenter
                    elide: Text.ElideRight
                }

                // Tags (first two badges)
                Item {
                    width: root._colTags; height: parent.height

                    Row {
                        anchors.verticalCenter: parent.verticalCenter
                        leftPadding: 8
                        spacing: 3

                        Repeater {
                            model: row.modelData.tags
                                   ? row.modelData.tags.slice(0, 2) : []
                            Rectangle {
                                height: 18; width: tl.width + 8; radius: 3
                                color: "#3B4252"
                                Text {
                                    id: tl
                                    anchors.centerIn: parent
                                    text: modelData
                                    color: "#A3BE8C"; font.pixelSize: 10
                                }
                            }
                        }
                    }
                }
            }

            MouseArea {
                id: rowMA
                anchors.fill: parent
                hoverEnabled: true
                acceptedButtons: Qt.LeftButton | Qt.RightButton
                cursorShape: Qt.PointingHandCursor
                enabled: !row.renaming

                onClicked: (mouse) => {
                    if (mouse.button === Qt.RightButton) {
                        rowCtxMenu.targetPath  = row.modelData.path
                        rowCtxMenu.targetName  = row.modelData.name
                        rowCtxMenu.targetIndex = row.index
                        rowCtxMenu.popup()
                    } else {
                        root.fileSelected(row.modelData)
                    }
                }

                onDoubleClicked: (mouse) => {
                    if (mouse.button !== Qt.LeftButton) return
                    if (row.modelData.isDir) root.directoryActivated(row.modelData.path)
                    else                     root.fileOpenRequested(row.modelData.path)
                }
            }
        }
    }

    Menu {
        id: rowCtxMenu
        property string targetPath: ""
        property string targetName: ""
        property int    targetIndex: -1

        MenuItem {
            text: "Rename"
            onTriggered: root._renamingIndex = rowCtxMenu.targetIndex
        }
        MenuItem {
            text: "Delete"
            onTriggered: {
                if (rowCtxMenu.targetPath)
                    root.deleteRequested(rowCtxMenu.targetPath)
            }
        }
    }
}
