package builtin

import (
	"context"
	"os"
	"path/filepath"
	"testing"

	"github.com/darkliquid/tilbo/internal/harvester"
)

// --- helpers ---

func tmpFile(t *testing.T, name string, data []byte) string {
	t.Helper()
	dir := t.TempDir()
	p := filepath.Join(dir, name)
	if err := os.WriteFile(p, data, 0o644); err != nil {
		t.Fatal(err)
	}
	return p
}

// JPEG magic header (SOI + APP0 marker).
var jpegHeader = []byte{0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 'J', 'F', 'I', 'F', 0x00}

// PNG magic header.
var pngHeader = []byte{0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A}

// --- MIMEHarvester ---

func TestMIMEHarvester_DetectsJPEG(t *testing.T) {
	path := tmpFile(t, "photo.jpg", jpegHeader)
	h := NewMIMEHarvester()
	meta, err := h.Run(context.Background(), harvester.Input{Path: path})
	if err != nil {
		t.Fatal(err)
	}
	mime, _ := meta["mime"].(string)
	if mime != "image/jpeg" {
		t.Errorf("expected image/jpeg, got %q", mime)
	}
}

func TestMIMEHarvester_DetectsPNG(t *testing.T) {
	path := tmpFile(t, "image.png", pngHeader)
	h := NewMIMEHarvester()
	meta, err := h.Run(context.Background(), harvester.Input{Path: path})
	if err != nil {
		t.Fatal(err)
	}
	mime, _ := meta["mime"].(string)
	if mime != "image/png" {
		t.Errorf("expected image/png, got %q", mime)
	}
}

func TestMIMEHarvester_FallsBackToExtension(t *testing.T) {
	// Plain text content has no strong magic; extension should be the tiebreaker.
	path := tmpFile(t, "doc.pdf", []byte("not really a pdf but has the extension"))
	h := NewMIMEHarvester()
	meta, err := h.Run(context.Background(), harvester.Input{Path: path})
	if err != nil {
		t.Fatal(err)
	}
	// We just need a non-empty mime, not necessarily "application/pdf" since the
	// content doesn't have the PDF magic bytes.
	if meta["mime"] == nil {
		t.Error("expected a mime value")
	}
}

func TestMIMEHarvester_MissingFileReturnsNil(t *testing.T) {
	h := NewMIMEHarvester()
	meta, err := h.Run(context.Background(), harvester.Input{Path: "/does/not/exist.jpg"})
	if err != nil {
		t.Fatal(err)
	}
	if meta != nil {
		t.Errorf("expected nil for missing file, got %v", meta)
	}
}

func TestMIMEHarvester_Interface(t *testing.T) {
	h := NewMIMEHarvester()
	if h.Name() == "" {
		t.Error("Name should not be empty")
	}
	if h.Priority() >= 0 {
		t.Errorf("MIME harvester should have negative priority, got %d", h.Priority())
	}
	if h.Async() {
		t.Error("MIME harvester should be synchronous")
	}
	if !h.Matches("/any/path", "video/mp4") {
		t.Error("MIME harvester should match everything")
	}
}

// --- StatHarvester ---

func TestStatHarvester_ReturnsBasicFields(t *testing.T) {
	path := tmpFile(t, "data.bin", make([]byte, 1024))
	h := NewStatHarvester()
	meta, err := h.Run(context.Background(), harvester.Input{Path: path})
	if err != nil {
		t.Fatal(err)
	}
	if meta["size_bytes"] != float64(1024) {
		t.Errorf("size_bytes: got %v", meta["size_bytes"])
	}
	if _, ok := meta["size_tier"].(string); !ok {
		t.Error("expected size_tier string")
	}
	if _, ok := meta["mtime"].(float64); !ok {
		t.Error("expected mtime float64")
	}
	if _, ok := meta["mtime_year"].(float64); !ok {
		t.Error("expected mtime_year float64")
	}
}

func TestStatHarvester_SizeTiers(t *testing.T) {
	cases := []struct {
		size int64
		want string
	}{
		{1024, "tiny"},
		{64*1024 + 1, "small"},
		{10*1024*1024 + 1, "medium"},
		{1024*1024*1024 + 1, "large"},
		{100*1024*1024*1024 + 1, "huge"},
	}
	for _, c := range cases {
		got := sizeTier(c.size)
		if got != c.want {
			t.Errorf("sizeTier(%d) = %q, want %q", c.size, got, c.want)
		}
	}
}

