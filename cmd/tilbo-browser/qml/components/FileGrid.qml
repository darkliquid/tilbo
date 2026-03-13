import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

GridView {
    id: grid
    
    // Aesthetic config
    signal fileSelected(var fileData)
    signal directoryActivated(string path)
    cellWidth: 140
    cellHeight: 160
    clip: true
    focus: true

    property int openRole: typeof fsRoleOpen !== "undefined" ? fsRoleOpen : 262
    property int renameRole: typeof fsRoleRename !== "undefined" ? fsRoleRename : 263
    property int deleteRole: typeof fsRoleDelete !== "undefined" ? fsRoleDelete : 264
    property int cdRole: typeof fsRoleCD !== "undefined" ? fsRoleCD : 266

    model: fsModel

    leftMargin: 20
    rightMargin: 20
    topMargin: 20
    bottomMargin: 20

    ScrollBar.vertical: ScrollBar {
        active: true
        policy: ScrollBar.AsNeeded
    }

    delegate: Item {
        width: grid.cellWidth
        height: grid.cellHeight
        
        // Outer pad
        Rectangle {
            anchors.fill: parent
            anchors.margins: 10
            color: grid.currentIndex === index ? "#3b3d45" : "transparent"
            border.color: grid.currentIndex === index ? "#5c5e66" : "transparent"
            border.width: 1
            radius: 8

            // Hover effects
            MouseArea {
                id: ma
                anchors.fill: parent
                hoverEnabled: true
                onClicked: {
                    grid.currentIndex = index
                    grid.fileSelected({
                        "name": fileName,
                        "path": filePath,
                        "isDir": isDir,
                        "size": fileSize,
                        "modified": fileModified,
                        "tags": fileTags,
                        "row": index
                    })
                }
                onDoubleClicked: {
                    if (isDir) {
                        grid.directoryActivated(filePath)
                        fsModel.setData(fsModel.index(index, 0), filePath, grid.cdRole)
                    } else {
                        // Trigger open action
                        fsModel.setData(fsModel.index(index, 0), true, grid.openRole)
                    }
                }
            }

            Rectangle {
                anchors.fill: parent
                color: "#1e1e24"
                opacity: ma.containsMouse && grid.currentIndex !== index ? 0.3 : 0.0
                radius: 8
            }

            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 8
                spacing: 4

                // Icon (Folder vs File)
                Rectangle {
                    Layout.alignment: Qt.AlignHCenter
                    Layout.preferredWidth: 60
                    Layout.preferredHeight: 60
                    radius: 12
                    color: isDir ? "#4A90E2" : "#555A64"
                    
                    Text {
                        anchors.centerIn: parent
                        text: isDir ? "📁" : "📄"
                        font.pixelSize: 32
                    }
                }

                // File Name
                Text {
                    id: nameLabel
                    Layout.fillWidth: true
                    text: fileName
                    color: "#ECEFF4"
                    font.pixelSize: 13
                    font.family: "Inter, sans-serif"
                    elide: Text.ElideMiddle
                    horizontalAlignment: Text.AlignHCenter
                }

                // Visible Tags badges
                Flow {
                    Layout.fillWidth: true
                    Layout.alignment: Qt.AlignHCenter
                    spacing: 4
                    visible: fileTags && fileTags.length > 0
                    Repeater {
                        model: fileTags ? Math.min(fileTags.length, 3) : 0
                        Rectangle {
                            height: 16
                            width: tagTxt.width + 8
                            radius: 4
                            color: "#4C566A"
                            Text {
                                id: tagTxt
                                anchors.centerIn: parent
                                text: modelData
                                color: "#ECEFF4"
                                font.pixelSize: 10
                            }
                        }
                    }
                }
                Item { Layout.fillHeight: true } // spacer
            }

            // Context Menu Placeholder
            // (In a real app, attach a Menu here triggered by right click)
        }
    }
}
