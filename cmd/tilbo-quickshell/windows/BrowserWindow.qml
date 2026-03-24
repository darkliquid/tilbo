// BrowserWindow.qml — main tilbo browser window for Quickshell.
//
// Orchestrator: instantiates subcomponents and wires signals between them.
//   • BrowserNavigation   — navigation, history, search, data arrays
//   • BrowserFileOperations — selection, clipboard, delete, create, zoom
//   • BrowserLayout       — all visual content (toolbar, footer, shortcuts, file area)
//     └── BrowserSidebar  — left places/right properties panels (inside Layout)

import QtQuick
import QtQuick.Controls

import "../services"
import "browser"

ApplicationWindow {
    id: window
    visible: true
    width: 1200
    height: 700
    title: "tilbo"
    color: Theme.bgDark

    // ── Daemon connection ───────────────────────────────────────────────

    property bool daemonConnected: TilboDaemon.connected

    // ── Subcomponents ───────────────────────────────────────────────────

    BrowserNavigation {
        id: nav
        places: layout.sidebar.places
    }

    BrowserFileOperations {
        id: fileOps
        currentPath: nav.currentPath
        isTrashView: nav.isTrashView
        isSearchMode: nav.isSearchMode
    }

    BrowserLayout {
        id: layout
        nav: nav
        fileOps: fileOps
        daemonConnected: window.daemonConnected
    }

    // ── Daemon event handlers ───────────────────────────────────────────

    Connections {
        target: TilboDaemon

        function onDaemonStateChanged(state) {
            window.daemonConnected = TilboDaemon.connected
        }

        function onShowWindow(path) {
            window.show()
            window.raise()
            window.requestActivate()
            if (path && path !== "") {
                nav.navigateTo(path)
            }
        }

        // When a file's tags change, patch the in-place entry so the badge row
        // refreshes without a full reload.
        function onFileTagged(path, added, removed) {
            nav._patchEntryTags(path, added, removed)
            if (fileOps.selectedFile && fileOps.selectedFile.path === path) {
                var updated = Object.assign({}, fileOps.selectedFile)
                updated.tags = nav._applyTagDiff(updated.tags || [], added, removed)
                fileOps.selectedFile = updated
            }
        }

        // After an index update, re-execute any active search so results stay fresh.
        function onIndexUpdated(_ft, _tt) {
            if (nav.isSearchMode && nav.searchChips.length > 0) {
                nav._executeSearch(nav.searchChips)
            }
        }
    }

    // ── Inter-component signal wiring ───────────────────────────────────

    Connections {
        target: nav
        function onNavigationChanged() {
            fileOps.clearSelection()
            layout.sidebar.showRightSidebar = false
        }
    }

    Connections {
        target: fileOps
        function onRefreshNeeded() {
            nav._loadDirectory(nav.currentPath)
        }
        function onTrashRefreshNeeded() {
            nav._loadTrash()
        }
        function onSelectedFileChanged() {
            if (!fileOps.selectedFile && layout._autoPropertiesSlideout) {
                layout.sidebar.showRightSidebar = false
                return
            }
            if (fileOps.selectedFile && layout._autoPropertiesSlideout) {
                layout.sidebar.showRightSidebar = true
            }
        }
    }

    Connections {
        target: layout.sidebar
        function onPlaceActivated(path) {
            nav.navigateTo(path)
        }
        function onTrashActivated() {
            nav.navigateToTrash()
        }
        function onSearchActivated(chips) {
            nav.executeSearch(chips)
        }
    }

    // ── Lifecycle ───────────────────────────────────────────────────────

    Component.onCompleted: {
        layout.sidebar.loadPlaces()
        layout.sidebar.loadMounts()
        layout.sidebar.loadSavedSearches()
        nav.navigateTo(nav.currentPath)
        TilboDaemon.getBrowserConfig(function(cfg, _err) {
            if (cfg) {
                layout._keybindings = cfg.keybindings || {}
                layout._useTrash = cfg.useTrash !== undefined ? cfg.useTrash : true
                layout._autoPropertiesSlideout = !!cfg.autoPropertiesSlideout
                fileOps._useInlineThumbnails = cfg.inlineThumbnails !== undefined ? cfg.inlineThumbnails : true
                if (cfg.theme && cfg.theme !== "")
                    Theme.applyPreset(cfg.theme)
            }
        })
    }
}
