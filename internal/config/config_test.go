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
}
