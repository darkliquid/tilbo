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
import "../services"

Item {
    id: root

    property var entries: []
    property bool inlineThumbnails: false
    property bool singleClick: false
    property var selection: []
    property int _lastSelectedIndex: -1
    property int iconSize: 48

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

    // Helper to check if a MIME type is thumbnailable.
    function _isThumbnailable(mime) {
        return mime && (mime.indexOf("image/") === 0 || mime.indexOf("video/") === 0)
    }

    // Index of the cell currently being renamed; -1 means none.
    property int _renamingIndex: -1

    property bool selectionMode: false

    function selectAll() {
        var all = []
        for (var i = 0; i < entries.length; i++) {
            all.push(entries[i].path)
        }
        root.selection = all
    }

    GridView {
        id: grid
        anchors.fill: parent
        anchors.margins: 8

        // Rubber band selection
        Rectangle {
            id: rubberBand
            property int startX: 0
            property int startY: 0
            visible: false
            color: Theme.selection
            opacity: 0.3
            border.color: Theme.selectionBorder
            border.width: 1
            z: 10
        }

        MouseArea {
            anchors.fill: parent
            z: -1
            acceptedButtons: Qt.LeftButton | Qt.RightButton
            onPressed: (mouse) => {
                if (mouse.button === Qt.LeftButton) {
                    rubberBand.startX = mouse.x + grid.contentX
                    rubberBand.startY = mouse.y + grid.contentY
                    rubberBand.x = mouse.x
                    rubberBand.y = mouse.y
                    rubberBand.width = 0
                    rubberBand.height = 0
                    rubberBand.visible = true
                }
            }
            onPositionChanged: (mouse) => {
                if (rubberBand.visible) {
                    var curX = mouse.x + grid.contentX
                    var curY = mouse.y + grid.contentY
                    rubberBand.x = Math.min(rubberBand.startX, curX) - grid.contentX
                    rubberBand.y = Math.min(rubberBand.startY, curY) - grid.contentY
                    rubberBand.width = Math.abs(curX - rubberBand.startX)
                    rubberBand.height = Math.abs(curY - rubberBand.startY)

                    // Update selection based on intersection
                    var newSelection = []
                    for (var i = 0; i < grid.count; i++) {
                        var item = grid.contentItem.children[i]
                        if (!item || item.index === undefined) continue
                        
                        var itemX = item.x
                        var itemY = item.y
                        if (itemX + item.width > rubberBand.x + grid.contentX &&
                            itemX < rubberBand.x + grid.contentX + rubberBand.width &&
                            itemY + item.height > rubberBand.y + grid.contentY &&
                            itemY < rubberBand.y + grid.contentY + rubberBand.height) {
                            newSelection.push(root.entries[i].path)
                        }
                    }
                    root.selection = newSelection
                }
            }
            onReleased: (mouse) => {
                rubberBand.visible = false
                if (mouse.button === Qt.RightButton) {
                    root.selection = []
                    root._lastSelectedIndex = -1
                    bgCtxMenu.popup()
                }
            }
        }

        model: root.entries
        cellWidth: root.iconSize + 100
        cellHeight: root.iconSize + 116
        clip: true
        ScrollBar.vertical: ScrollBar { policy: ScrollBar.AsNeeded }

        // Background DropArea for dropping into current directory
        DropArea {
            anchors.fill: parent
            onDropped: (drop) => {
                root.filesDropped(drop.urls, "", drop.proposedAction === Qt.CopyAction)
            }
        }

        delegate: Item {
            id: cell
            required property var modelData
            required property int index
            width: grid.cellWidth
            height: grid.cellHeight

            property bool renaming: root._renamingIndex === cell.index

            Rectangle {
                id: cellRect
                anchors.fill: parent
                anchors.margins: 4
                radius: 6
                property bool selected: root.selection.indexOf(cell.modelData.path) !== -1
                color: selected ? Theme.selection : (cellMA.containsMouse && !cell.renaming ? Theme.bgHover : "transparent")
                border.color: selected ? Theme.selectionBorder : (cellMA.containsMouse && !cell.renaming ? Theme.fgDeemphasized : "transparent")
                border.width: 1

                Column {
                    anchors.fill: parent
                    anchors.margins: 8
                    spacing: 4

                    // File type icon / thumbnail with badge overlay
                    Item {
                        id: gridIconItem
                        anchors.horizontalCenter: parent.horizontalCenter
                        width: root.iconSize; height: root.iconSize

                        property string _thumbnailSource: ""
                        function refreshThumbnail() {
                            if (cell.modelData.isDir) {
                                gridIconItem._thumbnailSource = ""
                                return
                            }
                            if (!root.inlineThumbnails || !root._isThumbnailable(cell.modelData.mimeType)) {
                                gridIconItem._thumbnailSource = ""
                                return
                            }
                            root.getThumbnail(cell.modelData.path, 0, function(result, _err) {
                                if (result && result.thumbnailPath)
                                    gridIconItem._thumbnailSource = "file://" + result.thumbnailPath
                            })
                        }

                        ThemeIcon {
                            anchors.fill: parent
                            iconName: cell.modelData.iconName || (cell.modelData.isDir ? "folder" : "application-x-generic")
                            visible: gridIconItem._thumbnailSource === ""
                        }

                        Image {
                            anchors.fill: parent
                            source: gridIconItem._thumbnailSource
                            visible: gridIconItem._thumbnailSource !== ""
                            fillMode: Image.PreserveAspectFit
                            smooth: true
                            sourceSize.width: root.iconSize
                            sourceSize.height: root.iconSize
                            cache: true
                        }

                        // Badge overlays (loaded asynchronously)
                        property var _badges: []
                        Component.onCompleted: {
                            if (!cell.modelData.isDir) {
                                root.getFileBadges(cell.modelData.path, function(badges, _err) {
                                    gridIconItem._badges = badges || []
                                })
                                gridIconItem.refreshThumbnail()
                            }
                        }

                        Connections {
                            target: root
                            function onInlineThumbnailsChanged() {
                                gridIconItem.refreshThumbnail()
                            }
                        }

                        Row {
                            anchors.bottom: parent.bottom
                            anchors.right: parent.right
                            spacing: 1
                            ThemeIcon {
                                iconName: "emblem-symbolic-link"
                                width: 16; height: 16
                                visible: cell.modelData.isLink
                            }
                            Repeater {
                                model: gridIconItem._badges.slice(0, 3)
                                ThemeIcon {
                                    iconName: modelData
                                    width: 16; height: 16
                                }
                            }
                        }
                    }

                    // Selection checkbox for mass selection mode
                    CheckBox {
                        anchors.horizontalCenter: parent.horizontalCenter
                        visible: root.selectionMode
                        checked: cellRect.selected
                        onToggled: {
                            var path = cell.modelData.path
                            var currentSelection = root.selection.slice()
                            var idx = currentSelection.indexOf(path)
                            if (checked && idx === -1) currentSelection.push(path)
                            else if (!checked && idx !== -1) currentSelection.splice(idx, 1)
                            root.selection = currentSelection
                        }
                    }

                    // File name — static label
                    Text {
                        width: parent.width
                        visible: !cell.renaming
                        text: cell.modelData.name
                        color: Theme.fgMain
                        font.pixelSize: 12
                        horizontalAlignment: Text.AlignHCenter
                        elide: Text.ElideRight
                        wrapMode: Text.Wrap
                        maximumLineCount: 2
                    }

                    TextField {
                        id: renameField
                        width: parent.width
                        visible: cell.renaming
                        text: cell.modelData.name
                        color: Theme.fgMain
                        font.pixelSize: 12
                        background: Rectangle {
                            color: Theme.bgInput; radius: 3
                            border.color: Theme.borderFocus; border.width: 1
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
                                color: Theme.bgActive
                                Text {
                                    id: tagLbl
                                    anchors.centerIn: parent
                                    text: modelData
                                    color: Theme.success; font.pixelSize: 10
                                }
                            }
                        }
                    }
                }

                // DropArea for folders
                DropArea {
                    anchors.fill: parent
                    enabled: cell.modelData.isDir
                    onEntered: (drag) => {
                        cellRect.border.color = Theme.accent
                        cellRect.border.width = 2
                    }
                    onExited: {
                        cellRect.border.color = cellRect.selected ? Theme.selectionBorder : "transparent"
                        cellRect.border.width = 1
                    }
                    onDropped: (drop) => {
                        cellRect.border.color = cellRect.selected ? Theme.selectionBorder : "transparent"
                        cellRect.border.width = 1
                        root.filesDropped(drop.urls, cell.modelData.path, drop.proposedAction === Qt.CopyAction)
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

                drag.target: dragProxy

                onClicked: (mouse) => {
                    if (mouse.button === Qt.RightButton) {
                        if (root.selection.indexOf(cell.modelData.path) === -1) {
                            root.selection = [cell.modelData.path]
                            root._lastSelectedIndex = cell.index
                        }
                        ctxMenu.targetPath  = cell.modelData.path
                        ctxMenu.targetName  = cell.modelData.name
                        ctxMenu.targetIndex = cell.index
                        ctxMenu.targetIsDir = cell.modelData.isDir
                        ctxMenu.popup()
                    } else {
                        var path = cell.modelData.path
                        var currentSelection = root.selection.slice()

                        if (mouse.modifiers & Qt.ControlModifier) {
                            var idx = currentSelection.indexOf(path)
                            if (idx === -1) currentSelection.push(path)
                            else           currentSelection.splice(idx, 1)
                            root._lastSelectedIndex = cell.index
                        } else if (mouse.modifiers & Qt.ShiftModifier && root._lastSelectedIndex !== -1) {
                            var start = Math.min(root._lastSelectedIndex, cell.index)
                            var end = Math.max(root._lastSelectedIndex, cell.index)
                            currentSelection = []
                            for (var i = start; i <= end; i++) {
                                currentSelection.push(root.entries[i].path)
                            }
                        } else {
                            currentSelection = [path]
                            root._lastSelectedIndex = cell.index
                        }

                        root.selection = currentSelection
                        root.fileSelected(cell.modelData)

                        if (root.singleClick && !(mouse.modifiers & (Qt.ControlModifier | Qt.ShiftModifier))) {
                            if (cell.modelData.isDir) root.directoryActivated(cell.modelData.path)
                            else                      root.fileOpenRequested(cell.modelData.path)
                        }
                    }
                }

                onDoubleClicked: (mouse) => {
                    if (mouse.button !== Qt.LeftButton) return
                    if (cell.modelData.isDir) root.directoryActivated(cell.modelData.path)
                    else                      root.fileOpenRequested(cell.modelData.path)
                }

                Item {
                    id: dragProxy
                    width: 1; height: 1
                    Drag.active: cellMA.drag.active
                    Drag.hotSpot.x: 0
                    Drag.hotSpot.y: 0
                    Drag.mimeData: { "text/uri-list": root.selection.map(p => "file://" + p).join("\n") }
                    Drag.dragType: Drag.Internal
                    
                    // Visual feedback during drag
                    visible: false
                }
                
                // Ghost icon during drag
                ThemeIcon {
                    visible: cellMA.drag.active
                    iconName: cell.modelData.iconName || (cell.modelData.isDir ? "folder" : "application-x-generic")
                    width: 32; height: 32
                    opacity: 0.7
                    x: cellMA.mouseX - 16
                    y: cellMA.mouseY - 16
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
            text: I18n.tr("menu.open")
            onTriggered: {
                if (!ctxMenu.targetIsDir)
                    root.fileOpenRequested(ctxMenu.targetPath)
                else
                    root.directoryActivated(ctxMenu.targetPath)
            }
        }
        MenuItem {
            text: I18n.tr("menu.open_with")
            visible: !ctxMenu.targetIsDir
            onTriggered: {
                if (ctxMenu.targetPath)
                    root.openWithRequested(ctxMenu.targetPath)
            }
        }
        MenuItem {
            text: I18n.tr("menu.open_terminal")
            onTriggered: {
                var dir = ctxMenu.targetIsDir ? ctxMenu.targetPath
                         : ctxMenu.targetPath.substring(0, ctxMenu.targetPath.lastIndexOf("/"))
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
            onTriggered: root._renamingIndex = ctxMenu.targetIndex
        }
        MenuItem {
            text: I18n.tr("menu.delete")
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
