package bookmarks

import (
	"bufio"
	"fmt"
	"log/slog"
	"os"
	"path/filepath"
	"strings"
)

// InjectVirtualTags ensures that the standard tilbo root folders are present 
// in standard GTK file chooser sidebars for non-portal applications.
func InjectVirtualTags(fuseMountPath string) {
	configDir, err := os.UserConfigDir()
	if err != nil {
		slog.Warn("Could not determine user config dir for GTK bookmarks", "err", err)
		return
	}

	targets := []string{
		filepath.Join(configDir, "gtk-3.0", "bookmarks"),
		filepath.Join(configDir, "gtk-4.0", "bookmarks"),
	}

	bookmarksToAdd := []struct {
		URI   string
		Label string
	}{
		{fmt.Sprintf("file://%s/@recent", fuseMountPath), "Recent (tilbo)"},
		{fmt.Sprintf("file://%s/@untagged", fuseMountPath), "Untagged (tilbo)"},
		{fmt.Sprintf("file://%s/work", fuseMountPath), "Work"},
	}

	for _, target := range targets {
		if err := injectBookmarks(target, bookmarksToAdd); err != nil {
			slog.Debug("Failed to inject GTK bookmarks", "file", target, "err", err)
		}
	}
}

func injectBookmarks(file string, toAdd []struct{ URI, Label string }) error {
	// Create parent directory if missing
	if err := os.MkdirAll(filepath.Dir(file), 0755); err != nil {
		return err
	}

	// Read existing
	existingURIs := make(map[string]bool)
	var lines []string

	f, err := os.Open(file)
	if err == nil {
		scanner := bufio.NewScanner(f)
		for scanner.Scan() {
			line := strings.TrimSpace(scanner.Text())
			if line == "" {
				continue
			}
			lines = append(lines, line)
			
			// A bookmark line is "URI Label" or just "URI"
			parts := strings.SplitN(line, " ", 2)
			existingURIs[parts[0]] = true
		}
		f.Close()
	} else if !os.IsNotExist(err) {
		return err
	}

	// Append missing
	added := false
	for _, b := range toAdd {
		if !existingURIs[b.URI] {
			lines = append(lines, fmt.Sprintf("%s %s", b.URI, b.Label))
			added = true
		}
	}

	if !added {
		return nil // Nothing to do
	}

	// Write back
	return os.WriteFile(file, []byte(strings.Join(lines, "\n")+"\n"), 0644)
}
