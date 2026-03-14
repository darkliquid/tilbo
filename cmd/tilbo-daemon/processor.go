package main

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log/slog"
	"maps"
	"os"
	"strings"
	"sync"
	"syscall"

	"golang.org/x/sys/unix"

	"github.com/darkliquid/tilbo/internal/graph"
	"github.com/darkliquid/tilbo/internal/harvester"
	"github.com/darkliquid/tilbo/internal/index"
	"github.com/darkliquid/tilbo/internal/rules"
	"github.com/darkliquid/tilbo/internal/vectorize"
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
	embedder *vectorize.ONNXEmbedder

	nonRetryableMu    sync.RWMutex
	nonRetryablePaths map[string]struct{}

	// OnFileTagged is called when a file's tags have been modified.
	OnFileTagged func(path string, added []string, removed []string)
}

// newProcessor creates a Processor.
func newProcessor(
	idx *index.DB,
	tags *xattr.Service,
	pipeline *harvester.Pipeline,
	engine *rules.Engine,
	g *graph.Graph,
	embedder *vectorize.ONNXEmbedder,
) *Processor {
	return &Processor{
		idx:      idx,
		tags:     tags,
		pipeline: pipeline,
		engine:   engine,
		g:        g,
		embedder: embedder,
		nonRetryablePaths: make(map[string]struct{}),
	}
}

