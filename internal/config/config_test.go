package config_test

import (
	"path/filepath"
	"testing"

	"github.com/darkliquid/tilbo/internal/config"
)

func TestLoad_MissingFileReturnsDefault(t *testing.T) {
	cfg, err := config.Load("/tmp/missing-config.toml")
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if cfg.Daemon.Watch != "" {
		t.Errorf("expected empty config, got %+v", cfg)
	}
}

func TestSaveAndLoad(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "config.toml")

	cfg := config.Config{
		Daemon: config.DaemonConfig{
			Watch: "/home/user",
		},
		Browser: config.BrowserConfig{
			UseTrash:               new(true),
			InlineThumbnails:       new(true),
			AutoPropertiesSlideout: new(false),
			Theme:                  "light",
			Keybindings: map[string]string{
				"copy": "Ctrl+Shift+C",
			},
		},
	}

	if err := config.Save(path, cfg); err != nil {
		t.Fatalf("Save: %v", err)
	}

	got, err := config.Load(path)
	if err != nil {
		t.Fatalf("Load: %v", err)
	}

	if got.Daemon.Watch != cfg.Daemon.Watch {
		t.Errorf("expected %v, got %v", cfg.Daemon.Watch, got.Daemon.Watch)
	}
	if got.Browser.UseTrash == nil || !*got.Browser.UseTrash {
		t.Fatalf("expected Browser.UseTrash=true, got %#v", got.Browser.UseTrash)
	}
	if got.Browser.InlineThumbnails == nil || !*got.Browser.InlineThumbnails {
		t.Fatalf("expected Browser.InlineThumbnails=true, got %#v", got.Browser.InlineThumbnails)
	}
	if got.Browser.AutoPropertiesSlideout == nil || *got.Browser.AutoPropertiesSlideout {
		t.Fatalf("expected Browser.AutoPropertiesSlideout=false, got %#v", got.Browser.AutoPropertiesSlideout)
	}
	if got.Browser.Theme != "light" {
		t.Fatalf("expected Browser.Theme=light, got %q", got.Browser.Theme)
	}
	if got.Browser.Keybindings["copy"] != "Ctrl+Shift+C" {
		t.Fatalf("expected Browser keybinding copy to round-trip, got %q", got.Browser.Keybindings["copy"])
	}
}
