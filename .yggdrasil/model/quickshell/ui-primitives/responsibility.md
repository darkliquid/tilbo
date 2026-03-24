# Responsibility

The UI Primitives module provides two foundational components used throughout the GUI:

### ThemeButton
A standardized button with three visual variants:
- **isAccent**: accent-colored background for primary actions
- **isDanger**: danger-colored background for destructive actions
- **isGhost**: transparent background with hover highlight for toolbar buttons

Supports optional icon via `iconName` property (renders a ThemeIcon before the label text).

### ThemeIcon
An icon component that loads XDG icon theme icons via Quickshell's `iconPath` resolver:
- Resolves icon name to file path using the system icon theme (detected via `TILBO_ICON_THEME` env var)
- Supports optional color tinting via `ColorOverlay` (controlled by `Theme.tintIcons`)
- Falls back to emoji when the icon theme cannot resolve the name (maps common names like `inode-directory` → folder emoji)

## Not responsible for

- Color definitions (→ theme)
- Icon theme detection (→ daemon/gui-manager sets the env var)
