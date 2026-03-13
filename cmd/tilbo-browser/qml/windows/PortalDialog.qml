import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

import "../components" as Components

ApplicationWindow {
    id: window
    visible: true
    width: 800
    height: 600
    title: "Select File - Tilbo"
    color: "#1A1C23"

    // Portal properties to be injected by Go (optional)
    property string initialDir: "/"
    property bool selectMultiple: false
    property bool selectDirectory: false

    property int openRole: 262
    property int cdRole: 266 
    property int toggleHiddenRole: 267 
    property int portalSubmitRole: 269
    property string selectedPath: ""

    header: ToolBar {
        background: Rectangle { color: "#22252E" }
        RowLayout {
            anchors.fill: parent
            anchors.margins: 12
            spacing: 16
            
            Label {
                text: "Open File"
                font.pixelSize: 16
                font.bold: true
                color: "#E5E9F0"
            }

            TextField {
                Layout.fillWidth: true
                Layout.preferredHeight: 36
                placeholderText: "Path..."
                color: "#D8DEE9"
                background: Rectangle {
                    color: "#1A1C23"
                    radius: 4
                    border.width: 1
                    border.color: parent.activeFocus ? "#5E81AC" : "#3B4252"
                }
                onAccepted: {
                    fsModel.setData(fsModel.index(0, 0), text, window.cdRole)
                }
            }
        }
    }

    Components.FileGrid {
        id: grid
        anchors.fill: parent
        anchors.margins: 10
        model: fsModel
        onFileSelected: (fileData) => {
            if (!fileData) {
                return
            }
            window.selectedPath = fileData.path || ""
        }
    }

    footer: ToolBar {
        background: Rectangle { color: "#22252E" }
        RowLayout {
            anchors.fill: parent
            anchors.margins: 12
            
            Item { Layout.fillWidth: true } // spacer
            
            Button {
                text: "Cancel"
                onClicked: {
                    fsModel.setData(fsModel.index(0, 0), "[]", window.portalSubmitRole)
                }
            }
            Button {
                text: "Open"
                highlighted: true
                enabled: window.selectedPath !== ""
                onClicked: {
                    var selected = JSON.stringify([window.selectedPath])
                    fsModel.setData(fsModel.index(0, 0), selected, window.portalSubmitRole)
                }
            }
        }
    }
}
