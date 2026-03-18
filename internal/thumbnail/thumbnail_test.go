package thumbnail_test

import (
	"context"
	"crypto/md5"
	"encoding/hex"
	"image"
	"image/color"
	"image/png"
	"os"
	"path/filepath"
	"testing"

	"github.com/darkliquid/tilbo/internal/thumbnail"
)

// writeSolidPNG creates a small solid-color PNG at path.
func writeSolidPNG(t *testing.T, path string, w, h int) {
	t.Helper()
	img := image.NewRGBA(image.Rect(0, 0, w, h))
	for y := range h {
		for x := range w {
			img.Set(x, y, color.RGBA{R: 200, G: 100, B: 50, A: 255})
		}
	}
	f, err := os.Create(path)
	if err != nil {
		t.Fatal(err)
	}
	defer f.Close()
	if err := png.Encode(f, img); err != nil {
		t.Fatal(err)
	}
}

func TestCanThumbnail(t *testing.T) {
	tests := []struct {
		mime string
		want bool
	}{
		{"image/jpeg", true},
		{"image/png", true},
		{"image/webp", true},
		{"video/mp4", true},
		{"video/x-matroska", true},
		{"text/plain", false},
		{"application/pdf", false},
		{"", false},
	}
	for _, tt := range tests {
		if got := thumbnail.CanThumbnail(tt.mime); got != tt.want {
			t.Errorf("CanThumbnail(%q) = %v, want %v", tt.mime, got, tt.want)
		}
	}
}

func TestGetOrGenerate_ImageNormal(t *testing.T) {
	dir := t.TempDir()
	cacheDir := filepath.Join(dir, "cache")
	srcPath := filepath.Join(dir, "test.png")
	writeSolidPNG(t, srcPath, 300, 200)

	gen := thumbnail.New(cacheDir)
	res, err := gen.GetOrGenerate(context.Background(), srcPath, "image/png", thumbnail.Normal)
	if err != nil {
		t.Fatal(err)
	}

	// Thumbnail should exist.
	if _, err := os.Stat(res.Path); err != nil {
		t.Fatalf("thumbnail not created at %s: %v", res.Path, err)
	}

	// Dimensions should be ≤128.
	if res.Width > 128 || res.Height > 128 {
		t.Errorf("thumbnail dimensions %dx%d exceed normal max 128x128", res.Width, res.Height)
	}
	if res.Width == 0 || res.Height == 0 {
		t.Error("thumbnail has zero dimension")
	}

	// Verify XDG path structure.
	relPath, err := filepath.Rel(cacheDir, res.Path)
	if err != nil {
		t.Fatal(err)
	}
	wantDir := "normal"
	if filepath.Dir(relPath) != wantDir {
		t.Errorf("thumbnail stored in %q, want %q subdirectory", filepath.Dir(relPath), wantDir)
	}
}

func TestGetOrGenerate_ImageLarge(t *testing.T) {
	dir := t.TempDir()
	cacheDir := filepath.Join(dir, "cache")
	srcPath := filepath.Join(dir, "test.png")
	writeSolidPNG(t, srcPath, 500, 400)

	gen := thumbnail.New(cacheDir)
	res, err := gen.GetOrGenerate(context.Background(), srcPath, "image/png", thumbnail.Large)
	if err != nil {
		t.Fatal(err)
	}

	if res.Width > 256 || res.Height > 256 {
		t.Errorf("thumbnail dimensions %dx%d exceed large max 256x256", res.Width, res.Height)
	}

	relPath, _ := filepath.Rel(cacheDir, res.Path)
	if filepath.Dir(relPath) != "large" {
		t.Errorf("thumbnail stored in %q, want 'large' subdirectory", filepath.Dir(relPath))
	}
}

