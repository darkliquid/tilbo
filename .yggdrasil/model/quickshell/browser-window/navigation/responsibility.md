# Responsibility

Non-visual QtObject owning all navigation state and data arrays. Responsible for:

- **Navigation**: `navigateTo()`, `goBack()`, `goForward()`, `goUp()`, `goHome()`, `navigateToTrash()`
- **History management**: `_history` stack with `_historyIndex`, `canGoBack`/`canGoForward` computed properties
- **Directory loading**: `_loadDirectory()` via TilboDaemon with tag hydration
- **Search execution**: `executeSearch()`, `_executeSearch()` (parses chip types: bare=tag, glob:*, fts:query, meta:key=val, hidden:any), `_runGlobSearch()`
- **Sorting**: `_sortEntries()` with folders-first, configurable column/direction
- **Tag patching**: `_patchEntryTags()` and `_applyTagDiff()` for in-place tag updates on `dirEntries`/`searchResults`
- **Data ownership**: `dirEntries`, `searchResults`, `trashEntries`, `activeEntries` (computed)
- **Signal**: emits `navigationChanged()` when navigation resets selection (consumed by orchestrator)

## Not responsible for

- File selection or metadata fetching (→ file-operations)
- Visual rendering (→ layout, sidebar)
- Daemon communication protocol (→ daemon-service)
