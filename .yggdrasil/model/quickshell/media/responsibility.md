# Responsibility

The Image Preview module is responsible for:

- **Lightbox overlay**: modal popup with dimmed background for fullscreen media viewing
- **Image display**: loads original image file directly for image MIME types
- **Video thumbnail**: requests large thumbnail from daemon for video MIME types (since QML cannot play video inline)
- **Zoom**: mouse-wheel zoom with zoom level indicator badge
- **Pan**: drag-to-pan when zoomed in
- **Close**: Escape key or click outside to dismiss

## Not responsible for

- Thumbnail generation (→ daemon/browser-handlers)
- File selection or navigation (→ browser-window)
