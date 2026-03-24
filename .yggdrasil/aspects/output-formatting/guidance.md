# Output Formatting

## What must be satisfied

CLI commands that produce structured output must support a `--format` flag with at least `json` and a human-readable default. Some commands additionally support `tsv` for scriptable piping. The format flag uses a string enum, not separate flags.

## Why

Users interact with tilbo in two modes: interactively (human-readable tables with alignment via `tabwriter`) and programmatically (JSON for `jq` pipelines, TSV for `cut`/`awk`). A consistent `--format` flag across commands reduces cognitive load and enables shell scripting.

## Guidance

- Default format should be human-readable (tabwriter-aligned columns)
- JSON output should use `json.NewEncoder` with `SetIndent("", "  ")` for readability
- TSV output should use tab-separated values with no header (for easy piping)
- Define format-specific structs (e.g., `jsonFileResult`) to control JSON field names and omit empty fields
- Use `const outputFormatJSON = "json"` for format string constants
- Each format case in the switch should handle its own output completely
