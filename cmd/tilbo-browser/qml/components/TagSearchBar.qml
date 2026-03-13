import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Rectangle {
    id: searchBar
    color: "#2E3440"
    radius: 6
    border.color: searchInput.activeFocus ? "#88C0D0" : "#434C5E"
    border.width: 1

    property var chips: []
    property int acTriggerRole: typeof acRoleTrigger !== "undefined" ? acRoleTrigger : 257
    property int searchRole: typeof fsRoleSearch !== "undefined" ? fsRoleSearch : 268

    // Trigger search on fsModel
    function executeSearch() {
        fsModel.setData(fsModel.index(0, 0), JSON.stringify(searchBar.chips), searchRole)
    }

    RowLayout {
        anchors.fill: parent
        anchors.margins: 4
        spacing: 4

        // Display applied chips
        Repeater {
            model: searchBar.chips
            delegate: Rectangle {
                color: "#4C566A"
                radius: 4
                Layout.preferredHeight: 24
                Layout.preferredWidth: chipTextGrp.width + removeBtn.width + 12

                RowLayout {
                    anchors.fill: parent
                    anchors.margins: 4
                    spacing: 4
                    Text {
                        id: chipTextGrp
                        text: modelData
                        color: "#ECEFF4"
                        font.pixelSize: 12
                    }
                    MouseArea {
                        id: removeBtn
                        Layout.preferredWidth: 16
                        Layout.preferredHeight: 16
                        cursorShape: Qt.PointingHandCursor
                        Text {
                            anchors.centerIn: parent
                            text: "×"
                            color: "#D8DEE9"
                            font.bold: true
                        }
                        onClicked: {
                            let temp = searchBar.chips
                            temp.splice(index, 1)
                            searchBar.chips = temp
                            executeSearch()
                        }
                    }
                }
            }
        }

        TextField {
            id: searchInput
            Layout.fillWidth: true
            background: Item {}
            color: "#ECEFF4"
            font.pixelSize: 14
            placeholderText: typeof daemonConnected !== "undefined" && !daemonConnected 
                                ? "Daemon offline: only paths and glob filtering supported."
                                : (searchBar.chips.length === 0 ? "Search tags, paths, metadata..." : "")
            
            onTextChanged: {
                if (typeof daemonConnected === "undefined" || !daemonConnected) {
                    return; // Disable autocomplete completely if no daemon
                }
                if (text.length > 0) {
                    acPopup.open()
                    acModel.setData(acModel.index(0, 0), text, acTriggerRole)
                } else {
                    acPopup.close()
                }
            }

            onAccepted: {
                if (text.trim() !== "") {
                    let temp = searchBar.chips
                    temp.push(text.trim())
                    searchBar.chips = temp
                    text = ""
                    acPopup.close()
                    executeSearch()
                }
            }

            Keys.onPressed: (event) => {
                if (event.key === Qt.Key_Backspace && text === "" && searchBar.chips.length > 0) {
                    let temp = searchBar.chips
                    temp.pop()
                    searchBar.chips = temp
                    executeSearch()
                }
            }
        }
    }

    Popup {
        id: acPopup
        y: parent.height + 4
        width: parent.width
        height: Math.min(200, acListView.contentHeight + 8)
        padding: 0
        visible: false
        background: Rectangle {
            color: "#3B4252"
            radius: 4
            border.color: "#4C566A"
            border.width: 1
        }
        
        ListView {
            id: acListView
            anchors.fill: parent
            anchors.margins: 4
            model: acModel
            clip: true
            delegate: ItemDelegate {
                width: ListView.view.width
                height: 32
                contentItem: Text {
                    text: acText
                    color: "#ECEFF4"
                    font.pixelSize: 13
                }
                background: Rectangle {
                    color: parent.hovered ? "#4C566A" : "transparent"
                    radius: 2
                }
                onClicked: {
                    let temp = searchBar.chips
                    temp.push(acText)
                    searchBar.chips = temp
                    searchInput.text = ""
                    searchInput.forceActiveFocus()
                    acPopup.close()
                    executeSearch()
                }
            }
        }
    }
}
