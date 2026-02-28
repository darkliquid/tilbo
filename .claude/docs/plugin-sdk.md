# Plugin & Harvester SDK

All plugin types share a common principle: they receive a file path and existing metadata,
and return additional metadata or tags. The daemon merges all outputs.

---

## Harvester Contract: Subprocess / WASM (stdio JSON)

The simplest and recommended plugin type. Works as a native subprocess OR a WASM module
(same binary, same contract).

**Registration** (`~/.config/tilbo/harvesters/<name>.toml`):
```toml
[harvester]
name        = "my-video-harvester"
command     = ["~/.local/share/tilbo/harvesters/video.wasm"]
# or:       = ["/usr/local/bin/my-harvester"]
mime_filter = ["video/*"]      # only run on matching MIME types
path_glob   = []               # alternative: glob patterns
priority    = 50               # lower runs first; built-ins are 0
timeout_ms  = 5000
async       = true             # don't block rule evaluation; run in background
```

**stdin (JSON):**
```json
{
  "path":     "/home/user/video.mkv",
  "mime":     "video/x-matroska",
  "existing": {
    "user.tags": "work",
    "user.meta.size_tier": "large"
  }
}
```

**stdout (JSON):**
```json
{
  "width":            1920,
  "height":           1080,
  "duration_seconds": 5400,
  "codec":            "h265",
  "hdr":              true,
  "audio_channels":   6
}
```

Exit 0 → output merged into metadata map.
Exit non-zero → harvester has nothing to contribute; output ignored.
Any key beginning with `_` is treated as internal and not written to xattr.

**Shell script example:**
```bash
#!/bin/bash
# reads path from stdin JSON, outputs media metadata
INPUT=$(cat)
PATH_VAL=$(echo "$INPUT" | jq -r '.path')
ffprobe -v quiet -print_format json -show_streams "$PATH_VAL" \
  | jq '{
      width:            (.streams[] | select(.codec_type=="video") | .width),
      height:           (.streams[] | select(.codec_type=="video") | .height),
      duration_seconds: (.streams[0].duration | tonumber),
      codec:            (.streams[] | select(.codec_type=="video") | .codec_name)
    }'
```

---

## Rule Contract: Declarative TOML

Rules live in `~/.config/tilbo/rules/<name>.toml` or `/etc/tilbo/rules/<name>.toml`.
User rules take precedence over system rules.

**Condition operators:**
- `eq = <value>` — exact match (string or bool)
- `glob = "<pattern>"` — shell glob match
- `gte = <n>`, `lte = <n>`, `gt = <n>`, `lt = <n>` — numeric comparison
- `between = [<min>, <max>]` — inclusive range
- `in = [<v1>, <v2>]` — membership
- `before = "<ISO date>"`, `after = "<ISO date>"` — date comparison on mtime
- `not = { <op> = <value> }` — negation

Add `any = true` at rule level for OR semantics across conditions (default is AND).

```toml
[[rule]]
name     = "hd-video"
tags     = ["video", "HD"]
priority = 10                  # higher runs later, wins conflicts

[rule.match]
mime  = "video/*"              # glob match

[rule.match.width]
gte = 1280


[[rule]]
name = "4k-hdr-video"
tags = ["video", "HD", "4K", "HDR"]

[rule.match]
mime = "video/*"

[rule.match.width]
gte = 3840

[rule.match.hdr]
eq = true


[[rule]]
name = "large-file"
tags = ["large"]

[rule.match.size_bytes]
gte = 1073741824               # 1 GiB


[[rule]]
name = "raw-photo"
tags = ["photo", "raw"]

[rule.match]
mime = { in = ["image/x-canon-cr2", "image/x-nikon-nef", "image/x-adobe-dng"] }


[[rule]]
name = "old-document"
tags = ["archive"]

[rule.match]
mime = "application/pdf"

[rule.match.mtime]
before = "2015-01-01"
```

---

## Rule Contract: Lua Scripted Rules

File: `~/.config/tilbo/rules/<name>.lua`

The `apply(meta)` function receives the full metadata map as a Lua table and returns
a list of tag strings to add. Return `{}` to add no tags.

Sandbox restrictions: no `io`, `os`, `require`, `load`, `dofile`, `loadfile`.
Only the metadata table and standard math/string/table libraries are available.

```lua
-- rules/video-quality.lua
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

  if meta.hdr == true then
    tags[#tags+1] = "HDR"
  end

  if meta.duration_seconds and meta.duration_seconds > 3600 then
    tags[#tags+1] = "long-video"
  end

  return tags
end
```

---

## Plugin Contract: Native `.so`

For maximum performance or when linking against native libraries.
Place `.so` files in `~/.local/lib/tilbo/plugins/` or `/usr/lib/tilbo/plugins/`.

**C header (`tilbo_plugin.h`):**
```c
#define TILBO_PLUGIN_API_VERSION 1

typedef struct {
    const char *key;
    const char *value;  /* JSON-encoded for non-strings */
} tilbo_meta_entry_t;

typedef struct {
    const tilbo_meta_entry_t *entries;
    size_t count;
} tilbo_metadata_t;

/* Harvester: populate output metadata. Return 0 on success. */
int tilbo_harvest(const char *path, tilbo_metadata_t *out);

/* Rule: return NULL-terminated array of tag strings, or NULL for no tags. */
/* Caller frees the returned array. */
const char **tilbo_apply_rule(const tilbo_metadata_t *meta);

/* Lifecycle */
int  tilbo_plugin_init(void);    /* called once at daemon start */
void tilbo_plugin_destroy(void); /* called on daemon shutdown  */

/* Version guard — daemon checks this before calling other symbols */
int tilbo_plugin_api_version(void); /* must return TILBO_PLUGIN_API_VERSION */
```

The daemon `dlopen()`s all `.so` files in the plugin directories at startup,
calls `tilbo_plugin_api_version()` first, and skips plugins with mismatched versions
(logs a warning). `tilbo_plugin_init()` is called once; `tilbo_plugin_destroy()` on
daemon shutdown or plugin reload.

---

## Extensibility Gradient

| Type | Skill Required | Use Case |
|---|---|---|
| Declarative TOML rule | None | Standard tag logic; copy-paste from docs |
| Shell script harvester | Basic shell + `jq` | Wrap any CLI tool with JSON output |
| Lua scripted rule | Basic scripting | Conditional logic not expressible in TOML |
| WASM harvester | Any compiled language | Link native libs; ship as single `.wasm` file |
| Native `.so` plugin | C/Go/Rust with C ABI | Maximum performance; complex native library use |
