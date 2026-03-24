# Interface

## Properties (set by parent before showing)

| Property | Type | Purpose |
|----------|------|---------|
| `filePath` | `string` | Absolute path to the file to preview |
| `mimeType` | `string` | MIME type (determines image vs video thumbnail path) |

## Behavior

- **On visible**: resets zoom/pan, loads image source or requests video thumbnail
- **Mouse wheel**: zooms in/out around cursor position
- **Mouse drag**: pans the image when zoomed
- **Escape / click outside**: closes the popup
- **Zoom badge**: shows current zoom percentage when not at 1.0x
