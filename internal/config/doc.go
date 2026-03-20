// Package config handles loading and writing Tilbo configuration files.
//
// Configuration is stored as TOML files in the standard XDG config directory
// (~/.config/tilbo/) with the following structure:
//
//   - daemon.toml — daemon flags (watch path, database path, FUSE mount, etc.)
//   - cli.toml — CLI settings (socket path, output format)
//   - browser.toml — GUI browser settings (keybindings, trash preference, thumbnails)
//
// The [Path] function resolves the config directory using XDG_CONFIG_HOME with
// a fallback to ~/.config/tilbo. The "config init" subcommand on both the daemon
// and CLI writes a baseline config file from the current flag values.
package config
