# Browser Commands Layout

Each command lives in its own package under this directory.

## Why

- One command per package keeps ownership clear.
- New command creation has a repeatable template.
- The top-level `browser` package re-exports command types for compatibility.

## Structure

- Shared command contract and command type constants:
  - `pkg/browser/commandcore/core.go`
- One package per command:
  - `pkg/browser/commands/<name>/command.go`

## Template

```go
package mycommand

import "github.com/darkliquid/tilbo/cmd/tilbo-browser/pkg/browser/commandcore"

// Command describes one action and its payload.
type Command struct {
    CommandBase commandcore.Base

    // payload fields
}

func (c Command) Type() commandcore.Type { return commandcore.MyType }
func (c Command) OperationID() string    { return c.CommandBase.OperationID() }
```

## Registering a New Command

1. Add a new command type constant in `commandcore/core.go`.
2. Create `pkg/browser/commands/<name>/command.go` with the template above.
3. Re-export it from `pkg/browser/commands.go`.
4. Register and handle it in `pkg/browser/controller.go`.
5. Add tests for behavior and any projection updates.
