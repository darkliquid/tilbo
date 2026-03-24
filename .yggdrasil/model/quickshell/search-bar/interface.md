# Interface

## Properties

| Property | Type | Purpose |
|----------|------|---------|
| `daemonConnected` | `bool` | Controls placeholder text (search prompt vs "Daemon not connected") |

## Signals

### `searchRequested(chips: string[])`
Emitted whenever the chip list changes (chip added or removed). The parent window should execute the search.

## Functions

### `addChip(chip)`
Programmatically adds a chip (used by external callers, e.g., clicking a tag in the sidebar).

## Internal state

- `_chips: array` — current chip list
- `_suggestions: array` — autocomplete suggestions from daemon
- `_suggestionLabels: array` — optional descriptive labels for suggestions
- `acTimer: Timer` — debounce timer for autocomplete requests

## Keyboard interactions

| Key | Action |
|-----|--------|
| Enter | Add current text as chip |
| Tab | Accept first autocomplete suggestion |
| Backspace (empty input) | Remove last chip |
| Escape | Clear autocomplete popup |
