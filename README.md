# Tilbo Taggings

_What has it gots in it's pocketses?_

Tilbo is a filesystem tagging and metadata system that provides a way to tag
files manually and automatically, and extract and associate metadata with them.

This data can then be used for file navigation using FUSE or a simple IPC system.

In addition to the daemon that maintains the tags and metadata, there is a CLI
tool for tagging and a Quickshell GUI file browser that communicates with the
daemon over a Unix socket (JSON RPC).

Tags and metadata are stored via extended filesystem attributes by default, with
a fallback to storing the data in an sqlite database for filesystems that do not
support extended filesystem attributes.

---

## Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [The Daemon](#the-daemon)
- [The CLI](#the-cli)
- [The GUI Browser](#the-gui-browser)
- [FUSE Virtual Filesystem](#fuse-virtual-filesystem)
- [Auto-tagging: Harvesters and Rules](#auto-tagging-harvesters-and-rules)
- [Optional External Dependencies](#optional-external-dependencies)
- [Configuration](#configuration)
- [Limitations](#limitations)

---

## Requirements

- Linux (kernel 5.10+ for fanotify; 5.17+ recommended for rename tracking)
- Go 1.26 or later (to build from source)
- FUSE kernel module (`fuse` package)
- [Quickshell](https://quickshell.outfoxxed.me/) (optional — only required for the GUI browser)

---

## Installation

```sh
# Build the unified tilbo binary (CGo-free; no special deps needed)
go build -o tilbo ./cmd/tilbo

# Install to ~/bin (or /usr/local/bin)
cp tilbo ~/bin/

# The GUI browser is a pure-QML app — no Go build step needed.
# Install Quickshell (https://quickshell.outfoxxed.me/), then run directly:
#   quickshell -p cmd/tilbo-quickshell/shell.qml

# Generate shell completions
tilbo completion bash > ~/.local/share/bash-completion/completions/tilbo

# Write baseline config files from current flags
tilbo --socket /run/user/$UID/tilbo.sock config init
tilbo daemon --watch "$HOME" --log-level info config init
```

A systemd user service unit is recommended for the daemon:

```ini
# ~/.config/systemd/user/tilbo-daemon.service
[Unit]
Description=Tilbo tag-first file manager daemon
After=network.target

[Service]
ExecStart=%h/bin/tilbo daemon --watch %h --log-format text --log-level info
Restart=on-failure

[Install]
WantedBy=default.target
```

```sh
# Install user-mode units via CLI using standard systemd tooling
tilbo daemon systemd install

# Or manually, if preferred
systemctl --user enable --now tilbo-daemon
```

---

## Getting Started

1. **Start the daemon** (watching your home directory):

   ```sh
   tilbo daemon --watch ~ --fuse-mount ~/tags
   ```

2. **Open the GUI browser** (optional, requires Quickshell):

   ```sh
   quickshell run cmd/tilbo-quickshell/shell.qml
   ```

3. **Tag a file**:

   ```sh
   tilbo tag add ~/documents/report.pdf work project-alpha
   ```

4. **Browse by tag** (after FUSE is mounted):

   ```sh
   ls ~/tags/work/
   ls ~/tags/work+project-alpha/
   ```

5. **Search from the CLI**:

   ```sh
   tilbo search --tags work+project-alpha
   tilbo search --tags @recent
   ```

Tags are stored directly in the file's extended attributes (`user.tags`). The
SQLite index is a read cache rebuilt from xattrs on startup — you can delete
and recreate it without losing any tag data.

---

## The Daemon

`tilbo daemon` is the core engine. It watches a directory tree via fanotify,
runs a metadata harvester pipeline, stores results in a SQLite index, serves a
FUSE virtual filesystem, and exposes a Unix socket IPC endpoint.

### Flags

| Flag | Default | Description |
| --- | --- | --- |
| `--watch <path>` | `~` | Filesystem path to watch via fanotify |
| `--db <path>` | `~/.local/state/tilbo/index.db` | SQLite index database path |
| `--fuse-mount <path>` | `/run/user/$UID/tilbo/tags` | FUSE virtual filesystem mount point (empty to disable) |
| `--log-format <fmt>` | `text` | Log format: `text` or `json` |
| `--log-level <lvl>` | `info` | Log level: `debug`, `info`, `warn`, `error` |
| `--embed-disabled` | `false` | Disable vector embeddings entirely |
| `--embed-model <path>` | | Path to local ONNX model directory (overrides auto-download) |
| `--embed-model-name <name>` | `sentence-transformers/all-MiniLM-L6-v2` | Huggingface model to auto-download |
| `--watch-hidden` | `false` | Watch hidden files and directories |
| `--watcher <backend>` | `auto` | Filesystem watcher backend: `auto`, `fanotify`, `inotify` |

### Config and Shell Setup

```sh
# Write a baseline daemon config using current flags
tilbo daemon --watch "$HOME" --db "$HOME/.local/state/tilbo/index.db" config init

# Install user-mode systemd service and socket
tilbo daemon systemd install

# Generate shell completions
tilbo completion zsh > ~/.zfunc/_tilbo
```

The generated `~/.config/tilbo/config.toml` also includes a `[browser]` section.
Common browser settings can be edited there:

```toml
[browser]
use_trash = true
inline_thumbnails = true
auto_properties_slideout = false
theme = "nord" # supported presets: nord, light

[browser.keybindings]
back = "Alt+Left"
forward = "Alt+Right"
up = "Alt+Up"
home = "Alt+Home"
toggle_hidden = "Ctrl+H"
toggle_grid = "Ctrl+G"
refresh = "F5"
focus_path = "Ctrl+L"
delete = "Delete"
permanent_delete = "Shift+Delete"
copy = "Ctrl+C"
cut = "Ctrl+X"
paste = "Ctrl+V"
new_folder = "Ctrl+Shift+N"
select_all = "Ctrl+A"
zoom_in = "Ctrl++"
zoom_in_alternate = "Ctrl+="
zoom_out = "Ctrl+-"
zoom_reset = "Ctrl+0"
```

### Watcher Permissions and Fallback Modes

`tilbo daemon` prefers fanotify, but fanotify setup depends on kernel and runtime permissions.

- `CAP_SYS_ADMIN` is required for fanotify mark setup and FID handle resolution.
- On a normal supported mount, the daemon uses full fanotify mode.
- If `FAN_MARK_FILESYSTEM` fails with `EXDEV` (common with btrfs subvolumes), the daemon switches to a hybrid mode:
  - fanotify mount marks for write/modify notifications,
  - inotify for create/delete/move events under the configured watch root.
- If fanotify is unavailable (for example missing capability), the daemon falls back fully to inotify.

To grant capability to a local build:

```sh
sudo setcap cap_sys_admin+ep ./tilbo
```

Verify capability:

```sh
getcap ./tilbo
```

Note: rebuilding the binary clears file capabilities, so re-apply `setcap` after each rebuild.

### Signals

| Signal | Behaviour |
| --- | --- |
| `SIGTERM` / `SIGINT` | Graceful shutdown; unmounts FUSE; closes index |
| `SIGHUP` | Reloads harvester and rule configuration; triggers background re-evaluation sweep |

### Data Storage

#### xattrs (source of truth)

Tags are stored in `user.tags` as a space-separated list. Metadata key/value
pairs are stored in `user.meta.<key>`. Tag provenance (which rule applied which
tag) is stored in `user.tags.source` as JSON.

#### SQLite index (cache)

A SQLite database caches the xattr data for fast search and graph queries. It
includes an FTS5 virtual table for full-text search over metadata values. The
index is fully rebuildable from xattrs — the daemon performs a background scan
on startup to ensure consistency.

#### Sidecar fallback

For filesystems that do not support xattrs (FAT32, some NFS mounts), the daemon
falls back to a sidecar SQLite database at `~/.local/share/tilbo/sidecar.db`
keyed by inode and device number.

---

## The CLI

`tilbo` is the terminal client. All commands communicate with a running
daemon via the Unix socket at `/run/user/$UID/tilbo.sock`.

### Tag management

```sh
# Add tags to a file
tilbo tag add <path> <tag> [tag...]

# Remove tags from a file
tilbo tag remove <path> <tag> [tag...]

# List a file's current tags
tilbo tag list <path>
```

### Search

```sh
# Find files matching a tag expression
tilbo search --tags <expr>

# Find files matching ANY of the given tags
tilbo search --tags tag1,tag2 --any

# Exclude files with specific tags
tilbo search --tags work --exclude archived

# Full-text search over metadata values
tilbo search --fts "invoice 2024"

# Filter by a metadata key/value pair
tilbo search --meta "codec=h265"

# Combine filters
tilbo search --tags work --fts "quarterly report"

# Control output, sorting, and pagination
tilbo search --tags video --sort mtime:desc --limit 50 --offset 0 --format json
tilbo search --tags photo --format tsv | cut -f1 | xargs ...
```

**Output formats:** `human` (default), `json`, `tsv`

**Search options:**

| Flag | Default | Description |
| --- | --- | --- |
| `--any` | `false` | Use OR semantics for `--tags` |
| `--exclude <tags>` | | Comma-separated tags that must not be present |
| `--fts <query>` | | Full-text search over metadata values |
| `--meta <filter>` | | Metadata filters: `key=op:value` (e.g. `iso=gt:1600`) |
| `--sort <order>` | `mtime:desc` | Sort order: `field:asc|desc` (`mtime`, `name`, `size`) |
| `--limit <n>` | `50` | Maximum results to return |
| `--offset <n>` | `0` | Result offset for pagination |
| `--format <fmt>` | `human` | Output format: `human`, `json`, `tsv` |

**Tag expression syntax:**

| Expression | Meaning |
| --- | --- |
| `work` | Files tagged `work` |
| `work+project` | Files tagged both `work` AND `project` |
| `work+project+!draft` | Files tagged `work` AND `project` but NOT `draft` |
| `low-priority` | Files tagged `low-priority` (hyphens are literal in tag names) |
| `work,personal` | Files tagged `work` OR `personal` |
| `@recent` | Files modified in the last 7 days |
| `@recent:30d` | Files modified in the last 30 days |
| `@untagged` | Files with no tags |
| `@search:invoice 2024` | Full-text search over metadata values |
| `@similar:/path/to/file` | Files similar via tag graph and vector embeddings |
| `@meta:iso:gte:1600` | Files where the `iso` metadata key is ≥ 1600 |

Notes:

- `+` (AND) and `,` (OR) cannot be mixed in the same expression.
- `-` is a literal character in tag names: `low-priority` means the tag named `low-priority`.
- NOT uses the `!` prefix on an individual term: `work+!draft`.
- Tag names containing `+`, `,`, `!`, or `%` must be percent-encoded (`%2B`, `%2C`, `%21`, `%25`) in FUSE paths. The CLI and IPC do not require encoding.

### Metadata

```sh
# Show all metadata for a file
tilbo meta show <path>
tilbo meta show <path> --format json

# Set a metadata key
tilbo meta set <path> <key> <value>

# Delete a metadata key
tilbo meta delete <path> <key>
```

### Related files

```sh
# Find files related to a given file via tag graph and vector embeddings
tilbo related <path>
tilbo related <path> --limit 20 --hops 3 --vec-weight 0.8
tilbo related <path> --format json
```

Related files are ranked by a combination of:
1.  **Tag Graph Traversal:** A weighted IDF score across shared tags, decayed by hop distance. Tags shared by many files contribute less to the score. High-cardinality tags (shared by more than 5% of all indexed files) are skipped.
2.  **Vector Similarity:** If vector embeddings are enabled (default), a cosine similarity boost is applied to files found during traversal.

| Flag | Default | Description |
| --- | --- | --- |
| `--hops <n>` | `3` | Maximum graph hops from seed |
| `--hop-weight <w>` | `1.0` | Weight multiplier for graph hop distance |
| `--vec-weight <w>` | `0.4` | Weight multiplier for vector similarity |
| `--limit <n>` | `20` | Maximum results to return |
| `--format <fmt>` | `human` | Output format: `human`, `json`, `tsv` |

### Daemon management

```sh
# Check daemon status
tilbo daemon status

# Reload harvester and rule configuration (equivalent to SIGHUP)
tilbo daemon reload-rules
```

### Config and shell completions

```sh
# Write a baseline CLI config using current flags
tilbo --socket /run/user/$UID/tilbo.sock config init

# Generate shell completions
tilbo completion fish > ~/.config/fish/completions/tilbo.fish
```

---

## The GUI Browser

The Quickshell frontend (`cmd/tilbo-quickshell`) is a pure-QML file browser
that communicates with a running daemon over a newline-delimited JSON Unix
socket (`$XDG_RUNTIME_DIR/tilbo-ui.sock`). It requires
[Quickshell](https://quickshell.outfoxxed.me/) to be installed.

### Running

```sh
# Start the daemon first
tilbo daemon --watch ~ --fuse-mount ~/tags

# Then launch the browser in another terminal (or via autostart)
quickshell -p cmd/tilbo-quickshell/shell.qml

# Or with the mise task shorthand
mise run run-quickshell
```

By default the properties sidebar stays closed until you click the `PROPERTIES`
strip. Set `browser.auto_properties_slideout = true` in `config.toml` if you
want it to open automatically on selection.

### Layout

| Area | Description |
| --- | --- |
| Header | Search bar (chips for tags, globs, full-text), grid/list toggle, hidden-files toggle |
| Left sidebar (Places) | Home directory, XDG user dirs, FUSE tag mount when active |
| Main pane | File grid or list; double-click to navigate/open |
| Right sidebar (Properties) | Name, path, size, mtime, metadata key/value pairs, tag badges for the selected file |
| Footer | Clickable breadcrumb strip; click the last segment or the ✎ icon to type a path directly |

### Search chip syntax

| Chip | Behaviour |
| --- | --- |
| `photo` | Indexed tag search — files tagged `photo` |
| `glob:*.jpg` | Filesystem glob search |
| `fts:sunset` | Full-text search over metadata values |
| `hidden:any` | Include hidden files in results |

Multiple chips are combined: tag chips use AND semantics; glob chips run a
separate filesystem walk; results from both are merged.

### Live events

The browser reacts to live daemon events pushed over the UI socket without
polling:

| Event | Browser reaction |
| --- | --- |
| `FileTagged` | Tag badges on the affected entry update in-place |
| `IndexUpdated` | Active search re-executes with the latest index |
| `DaemonStateChanged` | Connection indicator in the search bar updates |

---

## FUSE Virtual Filesystem

When `--fuse-mount` is set (default `~/tags`), the daemon mounts a virtual
filesystem that presents your files organised by tags rather than filesystem
location.

### Path grammar

```text
~/tags/<expr>/                    — virtual directory for a tag expression
~/tags/work/                      — all files tagged "work"
~/tags/work+project/              — files tagged both "work" AND "project"
~/tags/work+project+!draft/       — "work" AND "project" AND NOT "draft"
~/tags/low-priority/              — files tagged "low-priority" (hyphens allowed)
~/tags/work,personal/             — files tagged "work" OR "personal"
~/tags/@recent/                   — files modified in the last 7 days
~/tags/@recent:30d/               — files modified in the last 30 days
~/tags/@untagged/                 — files with no tags
~/tags/@search:foo bar/           — full-text metadata search
~/tags/@similar:/real/path/       — graph-similar files
~/tags/@meta:iso:gte:1600/        — metadata filter
~/tags/@browse/                   — incremental tag browser (see below)
~/tags/@browse/work/              — lists tags co-occurring with "work"
~/tags/@browse/work/project/      — lists tags co-occurring with work AND project
~/tags/@browse/work/!draft/       — excludes "draft" from accumulated query
~/tags/@browse/work/@files/       — files matching the current accumulated query
```

### How it works

Each entry in a virtual directory is a **symlink** to the real file on disk.
Reads and writes go to the actual file. Setting xattrs on a virtual-directory
entry applies them to the real file and updates the index.

**Rename semantics:** Moving a file from one virtual directory to another applies
tag changes rather than a filesystem rename:

```sh
# Adds tag "personal", removes tag "work"
mv ~/tags/work/report.pdf ~/tags/personal/
```

Rename only works when both source and destination are simple `+`/`-` tag
expressions. Rename within the same directory is a no-op. Moving files out of
the mount entirely returns `EXDEV`.

**Inode stability:** Inodes are derived from a 64-bit FNV hash of the real
absolute path, ensuring that directory listings remain stable across daemon
restarts.

**Deduplication:** When multiple files have the same basename, the virtual
directory appends a `_2`, `_3`, … suffix to avoid collisions.

### Incremental tag browser (@browse)

`@browse` is designed for interactive exploration with a file manager or shell.
Rather than requiring you to know the full tag query upfront, each subdirectory
level shows only the tags that co-occur with all the tags you have navigated so
far — narrowing the visible set with every step.

```text
~/tags/@browse/              — lists all tags
~/tags/@browse/work/         — lists tags that appear alongside "work"
~/tags/@browse/work/video/   — lists tags that appear with both "work" AND "video"
~/tags/@browse/work/@files/  — the matching files (symlinks)
```

Prefix a tag name with `!` to exclude it:

```text
~/tags/@browse/video/!draft/@files/   — video files, excluding drafts
```

`@files` is always present at every level and shows the files matching the
accumulated query so far. Tag names with special characters are percent-encoded
in directory listings (same rules as the flat grammar).

### Integration tips

```sh
# Use with fzf for interactive tag-browsing file picker
ls ~/tags/work/ | fzf

# Open a tag-filtered view in your file manager
xdg-open ~/tags/work+project/

# Add tag virtual dirs as GTK bookmarks
echo "file://$HOME/tags/work work" >> ~/.config/gtk-3.0/bookmarks
```

---

## Auto-tagging: Harvesters and Rules

The daemon automatically extracts metadata from files and applies tags based on
configurable rules.

### Pipeline overview

1. A filesystem event triggers the pipeline for a file.
2. All matching **harvesters** run concurrently and produce a metadata map
   (MIME type, dimensions, duration, EXIF data, etc.).
3. The **rule engine** evaluates the metadata map and writes tags to the file's
   xattrs and the SQLite index.
4. If you manually remove a rule-applied tag, that override is recorded. The rule
   will not reapply the tag until you clear the override.
5. Sending `SIGHUP` (or running `tilbo daemon reload-rules`) reloads all rule
   files and triggers a background re-evaluation sweep over all indexed files.

### Writing harvester plugins

Harvesters are registered via drop-in TOML files in `~/.config/tilbo/harvesters/`.

**`~/.config/tilbo/harvesters/my-harvester.toml`:**

```toml
[harvester]
name        = "my-harvester"
command     = ["/usr/local/bin/my-harvester"]
# or WASM:  = ["~/.local/share/tilbo/harvesters/my-harvester.wasm"]
mime_filter = ["video/*"]        # only run on matching MIME types
path_glob   = []                 # alternative: file glob patterns
priority    = 50                 # lower runs first; built-ins are 0
timeout_ms  = 5000
async       = true               # don't block rule evaluation
```

The harvester receives JSON on stdin and must write JSON to stdout:

stdin:

```json
{
  "path":     "/home/user/video.mkv",
  "mime":     "video/x-matroska",
  "existing": { "user.tags": "work" }
}
```

stdout:

```json
{
  "width": 1920,
  "height": 1080,
  "duration_seconds": 5400,
  "codec": "h265",
  "hdr": true
}
```

Exit 0 → output merged into metadata map. Exit non-zero → output ignored.
Keys beginning with `_` are internal and not written to xattr.

### Writing declarative rules (TOML)

Rules live in `~/.config/tilbo/rules/<name>.toml` (or `/etc/tilbo/rules/`).

```toml
[[rule]]
name = "hd-video"
tags = ["video", "HD"]

[rule.match]
mime = "video/*"

[rule.match.width]
gte = 1280


[[rule]]
name = "large-file"
tags = ["large"]

[rule.match.size_bytes]
gte = 1073741824        # 1 GiB


[[rule]]
name = "old-document"
tags = ["archive"]

[rule.match]
mime = "application/pdf"

[rule.match.mtime]
before = "2015-01-01"
```

**Condition operators:** `eq`, `glob`, `gte`, `lte`, `gt`, `lt`, `between`,
`in`, `not`, `before`, `after`. Add `any = true` at the rule level for OR
semantics (default is AND across all conditions).

### Writing scripted rules (Lua)

```lua
-- ~/.config/tilbo/rules/video-quality.lua
function apply(meta)
  if not meta.mime or not meta.mime:match("^video/") then
    return {}
  end

  local tags = {"video"}

  if meta.width then
    if meta.width >= 3840 then
      tags[#tags+1] = "4K"
      tags[#tags+1] = "HD"
    elseif meta.width >= 1280 then
      tags[#tags+1] = "HD"
    end
  end

  return tags
end
```

The `apply(meta)` function receives the metadata map and returns a list of tags.
The sandbox has no filesystem or network access — only standard math, string, and
table libraries are available.

### Testing and validation

```sh
# List all active harvesters
tilbo harvester list

# Test the harvester pipeline against a specific file
tilbo harvester test ~/photos/vacation.jpg

# List all configured rules
tilbo rule list

# Validate rule syntax and configuration
tilbo rule validate

# Test rule evaluation against a file (shows what tags would be applied)
tilbo rule test ~/photos/vacation.jpg
```

---

## Optional External Dependencies

The daemon's built-in harvester pipeline works without any external tools.
The following optional binaries can be installed to enable additional metadata
extraction. The daemon detects them at startup and logs which are active.

| Binary | Purpose | Install |
| --- | --- | --- |
| `ffprobe` | Richer video/audio metadata (codec, bitrate, frame rate, HDR, stream details) — overrides the built-in media harvester | Part of [FFmpeg](https://ffmpeg.org/download.html); most distros: `ffmpeg` package |
| `ebook-meta` | Ebook metadata for MOBI, AZW, AZW3, FB2, and other formats Calibre supports; also enriches EPUB with series/rating data | Part of [Calibre](https://calibre-ebook.com/download); most distros: `calibre` package |
| `magika` | ML-based file-type detection — improves MIME accuracy for ambiguous files (Office formats, polyglot files, obscure text variants) | `pip install magika` or [pre-built release](https://github.com/google/magika/releases) |

### Why these are optional

All core metadata (EXIF/IPTC from images, PDF info, MP4/MKV/audio duration and
tags, EPUB title/author/ISBN) is extracted in-process using pure-Go libraries —
no external tools required. The optional binaries exist only to provide deeper
or higher-accuracy results for specific file categories when they are already
present on the system.

---

## Configuration

### File locations

| Path | Purpose |
| --- | --- |
| `~/.local/state/tilbo/index.db` | SQLite index (default; override with `--db`) |
| `~/.local/share/tilbo/sidecar.db` | Sidecar store for non-xattr filesystems |
| `~/.config/tilbo/harvesters/*.toml` | User harvester registrations |
| `/etc/tilbo/harvesters/*.toml` | System-wide harvester registrations |
| `~/.config/tilbo/rules/*.toml` | User TOML rules |
| `~/.config/tilbo/rules/*.lua` | User Lua rules |
| `/etc/tilbo/rules/*.toml` | System-wide TOML rules |
| `~/.local/lib/tilbo/plugins/*.so` | Native plugin harvesters |
| `/usr/lib/tilbo/plugins/*.so` | System-wide native plugins |
| `/run/user/$UID/tilbo.sock` | IPC Unix socket |
| `/run/user/$UID/tilbo/tags` | FUSE mount point (default; override with `--fuse-mount`) |

### Wasm plugin cache

WASM modules are compiled once and cached in the OS temp directory
(`$TMPDIR/tilbo-wasm-cache`). This avoids per-invocation compilation overhead.
Delete the cache directory to force recompilation.

---

## Limitations

### Kernel requirements

- **fanotify** requires Linux kernel 5.10 or later.
- **Rename event tracking** (`FAN_RENAME`) requires kernel 5.17 or later. On
  older kernels, the daemon falls back to tracking moves via `FAN_MOVED_FROM` /
  `FAN_MOVED_TO` pairs, which can miss cross-directory renames under high
  concurrency.

### xattr support

- Extended attributes are not supported on FAT32, exFAT, or some network
  filesystems (NFSv3 without server config, SMB by default). The daemon detects
  this at startup and falls back to a sidecar SQLite database. The sidecar is
  keyed by inode+device, so it is invalidated if files are moved between
  filesystems.
- xattrs on Linux are typically capped at 64 KiB per namespace per file. Files
  with very large numbers of tags or long metadata values may hit this limit.

### FUSE

- The FUSE mount is read-only in the sense that creating new files inside a
  virtual directory is not supported — files must exist in the real filesystem
  first. Writing to existing files (reads/writes) passes through to the real file.
- **Rename** only works when both the source and destination directories are
  simple tag expressions (no OR expressions, no special `@` directives). Renaming
  within complex expressions returns `EPERM`.
- Directory listings cache for 2 seconds (entry TTL). Index changes from other
  processes may take up to 2 seconds to appear.
- The FUSE mount requires the `fuse` kernel module. It is incompatible with
  user namespaces that don't have `CAP_SYS_ADMIN`.

### Graph traversal

- Tags shared by more than 5% of all indexed files are treated as stopwords and
  skipped during graph traversal. This prevents very common tags (`document`,
  `work`) from dominating related-file results, but means those tags do not
  contribute to similarity scoring.
- The BFS frontier is capped at `limit × 8` candidates per hop to bound
  traversal cost. On very large corpora with dense tag graphs, some related files
  reachable within the hop limit may not appear in results.
- The graph is an in-memory snapshot loaded on daemon start and updated
  incrementally. It does not persist across daemon restarts (always rebuilt from
  the index).

### Auto-tagging

- Rule overrides (when you manually remove a rule-applied tag) are stored
  per-file in the index. If you delete and recreate the index, overrides are
  lost and rules will reapply previously suppressed tags.
- Harvester processes run with a configurable timeout (`timeout_ms`). Files
  that harvesters cannot process within the timeout are indexed with whatever
  metadata was available at the time.
- WASM and subprocess harvesters have WASI stdio only — no filesystem or
  network access from within the sandbox.

### Vector embeddings

- The embedding pipeline using `knights-analytics/hugot` and ONNX runs locally. The first run will automatically download the default model (`all-MiniLM-L6-v2`) unless configured otherwise.
- Semantic similarity search via `@similar:` or `tilbo related` combines tag graph traversal with vector similarity.
- Vector search requires the `sqlite-vec` extension to be available to the daemon's SQLite driver (built-in by default).
