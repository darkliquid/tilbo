// ThemeIcon.qml — Icon component that loads XDG icon theme icons
// via Quickshell's icon provider, with emoji fallback.
import QtQuick
import Qt5Compat.GraphicalEffects
import Quickshell
import "../services"

Item {
    id: root

    property string iconName: ""
    property color tintColor: Theme.iconTint
    property bool useTintColor: Theme.tintIcons

    // Resolve icon path via Quickshell; empty when icon is missing (check=true).
    readonly property string _resolvedPath: root.iconName
                                            ? Quickshell.iconPath(root.iconName, true) : ""

    Image {
        id: img
        anchors.fill: parent
        visible: root._resolvedPath !== "" && !root.useTintColor

        source: root._resolvedPath
        sourceSize.width: root.width
        sourceSize.height: root.height

        fillMode: Image.PreserveAspectFit
        smooth: true
    }

    ColorOverlay {
        anchors.fill: parent
        source: imgOverlay
        color: root.tintColor
        visible: root._resolvedPath !== "" && root.useTintColor
    }

    Image {
        id: imgOverlay
        anchors.fill: parent
        visible: false

        source: root._resolvedPath
        sourceSize.width: root.width
        sourceSize.height: root.height

        fillMode: Image.PreserveAspectFit
        smooth: true
    }

    // Emoji fallback when the theme icon cannot be resolved.
    Text {
        anchors.centerIn: parent
        visible: root.iconName !== "" && root._resolvedPath === ""
        color: root.tintColor
        text: {
            if (!root.iconName) return ""
            var n = root.iconName
            if (n.indexOf("directory") >= 0 || n.indexOf("folder") >= 0) return "\uD83D\uDCC1"
            if (n.indexOf("link") >= 0) return "\uD83D\uDD17"
            if (n.indexOf("trash") >= 0) return "\uD83D\uDDD1"
            if (n.indexOf("image") >= 0) return "\uD83D\uDDBC"
            if (n.indexOf("video") >= 0) return "\uD83C\uDFAC"
            if (n.indexOf("audio") >= 0) return "\uD83C\uDFB5"
            if (n.indexOf("text") >= 0) return "\uD83D\uDCC4"
            if (n.indexOf("archive") >= 0) return "\uD83D\uDCE6"
            if (n.indexOf("pdf") >= 0) return "\uD83D\uDCC4"
            if (n.indexOf("go-previous") >= 0) return "\u25C0"
            if (n.indexOf("go-next") >= 0) return "\u25B6"
            if (n.indexOf("go-up") >= 0) return "\u25B2"
            if (n.indexOf("home") >= 0) return "\uD83C\uDFE0"
            if (n.indexOf("view-list") >= 0) return "\u2630"
            if (n.indexOf("view-grid") >= 0) return "\u229E"
            if (n.indexOf("select") >= 0) return "\u2611"
            if (n.indexOf("visibility-off") >= 0) return "\u2205"
            if (n.indexOf("visibility") >= 0 || n.indexOf("eye") >= 0) return "\uD83D\uDC41"
            return "\uD83D\uDCC4"
        }
        font.pixelSize: Math.min(root.width, root.height) * 0.75
    }
}
