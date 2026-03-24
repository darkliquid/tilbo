# Interface

All properties are bindable from any QML component via `Theme.<property>`.

## Color properties

### Backgrounds
`bgDark`, `bgMedium`, `bgLight`, `bgHover`, `bgActive`, `bgInput`

### Foregrounds
`fgMain`, `fgDim`, `fgMuted`, `fgDeemphasized`, `fgPlaceholder`

### Semantic colors
`accent` (Frost Blue), `accentDim`, `success` (Green), `warning` (Yellow), `danger` (Red)

### Borders
`border`, `borderFocus`

### Selection
`selection`, `selectionBorder`

## Icon tinting
- `tintIcons: bool` — whether to apply tint to icons
- `iconTint: color` — tint color (defaults to accent)

## External configuration
- `configPath` — resolved path to `~/.config/tilbo/colors.json`
- Colors file is loaded at `Component.onCompleted` and merged over defaults
