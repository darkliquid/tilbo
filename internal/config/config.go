// Package config loads the shared tilbo configuration file.
//
// Both binaries (tilbo-daemon, tilbo-cli) read the same file at
// $XDG_CONFIG_HOME/tilbo/config.toml. App-specific settings live under
// [daemon] and [cli] keys; inline tag rules use [[rule]].
//
// CLI flags always override values from the config file.
package config

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/BurntSushi/toml"

	"github.com/darkliquid/tilbo/internal/rules"
)

// DaemonConfig holds tilbo-daemon settings.
type DaemonConfig struct {
	Watch          string `toml:"watch"`
	DB             string `toml:"db"`
	FuseMount      string `toml:"fuse_mount"`
	Socket         string `toml:"socket"`
	LogFormat      string `toml:"log_format"`
	LogLevel       string `toml:"log_level"`
	Watcher        string `toml:"watcher"`
	WatchHidden    bool   `toml:"watch_hidden"`
	EmbedModel     string `toml:"embed_model"`      // Local path to ONNX model directory. Overrides auto-download.
	EmbedModelName string `toml:"embed_model_name"` // HuggingFace model name to download if embed_model is unset. Defaults to sentence-transformers/all-MiniLM-L6-v2.
	EmbedDisabled  bool   `toml:"embed_disabled"`   // Explicitly disable vector embeddings.
}

// CLIConfig holds tilbo-cli settings.
type CLIConfig struct {
	Socket string `toml:"socket"`
}

// Config is the top-level structure of the shared config file.
type Config struct {
	Daemon DaemonConfig `toml:"daemon"`
	CLI    CLIConfig    `toml:"cli"`

	// Rules holds inline tag rules equivalent to per-file rules in the rules
	// directory. TOML rule files in the rules directory continue to work; these
	// are loaded in addition to any .lua or .wasm rules found there.
	Rules []rules.RuleDef `toml:"rule"`
}

// Path returns the default config file path ($XDG_CONFIG_HOME/tilbo/config.toml).
func Path() string {
	if dir, err := os.UserConfigDir(); err == nil {
		return filepath.Join(dir, "tilbo", "config.toml")
	}
	if home, err := os.UserHomeDir(); err == nil {
		return filepath.Join(home, ".config", "tilbo", "config.toml")
	}
	return "tilbo-config.toml"
}

// Load reads config from path. A missing file is not an error — a zero-value
// Config (all defaults) is returned silently.
func Load(path string) (Config, error) {
	var cfg Config
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return cfg, nil
	}
	if _, err := toml.DecodeFile(path, &cfg); err != nil {
		return cfg, fmt.Errorf("config: parse %q: %w", path, err)
	}
	return cfg, nil
}

// Save writes cfg to path as TOML, creating parent directories as needed.
func Save(path string, cfg Config) error {
	if err := os.MkdirAll(filepath.Dir(path), 0o700); err != nil {
		return fmt.Errorf("config: create dir for %q: %w", path, err)
	}

	f, err := os.OpenFile(path, os.O_CREATE|os.O_TRUNC|os.O_WRONLY, 0o600)
	if err != nil {
		return fmt.Errorf("config: open %q for write: %w", path, err)
	}
	defer f.Close()

	if err := toml.NewEncoder(f).Encode(cfg); err != nil {
		return fmt.Errorf("config: encode %q: %w", path, err)
	}
	return nil
}
