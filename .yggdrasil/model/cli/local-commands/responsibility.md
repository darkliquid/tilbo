# Responsibility

The Local Commands module is responsible for commands that operate without a daemon connection (annotated `"no_daemon": "true"`):

- **harvester list**: listing all configured harvester plugins with name, priority, and source
- **harvester test `<path>`**: running the full harvester pipeline against a local file and displaying extracted metadata
- **rule list**: listing all configured tagging rules with name, type (TOML/Lua), source, and priority
- **rule validate**: validating rule syntax and configuration without applying them
- **rule test `<path>`**: running rule evaluation against a local file using the harvester pipeline, showing which tags would be applied
- **config init**: writing a baseline TOML config file with current CLI flag values

## Not responsible for

- Daemon-side rule reload (→ cli/admin-commands)
- Harvester or rule implementation (→ internal/harvester, internal/rules)
