package browser

import (
	"bufio"
	"os"
	"strings"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commandcore"
)

const mountsMinFields = 3

const defaultPlacesCapacity = 6

// BuildPlaces creates the places list used by the sidebar.
func BuildPlaces() ([]commandcore.PlaceEntry, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return nil, err
	}

	fuseMount := fuseMountPath()
	fuseActive := isFUSEMounted(fuseMount)

	places := make([]commandcore.PlaceEntry, 0, defaultPlacesCapacity)
	for _, p := range []commandcore.PlaceEntry{
		{Name: "Home", Path: home},
		{Name: "Documents", Path: xdgDir("XDG_DOCUMENTS_DIR", home+"/Documents")},
		{Name: "Downloads", Path: xdgDir("XDG_DOWNLOAD_DIR", home+"/Downloads")},
	} {
		if _, statErr := os.Stat(p.Path); statErr == nil {
			places = append(places, p)
		}
	}

	if fuseActive {
		places = append(places,
			commandcore.PlaceEntry{Name: "@recent", Path: fuseMount + "/@recent"},
			commandcore.PlaceEntry{Name: "@untagged", Path: fuseMount + "/@untagged"},
			commandcore.PlaceEntry{Name: "@browse", Path: fuseMount + "/@browse"},
		)
	}

	return places, nil
}

func fuseMountPath() string {
	home, err := os.UserHomeDir()
	if err != nil {
		return ""
	}

	return home + "/tags"
}

func isFUSEMounted(mountPoint string) bool {
	f, err := os.Open("/proc/mounts")
	if err != nil {
		return false
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		fields := strings.Fields(scanner.Text())
		if len(fields) < mountsMinFields {
			continue
		}

		if fields[1] == mountPoint && strings.Contains(fields[2], "fuse.tilbo") {
			return true
		}
	}

	return false
}

func xdgDir(envVar, fallback string) string {
	if v := os.Getenv(envVar); v != "" {
		return v
	}

	return fallback
}
