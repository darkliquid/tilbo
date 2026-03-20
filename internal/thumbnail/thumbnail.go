package thumbnail

import (
	"context"
	"crypto/md5" //nolint:gosec // MD5 required by XDG thumbnail spec
	"encoding/hex"
	"errors"
	"fmt"
	"image"
	"image/png"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"

	"github.com/disintegration/imaging"
)

// Size selects the XDG thumbnail size bucket.
type Size int

const (
	// Normal is 128×128 max (XDG "normal").
	Normal Size = iota
	// Large is 256×256 max (XDG "large").
	Large
)

const (
	normalMaxDim = 128
	largeMaxDim  = 256
)

func (s Size) dir() string {
	if s == Large {
		return "large"
	}
	return "normal"
}

func (s Size) maxDim() int {
	if s == Large {
		return largeMaxDim
	}
	return normalMaxDim
}

// Generator produces thumbnails on demand.
type Generator struct {
	cacheDir   string // e.g. ~/.cache/thumbnails
	ffmpegPath string // resolved path to ffmpeg binary

	// singleflight-style dedup: key = cacheKey, value = *call
	mu    sync.Mutex
	inflt map[string]*call
}

type call struct {
	wg  sync.WaitGroup
	res Result
	err error
}

// Result holds information about a generated (or cached) thumbnail.
type Result struct {
	Path   string // absolute path to the PNG thumbnail
	Width  int
	Height int
}

// New creates a Generator.  cacheDir defaults to $XDG_CACHE_HOME/thumbnails
// (or ~/.cache/thumbnails) when empty.
func New(cacheDir string) *Generator {
	if cacheDir == "" {
		if xdg := os.Getenv("XDG_CACHE_HOME"); xdg != "" {
			cacheDir = filepath.Join(xdg, "thumbnails")
		} else {
			home, _ := os.UserHomeDir()
			cacheDir = filepath.Join(home, ".cache", "thumbnails")
		}
	}
	ffmpeg, _ := exec.LookPath("ffmpeg")
	return &Generator{
		cacheDir:   cacheDir,
		ffmpegPath: ffmpeg,
		inflt:      make(map[string]*call),
	}
}

func isImage(mime string) bool {
	switch mime {
	case "image/jpeg", "image/png", "image/gif", "image/webp", "image/tiff", "image/bmp":
		return true
	case "image/svg+xml":
		return false // not raster-thumbnailable with imaging
	}
	return strings.HasPrefix(mime, "image/")
}

func isVideo(mime string) bool {
	return strings.HasPrefix(mime, "video/")
}

// CanThumbnail reports whether the given MIME type is thumbnailable.
func CanThumbnail(mime string) bool {
	return isImage(mime) || isVideo(mime)
}

// GetOrGenerate returns the thumbnail for path at the requested size.  It
// checks the XDG cache first and only generates when needed.  Concurrent
// requests for the same file+size are coalesced.
func (g *Generator) GetOrGenerate(ctx context.Context, path string, mime string, sz Size) (Result, error) {
	absPath, err := filepath.Abs(path)
	if err != nil {
		return Result{}, fmt.Errorf("thumbnail: abs path: %w", err)
	}

	key := cacheKey(absPath, sz)

	// Fast path: check cache.
	if res, ok := g.cached(absPath, key); ok {
		return res, nil
	}

	// Coalesce concurrent calls.
	g.mu.Lock()
	if c, ok := g.inflt[key]; ok {
		g.mu.Unlock()
		c.wg.Wait()
		return c.res, c.err
	}
	c := &call{}
	c.wg.Add(1)
	g.inflt[key] = c
	g.mu.Unlock()

	c.res, c.err = g.generate(ctx, absPath, mime, sz, key)
	c.wg.Done()

	g.mu.Lock()
	delete(g.inflt, key)
	g.mu.Unlock()

	return c.res, c.err
}

// cacheKey returns the XDG cache filename (without extension) for the path and size.
func cacheKey(absPath string, sz Size) string {
	uri := "file://" + absPath
	sum := md5.Sum([]byte(uri)) //nolint:gosec // XDG spec requires MD5
	return filepath.Join(sz.dir(), hex.EncodeToString(sum[:]))
}

