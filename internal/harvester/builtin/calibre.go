package builtin

import (
	"bufio"
	"bytes"
	"context"
	"os/exec"
	"strconv"
	"strings"
	"time"

	"github.com/darkliquid/tilbo/internal/harvester"
)

// CalibreHarvester wraps the Calibre `ebook-meta` CLI to extract metadata
// from ebook formats that the pure-Go EPUBHarvester cannot handle: MOBI,
// AZW, AZW3, LIT, FB2, and others supported by Calibre.
//
// When installed, it also runs against EPUB at a higher priority (15 vs 10)
// so its richer results — including series, rating, and Calibre-normalised
// identifiers — override those from the built-in EPUB parser.
//
// Install Calibre: https://calibre-ebook.com/download
// On most distros: `calibre` package (provides ebook-meta in PATH).
type CalibreHarvester struct {
	binary string
}

const calibreNoneValue = "None"

const (
	calibrePriority    = 15
	calibreRunTimeout  = 20 * time.Second
	calibreMetaInitCap = 12
	calibreKVInitCap   = 16
)

// NewCalibreHarvester looks up ebook-meta on PATH. Returns nil if not found.
func NewCalibreHarvester() *CalibreHarvester {
	bin, err := exec.LookPath("ebook-meta")
	if err != nil {
		return nil
	}
	return &CalibreHarvester{binary: bin}
}

func (h *CalibreHarvester) Name() string  { return "builtin:calibre" }
func (h *CalibreHarvester) Priority() int { return calibrePriority }
func (h *CalibreHarvester) Async() bool   { return false }
func (h *CalibreHarvester) Matches(_ string, mime string) bool {
	switch mime {
	case "application/epub+zip",
		"application/x-mobipocket-ebook",
		"application/vnd.amazon.ebook",
		"application/x-kindle-book",
		"application/x-fictionbook+xml",
		"application/x-fictionbook",
		"application/x-cbz",
		"application/x-cbr",
		"application/vnd.comicbook+zip",
		"application/vnd.comicbook-rar":
		return true
	}
	return false
}

// Run calls `ebook-meta <path>` and returns a MetaMap with:
//   - "book_title"       — title (string)
//   - "book_author"      — author(s) (string)
//   - "book_publisher"   — publisher (string)
//   - "book_language"    — language (string)
//   - "book_description" — comments/synopsis (string)
//   - "book_subject"     — tags joined by "; " (string)
//   - "book_isbn"        — ISBN from identifiers (string)
//   - "book_date"        — publication date as Unix timestamp (float64)
//   - "book_series"      — series name (string)
//   - "book_series_index" — position within series (string)
//   - "book_rating"      — rating 0–10 (float64)
//
//nolint:gocyclo,cyclop,gocognit // field-by-field extraction keeps mapping logic explicit and maintainable
func (h *CalibreHarvester) Run(ctx context.Context, input harvester.Input) (harvester.MetaMap, error) {
	ctx, cancel := context.WithTimeout(ctx, calibreRunTimeout)
	defer cancel()

	//nolint:gosec // binary from LookPath; path is daemon-trusted.
	cmd := exec.CommandContext(ctx, h.binary, input.Path)
	out, err := cmd.Output()
	if err != nil {
		return harvester.MetaMap{}, nil
	}

	kv := parseCalibreKV(out)
	meta := make(harvester.MetaMap, calibreMetaInitCap)

	set := func(dst, src string) {
		// Calibre's ebook-meta outputs the literal string "None" for any
		// field that has no value, so we treat it the same as the empty string.
		if v, ok := kv[src]; ok && v != "" && v != calibreNoneValue {
			meta[dst] = v
		}
	}

	set("book_title", "Title")
	set("book_publisher", "Publisher")
	set("book_language", "Languages")
	set("book_series", "Series")
	set("book_series_index", "Series index")

	// Author(s) may list "&" or "," separated names; keep as-is.
	if v, ok := kv["Author(s)"]; ok && v != "" && v != calibreNoneValue {
		// Strip the "[sort: ...]" annotation Calibre sometimes appends.
		if i := strings.Index(v, " ["); i > 0 {
			v = strings.TrimSpace(v[:i])
		}
		meta["book_author"] = v
	}

	// Tags → book_subject
	if v, ok := kv["Tags"]; ok && v != "" && v != calibreNoneValue {
		meta["book_subject"] = v
	}

	// Comments → book_description (may contain HTML; strip tags crudely)
	if v, ok := kv["Comments"]; ok && v != "" && v != calibreNoneValue {
		meta["book_description"] = stripHTMLTags(v)
	}

	// Rating: Calibre reports N/10.
	if v, ok := kv["Rating"]; ok && v != "" && v != calibreNoneValue {
		if f, ok := parseSimpleFloat(v); ok {
			meta["book_rating"] = f
		}
	}

	// Published date.
	if v, ok := kv["Published"]; ok && v != "" && v != calibreNoneValue {
		for _, layout := range []string{time.RFC3339, "2006-01-02", "2006-01-02T15:04:05+00:00"} {
			if t, err := time.Parse(layout, strings.TrimSpace(v)); err == nil {
				meta["book_date"] = float64(t.Unix())
				break
			}
		}
	}

	// Identifiers: "isbn:9781234567890,mobi-asin:ASIN123"
	if v, ok := kv["Identifiers"]; ok && v != "" && v != calibreNoneValue {
		for part := range strings.SplitSeq(v, ",") {
			part = strings.TrimSpace(part)
			key, val, found := strings.Cut(part, ":")
			if !found {
				continue
			}
			if strings.ToLower(key) == "isbn" {
				meta["book_isbn"] = strings.TrimSpace(val)
				break
			}
		}
	}

	if len(meta) == 0 {
		return harvester.MetaMap{}, nil
	}
	return meta, nil
}

// parseCalibreKV parses the `ebook-meta` colon-delimited output.
// Lines have the form "Key               : Value".
func parseCalibreKV(data []byte) map[string]string {
	m := make(map[string]string, calibreKVInitCap)
	sc := bufio.NewScanner(bytes.NewReader(data))
	for sc.Scan() {
		line := sc.Text()
		before, after, ok := strings.Cut(line, ":")
		if !ok {
			continue
		}
		key := strings.TrimSpace(before)
		val := strings.TrimSpace(after)
		if key != "" {
			m[key] = val
		}
	}
	return m
}

// stripHTMLTags removes HTML/XML tags from s using a simple byte scan.
// A space is written after each closing '>' so that text nodes separated
// only by tags remain space-delimited (e.g. "<b>bold</b>word" → "bold word"
// rather than "boldword"). [strings.Fields] then collapses any resulting runs of
// whitespace into single spaces. This handles the lightweight HTML that
// Calibre writes into the Comments field without needing a full HTML parser.
func stripHTMLTags(s string) string {
	var b strings.Builder
	b.Grow(len(s))
	inTag := false
	for i := range len(s) {
		switch {
		case s[i] == '<':
			inTag = true
		case s[i] == '>':
			inTag = false
			b.WriteByte(' ')
		case !inTag:
			b.WriteByte(s[i])
		}
	}
	return strings.Join(strings.Fields(b.String()), " ")
}

// parseSimpleFloat parses a plain decimal string.
func parseSimpleFloat(s string) (float64, bool) {
	f, err := strconv.ParseFloat(strings.TrimSpace(s), 64)
	if err != nil {
		return 0, false
	}
	return f, true
}
