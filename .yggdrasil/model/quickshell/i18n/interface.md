# Interface

## Properties

| Property | Type | Purpose |
|----------|------|---------|
| `locale` | `string` | Current locale from `LANG` env var (default: `en_US`) |
| `strings` | `object` | User-provided string overrides (loaded from locale file) |
| `defaults` | `object` (readonly) | Built-in English string catalog |

## Methods

### `tr(key, args) → string`
Looks up `key` in `strings` (user override), falls back to `defaults`, then to the raw key. If `args` is provided:
- Array: replaces `%1`, `%2`, etc. with corresponding elements
- Scalar: replaces `%1` with the value

### `loadLocale()`
Loads `~/.config/tilbo/locales/<locale>.json` and merges into `strings`. Called automatically at `Component.onCompleted`. Silently falls back to defaults on missing file or invalid JSON.

## String key categories

- `sidebar.*` — sidebar section labels and actions
- `toolbar.*` — toolbar button labels
- `menu.*` — context menu items
- `search.*` — search bar placeholders and actions
- `prop.*` — properties panel labels
- `list.header.*` — list view column headers
- `gen.*` — generic labels (OK, Cancel, etc.)
