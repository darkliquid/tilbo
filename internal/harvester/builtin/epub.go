package builtin

import (
	"archive/zip"
	"context"
	"encoding/xml"
	"io"
	"strings"
	"time"

	"github.com/darkliquid/tilbo/internal/harvester"
)

// EPUBHarvester extracts document metadata from EPUB files in-process.
// EPUBs are ZIP archives containing an OPF package file with Dublin Core
// metadata. No external binary is required.
// Runs synchronously at priority 10 against application/epub+zip MIME types.
type EPUBHarvester struct{}

// NewEPUBHarvester returns an EPUBHarvester.
func NewEPUBHarvester() *EPUBHarvester { return &EPUBHarvester{} }

func (*EPUBHarvester) Name() string  { return "builtin:epub" }
func (*EPUBHarvester) Priority() int { return 10 }
func (*EPUBHarvester) Async() bool   { return false }
func (*EPUBHarvester) Matches(_ string, mime string) bool {
	return mime == "application/epub+zip"
}

// Run extracts EPUB metadata and returns a MetaMap with:
//   - "book_title"       — title (string)
//   - "book_author"      — primary creator with role "aut" (string)
//   - "book_publisher"   — publisher (string)
//   - "book_language"    — BCP-47 language tag (string)
//   - "book_description" — description/synopsis (string)
//   - "book_subject"     — subjects joined by "; " (string)
//   - "book_isbn"        — ISBN-10 or ISBN-13 (string)
//   - "book_date"        — publication date as Unix timestamp (float64)
//   - "book_series"      — series name from belongs-to-collection (string)
func (*EPUBHarvester) Run(_ context.Context, input harvester.Input) (harvester.MetaMap, error) {
	zr, err := zip.OpenReader(input.Path)
	if err != nil {
		return nil, nil
	}
	defer zr.Close()

	opfPath, err := epubOPFPath(zr)
	if err != nil || opfPath == "" {
		return nil, nil
	}

	opfData, err := epubReadFile(zr, opfPath)
	if err != nil {
		return nil, nil
	}

	return parseOPF(opfData)
}

// ── container.xml ────────────────────────────────────────────────────────────

type epubContainer struct {
	Rootfiles []struct {
		FullPath  string `xml:"full-path,attr"`
		MediaType string `xml:"media-type,attr"`
	} `xml:"rootfiles>rootfile"`
}

func epubOPFPath(zr *zip.ReadCloser) (string, error) {
	data, err := epubReadFile(zr, "META-INF/container.xml")
	if err != nil {
		return "", err
	}
	var c epubContainer
	if err := xml.Unmarshal(data, &c); err != nil {
		return "", err
	}
	for _, rf := range c.Rootfiles {
		if rf.MediaType == "application/oebps-package+xml" {
			return rf.FullPath, nil
		}
	}
	// Fallback: take the first rootfile regardless of type.
	if len(c.Rootfiles) > 0 {
		return c.Rootfiles[0].FullPath, nil
	}
	return "", nil
}

// ── OPF / Dublin Core ────────────────────────────────────────────────────────

// opfPackage covers both EPUB2 and EPUB3 OPF schema.
type opfPackage struct {
	XMLName  xml.Name    `xml:"package"`
	Metadata opfMetadata `xml:"metadata"`
}

type opfMetadata struct {
	Titles       []opfDCElem `xml:"title"`
	Creators     []opfCreator `xml:"creator"`
	Publishers   []opfDCElem `xml:"publisher"`
	Languages    []opfDCElem `xml:"language"`
	Subjects     []opfDCElem `xml:"subject"`
	Descriptions []opfDCElem `xml:"description"`
	Identifiers  []opfIdentifier `xml:"identifier"`
	Dates        []opfDate `xml:"date"`
	// EPUB3 <meta> elements (for series etc.)
	Metas []opfMeta `xml:"meta"`
}

type opfDCElem struct {
	Value string `xml:",chardata"`
}

type opfCreator struct {
	Value string `xml:",chardata"`
	Role  string `xml:"role,attr"` // EPUB2: opf:role="aut"
}

type opfIdentifier struct {
	Value  string `xml:",chardata"`
	Scheme string `xml:"scheme,attr"` // EPUB2: opf:scheme="ISBN"
	ID     string `xml:"id,attr"`
}

