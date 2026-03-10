package main

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log/slog"
	"strings"

	"github.com/darkliquid/tilbo/internal/embed"
	"github.com/darkliquid/tilbo/internal/graph"
	"github.com/darkliquid/tilbo/internal/harvester"
	"github.com/darkliquid/tilbo/internal/index"
	"github.com/darkliquid/tilbo/internal/rules"
	"github.com/darkliquid/tilbo/internal/xattr"
)

// Processor runs the M2 pipeline for a single file: harvester fan-out → rule
// evaluation → xattr + index update. It is called after the initial xattr→index
// sync so the file record is guaranteed to exist in the index.
type Processor struct {
	idx      *index.DB
	tags     *xattr.Service
	pipeline *harvester.Pipeline
	engine   *rules.Engine
	g        *graph.Graph
	embedder *embed.ONNXEmbedder

	// OnFileTagged is called when a file's tags have been modified.
	OnFileTagged func(path string, added []string, removed []string)
}

// newProcessor creates a Processor.
func newProcessor(idx *index.DB, tags *xattr.Service, pipeline *harvester.Pipeline, engine *rules.Engine, g *graph.Graph, embedder *embed.ONNXEmbedder) *Processor {
	return &Processor{
		idx:      idx,
		tags:     tags,
		pipeline: pipeline,
		engine:   engine,
		g:        g,
		embedder: embedder,
	}
}

// ProcessFile runs the full M2 pipeline for path. Any error is logged rather
// than returned because a pipeline failure should not stop the daemon.
func (p *Processor) ProcessFile(ctx context.Context, path string) {
	if err := p.processFile(ctx, path); err != nil {
		slog.DebugContext(ctx, "processor: file error", "path", path, "err", err)
	}
}

func (p *Processor) processFile(ctx context.Context, path string) error {
	existingTags, err := p.tags.ReadTags(ctx, path)
	if err != nil {
		return fmt.Errorf("read tags: %w", err)
	}
	existingMeta, err := p.tags.ReadAllMeta(ctx, path)
	if err != nil {
		return fmt.Errorf("read meta: %w", err)
	}

	// Convert string xattr values to typed MetaMap values for rule evaluation.
	meta := make(harvester.MetaMap, len(existingMeta))
	for k, v := range existingMeta {
		meta[k] = harvester.ParseMetaValue(v)
	}

	mime, _ := meta["mime"].(string)
	input := harvester.Input{Path: path, MIME: mime, Existing: meta}

	// Run synchronous harvesters.
	additional, err := p.pipeline.Run(ctx, input)
	if err != nil {
		slog.DebugContext(ctx, "processor: pipeline error", "path", path, "err", err)
	}

	// Persist new metadata and merge into working map.
	fileID, idErr := p.idx.GetFileIDByPath(ctx, path)
	for k, v := range additional {
		meta[k] = v
		if strings.HasPrefix(k, "_") {
			continue
		}
		strVal := harvester.ValueToString(v)
		if err := p.tags.WriteMeta(ctx, path, k, strVal); err != nil {
			slog.DebugContext(ctx, "processor: write meta xattr error",
				"path", path, "key", k, "err", err)
		}
		if idErr == nil {
			if err := p.idx.UpsertMeta(ctx, fileID, k, strVal, "harvester"); err != nil {
				slog.DebugContext(ctx, "processor: upsert meta index error",
					"path", path, "key", k, "err", err)
			}
		}
	}

	// Start async harvesters in the background; their results trigger a separate update.
	p.pipeline.RunAsync(ctx, input, func(name string, asyncMeta harvester.MetaMap) {
		p.handleAsyncResult(ctx, path, name, asyncMeta)
	})

	if idErr != nil {
		if errors.Is(idErr, sql.ErrNoRows) {
			// File not yet in index (race between watcher and syncer); skip rule eval.
			return nil
		}
		return fmt.Errorf("get file id: %w", idErr)
	}

	overrides, err := p.idx.GetTagOverrides(ctx, fileID)
	if err != nil {
		return fmt.Errorf("get tag overrides: %w", err)
	}

	diff, err := p.engine.Eval(ctx, meta, existingTags, overrides)
	if err != nil {
		return fmt.Errorf("eval rules: %w", err)
	}

	if p.embedder != nil {
		textParts := []string{path}
		textParts = append(textParts, existingTags...)
		if desc, ok := meta["description"].(string); ok && desc != "" {
			textParts = append(textParts, desc)
		}
		if title, ok := meta["title"].(string); ok && title != "" {
			textParts = append(textParts, title)
		}
		if text, ok := meta["text"].(string); ok && text != "" {
			textParts = append(textParts, text)
		}
		text := strings.Join(textParts, " ")

		vec, err := p.embedder.EmbedText(ctx, text)
		if err != nil {
			slog.DebugContext(ctx, "processor: embedding generation failed", "path", path, "err", err)
		} else {
			if err := p.idx.UpsertEmbedding(ctx, fileID, vec); err != nil {
				slog.DebugContext(ctx, "processor: embedding index upsert failed", "path", path, "err", err)
			} else {
				p.g.SetEmbedding(path, vec)
			}
		}
	}

	if len(diff.Added) == 0 {
		return nil
	}

	return p.applyDiff(ctx, path, fileID, existingTags, diff)
}

