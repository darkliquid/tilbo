# Interface

## ThemeButton

Extends `Button`.

| Property | Type | Default | Purpose |
|----------|------|---------|---------|
| `isAccent` | `bool` | `false` | Accent-colored background |
| `isDanger` | `bool` | `false` | Danger-colored background |
| `isGhost` | `bool` | `false` | Transparent/hover-only background |
| `iconName` | `string` | `""` | Optional icon before text |
| `iconSize` | `int` | `18` | Icon dimensions |

Background color logic: `isDanger ? Theme.danger : isAccent ? Theme.accent : isGhost ? (hovered ? Theme.bgHover : "transparent") : Theme.bgLight`

## ThemeIcon

Extends `Item`.

| Property | Type | Default | Purpose |
|----------|------|---------|---------|
| `iconName` | `string` | `""` | XDG icon theme name to resolve |
| `tintColor` | `color` | `Theme.iconTint` | Color overlay tint |
| `useTintColor` | `bool` | `Theme.tintIcons` | Whether to apply tint |

### Resolution logic
1. `Quickshell.iconPath(iconName, true)` → resolved file path
2. If resolved: shows `Image` (or `ColorOverlay` if tinting enabled)
3. If not resolved: shows emoji fallback (`inode-directory` → 📁, `image-x-generic` → 🖼, etc.)
