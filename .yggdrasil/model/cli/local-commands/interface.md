# Interface

All commands in this module are annotated `"no_daemon": "true"` — they skip the daemon socket check and run entirely locally.

## `harvester` (parent command)

### `harvester list`
Lists all configured harvester plugins. Loads the harvester registry from config paths, registers builtins, and displays a table of name, priority, MIME filter, and source.

### `harvester test <path>`
Runs the full harvester pipeline against a local file. Loads builtins + user harvesters, runs them in priority order, and displays extracted metadata in a key-value table.

## `rule` (parent command)

### `rule list`
Lists all configured tagging rules. Loads the rule registry and displays name, type (TOML/Lua), source file, and priority.

### `rule validate`
Validates rule syntax and configuration. Loads all rules and reports any parse or configuration errors without executing them.

### `rule test <path>`
End-to-end test: runs the harvester pipeline on a local file, then evaluates all rules against the harvested metadata. Displays which tags would be applied and why.

## `config` (parent command)

### `config init [--path PATH] [--force]`
Writes a baseline TOML config file. The `[cli]` section reflects the current `--socket` flag value. Refuses to overwrite existing config unless `--force` is set.
