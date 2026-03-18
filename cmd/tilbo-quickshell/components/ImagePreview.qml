// ImagePreview.qml — fullsize image lightbox overlay.
//
// Set filePath and mimeType, then toggle visible = true.  The overlay loads
// the original file (for images) or shows the large thumbnail (for video).
// Supports mouse-wheel zoom, drag-to-pan, and Escape to close.
import QtQuick
import QtQuick.Controls

import "../services"

Popup {
    id: root

    property string filePath: ""
    property string mimeType: ""

    // Internal state
    property real _zoom: 1.0
    property real _panX: 0
    property real _panY: 0
    property string _source: ""

    anchors.centerIn: parent
    width: parent ? parent.width : 800
    height: parent ? parent.height : 600
    modal: true
    dim: true
    closePolicy: Popup.CloseOnEscape | Popup.CloseOnPressOutside
    padding: 0

    Overlay.modal: Rectangle { color: "#CC000000" }

    onVisibleChanged: {
        if (visible) {
            _zoom = 1.0
            _panX = 0
            _panY = 0
            if (mimeType.indexOf("image/") === 0) {
                _source = "file://" + filePath
            } else {
                // For video, request the large thumbnail
                _source = ""
                TilboDaemon.getThumbnail(filePath, 1, function(result, _err) {
                    if (result && result.thumbnailPath)
                        root._source = "file://" + result.thumbnailPath
                })
            }
        }
    }

    background: Rectangle { color: "transparent" }

    contentItem: Item {
        anchors.fill: parent

        // Close button
        Rectangle {
            z: 10
            anchors.top: parent.top; anchors.right: parent.right
            anchors.topMargin: 16; anchors.rightMargin: 16
            width: 40; height: 40; radius: 20
            color: closeMa.containsMouse ? "#3B4252" : "#2E3440"
            border.color: "#4C566A"; border.width: 1

            Text {
                anchors.centerIn: parent
                text: "✕"
                color: "#ECEFF4"; font.pixelSize: 20
            }

            MouseArea {
                id: closeMa
                anchors.fill: parent; hoverEnabled: true
                cursorShape: Qt.PointingHandCursor
                onClicked: root.close()
            }
        }

        // Zoom indicator
        Rectangle {
            z: 10
            anchors.bottom: parent.bottom; anchors.horizontalCenter: parent.horizontalCenter
            anchors.bottomMargin: 16
            width: zoomLabel.width + 20; height: 28; radius: 14
            color: "#2E3440"; border.color: "#4C566A"; border.width: 1
            visible: root._zoom !== 1.0

            Text {
                id: zoomLabel
                anchors.centerIn: parent
                text: Math.round(root._zoom * 100) + "%"
                color: "#ECEFF4"; font.pixelSize: 13
            }
        }

        // Image container with pan/zoom
        Item {
            id: imageContainer
            anchors.fill: parent
            anchors.margins: 48

            Image {
                id: fullImage
                anchors.centerIn: parent
                width: parent.width * root._zoom
                height: parent.height * root._zoom
                x: (parent.width - width) / 2 + root._panX
                y: (parent.height - height) / 2 + root._panY
                source: root._source
                fillMode: Image.PreserveAspectFit
                smooth: true
                asynchronous: true
            }

            BusyIndicator {
                anchors.centerIn: parent
                running: fullImage.status === Image.Loading
                visible: running
            }

            // Drag to pan
            MouseArea {
                anchors.fill: parent
                property real _startX: 0
                property real _startY: 0
                property real _startPanX: 0
                property real _startPanY: 0

                onPressed: mouse => {
                    _startX = mouse.x
                    _startY = mouse.y
                    _startPanX = root._panX
                    _startPanY = root._panY
                    cursorShape = Qt.ClosedHandCursor
                }
                onReleased: cursorShape = Qt.OpenHandCursor
                onPositionChanged: mouse => {
                    if (pressed) {
                        root._panX = _startPanX + (mouse.x - _startX)
                        root._panY = _startPanY + (mouse.y - _startY)
                    }
                }
                cursorShape: Qt.OpenHandCursor
            }
        }
    }

    // Mouse wheel zoom
    WheelHandler {
        target: null
        onWheel: event => {
            var delta = event.angleDelta.y / 120
            var factor = delta > 0 ? 1.15 : (1 / 1.15)
            root._zoom = Math.max(0.1, Math.min(10.0, root._zoom * factor))
        }
    }
}
