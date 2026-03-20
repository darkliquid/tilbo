// Package thumbnail generates image thumbnails for the browser's file views.
//
// It creates PNG thumbnails at two standard sizes (normal: 128×128, large: 256×256)
// following the XDG thumbnail specification. Thumbnails are cached in the standard
// XDG cache directory (~/.cache/thumbnails/) keyed by the file URI, so they are
// shared with other applications that follow the spec.
//
// Currently supports image files (JPEG, PNG, GIF, WebP, BMP, TIFF). Video
// thumbnail generation requires ffmpeg to be available on PATH.
package thumbnail