type opfDate struct {
	Value string `xml:",chardata"`
	Event string `xml:"event,attr"` // EPUB2: opf:event="publication"
}

type opfMeta struct {
	Property string `xml:"property,attr"` // EPUB3
	Refines  string `xml:"refines,attr"`  // EPUB3
	Name     string `xml:"name,attr"`     // EPUB2
	Content  string `xml:"content,attr"`  // EPUB2
	Value    string `xml:",chardata"`     // EPUB3
}

func parseOPF(data []byte) (harvester.MetaMap, error) {
	var pkg opfPackage
	if err := xml.Unmarshal(data, &pkg); err != nil {
		return nil, nil
	}
	md := pkg.Metadata
	meta := make(harvester.MetaMap, 10)

	// Title
	if len(md.Titles) > 0 {
		if v := strings.TrimSpace(md.Titles[0].Value); v != "" {
			meta["book_title"] = v
		}
	}

	// Creator / author: prefer role="aut", else take first.
	author := ""
	for _, c := range md.Creators {
		v := strings.TrimSpace(c.Value)
		if v == "" {
			continue
		}
		r := strings.ToLower(c.Role)
		if author == "" || r == "aut" || r == "author" {
			author = v
			if r == "aut" || r == "author" {
				break
			}
		}
	}
	if author != "" {
		meta["book_author"] = author
	}

	// Publisher
	if len(md.Publishers) > 0 {
		if v := strings.TrimSpace(md.Publishers[0].Value); v != "" {
			meta["book_publisher"] = v
		}
	}

	// Language
	if len(md.Languages) > 0 {
		if v := strings.TrimSpace(md.Languages[0].Value); v != "" {
			meta["book_language"] = v
		}
	}

	// Description
	if len(md.Descriptions) > 0 {
		if v := strings.TrimSpace(md.Descriptions[0].Value); v != "" {
			meta["book_description"] = v
		}
	}

	// Subjects
	var subjects []string
	for _, s := range md.Subjects {
		if v := strings.TrimSpace(s.Value); v != "" {
			subjects = append(subjects, v)
		}
	}
	if len(subjects) > 0 {
		meta["book_subject"] = strings.Join(subjects, "; ")
	}

	// ISBN: EPUB2 uses <dc:identifier opf:scheme="ISBN">,
	// EPUB3 uses <dc:identifier> with "urn:isbn:" prefix.
	for _, id := range md.Identifiers {
		v := strings.TrimSpace(id.Value)
		if v == "" {
			continue
		}
		scheme := strings.ToUpper(id.Scheme)
		if scheme == "ISBN" {
			meta["book_isbn"] = v
			break
		}
		if strings.HasPrefix(strings.ToLower(v), "urn:isbn:") {
			meta["book_isbn"] = v[9:] // strip the 9-byte "urn:isbn:" prefix
			break
		}
	}

	// Publication date: prefer event="publication", else first.
	for _, d := range md.Dates {
		v := strings.TrimSpace(d.Value)
		if v == "" {
			continue
		}
		ev := strings.ToLower(d.Event)
		if ev == "" || ev == "publication" {
			if t := parseEPUBDate(v); !t.IsZero() {
				meta["book_date"] = float64(t.Unix())
				if ev == "publication" {
					break
				}
			}
		}
	}

	// EPUB3 series: <meta property="belongs-to-collection">
	for _, m := range md.Metas {
		if m.Property == "belongs-to-collection" {
			if v := strings.TrimSpace(m.Value); v != "" {
				meta["book_series"] = v
			}
		}
	}

	if len(meta) == 0 {
		return nil, nil
	}
	return meta, nil
}

func parseEPUBDate(s string) time.Time {
	for _, layout := range []string{
		time.RFC3339,
		"2006-01-02",
		"2006-01",
		"2006",
	} {
		if t, err := time.Parse(layout, s); err == nil {
			return t
		}
	}
	return time.Time{}
}

// epubReadFile finds and reads a named file from the ZIP archive.
func epubReadFile(zr *zip.ReadCloser, name string) ([]byte, error) {
	for _, f := range zr.File {
		if f.Name == name {
			rc, err := f.Open()
			if err != nil {
				return nil, err
			}
			defer rc.Close()
			return io.ReadAll(rc)
		}
	}
	return nil, nil
}