// handleAsyncResult is called on a goroutine when an async harvester completes.
// It persists the new metadata and re-runs rule evaluation.
func (p *Processor) handleAsyncResult(ctx context.Context, path, harvesterName string, asyncMeta harvester.MetaMap) {
	slog.DebugContext(ctx, "processor: async harvester complete",
		"harvester", harvesterName, "path", path)

	fileID, err := p.idx.GetFileIDByPath(ctx, path)
	if err != nil {
		return
	}

	existingTags, _ := p.tags.ReadTags(ctx, path)
	existingMeta, _ := p.tags.ReadAllMeta(ctx, path)
	meta := make(harvester.MetaMap, len(existingMeta)+len(asyncMeta))
	for k, v := range existingMeta {
		meta[k] = harvester.ParseMetaValue(v)
	}

	for k, v := range asyncMeta {
		meta[k] = v
		if strings.HasPrefix(k, "_") {
			continue
		}
		strVal := harvester.ValueToString(v)
		_ = p.tags.WriteMeta(ctx, path, k, strVal)
		_ = p.idx.UpsertMeta(ctx, fileID, k, strVal, "harvester:"+harvesterName)
	}

	overrides, _ := p.idx.GetTagOverrides(ctx, fileID)
	diff, err := p.engine.Eval(ctx, meta, existingTags, overrides)
	if err != nil || len(diff.Added) == 0 {
		return
	}
	if err := p.applyDiff(ctx, path, fileID, existingTags, diff); err != nil {
		slog.DebugContext(ctx, "processor: apply async diff error", "path", path, "err", err)
	}
}

// applyDiff writes new tags to xattr, updates provenance, and updates the index.
func (p *Processor) applyDiff(ctx context.Context, path string, fileID int64, existingTags []string, diff rules.TagDiff) error {
	newTags := make([]string, len(existingTags), len(existingTags)+len(diff.Added))
	copy(newTags, existingTags)
	newTags = append(newTags, diff.Added...)

	if err := p.tags.WriteTags(ctx, path, newTags); err != nil {
		return fmt.Errorf("write tags: %w", err)
	}

	// Update provenance xattr.
	sourceMap, _ := p.tags.ReadSource(ctx, path)
	if sourceMap == nil {
		sourceMap = make(map[string]string)
	}
	for tag, src := range diff.Sources {
		sourceMap[tag] = src
	}
	if err := p.tags.WriteSource(ctx, path, sourceMap); err != nil {
		slog.DebugContext(ctx, "processor: write source xattr error", "path", path, "err", err)
	}

	// Update index and in-memory graph.
	if err := p.idx.SetFileTags(ctx, fileID, newTags); err != nil {
		return fmt.Errorf("set file tags: %w", err)
	}
	p.g.SetFileTags(path, newTags)
	for tag, src := range diff.Sources {
		tagID, err := p.idx.UpsertTag(ctx, tag)
		if err != nil {
			continue
		}
		if err := p.idx.SetTagProvenance(ctx, fileID, tagID, src); err != nil {
			slog.DebugContext(ctx, "processor: set provenance error",
				"path", path, "tag", tag, "err", err)
		}
	}

	if p.OnFileTagged != nil {
		p.OnFileTagged(path, diff.Added, nil)
	}

	slog.DebugContext(ctx, "processor: applied tags", "path", path, "added", diff.Added)
	return nil
}
