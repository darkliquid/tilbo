# Internals

## Decisions

- **`no_daemon` annotation for local commands**: chose command annotations over a separate command tree because it keeps the CLI surface flat (e.g., `tilbo rule list` not `tilbo local rule list`). UX ergonomics — users don't need to think about whether a command needs the daemon or not. The `PersistentPreRunE` checks the annotation and skips the socket existence check for annotated commands.
- **`call()` as single-shot dial+send+close**: chose per-call connections over a persistent client because CLI commands are short-lived one-shot operations. No need for connection pooling or keepalive.
- **`absPath()` for all path arguments**: the daemon expects absolute paths (it has no concept of the client's working directory). All commands resolve paths before sending requests.
