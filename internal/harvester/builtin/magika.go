package builtin

// MagikaHarvester calls the `magika` CLI (https://github.com/google/magika)
// when it is installed on PATH. Magika uses a deep-learning model to identify
// file types with higher accuracy than byte-magic sniffing, making it a
// superior MIME source for ambiguous files (e.g. text variants, Office formats,
// polyglot files). It runs at priority -1, just after the byte-magic MIME
// harvester at priority -100, so its result wins over the simpler sniff.
//
// # Why subprocess instead of the Go library?
//
// The official google/magika Go library (github.com/google/magika/go/magika)
// requires the ONNX Runtime via CGo, which is prohibited in all non-browser
// tilbo packages. The `magika` CLI binary is CGo-free from the daemon's
// perspective and can be installed independently (pip install magika, or from
// a pre-built release tarball).
//
// # Future path to native integration
//
// If a CGo-free ONNX backend becomes available (e.g. an ONNX-WASM runtime or
// a pure-Go port), the MagikaHarvester can be upgraded to link the model in-
// process without changing the Harvester interface or the daemon wiring.

import (
	"context"
	"encoding/json"
	"os/exec"
	"time"

	"github.com/darkliquid/tilbo/internal/harvester"
)

// MagikaHarvester wraps the `magika` CLI for ML-based MIME detection.
// Returns nil from NewMagikaHarvester when the binary is absent.
type MagikaHarvester struct {
	binary string
}

// magikaRunTimeout caps how long the magika subprocess may run. Magika's
// deep-learning model is lightweight but can stall on very large files or
// under resource contention, so we bound it to avoid blocking the pipeline.
const magikaRunTimeout = 15 * time.Second

// NewMagikaHarvester looks up magika on PATH. Returns nil if not found.
func NewMagikaHarvester() *MagikaHarvester {
	bin, err := exec.LookPath("magika")
	if err != nil {
		return nil
	}
	return &MagikaHarvester{binary: bin}
}

func (h *MagikaHarvester) Name() string             { return "builtin:magika" }
func (h *MagikaHarvester) Priority() int            { return -1 }
func (h *MagikaHarvester) Async() bool              { return false }
func (h *MagikaHarvester) Matches(_, _ string) bool { return true }

// magikaResult is the per-file entry in `magika --json-output` output.
// The CLI emits a JSON array; we request exactly one file so we take element 0.
type magikaResult struct {
	Path   string      `json:"path"`
	Output magikaLabel `json:"output"`
}

type magikaLabel struct {
	CTLABEL string  `json:"ct_label"`  // e.g. "jpeg"
	MIME    string  `json:"mime_type"` // e.g. "image/jpeg"
	Group   string  `json:"group"`     // e.g. "image"
	Score   float64 `json:"score"`     // 0.0–1.0 confidence
	IsText  bool    `json:"is_text"`
}

// Run invokes `magika --json-output <path>` and returns:
//   - "mime"          — MIME type as detected by Magika (overrides byte-magic)
//   - "magika_label"  — Magika content-type label (string)
//   - "magika_group"  — broad group (e.g. "image", "document")
//   - "magika_score"  — model confidence 0.0–1.0 (float64)
//
// If the score is below 0.5 the result is discarded and MIME is left to the
// byte-magic harvester.
func (h *MagikaHarvester) Run(ctx context.Context, input harvester.Input) (harvester.MetaMap, error) {
	ctx, cancel := context.WithTimeout(ctx, magikaRunTimeout)
	defer cancel()

	//nolint:gosec // binary from LookPath; path is daemon-trusted.
	cmd := exec.CommandContext(ctx, h.binary, "--json-output", input.Path)
	out, err := cmd.Output()
	if err != nil {
		return harvester.MetaMap{}, nil
	}

	var results []magikaResult
	if err := json.Unmarshal(out, &results); err != nil || len(results) == 0 {
		return harvester.MetaMap{}, nil
	}

	r := results[0].Output
	if r.Score < 0.5 || r.MIME == "" {
		return harvester.MetaMap{}, nil
	}

	meta := harvester.MetaMap{
		"mime":         r.MIME,
		"magika_label": r.CTLABEL,
		"magika_score": r.Score,
	}
	if r.Group != "" {
		meta["magika_group"] = r.Group
	}
	return meta, nil
}
