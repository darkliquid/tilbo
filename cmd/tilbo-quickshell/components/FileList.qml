// FileList.qml — table/list view for the tilbo browser.
//
// Same entry contract and signal set as FileGrid.qml; only the visual layout
// changes.  Columns: icon | name | size | modified | tags.
import QtQuick
import QtQuick.Controls
import "../services"

Item {
    id: root

    property var entries: []
    property bool inlineThumbnails: false
    property var selection: []
    property int _lastSelectedIndex: -1

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
    signal getThumbnail(string path, int size, var cb)
    signal copyRequested(bool isMove)
    signal pasteRequested()
    signal createFileRequested()
    signal createDirectoryRequested()

    function _isThumbnailable(mime) {
        return mime && (mime.indexOf("image/") === 0 || mime.indexOf("video/") === 0)
    }

    property int _renamingIndex: -1

    property string sortColumn: "name"
    property bool sortAscending: true
    signal sortRequested(string column, bool ascending)

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
        color: Theme.bgMedium

        Row {
            anchors.fill: parent
            anchors.leftMargin: 8
            anchors.rightMargin: 8
            spacing: 0

            Item   { width: root._colIcon;  height: parent.height }
            
            HeaderItem {
                width: root._colName; height: parent.height; text: "Name"
                column: "name"; active: root.sortColumn === "name"
                ascending: root.sortAscending
                onClicked: root.sortRequested("name", active ? !ascending : true)
            }
            HeaderItem {
                width: root._colSize; height: parent.height; text: "Size"
                column: "size"; active: root.sortColumn === "size"
                ascending: root.sortAscending
                horizontalAlignment: Text.AlignRight
                onClicked: root.sortRequested("size", active ? !ascending : true)
            }
            HeaderItem {
                width: root._colMtime; height: parent.height; text: "Modified"
                column: "mtime"; active: root.sortColumn === "mtime"
                ascending: root.sortAscending; leftPadding: 8
                onClicked: root.sortRequested("mtime", active ? !ascending : true)
            }
            HeaderItem {
                width: root._colTags;  height: parent.height; text: "Tags"
                column: "tags"; active: root.sortColumn === "tags"
                ascending: root.sortAscending; leftPadding: 8
                onClicked: root.sortRequested("tags", active ? !ascending : true)
            }
        }
    }

    // Header item component for re-use
    component HeaderItem: Item {
        property string text: ""
        property string column: ""
        property bool active: false
        property bool ascending: true
        property int horizontalAlignment: Text.AlignLeft
        property int leftPadding: 0
        signal clicked()

        Text {
            anchors.fill: parent
            anchors.leftMargin: parent.leftPadding
            text: parent.text + (parent.active ? (parent.ascending ? " ↑" : " ↓") : "")
            color: parent.active ? Theme.fgMain : Theme.accent
            font.pixelSize: 12
            font.bold: parent.active
            verticalAlignment: Text.AlignVCenter
            horizontalAlignment: parent.horizontalAlignment
        }

        MouseArea {
            anchors.fill: parent
            hoverEnabled: true
            cursorShape: Qt.PointingHandCursor
            onClicked: parent.clicked()
        }
    }

    // ── File list ──────────────────────────────────────────────────────────

    ListView {
        id: listView
        anchors.top: header.bottom
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.bottom: parent.bottom

        MouseArea {
            anchors.fill: parent
            z: -1
            acceptedButtons: Qt.RightButton
            onClicked: (mouse) => {
                if (mouse.button === Qt.RightButton) {
                    root.selection = []
                    root._lastSelectedIndex = -1
                    bgCtxMenu.popup()
                }
            }
        }

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
                property bool selected: root.selection.indexOf(row.modelData.path) !== -1
                color: selected ? Theme.selection : (rowMA.containsMouse ? Theme.bgHover : "transparent")
                border.color: selected ? Theme.selectionBorder : "transparent"
                border.width: 1
            }

            Row {
                anchors.fill: parent
                anchors.leftMargin: 8; anchors.rightMargin: 8
                spacing: 0

                // Icon with badge overlay
                Item {
                    id: iconItem
                    width: root._colIcon; height: parent.height

                    property string _thumbnailSource: ""

                    ThemeIcon {
                        anchors.centerIn: parent
                        width: 24; height: 24
                        iconName: row.modelData.iconName
                                || (row.modelData.isDir ? "inode-directory" : "application-x-generic")
                        visible: iconItem._thumbnailSource === ""
                    }

                    Image {
                        anchors.centerIn: parent
                        width: 24; height: 24
                        source: iconItem._thumbnailSource
                        visible: iconItem._thumbnailSource !== ""
                        fillMode: Image.PreserveAspectFit
                        smooth: true
                        sourceSize.width: 24
                        sourceSize.height: 24
                        cache: true
                    }

                    property var _badges: []
                    Component.onCompleted: {
                        if (row.modelData && !row.modelData.isDir) {
                            root.getFileBadges(row.modelData.path, function(badges, _err) {
                                iconItem._badges = badges || []
                            })
                            if (root.inlineThumbnails && root._isThumbnailable(row.modelData.mimeType)) {
                                root.getThumbnail(row.modelData.path, 0, function(result, _err) {
                                    if (result && result.thumbnailPath)
                                        iconItem._thumbnailSource = "file://" + result.thumbnailPath
                                })
                            }
                        }
                    }

                    // Badge overlay — bottom-right corner
                    ThemeIcon {
                        anchors.bottom: parent.bottom
                        anchors.right: parent.right
                        width: 10; height: 10
                        iconName: iconItem._badges.length > 0 ? iconItem._badges[0] : ""
                        visible: iconItem._badges.length > 0
                    }
                }

                // Name / rename editor
                Item {
                    width: root._colName; height: parent.height

                    Text {
                        anchors.fill: parent
                        visible: !row.renaming
                        text: row.modelData.name
                        color: Theme.fgMain; font.pixelSize: 13
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
                        color: Theme.fgMain; font.pixelSize: 13
                        background: Rectangle {
                            color: Theme.bgInput; radius: 3
                            border.color: Theme.borderFocus; border.width: 1
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
                    color: Theme.fgMuted; font.pixelSize: 12
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
                    color: Theme.fgMuted; font.pixelSize: 12
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
                                color: Theme.bgActive
                                Text {
                                    id: tl
                                    anchors.centerIn: parent
                                    text: modelData
                                    color: Theme.success; font.pixelSize: 10
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
                        if (root.selection.indexOf(row.modelData.path) === -1) {
                            root.selection = [row.modelData.path]
                            root._lastSelectedIndex = row.index
                        }
                        rowCtxMenu.targetPath  = row.modelData.path
                        rowCtxMenu.targetName  = row.modelData.name
                        rowCtxMenu.targetIndex = row.index
                        rowCtxMenu.targetIsDir = row.modelData.isDir
                        rowCtxMenu.popup()
                    } else {
                        var path = row.modelData.path
                        var currentSelection = root.selection.slice()

                        if (mouse.modifiers & Qt.ControlModifier) {
                            var idx = currentSelection.indexOf(path)
                            if (idx === -1) currentSelection.push(path)
                            else           currentSelection.splice(idx, 1)
                            root._lastSelectedIndex = row.index
                        } else if (mouse.modifiers & Qt.ShiftModifier && root._lastSelectedIndex !== -1) {
                            var start = Math.min(root._lastSelectedIndex, row.index)
                            var end = Math.max(root._lastSelectedIndex, row.index)
                            currentSelection = []
                            for (var i = start; i <= end; i++) {
                                currentSelection.push(root.entries[i].path)
                            }
                        } else {
                            currentSelection = [path]
                            root._lastSelectedIndex = row.index
                        }

                        root.selection = currentSelection
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

    // Context menu for empty area
    Menu {
        id: bgCtxMenu
        MenuItem {
            text: "New File"
            onTriggered: root.createFileRequested()
        }
        MenuItem {
            text: "New Folder"
            onTriggered: root.createDirectoryRequested()
        }
        MenuSeparator {}
        MenuItem {
            text: "Paste"
            onTriggered: root.pasteRequested()
        }
    }

    Menu {
        id: rowCtxMenu
        property string targetPath: ""
        property string targetName: ""
        property int    targetIndex: -1
        property bool   targetIsDir: false
        property var    _extActions: []

        onAboutToShow: {
            _extActions = []
            root.getFileActions(targetPath, function(actions, _err) {
                rowCtxMenu._extActions = actions || []
            })
        }

        MenuItem {
            text: "Open"
            onTriggered: {
                if (rowCtxMenu.targetIsDir)
                    root.directoryActivated(rowCtxMenu.targetPath)
                else
                    root.fileOpenRequested(rowCtxMenu.targetPath)
            }
        }
        MenuItem {
            text: "Open With..."
            visible: !rowCtxMenu.targetIsDir
            onTriggered: {
                if (rowCtxMenu.targetPath)
                    root.openWithRequested(rowCtxMenu.targetPath)
            }
        }
        MenuItem {
            text: "Open in Terminal"
            onTriggered: {
                var dir = rowCtxMenu.targetIsDir ? rowCtxMenu.targetPath
                         : rowCtxMenu.targetPath.substring(0, rowCtxMenu.targetPath.lastIndexOf("/"))
                root.openInTerminalRequested(dir)
            }
        }
        MenuSeparator {}
        MenuItem {
            text: "Copy"
            onTriggered: root.copyRequested(false)
        }
        MenuItem {
            text: "Cut"
            onTriggered: root.copyRequested(true)
        }
        MenuItem {
            text: "Paste"
            onTriggered: root.pasteRequested()
        }
        MenuSeparator {}
        MenuItem {
            text: "Rename"
            onTriggered: root._renamingIndex = rowCtxMenu.targetIndex
        }
        MenuItem {
            text: "Move to Trash"
            onTriggered: {
                if (rowCtxMenu.targetPath)
                    root.deleteRequested(rowCtxMenu.targetPath)
            }
        }
        MenuSeparator { visible: rowCtxMenu._extActions.length > 0 }
        Repeater {
            model: rowCtxMenu._extActions
            MenuItem {
                required property var modelData
                text: modelData.label
                onTriggered: root.runFileAction(rowCtxMenu.targetPath, modelData.id)
            }
        }
    }
}
