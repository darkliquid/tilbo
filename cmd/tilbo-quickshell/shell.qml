// shell.qml — tilbo Quickshell entry point.
// Launch with: quickshell -p cmd/tilbo-quickshell/shell.qml
//
// The daemon must be running before the UI starts; TilboDaemon.qml connects
// to it via the JSON UI socket ($XDG_RUNTIME_DIR/tilbo-ui.sock).
import Quickshell
import QtQuick

import "services"
import "windows"

ShellRoot {
    BrowserWindow {
        id: browser
        visible: true
    }
}
