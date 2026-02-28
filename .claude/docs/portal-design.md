# Portal & Browser Design

## Process Model

`tilbo-browser` is a single resident process that serves two roles:

1. **Standalone file manager** — full-window tag-first browser with graph navigation
2. **XDG portal FileChooser backend** — constrained dialog returning file URIs to applications

The process is always running (started via autostart or first explicit launch).
It hides its window rather than quitting. The window appears on D-Bus activation.

## Single-Instance Enforcement

On launch, attempt to acquire the D-Bus name:

```go
reply, err := conn.RequestName("com.example.tilbo.Browser", dbus.NameFlagDoNotQueue)
if err != nil {
    log.Fatal(err)
}
if reply == dbus.RequestNameReplyExists {
    // Existing instance running — activate it and exit
    obj := conn.Object("com.example.tilbo.Browser", "/com/example/tilbo/Browser")
    call := obj.Call("com.example.tilbo.Browser.Open", 0, mode, argsJSON)
    if call.Err != nil {
        log.Fatal("failed to activate existing instance:", call.Err)
    }
    os.Exit(0)
}
// We are now the primary instance — continue initialisation
```

## D-Bus Interface

Service:   `com.example.tilbo.Browser`
Object:    `/com/example/tilbo/Browser`
Interface: `com.example.tilbo.Browser`

**Methods:**
```
Open(mode string, args string) → void
  mode = "browser"  → show full browser window
  mode = "portal"   → show portal dialog with JSON args
  mode = "search"   → show browser pre-populated with tag search

Hide() → void
Quit() → void
```

**Signals:**
```
WindowShown(mode string)
WindowHidden()
```

## XDG Portal Backend

The browser registers as the implementation of `org.freedesktop.impl.portal.FileChooser`.

**Portal config file** (installed to `/usr/share/xdg-desktop-portal/portals/tilbo.portal`):
```ini
[portal]
DBusName=com.example.tilbo.Browser
Interfaces=org.freedesktop.impl.portal.FileChooser;
UseIn=gnome;kde;sway;hyprland;
```

**Flow:**
```
1. Application calls org.freedesktop.portal.FileChooser.OpenFile on the user portal
2. xdg-desktop-portal reads tilbo.portal config, routes to com.example.tilbo.Browser
3. tilbo-browser receives org.freedesktop.impl.portal.FileChooser.OpenFile
4. Browser switches to portal mode QML window
5. User selects file(s) via tag search UI
6. Browser returns { uris: ["file:///real/path/to/file.pdf"] } via D-Bus reply
7. Application receives the file URI — no knowledge of the tag UI
```

**Portal mode constraints:**
- Window must use `org.freedesktop.portal.Request` token for cancellation support
- Must respond to `Close()` method on the request object
- Window title should reflect the calling application's display name (passed in options map)
- Must return `response = 0` (success) or `response = 1` (cancelled)

## Go↔Qt Thread Safety

**Rule: Qt methods must only be called from the Qt main thread.**

All daemon communication happens in goroutines. Results must be delivered to the Qt
main thread before any Qt/QML method can be called:

```go
// Pattern: goroutine → channel → Qt main thread via QTimer
func (b *Browser) SearchAsync(query string, callback func([]FileResult)) {
    go func() {
        results, err := b.daemonClient.Search(query)
        if err != nil {
            results = nil
        }
        // Deliver to Qt main thread
        b.mainThreadCh <- func() {
            callback(results)
        }
    }()
}

// In Qt main thread (called from a QTimer with interval=0):
func (b *Browser) drainMainThreadChannel() {
    for {
        select {
        case fn := <-b.mainThreadCh:
            fn()
        default:
            return
        }
    }
}
```

Set up a `QTimer` with `interval = 0` and `singleShot = false` connected to
`drainMainThreadChannel`. This flushes pending callbacks on every event loop iteration
without blocking the UI.

## QML Component Map

```
qml/
  components/
    TagSearchBar.qml        # autocomplete tag input; queries daemon for suggestions
    FileGrid.qml            # thumbnail grid view of file results
    FileList.qml            # list view alternative
    FileCard.qml            # single file item (thumbnail, name, tag chips)
    TagChip.qml             # individual tag badge with remove button
    MetadataPanel.qml       # sidebar: xattr display, inline tag editing
    GraphView.qml           # force-directed graph of related files
    HopRing.qml             # concentric ring layout by hop distance
  windows/
    BrowserWindow.qml       # full browser: search + grid/list + graph + metadata panel
    PortalDialog.qml        # constrained portal file chooser dialog
    SettingsWindow.qml      # harvester/rule config UI
```

## Startup Latency

Target: **< 150ms** from `Open()` D-Bus call to window visible (warm, process already running).

Warm path optimisations:
- Qt/QML engine initialised at process start, not on first Open()
- QML components compiled to bytecode at first load; cached
- Daemon socket connection kept alive; reconnect on error
- Tag autocomplete list pre-fetched and cached on startup

Cold start (first ever launch) will be slower (~500ms–1s depending on hardware).
Document this expectation. The autostart `.desktop` entry ensures the process is
warm before the user first needs it.

## Non-Portal Apps: GTK Bookmark Injection

For applications that use GTK's native file chooser directly (not via portal):

Write FUSE virtual directory paths to `~/.config/gtk-3.0/bookmarks` and
`~/.config/gtk-4.0/bookmarks`:

```
file:///home/user/tags/@recent Recent (tilbo)
file:///home/user/tags/@untagged Untagged (tilbo)
file:///home/user/tags/work Work
file:///home/user/tags/python Python
```

The daemon writes/updates these bookmark entries when tags are created or the config
changes. This is low-tech but gives non-portal apps one-click access to tag views
via the GTK sidebar.

## Packaging Checklist

- [ ] `tilbo-browser.desktop` (for application launcher)
- [ ] `tilbo-browser-autostart.desktop` → `~/.config/autostart/` (start on login)
- [ ] `/usr/share/xdg-desktop-portal/portals/tilbo.portal`
- [ ] `tilbo-daemon.service` (systemd user service)
- [ ] `tilbo-daemon.socket` (systemd socket activation for daemon auto-start)