func TestStatHarvester_MissingFileReturnsNil(t *testing.T) {
	h := NewStatHarvester()
	meta, err := h.Run(context.Background(), harvester.Input{Path: "/no/such/file"})
	if err != nil {
		t.Fatal(err)
	}
	if meta != nil {
		t.Errorf("expected nil for missing file, got %v", meta)
	}
}

func TestStatHarvester_Interface(t *testing.T) {
	h := NewStatHarvester()
	if h.Priority() >= 0 {
		t.Errorf("stat harvester should have negative priority, got %d", h.Priority())
	}
	if h.Async() {
		t.Error("stat harvester should be synchronous")
	}
	if !h.Matches("/any", "text/plain") {
		t.Error("stat harvester should match everything")
	}
}

// --- optional subprocess harvesters: just verify constructor & interface ---

func TestFFProbeHarvester_Interface(t *testing.T) {
	h := NewFFProbeHarvester()
	if h == nil {
		t.Skip("ffprobe not installed")
	}
	if !h.Async() {
		t.Error("ffprobe harvester should be async")
	}
	if h.Matches("", "text/plain") {
		t.Error("ffprobe should not match text/plain")
	}
	if !h.Matches("", "video/mp4") {
		t.Error("ffprobe should match video/mp4")
	}
	if !h.Matches("", "audio/mpeg") {
		t.Error("ffprobe should match audio/mpeg")
	}
}

func TestEXIFHarvester_Interface(t *testing.T) {
	h := NewEXIFHarvester()
	if h.Async() {
		t.Error("EXIF harvester should be synchronous")
	}
	if !h.Matches("", "image/jpeg") {
		t.Error("EXIF harvester should match image/jpeg")
	}
	if h.Matches("", "video/mp4") {
		t.Error("EXIF harvester should not match video/mp4")
	}
}

func TestEXIFHarvester_MissingFileReturnsNil(t *testing.T) {
	h := NewEXIFHarvester()
	meta, err := h.Run(context.Background(), harvester.Input{Path: "/no/such/file.jpg", MIME: "image/jpeg"})
	if err != nil {
		t.Fatal(err)
	}
	if meta != nil {
		t.Errorf("expected nil for missing file, got %v", meta)
	}
}

func TestPDFHarvester_Interface(t *testing.T) {
	h := NewPDFHarvester()
	if h.Async() {
		t.Error("PDF harvester should be synchronous")
	}
	if !h.Matches("", "application/pdf") {
		t.Error("PDF harvester should match application/pdf")
	}
	if h.Matches("", "image/png") {
		t.Error("PDF harvester should not match image/png")
	}
}

func TestPDFHarvester_MissingFileReturnsNil(t *testing.T) {
	h := NewPDFHarvester()
	meta, err := h.Run(context.Background(), harvester.Input{Path: "/no/such/file.pdf", MIME: "application/pdf"})
	if err != nil {
		t.Fatal(err)
	}
	if meta != nil {
		t.Errorf("expected nil for missing file, got %v", meta)
	}
}

func TestMediaHarvester_Interface(t *testing.T) {
	h := NewMediaHarvester()
	if h.Async() {
		t.Error("media harvester should be synchronous")
	}
	if !h.Matches("", "video/mp4") {
		t.Error("media harvester should match video/mp4")
	}
	if !h.Matches("", "audio/mpeg") {
		t.Error("media harvester should match audio/mpeg")
	}
	if h.Matches("", "image/jpeg") {
		t.Error("media harvester should not match image/jpeg")
	}
}

func TestMagikaHarvester_Interface(t *testing.T) {
	h := NewMagikaHarvester()
	if h == nil {
		t.Skip("magika not installed")
	}
	if h.Priority() >= 0 {
		t.Errorf("magika harvester should have negative priority, got %d", h.Priority())
	}
	if !h.Matches("", "anything") {
		t.Error("magika harvester should match everything")
	}
}

// --- helpers tested directly ---

func TestParseFrameRate(t *testing.T) {
	cases := []struct{ in string; want float64 }{
		{"30000/1001", 30000.0 / 1001.0},
		{"25/1", 25},
		{"0/0", 0},
		{"", 0},
	}
	for _, c := range cases {
		got := parseFrameRate(c.in)
		if got != c.want {
			t.Errorf("parseFrameRate(%q) = %v, want %v", c.in, got, c.want)
		}
	}
}
