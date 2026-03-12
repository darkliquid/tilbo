package builtin

import (
	"context"
	"os"
	"strings"
	"time"

	pdfapi "github.com/pdfcpu/pdfcpu/pkg/api"
	"github.com/pdfcpu/pdfcpu/pkg/pdfcpu/model"

	"github.com/darkliquid/tilbo/internal/harvester"
)

// PDFHarvester extracts document metadata from PDF files in-process using
// github.com/pdfcpu/pdfcpu. No external binary is required.
// Runs synchronously at priority 10 against application/pdf MIME types.
type PDFHarvester struct{}

const (
	pdfPriority    = 10
	pdfMetaInitCap = 10
)

// NewPDFHarvester returns a PDFHarvester.
func NewPDFHarvester() *PDFHarvester { return &PDFHarvester{} }

func (*PDFHarvester) Name() string  { return "builtin:pdf" }
func (*PDFHarvester) Priority() int { return pdfPriority }
func (*PDFHarvester) Async() bool   { return false }
func (*PDFHarvester) Matches(_ string, mime string) bool {
	return mime == "application/pdf"
}

// Run extracts PDF metadata and returns a MetaMap with:
//   - "pdf_pages"     — number of pages (float64)
//   - "pdf_title"     — document title (string)
//   - "pdf_author"    — document author (string)
//   - "pdf_subject"   — document subject (string)
//   - "pdf_creator"   — creating application (string)
//   - "pdf_producer"  — PDF producer library (string)
//   - "pdf_keywords"  — keywords joined by "; " (string)
//   - "pdf_encrypted" — true if the PDF is encrypted (bool)
//   - "pdf_date"      — CreationDate as Unix timestamp (float64)
//   - "pdf_version"   — PDF version string (string)
func (*PDFHarvester) Run(_ context.Context, input harvester.Input) (harvester.MetaMap, error) {
	f, err := os.Open(input.Path)
	if err != nil {
		return harvester.MetaMap{}, nil
	}
	defer f.Close()

	conf := model.NewDefaultConfiguration()
	conf.ValidationMode = model.ValidationRelaxed

	info, err := pdfapi.PDFInfo(f, input.Path, nil, false, conf)
	if err != nil {
		return harvester.MetaMap{}, nil // not a valid PDF or parse error — skip
	}

	meta := make(harvester.MetaMap, pdfMetaInitCap)

	if info.PageCount > 0 {
		meta["pdf_pages"] = float64(info.PageCount)
	}
	if v := strings.TrimSpace(info.Title); v != "" {
		meta["pdf_title"] = v
	}
	if v := strings.TrimSpace(info.Author); v != "" {
		meta["pdf_author"] = v
	}
	if v := strings.TrimSpace(info.Subject); v != "" {
		meta["pdf_subject"] = v
	}
	if v := strings.TrimSpace(info.Creator); v != "" {
		meta["pdf_creator"] = v
	}
	if v := strings.TrimSpace(info.Producer); v != "" {
		meta["pdf_producer"] = v
	}
	if v := strings.TrimSpace(info.Version); v != "" {
		meta["pdf_version"] = v
	}
	if len(info.Keywords) > 0 {
		meta["pdf_keywords"] = strings.Join(info.Keywords, "; ")
	}
	meta["pdf_encrypted"] = info.Encrypted

	// CreationDate is in PDF date format: "D:YYYYMMDDHHmmSSOHH'mm'"
	// Try RFC3339 first (pdfcpu may normalise it), then the raw PDF format.
	if v := strings.TrimSpace(info.CreationDate); v != "" {
		if t, err := time.Parse(time.RFC3339, v); err == nil {
			meta["pdf_date"] = float64(t.Unix())
		} else if t, err := parsePDFDate(v); err == nil {
			meta["pdf_date"] = float64(t.Unix())
		}
	}

	if len(meta) == 0 {
		return harvester.MetaMap{}, nil
	}
	return meta, nil
}

// parsePDFDate parses the PDF date format "D:YYYYMMDDHHmmSSOHH'mm'" or
// the truncated forms "D:YYYYMMDD" and "D:YYYYMMDDHHmmSS".
func parsePDFDate(s string) (time.Time, error) {
	s = strings.TrimPrefix(s, "D:")
	// Normalise timezone: replace trailing "Z" with "+00'00'" already handled;
	// drop the apostrophe-delimited offset for simple parsing.
	s = strings.ReplaceAll(s, "'", "")
	for _, layout := range []string{
		"20060102150405-0700",
		"20060102150405+0700",
		"20060102150405Z07",
		"20060102150405",
		"20060102",
	} {
		if t, err := time.Parse(layout, s); err == nil {
			return t, nil
		}
	}
	return time.Time{}, &time.ParseError{}
}
