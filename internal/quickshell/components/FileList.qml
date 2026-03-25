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
    property bool singleClick: false
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
    signal filesDropped(var urls, string targetPath, bool isCopy)

    property bool selectionMode: false

    function selectAll() {
        var all = []
        for (var i = 0; i < entries.length; i++) {
            all.push(entries[i].path)
        }
        root.selection = all
    }

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
                width: root._colName; height: parent.height; text: I18n.tr("list.header.name")
                column: "name"; active: root.sortColumn === "name"
                ascending: root.sortAscending
                onClicked: root.sortRequested("name", active ? !ascending : true)
            }
            HeaderItem {
                width: root._colSize; height: parent.height; text: I18n.tr("list.header.size")
                column: "size"; active: root.sortColumn === "size"
                ascending: root.sortAscending
                horizontalAlignment: Text.AlignRight
                onClicked: root.sortRequested("size", active ? !ascending : true)
            }
            HeaderItem {
                width: root._colMtime; height: parent.height; text: I18n.tr("list.header.mtime")
                column: "mtime"; active: root.sortColumn === "mtime"
                ascending: root.sortAscending; leftPadding: 8
                onClicked: root.sortRequested("mtime", active ? !ascending : true)
            }
            HeaderItem {
                width: root._colTags;  height: parent.height; text: I18n.tr("list.header.tags")
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

        // Background DropArea
        DropArea {
            anchors.fill: parent
            onDropped: (drop) => {
                root.filesDropped(drop.urls, "", drop.proposedAction === Qt.CopyAction)
            }
        }

        delegate: Item {
            id: row
            required property var modelData
            required property int index
            width: listView.width
            height: 40

            property bool renaming: root._renamingIndex === row.index

            // Hover / selection background
            Rectangle {
                id: rowRect
                anchors.fill: parent
                anchors.leftMargin: 4; anchors.rightMargin: 4
                radius: 4
                property bool selected: root.selection.indexOf(row.modelData.path) !== -1
                color: selected ? Theme.selection : (rowMA.containsMouse ? Theme.bgHover : "transparent")
                border.color: selected ? Theme.selectionBorder : "transparent"
                border.width: 1

                // DropArea for folders
                DropArea {
                    anchors.fill: parent
                    enabled: row.modelData.isDir
                    onEntered: (drag) => {
                        rowRect.border.color = Theme.accent
                        rowRect.border.width = 2
                    }
                    onExited: {
                        rowRect.border.color = rowRect.selected ? Theme.selectionBorder : "transparent"
                        rowRect.border.width = 1
                    }
                    onDropped: (drop) => {
                        rowRect.border.color = rowRect.selected ? Theme.selectionBorder : "transparent"
                        rowRect.border.width = 1
                        root.filesDropped(drop.urls, row.modelData.path, drop.proposedAction === Qt.CopyAction)
                    }
                }
            }

            Row {
                anchors.fill: parent
                anchors.leftMargin: 8; anchors.rightMargin: 8
                spacing: 0

                // Selection checkbox
                CheckBox {
                    width: 32; height: parent.height
                    visible: root.selectionMode
                    checked: rowRect.selected
                    onToggled: {
                        var path = row.modelData.path
                        var currentSelection = root.selection.slice()
                        var idx = currentSelection.indexOf(path)
                        if (checked && idx === -1) currentSelection.push(path)
                        else if (!checked && idx !== -1) currentSelection.splice(idx, 1)
                        root.selection = currentSelection
                    }
                }

                // Icon with badge overlay
                Item {
                    id: iconItem
                    width: root._colIcon; height: parent.height

                    property string _thumbnailSource: ""
                    function refreshThumbnail() {
                        if (!row.modelData || row.modelData.isDir) {
                            iconItem._thumbnailSource = ""
                            return
                        }
                        if (!root.inlineThumbnails || !root._isThumbnailable(row.modelData.mimeType)) {
                            iconItem._thumbnailSource = ""
                            return
                        }
                        root.getThumbnail(row.modelData.path, 0, function(result, _err) {
                            if (result && result.thumbnailPath)
                                iconItem._thumbnailSource = "file://" + result.thumbnailPath
                        })
                    }

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
                            iconItem.refreshThumbnail()
                        }
                    }

                    Connections {
                        target: root
                        function onInlineThumbnailsChanged() {
                            iconItem.refreshThumbnail()
                        }
                    }

                    // Badge overlay — bottom-right corner
                    Row {
                        anchors.bottom: parent.bottom
                        anchors.right: parent.right
                        spacing: 1
                        ThemeIcon {
                            iconName: "emblem-symbolic-link"
                            width: 10; height: 10
                            visible: row.modelData.isLink
                        }
                        ThemeIcon {
                            width: 10; height: 10
                            iconName: iconItem._badges.length > 0 ? iconItem._badges[0] : ""
                            visible: iconItem._badges.length > 0
                        }
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

                drag.target: dragProxy

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

                        if (root.singleClick && !(mouse.modifiers & (Qt.ControlModifier | Qt.ShiftModifier))) {
                            if (row.modelData.isDir) root.directoryActivated(row.modelData.path)
                            else                     root.fileOpenRequested(row.modelData.path)
                        }
                    }
                }

                onDoubleClicked: (mouse) => {
                    if (mouse.button !== Qt.LeftButton) return
                    if (row.modelData.isDir) root.directoryActivated(row.modelData.path)
                    else                     root.fileOpenRequested(row.modelData.path)
                }

                Item {
                    id: dragProxy
                    width: 1; height: 1
                    Drag.active: rowMA.drag.active
                    Drag.hotSpot.x: 0
                    Drag.hotSpot.y: 0
                    Drag.mimeData: { "text/uri-list": root.selection.map(p => "file://" + p).join("\n") }
                    Drag.dragType: Drag.Internal
                    visible: false
                }

                ThemeIcon {
                    visible: rowMA.drag.active
                    iconName: row.modelData.iconName || (row.modelData.isDir ? "folder" : "application-x-generic")
                    width: 24; height: 24
                    opacity: 0.7
                    x: rowMA.mouseX - 12
                    y: rowMA.mouseY - 12
                    z: 100
                }
            }
        }
    }

    // Context menu for empty area
    Menu {
        id: bgCtxMenu
        MenuItem {
            text: I18n.tr("menu.new_file")
            onTriggered: root.createFileRequested()
        }
        MenuItem {
            text: I18n.tr("menu.new_folder")
            onTriggered: root.createDirectoryRequested()
        }
        MenuSeparator {}
        MenuItem {
            text: I18n.tr("menu.paste")
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
            text: I18n.tr("menu.open")
            onTriggered: {
                if (rowCtxMenu.targetIsDir)
                    root.directoryActivated(rowCtxMenu.targetPath)
                else
                    root.fileOpenRequested(rowCtxMenu.targetPath)
            }
        }
        MenuItem {
            text: I18n.tr("menu.open_with")
            visible: !rowCtxMenu.targetIsDir
            onTriggered: {
                if (rowCtxMenu.targetPath)
                    root.openWithRequested(rowCtxMenu.targetPath)
            }
        }
        MenuItem {
            text: I18n.tr("menu.open_terminal")
            onTriggered: {
                var dir = rowCtxMenu.targetIsDir ? rowCtxMenu.targetPath
                         : rowCtxMenu.targetPath.substring(0, rowCtxMenu.targetPath.lastIndexOf("/"))
                root.openInTerminalRequested(dir)
            }
        }
        MenuSeparator {}
        MenuItem {
            text: I18n.tr("menu.copy")
            onTriggered: root.copyRequested(false)
        }
        MenuItem {
            text: I18n.tr("menu.cut")
            onTriggered: root.copyRequested(true)
        }
        MenuItem {
            text: I18n.tr("menu.paste")
            onTriggered: root.pasteRequested()
        }
        MenuSeparator {}
        MenuItem {
            text: I18n.tr("menu.rename")
            onTriggered: root._renamingIndex = rowCtxMenu.targetIndex
        }
        MenuItem {
            text: I18n.tr("menu.delete")
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