// cached checks if a valid thumbnail exists in the cache.
func (g *Generator) cached(absPath, key string) (Result, bool) {
	thumbPath := filepath.Join(g.cacheDir, key+".png")

	info, err := os.Stat(thumbPath)
	if err != nil {
		return Result{}, false
	}

	// Validate: thumbnail must be newer than the source (cheap mtime check).
	srcInfo, err := os.Stat(absPath)
	if err != nil {
		return Result{}, false
	}
	if info.ModTime().Before(srcInfo.ModTime()) {
		// Stale thumbnail.
		return Result{}, false
	}

	// Read dimensions from the thumbnail.
	w, h := readPNGDimensions(thumbPath)
	return Result{Path: thumbPath, Width: w, Height: h}, true
}

// generate creates a thumbnail for absPath.
func (g *Generator) generate(ctx context.Context, absPath, mime string, sz Size, key string) (Result, error) {
	thumbPath := filepath.Join(g.cacheDir, key+".png")

	if err := os.MkdirAll(filepath.Dir(thumbPath), 0o700); err != nil {
		return Result{}, fmt.Errorf("thumbnail: mkdir: %w", err)
	}

	var img image.Image
	var err error

	switch {
	case isImage(mime):
		img, err = g.generateImage(absPath, sz)
	case isVideo(mime):
		img, err = g.generateVideo(ctx, absPath, sz)
	default:
		return Result{}, errors.New("thumbnail: unsupported MIME type: " + mime)
	}
	if err != nil {
		return Result{}, err
	}

	// Write to temp file then rename for atomicity.
	tmp := thumbPath + ".tmp"
	f, err := os.OpenFile(tmp, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0o600)
	if err != nil {
		return Result{}, fmt.Errorf("thumbnail: create tmp: %w", err)
	}

	if err := png.Encode(f, img); err != nil {
		_ = f.Close()
		_ = os.Remove(tmp)
		return Result{}, fmt.Errorf("thumbnail: encode png: %w", err)
	}
	if err := f.Close(); err != nil {
		_ = os.Remove(tmp)
		return Result{}, fmt.Errorf("thumbnail: close tmp: %w", err)
	}

	if err := os.Rename(tmp, thumbPath); err != nil {
		_ = os.Remove(tmp)
		return Result{}, fmt.Errorf("thumbnail: rename: %w", err)
	}

	bounds := img.Bounds()
	return Result{
		Path:   thumbPath,
		Width:  bounds.Dx(),
		Height: bounds.Dy(),
	}, nil
}

// generateImage decodes and resizes an image file.
func (g *Generator) generateImage(path string, sz Size) (image.Image, error) {
	src, err := imaging.Open(path, imaging.AutoOrientation(true))
	if err != nil {
		return nil, fmt.Errorf("thumbnail: open image: %w", err)
	}

	dim := sz.maxDim()
	return imaging.Fit(src, dim, dim, imaging.Lanczos), nil
}

// generateVideo extracts a frame via ffmpeg and resizes it.
func (g *Generator) generateVideo(ctx context.Context, path string, sz Size) (image.Image, error) {
	if g.ffmpegPath == "" {
		return nil, errors.New("thumbnail: ffmpeg not found on PATH")
	}

	dim := sz.maxDim()
	scale := fmt.Sprintf("scale='min(%d,iw)':'min(%d,ih)':force_original_aspect_ratio=decrease", dim, dim)

	// Extract a frame at 3 seconds (or the first frame if shorter).
	tmp, err := os.CreateTemp("", "tilbo-thumb-*.png")
	if err != nil {
		return nil, fmt.Errorf("thumbnail: temp file: %w", err)
	}
	tmpPath := tmp.Name()
	_ = tmp.Close()
	defer func() { _ = os.Remove(tmpPath) }()

	cmd := exec.CommandContext(ctx, g.ffmpegPath, //nolint:gosec // ffmpegPath is resolved from PATH at init
		"-ss", "3",
		"-i", path,
		"-vframes", "1",
		"-vf", scale,
		"-y",
		tmpPath,
	)
	if out, err := cmd.CombinedOutput(); err != nil {
		return nil, fmt.Errorf("thumbnail: ffmpeg: %w: %s", err, out)
	}

	img, err := imaging.Open(tmpPath)
	if err != nil {
		return nil, fmt.Errorf("thumbnail: read ffmpeg output: %w", err)
	}
	return img, nil
}

// readPNGDimensions reads width and height from a PNG file without decoding
// the full image.
func readPNGDimensions(path string) (int, int) {
	f, err := os.Open(path)
	if err != nil {
		return 0, 0
	}
	defer f.Close()

	cfg, err := png.DecodeConfig(f)
	if err != nil {
		return 0, 0
	}
	return cfg.Width, cfg.Height
}
