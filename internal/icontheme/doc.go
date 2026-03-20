// Package icontheme detects the active XDG icon theme on the host system.
//
// It checks GTK and KDE configuration files and standard icon directories to
// determine which icon theme is in use. The detected theme name is used by the
// Quickshell GUI to resolve file-type and action icons via the ThemeIcon component.
//
// Detection order:
//  1. GTK 3/4 settings files (~/.config/gtk-3.0/settings.ini, gtk-4.0)
//  2. KDE globals (~/.config/kdeglobals)
//  3. Scanning /usr/share/icons/ for installed theme directories
package icontheme
