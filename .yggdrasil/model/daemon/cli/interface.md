# Interface

## `newRootCmd() *cobra.Command`

Builds the top-level cobra command. Loads config eagerly so config values can serve as flag defaults. Returns the fully wired command tree.

### Subcommands

- `config init [--path PATH] [--force]` — writes a baseline TOML config reflecting current flag values
- `completion {bash|zsh|fish|powershell}` — outputs shell completion scripts
- `systemd` — generates a systemd unit file

### Key flags (on root command)

| Flag | Default | Description |
|------|---------|-------------|
| `--watch` | `$HOME` | Directory to watch for filesystem events |
| `--db` | `~/.local/state/tilbo/index.db` | SQLite index path |
| `--fuse-mount` | `/run/user/$UID/tilbo/tags` | FUSE virtual filesystem mount point |
| `--socket` | (empty, uses XDG runtime dir) | Override IPC socket path |
| `--log-format` | `text` | Log format: `text` or `json` |
| `--log-level` | `info` | Log level: `debug`, `info`, `warn`, `error` |
| `--watcher-backend` | `fanotify` | File watcher backend |
| `--watch-hidden` | `false` | Include hidden files/dirs |
| `--embed-model` | (default) | ONNX model path for vector embeddings |
| `--embed-disabled` | `false` | Disable vector embeddings |

## `daemonOptions` struct

Holds all parsed runtime configuration. Populated from config file first, then overridden by CLI flags.

## `runDaemon(ctx, cfgPath, cfgErr, opts) error`

Entry point after flag parsing. Configures logging, sets up signal handlers, delegates to `run()`.
