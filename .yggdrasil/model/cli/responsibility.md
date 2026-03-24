# Responsibility

The CLI node is the top-level entry point for tilbo-cli. It is responsible for:

- **Root cobra command**: `tilbo` command with persistent `--socket` flag and version display
- **IPC client helpers**: `dial()` connects to the daemon Unix socket, `call()` sends a request and returns the response, `daemonError()` extracts error responses from the protobuf envelope
- **Path resolution**: `absPath()` converts relative paths to absolute for daemon communication
- **Socket path resolution**: defaults to `/run/user/$UID/tilbo.sock`, overridable via config or `--socket` flag
- **No-daemon gating**: `PersistentPreRunE` checks the socket exists before commands that need the daemon, but skips for commands annotated `"no_daemon": "true"`
- **Command registration**: wires all subcommands (tag, search, meta, related, daemon, gui, harvester, rule, config, completion) into the root command

## Not responsible for

- Individual command logic (→ child nodes)
- Shell completion logic (→ `cli/completions`)
- Output formatting decisions (→ individual command modules)
