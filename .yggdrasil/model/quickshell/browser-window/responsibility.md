# Responsibility

The Browser Window module is the orchestrator — an ApplicationWindow shell (~100 lines) that instantiates and wires four subcomponents:

- **BrowserNavigation** (→ `browser-window/navigation`) — navigation logic, history, search, data arrays
- **BrowserFileOperations** (→ `browser-window/file-operations`) — selection, clipboard, delete, create, zoom
- **BrowserLayout** (→ `browser-window/layout`) — all visual content (toolbar, footer, shortcuts, file area)
  - **BrowserSidebar** (→ `browser-window/sidebar`) — left places panel, right properties panel (inside Layout)

The orchestrator is responsible for:
- **Signal wiring**: connecting signals between subcomponents (e.g., `nav.navigationChanged` → `fileOps.clearSelection`)
- **Daemon event handling**: bridging TilboDaemon events to the appropriate subcomponent
- **Lifecycle**: initializing sidebar data, triggering initial navigation, loading browser config

## Not responsible for

- Navigation logic (→ navigation)
- File manipulation (→ file-operations)
- Visual layout (→ layout)
- Sidebar UI (→ sidebar)
- Daemon communication (→ daemon-service)
- File view rendering (→ file-views)
- Search input UI (→ search-bar)
- Image preview (→ media)
- Theming (→ theme)
- Localization (→ i18n)
