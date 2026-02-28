---
paths:
  - "plugins/**/*"
  - "internal/harvester/**/*.go"
  - "internal/rules/**/*.go"
---
# Plugin & Harvester Rules

- All WASM plugin execution must go through wazero. Never use os/exec for WASM files.
- Subprocess harvesters must have an enforced timeout (from harvester registration config).
  Never allow a harvester subprocess to run indefinitely.
- The harvester stdio JSON contract is defined in `.claude/docs/plugin-sdk.md`.
  Do not change the contract without updating that doc and bumping the version field.
- Lua rule sandboxes must disable: io, os, require, load, dofile, loadfile.
  Only math, string, table, and the metadata argument are available.
- Native .so plugins must be version-guarded. Check `tilbo_plugin_api_version()` return value
  before calling any other symbol. Skip and warn on version mismatch; never crash.
- Rule re-evaluation sweeps run at `IOPRIO_CLASS_IDLE` priority. Use `unix.IoPrioSet` before
  starting the sweep goroutine.
