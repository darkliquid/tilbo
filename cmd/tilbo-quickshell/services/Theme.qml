pragma Singleton
import QtQuick
import Quickshell

// Theme.qml — Centralised color palette for tilbo.
// Values here can be overridden by ~/.config/tilbo/colors.json
Item {
    id: root

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

    Component.onCompleted: loadTheme()
}
