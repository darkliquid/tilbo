package main

import (
	"log/slog"

	"github.com/darkliquid/tilbo/internal/harvester"
	"github.com/darkliquid/tilbo/internal/harvester/builtin"
)

// registerBuiltins adds all built-in harvesters to the pipeline.
// Optional harvesters that depend on external binaries (ffprobe, exiv2, pdfinfo,
// magika) are silently skipped when the binary is not found on PATH.
func registerBuiltins(p *harvester.Pipeline) {
	// Always-on: stat and MIME run at priority -100 before everything else.
	p.Register(builtin.NewStatHarvester())
	p.Register(builtin.NewMIMEHarvester())

	// Optional MIME override: Magika (ML-based) at priority -1.
	if h := builtin.NewMagikaHarvester(); h != nil {
		p.Register(h)
		slog.Info("builtin harvester enabled", "name", h.Name())
	}

	// Always-on pure-Go harvesters at priority 5–10.
	p.Register(builtin.NewEXIFHarvester())
	p.Register(builtin.NewPDFHarvester())
	p.Register(builtin.NewMediaHarvester())

	// Optional subprocess harvesters at priority 10.
	for _, h := range []harvester.Harvester{
		builtin.NewFFProbeHarvester(),
	} {
		if h == nil {
			continue
		}
		p.Register(h)
		slog.Info("builtin harvester enabled", "name", h.Name())
	}
}
