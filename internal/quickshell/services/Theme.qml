pragma Singleton
import QtQuick
import Quickshell

// Theme.qml — Centralised color palette for tilbo.
// Values here can be overridden by ~/.config/tilbo/colors.json
Item {
    id: root

    property string preset: "nord"

    function applyPreset(name) {
        var requested = (name || "").toLowerCase()
        if (requested === "" || requested === "nord") {
            root.preset = "nord"
            root.bgDark = "#1A1C23"
            root.bgMedium = "#1E212A"
            root.bgLight = "#22252E"
            root.bgHover = "#2E3440"
            root.bgActive = "#3B4252"
            root.bgInput = "#1A1C23"
            root.fgMain = "#ECEFF4"
            root.fgDim = "#D8DEE9"
            root.fgMuted = "#9099A3"
            root.fgDeemphasized = "#4C566A"
            root.fgPlaceholder = "#4C566A"
            root.accent = "#88C0D0"
            root.accentDim = "#5E81AC"
            root.success = "#A3BE8C"
            root.warning = "#EBCB8B"
            root.danger = "#BF616A"
            root.border = "#3B4252"
            root.borderFocus = "#5E81AC"
            root.selection = "#4C566A"
            root.selectionBorder = "#88C0D0"
            root.tintIcons = false
            root.iconTint = root.accent
            return
        }
        if (requested === "light") {
            root.preset = "light"
            root.bgDark = "#F4F6FB"
            root.bgMedium = "#E8ECF4"
            root.bgLight = "#DDE3EE"
            root.bgHover = "#D2D9E6"
            root.bgActive = "#C3CCDC"
            root.bgInput = "#FFFFFF"
            root.fgMain = "#1F2937"
            root.fgDim = "#374151"
            root.fgMuted = "#6B7280"
            root.fgDeemphasized = "#9CA3AF"
            root.fgPlaceholder = "#9CA3AF"
            root.accent = "#2563EB"
            root.accentDim = "#1D4ED8"
            root.success = "#059669"
            root.warning = "#D97706"
            root.danger = "#DC2626"
            root.border = "#C7D0E0"
            root.borderFocus = "#2563EB"
            root.selection = "#BFDBFE"
            root.selectionBorder = "#2563EB"
            root.tintIcons = false
            root.iconTint = root.accent
        }
    }

    // ── Nord-inspired Defaults ────────────────────────────────────────────

    property color bgDark:      "#1A1C23"
    property color bgMedium:    "#1E212A"
    property color bgLight:     "#22252E"
    property color bgHover:     "#2E3440"
    property color bgActive:    "#3B4252"
    property color bgInput:     "#1A1C23"

    property color fgMain:      "#ECEFF4"
    property color fgDim:       "#D8DEE9"
    property color fgMuted:     "#9099A3"
    property color fgDeemphasized: "#4C566A"
    property color fgPlaceholder:  "#4C566A"

    property color accent:      "#88C0D0" // Frost Blue
    property color accentDim:   "#5E81AC"
    property color success:     "#A3BE8C" // Green
    property color warning:     "#EBCB8B" // Yellow
    property color danger:      "#BF616A" // Red

    property color border:      "#3B4252"
    property color borderFocus:  "#5E81AC"

    property color selection:   "#4C566A"
    property color selectionBorder: "#88C0D0"

    // ── Icon Tinting ──────────────────────────────────────────────────────

    property bool tintIcons: false
    property color iconTint: accent

    // ── External Configuration (matugen etc.) ─────────────────────────────

    readonly property string configPath: Quickshell.env("XDG_CONFIG_HOME") 
                                         ? Quickshell.env("XDG_CONFIG_HOME") + "/tilbo/colors.json"
                                         : Quickshell.env("HOME") + "/.config/tilbo/colors.json"

    function loadTheme() {
        // We'll use a File object if Quickshell provides it, or simple fetch if possible.
        // For simplicity in this env, we'll just check if we can read it.
        // If not, we stay with defaults.
        // (Implementation note: actual file reading in QML usually requires a C++ helper or Quickshell.readFile)
        try {
            var content = Quickshell.readFile(configPath);
            if (content) {
                var json = JSON.parse(content);
                if (json.bgDark)      root.bgDark      = json.bgDark;
                if (json.bgMedium)    root.bgMedium    = json.bgMedium;
                if (json.bgLight)     root.bgLight     = json.bgLight;
                if (json.bgHover)     root.bgHover     = json.bgHover;
                if (json.bgActive)    root.bgActive    = json.bgActive;
                if (json.bgInput)     root.bgInput     = json.bgInput;
                if (json.fgMain)      root.fgMain      = json.fgMain;
                if (json.fgDim)       root.fgDim       = json.fgDim;
                if (json.fgMuted)     root.fgMuted     = json.fgMuted;
                if (json.fgDeemphasized) root.fgDeemphasized = json.fgDeemphasized;
                if (json.accent)      root.accent      = json.accent;
                if (json.accentDim)   root.accentDim   = json.accentDim;
                if (json.success)     root.success     = json.success;
                if (json.warning)     root.warning     = json.warning;
                if (json.danger)      root.danger      = json.danger;
                if (json.border)      root.border      = json.border;
                if (json.borderFocus) root.borderFocus = json.borderFocus;
                if (json.selection)   root.selection   = json.selection;
                if (json.selectionBorder) root.selectionBorder = json.selectionBorder;
                if (json.tintIcons !== undefined) root.tintIcons = json.tintIcons;
                if (json.iconTint)    root.iconTint    = json.iconTint;
            }
        } catch (e) {
            // No config or invalid JSON, ignore.
        }
    }

    Component.onCompleted: {
        applyPreset(root.preset)
        loadTheme()
    }
}
