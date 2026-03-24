# Responsibility

The Theme Service module is responsible for:

- **Centralized color palette**: providing a single source of truth for all UI colors (backgrounds, foregrounds, accents, borders, semantic colors)
- **Nord-inspired defaults**: shipping sensible dark-theme defaults based on the Nord color scheme
- **External config override**: loading color overrides from `~/.config/tilbo/colors.json` at startup (supports integration with tools like matugen for dynamic theming)
- **Icon tinting**: configurable icon tint color and toggle for monochrome icon themes

## Not responsible for

- Component-level styling decisions (→ individual components reference Theme properties)
- Localization (→ i18n)
