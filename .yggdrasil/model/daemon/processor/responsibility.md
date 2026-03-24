# Responsibility

The Processor module is responsible for:

- **M2 pipeline execution**: running the full harvest → rules → update cycle for a single file
- **Metadata harvesting**: fan-out to all registered harvesters via the pipeline
- **Rule evaluation**: applying TOML/Lua rules against harvested metadata to derive tags
- **Tag persistence**: writing computed tags to xattr and updating the SQLite index
- **Vector embedding**: generating semantic embeddings for indexed files (when enabled)
- **Non-retryable path tracking**: remembering files that caused permission/context errors to avoid repeated failures; clearing the set on SIGHUP

## Not responsible for

- Filesystem event dispatch (→ `daemon` via `handleFSEvent`)
- Harvester registration (→ `daemon` via `registerBuiltins`)
- Rule loading/reloading (→ `daemon` via rule engine)
