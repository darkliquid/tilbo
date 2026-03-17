// FileGrid.qml — tile/grid view for the tilbo browser.
//
// Accepts a plain JS array via the `entries` property.  Each element must have
// at minimum: name, path, isDir, size, mtime, tags, iconName.
//
// Signals emitted:
//   fileSelected(fileData)          — single click; pass the full entry object
//   directoryActivated(path)        — double-click on a directory
//   fileOpenRequested(path)         — double-click on a regular file
//   renameRequested(path, newName)  — user confirmed rename via inline editor
//   deleteRequested(path)           — user chose Delete from context menu
//   openWithRequested(path)         — user chose Open With from context menu
//   openInTerminalRequested(path)   — user chose Open in Terminal
//   getFileActions(path, cb)        — request extension actions
//   runFileAction(path, actionId)   — run an extension action
//   getFileBadges(path, cb)         — request badge overlays
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
    signal openWithRequested(string path)
    signal openInTerminalRequested(string path)
    signal getFileActions(string path, var cb)
    signal runFileAction(string path, string actionId)
    signal getFileBadges(string path, var cb)

    // Index of the cell currently being renamed; -1 means none.
    property int _renamingIndex: -1

    GridView {
        id: grid
        anchors.fill: parent
        anchors.margins: 8
        model: root.entries
        cellWidth: 148
        cellHeight: 164
        clip: true
        ScrollBar.vertical: ScrollBar { policy: ScrollBar.AsNeeded }

        delegate: Item {
            id: cell
            required property var modelData
            required property int index
            width: grid.cellWidth
            height: grid.cellHeight

            property bool renaming: root._renamingIndex === cell.index

            Rectangle {
                anchors.fill: parent
                anchors.margins: 4
                radius: 6
                color: cellMA.containsMouse && !cell.renaming ? "#2E3440" : "transparent"
                border.color: cellMA.containsMouse && !cell.renaming ? "#4C566A" : "transparent"
                border.width: 1

                Column {
                    anchors.fill: parent
                    anchors.margins: 8
                    spacing: 4

                    // File type icon with badge overlay
                    Item {
                        id: gridIconItem
                        anchors.horizontalCenter: parent.horizontalCenter
                        width: 48; height: 48

                        ThemeIcon {
                            anchors.fill: parent
                            iconName: cell.modelData.iconName
                                    || (cell.modelData.isDir ? "inode-directory" : "application-x-generic")
                        }

                        // Badge overlays (loaded asynchronously)
                        property var _badges: []
                        Component.onCompleted: {
                            if (!cell.modelData.isDir) {
                                root.getFileBadges(cell.modelData.path, function(badges, _err) {
                                    gridIconItem._badges = badges || []
                                })
                            }
                        }

                        Row {
                            anchors.bottom: parent.bottom
                            anchors.right: parent.right
                            spacing: 1
                            Repeater {
                                model: gridIconItem._badges.slice(0, 3)
                                ThemeIcon {
                                    iconName: modelData
                                    width: 16; height: 16
                                }
                            }
                        }
                    }

                    // File name — static label
                    Text {
                        width: parent.width
                        visible: !cell.renaming
                        text: cell.modelData.name
                        color: "#ECEFF4"
                        font.pixelSize: 12
                        elide: Text.ElideRight
                        horizontalAlignment: Text.AlignHCenter
                    }

                    // Inline rename editor
                    TextField {
                        id: renameField
                        width: parent.width
                        visible: cell.renaming
                        text: cell.modelData.name
                        color: "#ECEFF4"
                        font.pixelSize: 12
                        background: Rectangle {
                            color: "#1A1C23"; radius: 3
                            border.color: "#5E81AC"; border.width: 1
                        }
                        onVisibleChanged: {
                            if (visible) { selectAll(); forceActiveFocus() }
                        }
                        onAccepted: {
                            var n = text.trim()
                            if (n && n !== cell.modelData.name)
                                root.renameRequested(cell.modelData.path, n)
                            root._renamingIndex = -1
                        }
                        Keys.onEscapePressed: root._renamingIndex = -1
                    }

                    // Tag badges — up to three tags shown
                    Flow {
                        width: parent.width
                        spacing: 2
                        visible: cell.modelData.tags && cell.modelData.tags.length > 0

                        Repeater {
                            model: cell.modelData.tags
                                   ? cell.modelData.tags.slice(0, 3) : []
                            Rectangle {
                                height: 16
                                width: tagLbl.width + 8; radius: 3
                                color: "#3B4252"
                                Text {
                                    id: tagLbl
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
                id: cellMA
                anchors.fill: parent
                hoverEnabled: true
                acceptedButtons: Qt.LeftButton | Qt.RightButton
                cursorShape: Qt.PointingHandCursor
                enabled: !cell.renaming

                onClicked: (mouse) => {
                    if (mouse.button === Qt.RightButton) {
                        ctxMenu.targetPath  = cell.modelData.path
                        ctxMenu.targetName  = cell.modelData.name
                        ctxMenu.targetIndex = cell.index
                        ctxMenu.targetIsDir = cell.modelData.isDir
                        ctxMenu.popup()
                    } else {
                        root.fileSelected(cell.modelData)
                    }
                }

                onDoubleClicked: (mouse) => {
                    if (mouse.button !== Qt.LeftButton) return
                    if (cell.modelData.isDir) root.directoryActivated(cell.modelData.path)
                    else                      root.fileOpenRequested(cell.modelData.path)
                }
            }
        }
    }

    // Shared context menu — populated before popup() is called.
    Menu {
        id: ctxMenu
        property string targetPath: ""
        property string targetName: ""
        property int    targetIndex: -1
        property bool   targetIsDir: false
        property var    _extActions: []

        onAboutToShow: {
            // Load extension actions asynchronously
            _extActions = []
            root.getFileActions(targetPath, function(actions, _err) {
                ctxMenu._extActions = actions || []
            })
        }

        MenuItem {
            text: "Open"
            onTriggered: {
                if (!ctxMenu.targetIsDir)
                    root.fileOpenRequested(ctxMenu.targetPath)
                else
                    root.directoryActivated(ctxMenu.targetPath)
            }
        }
        MenuItem {
            text: "Open With..."
            visible: !ctxMenu.targetIsDir
            onTriggered: {
                if (ctxMenu.targetPath)
                    root.openWithRequested(ctxMenu.targetPath)
            }
        }
        MenuItem {
            text: "Open in Terminal"
            onTriggered: {
                var dir = ctxMenu.targetIsDir ? ctxMenu.targetPath
                         : ctxMenu.targetPath.substring(0, ctxMenu.targetPath.lastIndexOf("/"))
                root.openInTerminalRequested(dir)
            }
        }
        MenuSeparator {}
        MenuItem {
            text: "Rename"
            onTriggered: root._renamingIndex = ctxMenu.targetIndex
        }
        MenuItem {
            text: "Move to Trash"
            onTriggered: {
                if (ctxMenu.targetPath)
                    root.deleteRequested(ctxMenu.targetPath)
            }
        }
        MenuSeparator { visible: ctxMenu._extActions.length > 0 }
        // Extension actions (dynamic)
        Repeater {
            model: ctxMenu._extActions
            MenuItem {
                required property var modelData
                text: modelData.label
                onTriggered: root.runFileAction(ctxMenu.targetPath, modelData.id)
            }
        }
    }
}
