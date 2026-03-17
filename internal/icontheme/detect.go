// Package icontheme detects the active XDG icon theme name by probing
// desktop environment configuration sources in priority order.
package icontheme

import (
	"bufio"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

// preferredThemes are well-known icon themes checked when scanning icon
// directories as a last resort.
//nolint:gochecknoglobals // read-only lookup table
var preferredThemes = []string{
	"Adwaita",
	"breeze",
	"Papirus",
	"Humanity",
	"elementary-xfce",
}

// Detect returns the active icon theme name using the following resolution
// order:
//  1. QS_ICON_THEME environment variable
//  2. qt6ct config (~/.config/qt6ct/qt6ct.conf)
//  3. qt5ct config (~/.config/qt5ct/qt5ct.conf)
//  4. gsettings (GNOME / xdg-desktop-portal)
//  5. GTK-3 settings.ini
//  6. GTK-2 gtkrc
//  7. First real theme in icon directories
//  8. Fallback: "hicolor"
func Detect() string {
	if v := os.Getenv("QS_ICON_THEME"); v != "" {
		return v
	}

	configHome := os.Getenv("XDG_CONFIG_HOME")
	if configHome == "" {
		if home, err := os.UserHomeDir(); err == nil {
			configHome = filepath.Join(home, ".config")
		}
	}

	// qt6ct / qt5ct
	for _, name := range []string{"qt6ct", "qt5ct"} {
		if theme := readQtCtTheme(filepath.Join(configHome, name, name+".conf")); theme != "" {
			return theme
		}
	}

	// gsettings
	if theme := readGSettings(); theme != "" {
		return theme
	}

	// GTK-3
	if theme := readINIKey(filepath.Join(configHome, "gtk-3.0", "settings.ini"), "gtk-icon-theme-name"); theme != "" {
		return theme
	}

	// GTK-2
	home, _ := os.UserHomeDir()
	for _, rc := range []string{filepath.Join(home, ".gtkrc-2.0"), "/etc/gtk-2.0/gtkrc"} {
		if theme := readGTK2Theme(rc); theme != "" {
			return theme
		}
	}

	// Scan icon directories
	if theme := scanIconDirs(home); theme != "" {
		return theme
	}

	return "hicolor"
}

// readQtCtTheme extracts icon_theme_name from a qt*ct config file.
func readQtCtTheme(path string) string {
	f, err := os.Open(path)
	if err != nil {
		return ""
	}
	defer f.Close()

	inAppearance := false
	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if strings.HasPrefix(line, "[") {
			inAppearance = line == "[Appearance]"
			continue
		}
		if inAppearance && strings.HasPrefix(line, "icon_theme_name=") {
			return strings.TrimPrefix(line, "icon_theme_name=")
		}
	}
	return ""
}

// readGSettings queries gsettings for the GNOME icon theme.
func readGSettings() string {
	out, err := exec.Command("gsettings", "get", "org.gnome.desktop.interface", "icon-theme").Output()
	if err != nil {
		return ""
	}
	theme := strings.TrimSpace(string(out))
	theme = strings.Trim(theme, "'\"")
	return theme
}

// readINIKey reads a simple key=value from an INI file (ignoring sections).
func readINIKey(path, key string) string {
	f, err := os.Open(path)
	if err != nil {
		return ""
	}
	defer f.Close()

	prefix := key + "="
	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if val, ok := strings.CutPrefix(line, prefix); ok {
			return strings.TrimSpace(val)
		}
	}
	return ""
}

// readGTK2Theme extracts gtk-icon-theme-name from a GTK-2 rc file.
func readGTK2Theme(path string) string {
	f, err := os.Open(path)
	if err != nil {
		return ""
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if _, val, ok := strings.Cut(line, "="); ok && strings.HasPrefix(line, "gtk-icon-theme-name") {
			v := strings.TrimSpace(val)
			v = strings.Trim(v, "\"'")
			if v != "" {
				return v
			}
		}
	}
	return ""
}

// scanIconDirs looks for installed icon themes, preferring well-known themes.
func scanIconDirs(home string) string {
	dataHome := os.Getenv("XDG_DATA_HOME")
	if dataHome == "" && home != "" {
		dataHome = filepath.Join(home, ".local", "share")
	}

	dirs := []string{
		filepath.Join(dataHome, "icons"),
		"/usr/local/share/icons",
		"/usr/share/icons",
	}

	for _, dir := range dirs {
		// Check preferred themes first.
		for _, name := range preferredThemes {
			if _, err := os.Stat(filepath.Join(dir, name, "index.theme")); err == nil {
				return name
			}
		}
	}

	// Fall back to first non-hicolor theme with an index.theme.
	for _, dir := range dirs {
		entries, err := os.ReadDir(dir)
		if err != nil {
			continue
		}
		for _, e := range entries {
			if !e.IsDir() {
				continue
			}
			name := e.Name()
			if name == "hicolor" || name == "default" {
				continue
			}
			if _, err := os.Stat(filepath.Join(dir, name, "index.theme")); err == nil {
				return name
			}
		}
	}

	return ""
}
