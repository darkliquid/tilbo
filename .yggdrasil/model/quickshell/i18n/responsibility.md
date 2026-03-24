# Responsibility

The I18n Service module is responsible for:

- **Centralized string catalog**: providing all UI-visible strings in one place, keyed by dot-notation IDs (e.g., `sidebar.places`, `menu.rename`, `search.placeholder`)
- **Default English strings**: shipping complete English translations as built-in defaults
- **External locale override**: loading locale-specific overrides from `~/.config/tilbo/locales/<locale>.json`
- **Translation function**: `tr(key, args)` with positional argument substitution (`%1`, `%2`, etc.) and array support
- **Locale detection**: reading `LANG` environment variable, stripping encoding suffix (e.g., `en_US.UTF-8` → `en_US`)

## Not responsible for

- Theming or visual styling (→ theme)
- Pluralization rules (uses simple string replacement)