// ProcessFile runs the full M2 pipeline for path. Any error is logged rather
// than returned because a pipeline failure should not stop the daemon.
func (p *Processor) ProcessFile(ctx context.Context, path string) {
	if p.shouldSkipPath(path) {
		if !isRetryEligiblePath(path) {
			return
		}
		p.clearPathNonRetryable(path)
	}
	if ctx.Err() != nil {
		return
	}
	if err := p.processFile(ctx, path); err != nil {
		if isNonRetryableProcessingErr(err) {
			p.markPathNonRetryable(path)
			return
		}
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

	// Phase 1: Run synchronous harvesters. On first-ever processing, MIME is
	// unknown so only unconditional harvesters (stat, mime) will run.
	additional, err := p.pipeline.Run(ctx, input)
	if err != nil {
		if isNonRetryableProcessingErr(err) {
			return nil
		}
		slog.DebugContext(ctx, "processor: pipeline error", "path", path, "err", err)
	}

	// Phase 2: If MIME was just discovered this run, re-run with the new MIME
	// so that MIME-dependent harvesters (EXIF, ffprobe, media, …) get a chance
	// to execute without waiting for a second file-change event.
	if newMIME, _ := additional["mime"].(string); input.MIME == "" && newMIME != "" {
		maps.Copy(meta, additional)
		input.MIME = newMIME
		input.Existing = meta
		phase2, err2 := p.pipeline.Run(ctx, input)
		if err2 != nil {
			if isNonRetryableProcessingErr(err2) {
				return nil
			}
			slog.DebugContext(ctx, "processor: pipeline phase2 error", "path", path, "err", err2)
		}
		maps.Copy(additional, phase2)
	}

	// Persist new metadata and merge into working map.
	fileID, idErr := p.idx.GetFileIDByPath(ctx, path)
	for k, v := range additional {
		meta[k] = v
		if strings.HasPrefix(k, "_") {
			continue
		}
		strVal := harvester.ValueToString(v)
		if writeErr := p.tags.WriteMeta(ctx, path, k, strVal); writeErr != nil {
			if isNonRetryableProcessingErr(writeErr) {
				p.markPathNonRetryable(path)
				return nil
			}
			slog.DebugContext(ctx, "processor: write meta xattr error",
				"path", path, "key", k, "err", writeErr)
		}
		if idErr == nil {
			if upsertErr := p.idx.UpsertMeta(ctx, fileID, k, strVal, "harvester"); upsertErr != nil {
				if isNonRetryableProcessingErr(upsertErr) {
					p.markPathNonRetryable(path)
					return nil
				}
				slog.DebugContext(ctx, "processor: upsert meta index error",
					"path", path, "key", k, "err", upsertErr)
			}
		}
	}

	// Start async harvesters in the background; their results trigger a separate update.
	p.pipeline.RunAsync(ctx, input, func(name string, asyncMeta harvester.MetaMap) {
		p.handleAsyncResult(ctx, path, name, asyncMeta)
	})

	if idErr != nil {
		if isNonRetryableProcessingErr(idErr) {
			p.markPathNonRetryable(path)
			return nil
		}
		if errors.Is(idErr, sql.ErrNoRows) {
			// File not yet in index (race between watcher and syncer); skip rule eval.
			return nil
		}
		return fmt.Errorf("get file id: %w", idErr)
	}

	overrides, err := p.idx.GetTagOverrides(ctx, fileID)
	if err != nil {
		if isNonRetryableProcessingErr(err) {
			p.markPathNonRetryable(path)
			return nil
		}
		return fmt.Errorf("get tag overrides: %w", err)
	}

	diff, err := p.engine.Eval(ctx, meta, existingTags, overrides)
	if err != nil {
		return fmt.Errorf("eval rules: %w", err)
	}

	p.updateEmbedding(ctx, path, fileID, existingTags, meta)

	if len(diff.Added) == 0 {
		return nil
	}

	return p.applyDiff(ctx, path, fileID, existingTags, diff)
}

func (p *Processor) updateEmbedding(
	ctx context.Context,
	path string,
	fileID int64,
	existingTags []string,
	meta harvester.MetaMap,
) {
	if p.embedder == nil {
		return
	}

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

	vec, err := p.embedder.EmbedText(ctx, strings.Join(textParts, " "))
	if err != nil {
		slog.DebugContext(ctx, "processor: embedding generation failed", "path", path, "err", err)
		return
	}

	if err := p.idx.UpsertEmbedding(ctx, fileID, vec); err != nil {
		slog.DebugContext(ctx, "processor: embedding index upsert failed", "path", path, "err", err)
		return
	}

	p.g.SetEmbedding(path, vec)
}

// handleAsyncResult is called on a goroutine when an async harvester completes.
// It persists the new metadata and re-runs rule evaluation.
func (p *Processor) handleAsyncResult(ctx context.Context, path, harvesterName string, asyncMeta harvester.MetaMap) {
	if p.shouldSkipPath(path) {
		if !isRetryEligiblePath(path) {
			return
		}
		p.clearPathNonRetryable(path)
	}
	if ctx.Err() != nil {
		return
	}
	slog.DebugContext(ctx, "processor: async harvester complete",
		"harvester", harvesterName, "path", path)

	fileID, err := p.idx.GetFileIDByPath(ctx, path)
	if err != nil {
		if isNonRetryableProcessingErr(err) {
			p.markPathNonRetryable(path)
		}
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
		if writeErr := p.tags.WriteMeta(ctx, path, k, strVal); writeErr != nil {
			if isNonRetryableProcessingErr(writeErr) {
				p.markPathNonRetryable(path)
				return
			}
			slog.DebugContext(ctx, "processor: write async meta xattr error", "path", path, "key", k, "err", writeErr)
		}
		if upsertErr := p.idx.UpsertMeta(ctx, fileID, k, strVal, harvesterName); upsertErr != nil {
			if isNonRetryableProcessingErr(upsertErr) {
				p.markPathNonRetryable(path)
				return
			}
			slog.DebugContext(ctx, "processor: upsert async meta index error", "path", path, "key", k, "err", upsertErr)
		}
	}

	overrides, overridesErr := p.idx.GetTagOverrides(ctx, fileID)
	if overridesErr != nil {
		if isNonRetryableProcessingErr(overridesErr) {
			p.markPathNonRetryable(path)
		}
		return
	}
	diff, err := p.engine.Eval(ctx, meta, existingTags, overrides)
	if err != nil || len(diff.Added) == 0 {
		return
	}

	p.updateEmbedding(ctx, path, fileID, existingTags, meta)
	if applyErr := p.applyDiff(ctx, path, fileID, existingTags, diff); applyErr != nil {
		if isNonRetryableProcessingErr(applyErr) {
			p.markPathNonRetryable(path)
			return
		}
		slog.DebugContext(ctx, "processor: apply async diff error", "path", path, "err", applyErr)
	}
}

func (p *Processor) shouldSkipPath(path string) bool {
	p.nonRetryableMu.RLock()
	_, ok := p.nonRetryablePaths[path]
	p.nonRetryableMu.RUnlock()
	return ok
}

func (p *Processor) markPathNonRetryable(path string) {
	if path == "" {
		return
	}
	p.nonRetryableMu.Lock()
	p.nonRetryablePaths[path] = struct{}{}
	p.nonRetryableMu.Unlock()
}

func (p *Processor) clearPathNonRetryable(path string) {
	if path == "" {
		return
	}
	p.nonRetryableMu.Lock()
	delete(p.nonRetryablePaths, path)
	p.nonRetryableMu.Unlock()
}

func (p *Processor) clearAllNonRetryablePaths() {
	p.nonRetryableMu.Lock()
	clear(p.nonRetryablePaths)
	p.nonRetryableMu.Unlock()
}

func isRetryEligiblePath(path string) bool {
	if path == "" {
		return false
	}
	return unix.Access(path, unix.W_OK) == nil
}

func isNonRetryableProcessingErr(err error) bool {
	if err == nil {
		return false
	}
	if errors.Is(err, context.Canceled) || errors.Is(err, context.DeadlineExceeded) {
		return true
	}
	if errors.Is(err, os.ErrPermission) || errors.Is(err, syscall.EPERM) || errors.Is(err, syscall.EACCES) {
		return true
	}
	msg := strings.ToLower(err.Error())
	return strings.Contains(msg, "permission denied") || strings.Contains(msg, "operation not permitted")
}

// applyDiff writes new tags to xattr, updates provenance, and updates the index.
func (p *Processor) applyDiff(
	ctx context.Context,
	path string,
	fileID int64,
	existingTags []string,
	diff rules.TagDiff,
) error {
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
	maps.Copy(sourceMap, diff.Sources)
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
