package desktopfile

import (
	"bufio"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
)

// AppEntry represents an installed application from a .desktop file.
type AppEntry struct {
	ID        string
	Name      string
	Exec      string
	Icon      string
	MimeTypes []string
}

// scanDirs returns the directories to scan for .desktop files.
func scanDirs() []string {
	dirs := []string{"/usr/share/applications", "/usr/local/share/applications"}
	if home, err := os.UserHomeDir(); err == nil {
		dirs = append([]string{filepath.Join(home, ".local", "share", "applications")}, dirs...)
	}
	if dataHome := os.Getenv("XDG_DATA_HOME"); dataHome != "" {
		dirs = append([]string{filepath.Join(dataHome, "applications")}, dirs...)
	}
	for _, dir := range strings.Split(os.Getenv("XDG_DATA_DIRS"), ":") {
		if dir != "" {
			dirs = append(dirs, filepath.Join(dir, "applications"))
		}
	}
	return dirs
}

// parseDesktopFile parses a .desktop file and returns an AppEntry.
// Returns nil if the file is not a valid application entry.
func parseDesktopFile(path, id string) *AppEntry {
	f, err := os.Open(path)
	if err != nil {
		return nil
	}
	defer f.Close()

	var (
		inDesktopEntry bool
		entry          AppEntry
	)
	entry.ID = id

	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "[Desktop Entry]" {
			inDesktopEntry = true
			continue
		}
		if strings.HasPrefix(line, "[") && inDesktopEntry {
			break // Left [Desktop Entry] section
		}
		if !inDesktopEntry || line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		key, val, ok := strings.Cut(line, "=")
		if !ok {
			continue
		}
		key = strings.TrimSpace(key)
		val = strings.TrimSpace(val)
		switch key {
		case "Name":
			if entry.Name == "" {
				entry.Name = val
			}
		case "Exec":
			entry.Exec = val
		case "Icon":
			entry.Icon = val
		case "MimeType":
			for _, mt := range strings.Split(val, ";") {
				mt = strings.TrimSpace(mt)
				if mt != "" {
					entry.MimeTypes = append(entry.MimeTypes, mt)
				}
			}
		case "Type":
			if val != "Application" {
				return nil
			}
		case "NoDisplay":
			if val == "true" {
				return nil
			}
		}
	}

	if entry.Name == "" || entry.Exec == "" {
		return nil
	}
	return &entry
}

// FindAppsForMime returns all installed applications that handle the given MIME type.
func FindAppsForMime(mime string) []AppEntry {
	seen := make(map[string]bool)
	var apps []AppEntry

	for _, dir := range scanDirs() {
		entries, err := os.ReadDir(dir)
		if err != nil {
			continue
		}
		for _, e := range entries {
			if e.IsDir() || !strings.HasSuffix(e.Name(), ".desktop") {
				continue
			}
			id := strings.TrimSuffix(e.Name(), ".desktop")
			if seen[id] {
				continue
			}
			app := parseDesktopFile(filepath.Join(dir, e.Name()), id)
			if app == nil {
				continue
			}
			for _, mt := range app.MimeTypes {
				if mt == mime || (strings.HasSuffix(mt, "/*") && strings.HasPrefix(mime, strings.TrimSuffix(mt, "*"))) {
					seen[id] = true
					apps = append(apps, *app)
					break
				}
			}
		}
	}
	return apps
}

// FindAppByID returns the AppEntry for a given desktop file ID, searching all dirs.
func FindAppByID(id string) *AppEntry {
	for _, dir := range scanDirs() {
		path := filepath.Join(dir, id+".desktop")
		if app := parseDesktopFile(path, id); app != nil {
			return app
		}
	}
	return nil
}

var fieldCodeRe = regexp.MustCompile(`%[fFuUdDnNickvm%]`)

// LaunchApp launches an application with the given file path, substituting
// Exec field codes (%f, %F, %u, %U) with the file path.
func LaunchApp(app AppEntry, filePath string) error {
	// Remove desktop-specific field codes we don't handle, substitute %f/%u/%F/%U
	execStr := fieldCodeRe.ReplaceAllStringFunc(app.Exec, func(code string) string {
		switch code {
		case "%f", "%u":
			return filePath
		case "%F", "%U":
			return filePath // simplification: single file
		case "%%":
			return "%"
		default:
			return ""
		}
	})

	// Tokenize the exec string (simple split, not full shell parsing)
	parts := strings.Fields(execStr)
	if len(parts) == 0 {
		return nil
	}

	cmd := exec.Command(parts[0], parts[1:]...)
	cmd.Stdin = nil
	cmd.Stdout = nil
	cmd.Stderr = nil
	return cmd.Start()
}
