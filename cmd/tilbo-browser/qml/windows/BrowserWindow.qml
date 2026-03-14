import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

import "../components" as Components

ApplicationWindow {
    id: window
    visible: true
    width: 1200
    height: 700
    title: "Tilbo Browser"
    
    // QtQuick dark aesthetic
    color: "#1A1C23"

    // Go-to-QML mappings (provided by Go context properties)
    property int openRole: typeof fsRoleOpen !== "undefined" ? fsRoleOpen : 262
    property int cdRole: typeof fsRoleCD !== "undefined" ? fsRoleCD : 266
    property int toggleHiddenRole: typeof fsRoleToggleHidden !== "undefined" ? fsRoleToggleHidden : 267

    property bool isGridView: true
    property var selectedFile: null
    property int selectedFileRow: -1
    property string currentPath: typeof browserInitialPath !== "undefined" ? browserInitialPath : "/"
    property bool pathEditMode: false

    property int statFileRole: typeof fsRoleStatFile !== "undefined" ? fsRoleStatFile : -1
    property int sizeRole: typeof fsRoleSize !== "undefined" ? fsRoleSize : 259
    property int modifiedRole: typeof fsRoleModified !== "undefined" ? fsRoleModified : 260
    property int metadataRole: typeof fsRoleMetadata !== "undefined" ? fsRoleMetadata : -1

    property bool showLeftSidebar: true
    property bool showRightSidebar: !!selectedFile
    property var selectedFileMeta: null   // map of user metadata key→value
    property string selectedMetaPath: ""
    property bool metaExpanded: true      // collapsible state

    // Automatically show right sidebar when a file is selected
    onSelectedFileChanged: {
        if (selectedFile) {
            showRightSidebar = true
            var nextPath = selectedFile.path ? selectedFile.path.toString() : ""
            var pathChanged = nextPath !== selectedMetaPath
            if (pathChanged) {
                selectedFileMeta = null
            }
            selectedMetaPath = nextPath
            console.debug("properties: selectedFileChanged", selectedFile.path, "modified", selectedFile.modified, "row", selectedFile.row)
            if (pathChanged && typeof fsModel.loadMetadata === "function") {
                var immediateRaw = fsModel.loadMetadata(selectedFile.path, selectedFile.modified || 0)
                console.debug("properties: loadMetadata raw", immediateRaw)
                if (immediateRaw && immediateRaw !== "") {
                    try {
                        var immediateObj = JSON.parse(immediateRaw)
                        window.selectedFileMeta = immediateObj.userMeta || {}
                        console.debug("properties: immediate metadata keys", Object.keys(window.selectedFileMeta || {}).length, JSON.stringify(window.selectedFileMeta || {}))
                    } catch(e) {}
                }
            }
            if (pathChanged && typeof fsModel.requestMetadata === "function") {
                console.debug("properties: requestMetadata", selectedFile.path)
                fsModel.requestMetadata(selectedFile.path)
                metaPollTimer.restart()
            } else if (pathChanged) {
                metaPollTimer.stop()
            }
        } else {
            selectedFileMeta = null
            selectedMetaPath = ""
            metaPollTimer.stop()
        }
    }

    // Poll for async metadata result after file selection.
    Timer {
        id: metaPollTimer
        interval: 100
        repeat: true
        running: false
        onTriggered: {
            if (!window.selectedFile) { stop(); return }
            var raw = (typeof fsModel.takeMetadata === "function")
                ? fsModel.takeMetadata(window.selectedFile.path)
                : ""
            console.debug("properties: takeMetadata raw", raw)
            if (raw && raw !== "") {
                try {
                    var obj = JSON.parse(raw)
                    window.selectedFileMeta = obj.userMeta || null
                    console.debug("properties: async metadata keys", Object.keys(window.selectedFileMeta || {}).length, JSON.stringify(window.selectedFileMeta || {}))
                } catch(e) {}
                stop()
            }
        }
    }

    function navigateTo(path) {
        var target = path ? path.toString() : ""
        if (!target || target === "") {
            return
        }
        currentPath = target
        var ok = false
        if (typeof fsModel.setPath === "function") {
            fsModel.setPath(target)
            ok = true
        } else {
            ok = fsModel.setData(fsModel.index(0, 0), target, window.cdRole)
        }
        if (!ok) {
            console.warn("navigateTo dispatch failed", target)
        }
    }

    function enterPathEditMode() {
        window.pathEditMode = true
        pathEditor.text = window.currentPath
        pathEditor.forceActiveFocus()
        pathEditor.selectAll()
    }

    function selectFile(fileData) {
        if (!fileData) {
            window.selectedFile = null
            window.selectedFileRow = -1
            return
        }

        console.debug("properties: selectFile", fileData.path, "modified", fileData.modified, "row", fileData.row)

        window.selectedFile = fileData
        window.selectedFileRow = fileData.row !== undefined ? fileData.row : -1

        // Trigger a fresh stat on the selected file so the properties panel
        // shows current size and mtime even if the directory listing is stale.
        if (window.selectedFileRow >= 0 && window.statFileRole >= 0) {
            fsModel.setData(fsModel.index(window.selectedFileRow, 0), true, window.statFileRole)
        }
    }

    // Refresh selectedFile size/mtime when the model item is updated by the
    // background stat goroutine (triggered via ActionStatFileRole above).
    Connections {
        target: fsModel
        function onDataChanged(topLeft, bottomRight, roles) {
            if (!window.selectedFile || window.selectedFileRow < 0) return
            if (window.selectedFileRow < topLeft.row || window.selectedFileRow > bottomRight.row) return
            var idx = fsModel.index(window.selectedFileRow, 0)
            var freshSize = fsModel.data(idx, window.sizeRole)
            var freshModified = fsModel.data(idx, window.modifiedRole)
            var freshMetadataRaw = window.metadataRole >= 0 ? fsModel.data(idx, window.metadataRole) : ""
            console.debug("properties: onDataChanged metadata role raw", freshMetadataRaw)
            var freshMetadata = window.selectedFileMeta || {}
            if (freshMetadataRaw && freshMetadataRaw !== "") {
                try {
                    var freshMetadataObj = JSON.parse(freshMetadataRaw)
                    freshMetadata = freshMetadataObj.userMeta || {}
                    window.selectedFileMeta = freshMetadata
                    console.debug("properties: metadata role keys", Object.keys(freshMetadata).length, JSON.stringify(freshMetadata))
                } catch(e) {
                    console.debug("properties: metadata role parse failed", e)
                }
            }
            window.selectedFile = Object.assign({}, window.selectedFile, {
                size: freshSize,
                modified: freshModified
            })
        }
    }

    function breadcrumbModel(path) {
        var crumbs = []
        if (!path || path === "/") {
            crumbs.push({ "label": "/", "path": "/" })
            return crumbs
        }

        crumbs.push({ "label": "/", "path": "/" })
        var parts = path.split("/")
        var acc = ""
        for (var i = 0; i < parts.length; i++) {
            var part = parts[i]
            if (!part || part === "") {
                continue
            }
            acc += "/" + part
            crumbs.push({ "label": part, "path": acc })
        }
        return crumbs
    }

    function scrollBreadcrumbsToEnd() {
        breadcrumbFlick.contentX = Math.max(0, breadcrumbFlick.contentWidth - breadcrumbFlick.width)
    }

    onCurrentPathChanged: {
        window.selectedFileRow = -1
        Qt.callLater(window.scrollBreadcrumbsToEnd)
    }

    header: ToolBar {
        background: Rectangle { color: "#22252E" }
        height: 60 // Explicitly set height to ensure containment
        RowLayout {
            anchors.fill: parent
            anchors.leftMargin: 16
            anchors.rightMargin: 16
            anchors.verticalCenter: parent.verticalCenter
            spacing: 16

            Label {
                text: "tilbo"
                font.pixelSize: 20
                font.bold: true
                color: "#88C0D0"
                font.family: "Inter, sans-serif"
            }

            Components.TagSearchBar {
                Layout.fillWidth: true
                Layout.preferredHeight: 40 // Taller
            }

            Button {
                text: window.isGridView ? "List ☰" : "Grid ⊞"
                Layout.preferredHeight: 40
                onClicked: window.isGridView = !window.isGridView
            }

            Button {
                text: "Hidden"
                checkable: true
                Layout.preferredHeight: 40
                onToggled: {
                    fsModel.setData(fsModel.index(0, 0), checked, window.toggleHiddenRole)
                }
            }
        }
    }

    RowLayout {
        anchors.fill: parent
        spacing: 0

        // Always visible Left vertical title strip
        Rectangle {
            Layout.preferredWidth: 36
            Layout.fillHeight: true
            color: "#1E212A"
            
            Rectangle {
                anchors.fill: parent
                color: maLeftToggle.containsMouse ? "#2A2E39" : "transparent"
            }

            Text {
                text: "PLACES"
                color: "#88C0D0"
                font.pixelSize: 14
                font.bold: true
                font.letterSpacing: 2
                rotation: -90
                anchors.centerIn: parent
            }

            MouseArea {
                id: maLeftToggle
                anchors.fill: parent
                hoverEnabled: true
                cursorShape: Qt.PointingHandCursor
                onClicked: window.showLeftSidebar = !window.showLeftSidebar
            }
        }

        // Sidebar Left Content
        Rectangle {
            Layout.preferredWidth: window.showLeftSidebar ? 200 : 0
            Layout.fillHeight: true
            color: "#1E212A"
            clip: true
            Behavior on Layout.preferredWidth { NumberAnimation { duration: 250; easing.type: Easing.InOutQuad } }

            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 16
                spacing: 12
                visible: window.showLeftSidebar

                ListView {
                    id: placesList
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    clip: true
                    model: placesModel

                    ScrollBar.vertical: ScrollBar {
                        id: placesScrollBar
                        policy: ScrollBar.AsNeeded
                    }

                    delegate: ItemDelegate {
                        required property string placeName
                        required property string placePath

                        width: ListView.view.width
                        leftPadding: 12
                        rightPadding: 12 + (placesScrollBar.visible ? placesScrollBar.width + 8 : 0)
                        text: placeName
                        onClicked: window.navigateTo(placePath)
                        contentItem: Text {
                            text: parent.text
                            font.pixelSize: 14
                            color: "#ECEFF4"
                        }
                        background: Rectangle {
                            x: 8
                            width: parent.width - 16 - (placesScrollBar.visible ? placesScrollBar.width + 8 : 0)
                            color: parent.hovered ? "#2E3440" : "transparent"
                            radius: 4
                        }
                    }
                }
            }
        }

        // Main File View
        Rectangle {
            Layout.fillWidth: true
            Layout.fillHeight: true
            color: "#111419" // Very dark grid bg
            
            StackLayout {
                anchors.fill: parent
                currentIndex: window.isGridView ? 0 : 1

                Components.FileGrid {
                    model: fsModel
                    onFileSelected: (fileData) => { window.selectFile(fileData); }
                    onDirectoryActivated: (path) => { window.currentPath = path; }
                }

                Components.FileList {
                    model: fsModel
                    onFileSelected: (fileData) => { window.selectFile(fileData); }
                    onDirectoryActivated: (path) => { window.currentPath = path; }
                }
            }
        }

        // Properties Sidebar Right Content
        Rectangle {
            Layout.preferredWidth: window.showRightSidebar ? 260 : 0
            Layout.fillHeight: true
            color: "#1E212A"
            clip: true
            Behavior on Layout.preferredWidth { NumberAnimation { duration: 250; easing.type: Easing.InOutQuad } }

            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 16
                spacing: 12
                visible: window.showRightSidebar

                Rectangle {
                    Layout.fillWidth: true
                    height: 1
                    color: "#3B4252"
                }

                // If nothing is selected
                Item {
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    visible: !window.selectedFile

                    Text {
                        anchors.centerIn: parent
                        text: "Select a file to view properties"
                        color: "#4C566A"
                        font.pixelSize: 13
                        wrapMode: Text.WordWrap
                        horizontalAlignment: Text.AlignHCenter
                        width: parent.width - 20
                    }
                }

                // If something is selected
                ScrollView {
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    visible: !!window.selectedFile
                    clip: true
                    ScrollBar.horizontal.policy: ScrollBar.AlwaysOff

                    contentWidth: availableWidth

                    ColumnLayout {
                        width: parent.width
                        spacing: 12

                        // Icon
                        Rectangle {
                            Layout.alignment: Qt.AlignHCenter
                            Layout.preferredWidth: 64
                            Layout.preferredHeight: 64
                            radius: 8
                            color: window.selectedFile && window.selectedFile.isDir ? "#4A90E2" : "#555A64"
                            Text {
                                anchors.centerIn: parent
                                text: window.selectedFile && window.selectedFile.isDir ? "📁" : "📄"
                                font.pixelSize: 32
                            }
                        }

                        // Name
                        Text {
                            Layout.fillWidth: true
                            text: window.selectedFile ? window.selectedFile.name : ""
                            color: "#ECEFF4"
                            font.pixelSize: 16
                            font.bold: true
                            wrapMode: Text.WrapAnywhere
                            horizontalAlignment: Text.AlignHCenter
                        }

                        // Details
                        GridLayout {
                            Layout.fillWidth: true
                            columns: 2
                            rowSpacing: 8
                            columnSpacing: 8

                            Text { text: "Path:"; color: "#88C0D0"; font.pixelSize: 13 }
                            Text { 
                                text: window.selectedFile ? window.selectedFile.path : ""
                                color: "#D8DEE9"
                                font.pixelSize: 12
                                Layout.fillWidth: true
                                elide: Text.ElideMiddle
                            }

                            Text { text: "Size:"; color: "#88C0D0"; font.pixelSize: 13 }
                            Text { 
                                text: window.selectedFile ? (window.selectedFile.isDir ? "--" : (window.selectedFile.size / 1024).toFixed(1) + " KB") : ""
                                color: "#D8DEE9"
                                font.pixelSize: 13
                                Layout.fillWidth: true
                                elide: Text.ElideRight
                            }

                            Text { text: "Modified:"; color: "#88C0D0"; font.pixelSize: 13 }
                            Text { 
                                // The unix modified timestamp from Go
                                text: window.selectedFile && window.selectedFile.modified ? new Date(window.selectedFile.modified * 1000).toLocaleString(Qt.locale(), Locale.ShortFormat) : ""
                                color: "#D8DEE9"
                                font.pixelSize: 13
                                Layout.fillWidth: true
                                elide: Text.ElideRight
                            }
                        }

                        Rectangle {
                            Layout.fillWidth: true
                            Layout.preferredHeight: 1
                            Layout.topMargin: 8
                            color: "#3B4252"
                            visible: window.selectedFileMeta !== null &&
                                     Object.keys(window.selectedFileMeta || {}).length > 0
                        }

                        // User metadata section in properties sidebar, directly after file details.
                        Rectangle {
                            Layout.fillWidth: true
                            Layout.preferredHeight: 220
                            visible: window.selectedFileMeta !== null &&
                                     Object.keys(window.selectedFileMeta || {}).length > 0
                            color: "#252A35"
                            border.color: "#3B4252"
                            border.width: 1
                            radius: 6

                            Column {
                                anchors.fill: parent
                                anchors.margins: 8
                                spacing: 6

                                Text {
                                    text: "Metadata (" + Object.keys(window.selectedFileMeta || {}).length + ")"
                                    color: "#88C0D0"
                                    font.pixelSize: 13
                                    font.bold: true
                                }

                                ListView {
                                    id: metadataList
                                    width: parent.width
                                    height: parent.height - 28
                                    clip: true

                                    model: {
                                        var m = window.selectedFileMeta
                                        if (!m) return []
                                        var keys = Object.keys(m).sort()
                                        console.debug("properties: rendering metadata list", keys.length, JSON.stringify(m))
                                        return keys
                                    }

                                    delegate: Row {
                                        width: metadataList.width
                                        spacing: 6

                                        Text {
                                            text: modelData
                                            width: 90
                                            color: "#88C0D0"
                                            font.pixelSize: 11
                                            elide: Text.ElideRight
                                        }

                                        Text {
                                            text: (window.selectedFileMeta && window.selectedFileMeta[modelData]) ? window.selectedFileMeta[modelData] : ""
                                            width: metadataList.width - 96
                                            color: "#D8DEE9"
                                            font.pixelSize: 11
                                            wrapMode: Text.WrapAnywhere
                                        }
                                    }

                                    ScrollBar.vertical: ScrollBar {
                                        policy: ScrollBar.AsNeeded
                                    }
                                }
                            }
                        }

                        Label {
                            text: "Tags"
                            color: "#88C0D0"
                            font.pixelSize: 13
                            Layout.topMargin: 8
                            visible: window.selectedFile && window.selectedFile.tags && window.selectedFile.tags.length > 0
                        }

                        Flow {
                            Layout.fillWidth: true
                            spacing: 4
                            visible: window.selectedFile && window.selectedFile.tags && window.selectedFile.tags.length > 0
                            Repeater {
                                model: window.selectedFile && window.selectedFile.tags ? window.selectedFile.tags : []
                                Rectangle {
                                    height: 22
                                    width: propTagTxt.width + 16
                                    radius: 4
                                    color: "#3B4252"
                                    border.color: "#4C566A"
                                    border.width: 1
                                    Text {
                                        id: propTagTxt
                                        anchors.centerIn: parent
                                        text: modelData
                                        color: "#A3BE8C"
                                        font.pixelSize: 12
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Always visible Right vertical title strip
        Rectangle {
            Layout.preferredWidth: 36
            Layout.fillHeight: true
            color: "#1E212A"
            
            Rectangle {
                anchors.fill: parent
                color: maRightToggle.containsMouse ? "#2A2E39" : "transparent"
            }

            Text {
                text: "PROPERTIES"
                color: "#88C0D0"
                font.pixelSize: 14
                font.bold: true
                font.letterSpacing: 2
                rotation: -90
                anchors.centerIn: parent
            }

            MouseArea {
                id: maRightToggle
                anchors.fill: parent
                hoverEnabled: true
                cursorShape: Qt.PointingHandCursor
                onClicked: window.showRightSidebar = !window.showRightSidebar
            }
        }
    }

    footer: ToolBar {
        height: 42
        background: Rectangle { color: "#1E212A" }

        RowLayout {
            anchors.fill: parent
            anchors.leftMargin: 12
            anchors.rightMargin: 12
            spacing: 8

            Item {
                Layout.fillWidth: true
                Layout.fillHeight: true

                StackLayout {
                    anchors.fill: parent
                    currentIndex: window.pathEditMode ? 1 : 0

                    Flickable {
                        id: breadcrumbFlick
                        clip: true
                        contentWidth: breadcrumbRow.implicitWidth
                        contentHeight: height
                        boundsBehavior: Flickable.StopAtBounds
                        onContentWidthChanged: Qt.callLater(window.scrollBreadcrumbsToEnd)
                        onWidthChanged: Qt.callLater(window.scrollBreadcrumbsToEnd)

                        Row {
                            id: breadcrumbRow
                            height: parent.height
                            spacing: 4

                            Repeater {
                                id: breadcrumbRepeater
                                model: window.breadcrumbModel(window.currentPath)
                                delegate: Row {
                                    height: parent.height
                                    spacing: 4

                                    Text {
                                        visible: index > 0
                                        text: "›"
                                        color: "#6B7280"
                                        font.pixelSize: 13
                                        anchors.verticalCenter: parent.verticalCenter
                                    }

                                    Item {
                                        height: parent.height
                                        width: Math.min(220, breadcrumbLabel.implicitWidth)

                                        Text {
                                            id: breadcrumbLabel
                                            width: parent.width
                                            anchors.verticalCenter: parent.verticalCenter
                                            text: modelData.label
                                            color: breadcrumbMouse.containsMouse ? "#88C0D0" : "#D8DEE9"
                                            font.pixelSize: 13
                                            elide: Text.ElideRight
                                        }

                                        MouseArea {
                                            id: breadcrumbMouse
                                            anchors.fill: parent
                                            hoverEnabled: true
                                            cursorShape: Qt.PointingHandCursor
                                            onClicked: {
                                                if (index === breadcrumbRepeater.count - 1) {
                                                    window.enterPathEditMode()
                                                } else {
                                                    window.navigateTo(modelData.path)
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    TextField {
                        id: pathEditor
                        Layout.fillWidth: true
                        Layout.preferredHeight: 30
                        text: window.currentPath
                        color: "#D8DEE9"
                        background: Rectangle {
                            color: "#1A1C23"
                            radius: 4
                            border.width: 1
                            border.color: parent.activeFocus ? "#5E81AC" : "#3B4252"
                        }
                        onAccepted: {
                            window.navigateTo(text)
                            window.pathEditMode = false
                        }
                        Keys.onEscapePressed: {
                            text = window.currentPath
                            window.pathEditMode = false
                        }
                    }
                }
            }

            Item {
                Layout.preferredWidth: 22
                Layout.fillHeight: true

                Text {
                    anchors.centerIn: parent
                    text: window.pathEditMode ? "✓" : "✎"
                    color: editPathMouse.containsMouse ? "#88C0D0" : "#D8DEE9"
                    font.pixelSize: 15
                }

                MouseArea {
                    id: editPathMouse
                    anchors.fill: parent
                    hoverEnabled: true
                    cursorShape: Qt.PointingHandCursor
                    onClicked: {
                        if (window.pathEditMode) {
                            window.navigateTo(pathEditor.text)
                            window.pathEditMode = false
                        } else {
                            window.enterPathEditMode()
                        }
                    }
                }
            }

        }
    }

}
