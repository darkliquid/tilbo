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

	// nonRetryablePaths tracks files that caused permission or context errors.
	// These paths are skipped on subsequent events to avoid repeated failures.
	// The set is cleared when rules are reloaded (SIGHUP).
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
		idx:               idx,
		tags:              tags,
		pipeline:          pipeline,
		engine:            engine,
		g:                 g,
		embedder:          embedder,
		nonRetryablePaths: make(map[string]struct{}),
	}
}

// ProcessFile runs the full M2 pipeline for path. Any error is logged rather
// than returned because a pipeline failure should not stop the daemon.
func (p *Processor) ProcessFile(ctx context.Context, path string) {
	if !p.preparePath(ctx, path) {
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

func (p *Processor) preparePath(ctx context.Context, path string) bool {
	if p.shouldSkipPath(path) {
		if !isRetryEligiblePath(path) {
			return false
		}
		p.clearPathNonRetryable(path)
	}
	return ctx.Err() == nil
}

// readProcessingState reads the current tags and metadata from xattrs for the
// given path. This is the synchronous variant used in the main pipeline where
// errors must be propagated.
func (p *Processor) readProcessingState(ctx context.Context, path string) ([]string, harvester.MetaMap, error) {
	existingTags, err := p.tags.ReadTags(ctx, path)
	if err != nil {
		return nil, nil, fmt.Errorf("read tags: %w", err)
	}
	existingMeta, err := p.tags.ReadAllMeta(ctx, path)
	if err != nil {
		return nil, nil, fmt.Errorf("read meta: %w", err)
	}
	return existingTags, parseStoredMeta(existingMeta), nil
}

// readAsyncState is the best-effort variant of readProcessingState used by
// async harvester callbacks. Errors are silently ignored because the async
// path should not fail the pipeline.
func (p *Processor) readAsyncState(ctx context.Context, path string) ([]string, harvester.MetaMap) {
	existingTags, _ := p.tags.ReadTags(ctx, path)
	existingMeta, _ := p.tags.ReadAllMeta(ctx, path)
	return existingTags, parseStoredMeta(existingMeta)
}

func parseStoredMeta(existingMeta map[string]string) harvester.MetaMap {
	meta := make(harvester.MetaMap, len(existingMeta))
	for k, v := range existingMeta {
		meta[k] = harvester.ParseMetaValue(v)
	}
	return meta
}

// runPipelinePhase executes the harvester pipeline for the given input and
// returns the extracted metadata. The stop return value is true if a
// non-retryable error occurred and the caller should abort processing.
func (p *Processor) runPipelinePhase(
	ctx context.Context,
	path string,
	input harvester.Input,
	logMsg string,
) (harvester.MetaMap, bool) {
	additional, err := p.pipeline.Run(ctx, input)
	if additional == nil {
		additional = make(harvester.MetaMap)
	}
	if err == nil {
		return additional, false
	}
	if isNonRetryableProcessingErr(err) {
		return nil, true
	}
	slog.DebugContext(ctx, logMsg, "path", path, "err", err)
	return additional, false
}

// maybeRunSecondPipelinePhase re-runs the pipeline if MIME was just discovered
// in phase 1. On the very first processing of a file, the MIME type is unknown,
// so only unconditional harvesters (stat, mime) run. Once MIME is known, this
// second pass lets MIME-dependent harvesters (EXIF, ffprobe, media, etc.)
// execute without waiting for another filesystem event.
func (p *Processor) maybeRunSecondPipelinePhase(
	ctx context.Context,
	path string,
	input *harvester.Input,
	meta harvester.MetaMap,
	additional harvester.MetaMap,
) bool {
	newMIME, _ := additional["mime"].(string)
	if input.MIME != "" || newMIME == "" {
		return false
	}

	maps.Copy(meta, additional)
	input.MIME = newMIME
	input.Existing = meta

	phase2, stop := p.runPipelinePhase(ctx, path, *input, "processor: pipeline phase2 error")
	if stop {
		return true
	}
	maps.Copy(additional, phase2)
	return false
}

// mergeAndPersistMeta writes updated metadata values to both xattrs and the
// index. Keys beginning with "_" are internal-only and skipped for xattr
// persistence. The base map is mutated in place to reflect the merged state.
func (p *Processor) mergeAndPersistMeta(
	ctx context.Context,
	path string,
	fileID int64,
	persistToIndex bool,
	source string,
	base harvester.MetaMap,
	updates harvester.MetaMap,
	xattrLogMsg string,
	indexLogMsg string,
) error {
	for k, v := range updates {
		base[k] = v
		if strings.HasPrefix(k, "_") {
			continue
		}
		strVal := harvester.ValueToString(v)
		if err := p.persistMetaValue(
			ctx,
			path,
			fileID,
			persistToIndex,
			source,
			k,
			strVal,
			xattrLogMsg,
			indexLogMsg,
		); err != nil {
			return err
		}
	}
	return nil
}

func (p *Processor) persistMetaValue(
	ctx context.Context,
	path string,
	fileID int64,
	persistToIndex bool,
	source string,
	key string,
	value string,
	xattrLogMsg string,
	indexLogMsg string,
) error {
	if err := p.tags.WriteMeta(ctx, path, key, value); err != nil {
		if isNonRetryableProcessingErr(err) {
			return err
		}
		slog.DebugContext(ctx, xattrLogMsg, "path", path, "key", key, "err", err)
	}
	if !persistToIndex {
		return nil
	}
	if err := p.idx.UpsertMeta(ctx, fileID, key, value, source); err != nil {
		if isNonRetryableProcessingErr(err) {
			return err
		}
		slog.DebugContext(ctx, indexLogMsg, "path", path, "key", key, "err", err)
	}
	return nil
}

func (p *Processor) consumeNonRetryablePathErr(path string, err error) bool {
	if !isNonRetryableProcessingErr(err) {
		return false
	}
	p.markPathNonRetryable(path)
	return true
}

func (p *Processor) processFile(ctx context.Context, path string) error {
	existingTags, meta, err := p.readProcessingState(ctx, path)
	if err != nil {
		return err
	}

	mime, _ := meta["mime"].(string)
	input := harvester.Input{Path: path, MIME: mime, Existing: meta}

	// Phase 1: Run synchronous harvesters. On first-ever processing, MIME is
	// unknown so only unconditional harvesters (stat, mime) will run.
	additional, stop := p.runPipelinePhase(ctx, path, input, "processor: pipeline error")
	if stop {
		return nil
	}

	// Phase 2: If MIME was just discovered this run, re-run with the new MIME
	// so that MIME-dependent harvesters (EXIF, ffprobe, media, …) get a chance
	// to execute without waiting for a second file-change event.
	if p.maybeRunSecondPipelinePhase(ctx, path, &input, meta, additional) {
		return nil
	}

	// Persist new metadata and merge into working map.
	fileID, idErr := p.idx.GetFileIDByPath(ctx, path)
	if err := p.mergeAndPersistMeta(
		ctx,
		path,
		fileID,
		idErr == nil,
		"harvester",
		meta,
		additional,
		"processor: write meta xattr error",
		"processor: upsert meta index error",
	); err != nil {
		if p.consumeNonRetryablePathErr(path, err) {
			return nil
		}
		return err
	}

	// Start async harvesters in the background; their results trigger a separate update.
	p.pipeline.RunAsync(ctx, input, func(name string, asyncMeta harvester.MetaMap) {
		p.handleAsyncResult(ctx, path, name, asyncMeta)
	})

	if idErr != nil {
		if p.consumeNonRetryablePathErr(path, idErr) {
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
		if p.consumeNonRetryablePathErr(path, err) {
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

// updateEmbedding generates a vector embedding for the file by concatenating
// its path, tags, and key textual metadata fields (description, title, text).
// The embedding is stored in the index and the in-memory graph for similarity
// queries. Silently returns if the embedder is disabled.
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
	if !p.preparePath(ctx, path) {
		return
	}
	slog.DebugContext(ctx, "processor: async harvester complete",
		"harvester", harvesterName, "path", path)

	fileID, err := p.idx.GetFileIDByPath(ctx, path)
	if err != nil {
		p.consumeNonRetryablePathErr(path, err)
		return
	}

	existingTags, meta := p.readAsyncState(ctx, path)
	if err := p.mergeAndPersistMeta(
		ctx,
		path,
		fileID,
		true,
		harvesterName,
		meta,
		asyncMeta,
		"processor: write async meta xattr error",
		"processor: upsert async meta index error",
	); err != nil {
		p.consumeNonRetryablePathErr(path, err)
		return
	}

	overrides, err := p.idx.GetTagOverrides(ctx, fileID)
	if err != nil {
		p.consumeNonRetryablePathErr(path, err)
		return
	}
	diff, err := p.engine.Eval(ctx, meta, existingTags, overrides)
	if err != nil || len(diff.Added) == 0 {
		return
	}

	p.updateEmbedding(ctx, path, fileID, existingTags, meta)
	if applyErr := p.applyDiff(ctx, path, fileID, existingTags, diff); applyErr != nil {
		if p.consumeNonRetryablePathErr(path, applyErr) {
			return
		}
		slog.DebugContext(ctx, "processor: apply async diff error", "path", path, "err", applyErr)
	}
}

// shouldSkipPath checks if the path has been marked as non-retryable due to
// prior permission or context errors.
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

// isRetryEligiblePath checks if a previously non-retryable path has become
// writable again (e.g. permissions were fixed). If so, the path can be
// removed from the non-retryable set and re-processed.
func isRetryEligiblePath(path string) bool {
	if path == "" {
		return false
	}
	return unix.Access(path, unix.W_OK) == nil
}

// isNonRetryableProcessingErr returns true for errors that will not resolve
// on retry: context cancellation, deadline exceeded, or permission denied.
// These paths are added to the non-retryable set to avoid repeated failures.
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
