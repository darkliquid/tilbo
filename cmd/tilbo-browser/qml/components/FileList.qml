import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

ListView {
    id: listv
    
    clip: true
    focus: true

    signal fileSelected(var fileData)
    signal directoryActivated(string path)

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
        id: fileListScrollBar
        active: true
        policy: ScrollBar.AsNeeded
    }

    delegate: Item {
        x: listv.leftMargin
        width: listv.width - listv.leftMargin - listv.rightMargin - (fileListScrollBar.visible ? fileListScrollBar.width + 8 : 0)
        height: 60
        
        Rectangle {
            anchors.fill: parent
            anchors.margins: 4
            color: listv.currentIndex === index ? "#3b3d45" : "transparent"
            border.color: listv.currentIndex === index ? "#5c5e66" : "transparent"
            border.width: 1
            radius: 4

            MouseArea {
                id: ma
                anchors.fill: parent
                hoverEnabled: true
                onClicked: {
                    listv.currentIndex = index
                    listv.fileSelected({
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
                        listv.directoryActivated(filePath)
                        fsModel.setData(fsModel.index(index, 0), filePath, listv.cdRole)
                    } else {
                        fsModel.setData(fsModel.index(index, 0), true, listv.openRole)
                    }
                }
            }

            Rectangle {
                anchors.fill: parent
                color: "#1e1e24"
                opacity: ma.containsMouse && listv.currentIndex !== index ? 0.3 : 0.0
                radius: 4
            }

            RowLayout {
                anchors.fill: parent
                anchors.margins: 8
                spacing: 12

                Text {
                    text: isDir ? "📁" : "📄"
                    font.pixelSize: 24
                    Layout.preferredWidth: 32
                }

                Text {
                    Layout.fillWidth: true
                    text: fileName
                    color: "#ECEFF4"
                    font.pixelSize: 14
                    font.family: "Inter, sans-serif"
                    elide: Text.ElideRight
                }

                Flow {
                    Layout.preferredWidth: 200
                    Layout.alignment: Qt.AlignVCenter
                    spacing: 4
                    visible: fileTags && fileTags.length > 0
                    Repeater {
                        model: fileTags ? fileTags : []
                        Rectangle {
                            height: 18
                            width: tagTxt2.width + 8
                            radius: 4
                            color: "#4C566A"
                            Text {
                                id: tagTxt2
                                anchors.centerIn: parent
                                text: modelData
                                color: "#8FBCBB"
                                font.pixelSize: 11
                            }
                        }
                    }
                }
                
                Text {
                    Layout.preferredWidth: 60
                    text: isDir ? "--" : (fileSize / 1024).toFixed(0) + " KB"
                    color: "#D8DEE9"
                    font.pixelSize: 12
                    horizontalAlignment: Text.AlignRight
                }
            }
        }
    }
}
