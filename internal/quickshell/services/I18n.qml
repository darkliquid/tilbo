pragma Singleton
import QtQuick
import Quickshell

// I18n.qml — Centralised localisation for tilbo.
// Strings can be overridden by ~/.config/tilbo/locales/<locale>.json
Item {
    id: root

    property string locale: Quickshell.env("LANG") || "en_US"
    property var strings: ({})

    // ── Default English Strings ───────────────────────────────────────────

    readonly property var defaults: ({
        // Sidebar
        "sidebar.places": "PLACES",
        "sidebar.mounts": "MOUNTS",
        "sidebar.searches": "SEARCHES",
        "sidebar.trash": "Trash",
        "sidebar.properties": "PROPERTIES",
        "sidebar.remove": "Remove from sidebar",
        "sidebar.pin_current": "Pin Current Folder",

        // Toolbar
        "toolbar.view.list": "List ☰",
        "toolbar.view.grid": "Grid ⊞",
        "toolbar.selection": "Mass Selection Mode",
        "toolbar.hidden": "Hidden",
        "toolbar.pin": "Pin",
        "toolbar.up": "Up (Alt+Up)",
        "toolbar.home": "Home (Alt+Home)",
        "toolbar.back": "Back (Alt+Left)",
        "toolbar.forward": "Forward (Alt+Right)",

        // Context Menus
        "menu.new_file": "New File",
        "menu.new_folder": "New Folder",
        "menu.paste": "Paste",
        "menu.open": "Open",
        "menu.open_with": "Open With...",
        "menu.open_terminal": "Open in Terminal",
        "menu.copy": "Copy",
        "menu.cut": "Cut",
        "menu.rename": "Rename",
        "menu.delete": "Move to Trash",
        "menu.empty_trash": "Empty Trash",

        // Search
        "search.placeholder": "Search tags, glob:*, fts:query…",
        "search.no_daemon": "Daemon not connected",
        "search.pin_title": "Pin Search",
        "search.pin_prompt": "Enter a name for this search:",
        "search.pin_placeholder": "e.g. Large Images, Recent PDF...",
        "search.filter.images": "Images",
        "search.filter.videos": "Videos",
        "search.filter.docs": "Documents",
        "search.filter.2026": "2026 Only",

        // Autocomplete
        "ac.glob": "Filename pattern (e.g. glob:*.jpg)",
        "ac.fts": "Full-text / metadata query",
        "ac.hidden": "Include hidden files (hidden:any)",
        "ac.size": "Filter by size (e.g. size:>10MB)",
        "ac.mtime": "Filter by age (e.g. mtime:<1w)",
        "ac.is": "Filter by type (e.g. is:images)",
        "ac.meta": "Filter by metadata key (e.g. meta:width=gte:1920)",
        "ac.label.glob": "Filename pattern",
        "ac.label.fts": "Full-text query",
        "ac.label.hidden": "Toggle hidden files",
        "ac.label.size": "Size filter",
        "ac.label.mtime": "Age filter",
        "ac.label.is": "Type filter",
        "ac.label.meta": "Metadata filter",
        "ac.meta.width": "Image/Video width",
        "ac.meta.height": "Image/Video height",
        "ac.meta.duration": "Media duration (seconds)",
        "ac.meta.artist": "Audio artist",
        "ac.meta.album": "Audio album",
        "ac.meta.title": "Media title",
        "ac.meta.codec": "Media codec",
        "ac.meta.format": "File format",
        "ac.op.gte": "Greater than or equal",
        "ac.op.lte": "Less than or equal",
        "ac.hidden_any": "Show all hidden files",
        "ac.mtime.1d": "Last 24 hours",
        "ac.mtime.1w": "Last week",
        "ac.mtime.1m": "Last month",
        "ac.mtime.1y": "Last year",

        // Properties
        "prop.title": "Properties",
        "prop.empty": "Select a file to view properties",
        "prop.path": "Path:",
        "prop.size": "Size:",
        "prop.mtime": "Modified:",
        "prop.metadata": "Metadata (%1)",
        "prop.tags": "Tags",
        "prop.change_icon": "Change Icon...",
        "prop.change_icon_title": "Change Icon",
        "prop.icon_prompt": "Enter an XDG icon name for %1:",
        "prop.action.open": "Open",
        "prop.action.navigate": "Navigate",
        "prop.action.preview": "Preview",
        "prop.action.refresh": "Refresh",

        // File List Headers
        "list.header.name": "Name",
        "list.header.size": "Size",
        "list.header.mtime": "Modified",
        "list.header.tags": "Tags",

        // Generic
        "gen.ok": "OK",
        "gen.cancel": "Cancel",
        "gen.trash_count": "Trash  (%1 items)"
    })

    // ── Translation Function ──────────────────────────────────────────────

    function tr(key, args) {
        var str = strings[key] || defaults[key] || key
        if (args !== undefined) {
            if (Array.isArray(args)) {
                for (var i = 0; i < args.length; i++) {
                    str = str.replace("%" + (i + 1), args[i])
                }
            } else {
                str = str.replace("%1", args)
            }
        }
        return str
    }

    // ── External Configuration ────────────────────────────────────────────

    readonly property string configDir: Quickshell.env("XDG_CONFIG_HOME") 
                                        ? Quickshell.env("XDG_CONFIG_HOME") + "/tilbo/locales/"
                                        : Quickshell.env("HOME") + "/.config/tilbo/locales/"

    function loadLocale() {
        var cleanLocale = root.locale.split(".")[0] // en_US.UTF-8 -> en_US
        var path = configDir + cleanLocale + ".json"
        
        try {
            var content = Quickshell.readFile(path)
            if (content) {
                root.strings = JSON.parse(content)
            }
        } catch (e) {
            // No locale file or invalid JSON, fallback to defaults
        }
    }

    Component.onCompleted: loadLocale()
}