func TestGetOrGenerate_CacheHit(t *testing.T) {
	dir := t.TempDir()
	cacheDir := filepath.Join(dir, "cache")
	srcPath := filepath.Join(dir, "test.png")
	writeSolidPNG(t, srcPath, 200, 200)

	gen := thumbnail.New(cacheDir)

	// First call generates.
	res1, err := gen.GetOrGenerate(context.Background(), srcPath, "image/png", thumbnail.Normal)
	if err != nil {
		t.Fatal(err)
	}
	info1, _ := os.Stat(res1.Path)

	// Second call should be a cache hit (same file returned).
	res2, err := gen.GetOrGenerate(context.Background(), srcPath, "image/png", thumbnail.Normal)
	if err != nil {
		t.Fatal(err)
	}
	if res2.Path != res1.Path {
		t.Errorf("cache miss: got different path %q vs %q", res2.Path, res1.Path)
	}
	info2, _ := os.Stat(res2.Path)
	if info2.ModTime() != info1.ModTime() {
		t.Error("thumbnail was regenerated on cache hit")
	}
}

func TestGetOrGenerate_CacheInvalidation(t *testing.T) {
	dir := t.TempDir()
	cacheDir := filepath.Join(dir, "cache")
	srcPath := filepath.Join(dir, "test.png")
	writeSolidPNG(t, srcPath, 200, 200)

	gen := thumbnail.New(cacheDir)

	res1, err := gen.GetOrGenerate(context.Background(), srcPath, "image/png", thumbnail.Normal)
	if err != nil {
		t.Fatal(err)
	}

	// Rewrite the source file (newer mtime).
	writeSolidPNG(t, srcPath, 200, 200)

	res2, err := gen.GetOrGenerate(context.Background(), srcPath, "image/png", thumbnail.Normal)
	if err != nil {
		t.Fatal(err)
	}
	if res2.Path != res1.Path {
		t.Errorf("path changed after invalidation: %q vs %q", res2.Path, res1.Path)
	}
	// The file should be regenerated (newer mtime).
	info2, _ := os.Stat(res2.Path)
	info1, _ := os.Stat(res1.Path)
	_ = info1 // info1 was obtained before rewrite; check info2 is newer than source
	srcInfo, _ := os.Stat(srcPath)
	if info2.ModTime().Before(srcInfo.ModTime()) {
		t.Error("thumbnail not regenerated after source modification")
	}
}

func TestXDGPathFormat(t *testing.T) {
	// Verify that the thumbnail path follows XDG naming convention:
	// MD5(file:///absolute/path) + ".png"
	dir := t.TempDir()
	cacheDir := filepath.Join(dir, "cache")
	srcPath := filepath.Join(dir, "test.png")
	writeSolidPNG(t, srcPath, 100, 100)

	gen := thumbnail.New(cacheDir)
	res, err := gen.GetOrGenerate(context.Background(), srcPath, "image/png", thumbnail.Normal)
	if err != nil {
		t.Fatal(err)
	}

	// Expected: cacheDir/normal/MD5("file://" + absPath).png
	uri := "file://" + srcPath
	sum := md5.Sum([]byte(uri))
	wantName := hex.EncodeToString(sum[:]) + ".png"
	wantPath := filepath.Join(cacheDir, "normal", wantName)

	if res.Path != wantPath {
		t.Errorf("thumbnail path\n  got:  %s\n  want: %s", res.Path, wantPath)
	}
}

func TestGetOrGenerate_UnsupportedMIME(t *testing.T) {
	dir := t.TempDir()
	gen := thumbnail.New(filepath.Join(dir, "cache"))
	_, err := gen.GetOrGenerate(context.Background(), filepath.Join(dir, "test.txt"), "text/plain", thumbnail.Normal)
	if err == nil {
		t.Error("expected error for unsupported MIME type")
	}
}

func TestGetOrGenerate_SmallImage(t *testing.T) {
	// Image smaller than the thumbnail max should still be produced at its native size.
	dir := t.TempDir()
	cacheDir := filepath.Join(dir, "cache")
	srcPath := filepath.Join(dir, "small.png")
	writeSolidPNG(t, srcPath, 32, 32)

	gen := thumbnail.New(cacheDir)
	res, err := gen.GetOrGenerate(context.Background(), srcPath, "image/png", thumbnail.Normal)
	if err != nil {
		t.Fatal(err)
	}
	if res.Width != 32 || res.Height != 32 {
		t.Errorf("small image thumbnail: got %dx%d, want 32x32", res.Width, res.Height)
	}
}
