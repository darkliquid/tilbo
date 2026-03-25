// Package builtin contains the built-in harvesters that ship with the tilbo daemon.
// All harvesters in this package are CGo-free and safe to use in any non-browser binary.
//
// Priority layout:
//
//	-100 : stat + MIME (always run first; provide base metadata for all rules)
//	  -1 : magika optional MIME override (only if binary found)
//	  10 : subprocess harvesters (ffprobe, exiv2, pdfinfo) — async where slow
package builtin

import (
	"context"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/h2non/filetype"

	"github.com/darkliquid/tilbo/internal/harvester"
)

const mimeReadBytes = 512 // bytes read for magic detection (filetype needs ≤262; http.DetectContentType needs 512)

// MIMEHarvester detects MIME type from file magic bytes (via h2non/filetype) with a
// stdlib fallback, then falls back to extension-based MIME from the OS MIME database.
// It runs at priority -100 so all other harvesters have a MIME value to filter on.
type MIMEHarvester struct{}

// NewMIMEHarvester returns a MIMEHarvester.
func NewMIMEHarvester() *MIMEHarvester { return &MIMEHarvester{} }

func (*MIMEHarvester) Name() string             { return "builtin:mime" }
func (*MIMEHarvester) Priority() int            { return -100 }
func (*MIMEHarvester) Async() bool              { return false }
func (*MIMEHarvester) Matches(_, _ string) bool { return true }

// Run detects the MIME type for input.Path and returns a MetaMap containing:
//   - "mime"  — detected MIME type string (e.g. "image/jpeg")
func (*MIMEHarvester) Run(_ context.Context, input harvester.Input) (harvester.MetaMap, error) {
	// Open and read the magic bytes.
	f, err := os.Open(input.Path)
	if err != nil {
		return harvester.MetaMap{}, nil // file unreadable — skip gracefully
	}
	defer f.Close()

	buf := make([]byte, mimeReadBytes)
	n, _ := f.Read(buf)
	buf = buf[:n]

	// 1. Try h2non/filetype (magic bytes; covers 60+ types).
	if kind, err := filetype.Match(buf); err == nil && kind != filetype.Unknown {
		return harvester.MetaMap{"mime": kind.MIME.Value}, nil
	}

	// 2. Stdlib http.DetectContentType (RFC 2045 sniff; always returns something).
	sniffed := http.DetectContentType(buf)
	if !strings.HasPrefix(sniffed, "application/octet-stream") &&
		!strings.HasPrefix(sniffed, "text/plain") {
		return harvester.MetaMap{"mime": sniffed}, nil
	}

	// 3. Extension-based fallback via OS MIME database.
	if ext := strings.ToLower(filepath.Ext(input.Path)); ext != "" {
		if mimeType := mime.TypeByExtension(ext); mimeType != "" {
			// Strip parameters (e.g. "text/plain; charset=utf-8" → "text/plain").
			if idx := strings.IndexByte(mimeType, ';'); idx >= 0 {
				mimeType = strings.TrimSpace(mimeType[:idx])
			}
			return harvester.MetaMap{"mime": mimeType}, nil
		}
	}

	// 4. Best-effort: return the sniffed value even if generic.
	return harvester.MetaMap{"mime": sniffed}, nil
}
