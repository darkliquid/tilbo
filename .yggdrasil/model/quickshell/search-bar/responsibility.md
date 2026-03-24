# Responsibility

The Search Bar module is responsible for:

- **Chip-based input**: users type search terms which become visual chips — removable, reorderable tokens that drive the search query
- **Chip format parsing**: recognizing chip types:
  - Bare string → tag search
  - `glob:*.jpg` → filesystem glob
  - `fts:sunset` → full-text search
  - `hidden:any` → include hidden files
- **Tag autocomplete**: as the user types, queries the daemon via `TilboDaemon.listTags(prefix)` for matching tag names, shown in a popup below the input
- **Debounced autocomplete**: uses a timer to avoid flooding the daemon with requests on each keystroke
- **Chip management**: add on Enter/Tab, remove on Backspace (when input is empty), clear all button

## Not responsible for

- Search execution (→ browser-window/navigation via `_executeSearch`)
- Search result display (→ file-views)
