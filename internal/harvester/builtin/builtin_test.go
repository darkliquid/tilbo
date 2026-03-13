package builtin

import (
	"archive/zip"
	"bytes"
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
func jpegHeader() []byte {
	return []byte{0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 'J', 'F', 'I', 'F', 0x00}
}

// PNG magic header.
func pngHeader() []byte {
	return []byte{0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A}
}

// --- MIMEHarvester ---

func TestMIMEHarvester_DetectsJPEG(t *testing.T) {
	path := tmpFile(t, "photo.jpg", jpegHeader())
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
	path := tmpFile(t, "image.png", pngHeader())
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

func TestMIMEHarvester_MissingFileReturnsEmpty(t *testing.T) {
	h := NewMIMEHarvester()
	meta, err := h.Run(context.Background(), harvester.Input{Path: "/does/not/exist.jpg"})
	if err != nil {
		t.Fatal(err)
	}
	if len(meta) != 0 {
		t.Errorf("expected empty metadata for missing file, got %v", meta)
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

func TestStatHarvester_MissingFileReturnsEmpty(t *testing.T) {
	h := NewStatHarvester()
	meta, err := h.Run(context.Background(), harvester.Input{Path: "/no/such/file"})
	if err != nil {
		t.Fatal(err)
	}
	if len(meta) != 0 {
		t.Errorf("expected empty metadata for missing file, got %v", meta)
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

func TestEXIFHarvester_MissingFileReturnsEmpty(t *testing.T) {
	h := NewEXIFHarvester()
	meta, err := h.Run(context.Background(), harvester.Input{Path: "/no/such/file.jpg", MIME: "image/jpeg"})
	if err != nil {
		t.Fatal(err)
	}
	if len(meta) != 0 {
		t.Errorf("expected empty metadata for missing file, got %v", meta)
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

func TestPDFHarvester_MissingFileReturnsEmpty(t *testing.T) {
	h := NewPDFHarvester()
	meta, err := h.Run(context.Background(), harvester.Input{Path: "/no/such/file.pdf", MIME: "application/pdf"})
	if err != nil {
		t.Fatal(err)
	}
	if len(meta) != 0 {
		t.Errorf("expected empty metadata for missing file, got %v", meta)
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

// --- EPUBHarvester ---

// makeEPUB builds a minimal valid EPUB ZIP in memory with the given OPF body.
func makeEPUB(t *testing.T, opfBody string) string {
	t.Helper()
	var buf bytes.Buffer
	zw := zip.NewWriter(&buf)

	addFile := func(name, content string) {
		t.Helper()
		w, err := zw.Create(name)
		if err != nil {
			t.Fatal(err)
		}
		if _, err := w.Write([]byte(content)); err != nil {
			t.Fatal(err)
		}
	}

	addFile("mimetype", "application/epub+zip")
	addFile("META-INF/container.xml", `<?xml version="1.0"?>
<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`)
	addFile("OEBPS/content.opf", opfBody)

	if err := zw.Close(); err != nil {
		t.Fatal(err)
	}
	return tmpFile(t, "test.epub", buf.Bytes())
}

const testOPF = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf"
         xmlns:dc="http://purl.org/dc/elements/1.1/"
         xmlns:opf="http://www.idpf.org/2007/opf" version="2.0">
  <metadata>
    <dc:title>The Test Book</dc:title>
    <dc:creator opf:role="aut">Jane Author</dc:creator>
    <dc:publisher>Test Press</dc:publisher>
    <dc:language>en</dc:language>
    <dc:subject>Fiction</dc:subject>
    <dc:subject>Science Fiction</dc:subject>
    <dc:identifier opf:scheme="ISBN">9781234567890</dc:identifier>
    <dc:date opf:event="publication">2023-06-15</dc:date>
    <dc:description>A book about testing.</dc:description>
  </metadata>
</package>`

func TestEPUBHarvester_Interface(t *testing.T) {
	h := NewEPUBHarvester()
	if h.Async() {
		t.Error("EPUB harvester should be synchronous")
	}
	if !h.Matches("", "application/epub+zip") {
		t.Error("EPUB harvester should match application/epub+zip")
	}
	if h.Matches("", "application/pdf") {
		t.Error("EPUB harvester should not match application/pdf")
	}
}

func TestEPUBHarvester_ExtractsMetadata(t *testing.T) {
	path := makeEPUB(t, testOPF)
	h := NewEPUBHarvester()
	meta, err := h.Run(context.Background(), harvester.Input{Path: path, MIME: "application/epub+zip"})
	if err != nil {
		t.Fatal(err)
	}
	if meta == nil {
		t.Fatal("expected metadata, got nil")
	}

	check := func(key, want string) {
		t.Helper()
		got, _ := meta[key].(string)
		if got != want {
			t.Errorf("%s = %q, want %q", key, got, want)
		}
	}
	check("book_title", "The Test Book")
	check("book_author", "Jane Author")
	check("book_publisher", "Test Press")
	check("book_language", "en")
	check("book_isbn", "9781234567890")
	check("book_description", "A book about testing.")

	if subj, _ := meta["book_subject"].(string); subj == "" {
		t.Error("expected book_subject")
	}
	if _, ok := meta["book_date"].(float64); !ok {
		t.Error("expected book_date float64")
	}
}

func TestEPUBHarvester_MissingFileReturnsEmpty(t *testing.T) {
	h := NewEPUBHarvester()
	meta, err := h.Run(context.Background(), harvester.Input{Path: "/no/such/file.epub", MIME: "application/epub+zip"})
	if err != nil {
		t.Fatal(err)
	}
	if len(meta) != 0 {
		t.Errorf("expected empty metadata for missing file, got %v", meta)
	}
}

func TestCalibreHarvester_Interface(t *testing.T) {
	h := NewCalibreHarvester()
	if h == nil {
		t.Skip("ebook-meta (calibre) not installed")
	}
	if h.Async() {
		t.Error("calibre harvester should be synchronous")
	}
	if !h.Matches("", "application/epub+zip") {
		t.Error("calibre harvester should match epub")
	}
	if !h.Matches("", "application/x-mobipocket-ebook") {
		t.Error("calibre harvester should match mobi")
	}
	if h.Matches("", "image/jpeg") {
		t.Error("calibre harvester should not match image/jpeg")
	}
}

// --- helpers tested directly ---

func TestParseFrameRate(t *testing.T) {
	cases := []struct {
		in   string
		want float64
	}{
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
