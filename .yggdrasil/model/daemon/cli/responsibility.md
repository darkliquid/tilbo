# Responsibility

The CLI module is responsible for:

- **Cobra command tree**: `daemon` subcommand of `tilbo`, `config init`, `completion`, `systemd` subcommands
- **Flag parsing**: all daemon runtime options (`--watch`, `--db`, `--fuse-mount`, `--socket`, `--log-format`, `--log-level`, `--embed-*`, etc.)
- **Layered configuration**: config file values serve as flag defaults, CLI flags override everything (`orDefault` pattern)
- **Logging setup**: configures `slog` handler (text or JSON) with the requested log level
- **Signal handling**: sets up SIGTERM/SIGINT for graceful shutdown via `signal.NotifyContext`, SIGHUP on a separate channel for live reload
- **Entry point delegation**: after parsing, calls `run()` with resolved options

## Not responsible for

- Daemon initialization or lifecycle (→ `daemon`)
- Any IPC handling or file processing logic
