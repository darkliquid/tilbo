#!/bin/sh
# detect-icon-theme.sh — Probe for the active XDG icon theme name.
#
# Resolution order:
#   1. QS_ICON_THEME (already set — honour it)
#   2. qt6ct config (~/.config/qt6ct/qt6ct.conf)
#   3. qt5ct config (~/.config/qt5ct/qt5ct.conf)
#   4. gsettings (GNOME / xdg-desktop-portal)
#   5. GTK-3 settings.ini
#   6. GTK-2 gtkrc
#   7. First real theme found in icon directories
#   8. Fallback: "hicolor"
#
# Prints the detected theme name to stdout.

set -e

# 1. Already set — pass through.
if [ -n "$QS_ICON_THEME" ]; then
    echo "$QS_ICON_THEME"
    exit 0
fi

# Helper: read icon_theme_name from a qt*ct .conf (INI format).
read_qtct_theme() {
    conf="$1"
    [ -f "$conf" ] || return 1
    # icon_theme_name sits under [Appearance]; grab the first match.
    sed -n '/^\[Appearance\]/,/^\[/{s/^icon_theme_name=//p;}' "$conf" | head -1
}

# 2. qt6ct
theme=$(read_qtct_theme "${XDG_CONFIG_HOME:-$HOME/.config}/qt6ct/qt6ct.conf" 2>/dev/null || true)
if [ -n "$theme" ]; then echo "$theme"; exit 0; fi

# 3. qt5ct
theme=$(read_qtct_theme "${XDG_CONFIG_HOME:-$HOME/.config}/qt5ct/qt5ct.conf" 2>/dev/null || true)
if [ -n "$theme" ]; then echo "$theme"; exit 0; fi

# 4. gsettings (works on GNOME, Cinnamon, Budgie, and via xdg-desktop-portal)
if command -v gsettings >/dev/null 2>&1; then
    theme=$(gsettings get org.gnome.desktop.interface icon-theme 2>/dev/null | tr -d "'" || true)
    if [ -n "$theme" ]; then echo "$theme"; exit 0; fi
fi

# 5. GTK-3 settings.ini
gtk3_conf="${XDG_CONFIG_HOME:-$HOME/.config}/gtk-3.0/settings.ini"
if [ -f "$gtk3_conf" ]; then
    theme=$(sed -n 's/^gtk-icon-theme-name=//p' "$gtk3_conf" | head -1)
    if [ -n "$theme" ]; then echo "$theme"; exit 0; fi
fi

# 6. GTK-2 gtkrc
for rc in "$HOME/.gtkrc-2.0" "/etc/gtk-2.0/gtkrc"; do
    if [ -f "$rc" ]; then
        theme=$(sed -n 's/^gtk-icon-theme-name *= *"\{0,1\}\([^"]*\)"\{0,1\}/\1/p' "$rc" | head -1)
        if [ -n "$theme" ]; then echo "$theme"; exit 0; fi
    fi
done

# 7. Pick the first installed theme that has an index.theme and isn't "hicolor"
#    or "default". Prefer well-known themes if present.
find_first_theme() {
    for dir in \
        "${XDG_DATA_HOME:-$HOME/.local/share}/icons" \
        /usr/local/share/icons \
        /usr/share/icons; do
        [ -d "$dir" ] || continue
        # Prefer well-known themes first.
        for preferred in Adwaita breeze Papirus Humanity elementary-xfce; do
            if [ -f "$dir/$preferred/index.theme" ]; then
                echo "$preferred"
                return 0
            fi
        done
        # Fall back to the first non-hicolor theme.
        for d in "$dir"/*/; do
            name=$(basename "$d")
            case "$name" in hicolor|default) continue;; esac
            if [ -f "$d/index.theme" ]; then
                echo "$name"
                return 0
            fi
        done
    done
    return 1
}

theme=$(find_first_theme 2>/dev/null || true)
if [ -n "$theme" ]; then echo "$theme"; exit 0; fi

# 8. Last resort.
echo "hicolor"
