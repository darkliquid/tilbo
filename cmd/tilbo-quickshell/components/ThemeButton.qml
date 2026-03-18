import QtQuick
import QtQuick.Controls
import "../services"

// ThemeButton.qml — Standardised button for tilbo
Button {
    id: control

    property bool isAccent: false
    property bool isDanger: false
    property bool isGhost: false

    contentItem: Text {
        text: control.text
        font: control.font
        color: {
            if (!control.enabled) return Theme.fgDeemphasized
            if (control.isGhost)  return Theme.fgDim
            if (control.isAccent || control.isDanger) return Theme.fgMain
            return Theme.fgDim
        }
        horizontalAlignment: Text.AlignHCenter
        verticalAlignment: Text.AlignVCenter
        elide: Text.ElideRight
    }

    background: Rectangle {
        implicitWidth: 80
        implicitHeight: 32
        radius: 4
        color: {
            if (!control.enabled) return "transparent"
            if (control.isGhost)  return "transparent"
            
            var base = Theme.bgActive
            if (control.isAccent) base = Theme.accentDim
            if (control.isDanger) base = Theme.danger
            
            if (control.pressed) return Qt.darker(base, 1.2)
            if (control.hovered) return Qt.lighter(base, 1.1)
            return base
        }
        border.color: {
            if (control.isGhost) {
                if (control.hovered) return Theme.fgDeemphasized
                return "transparent"
            }
            if (control.activeFocus) return Theme.borderFocus
            return "transparent"
        }
        border.width: 1
    }
}
