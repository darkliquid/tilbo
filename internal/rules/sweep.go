package rules

import (
	"context"
	"log/slog"
	"runtime"
	"strings"

	"golang.org/x/sys/unix"

	"github.com/darkliquid/tilbo/internal/harvester"
	"github.com/darkliquid/tilbo/internal/index"
	"github.com/darkliquid/tilbo/internal/xattr"
)

// Sweeper re-evaluates the harvester pipeline and rule engine for every indexed
// file. It is triggered after rule definitions change (e.g. on SIGHUP).
// The sweep runs at low I/O priority to minimise system impact.
type Sweeper struct {
	idx      *index.DB
	tags     *xattr.Service
	pipeline *harvester.Pipeline
	engine   *Engine
}

// NewSweeper creates a Sweeper with the required dependencies.
func NewSweeper(idx *index.DB, tags *xattr.Service, pipeline *harvester.Pipeline, engine *Engine) *Sweeper {
	return &Sweeper{
		idx:      idx,
		tags:     tags,
		pipeline: pipeline,
		engine:   engine,
	}
}

// Sweep iterates all indexed files, re-runs harvesters and rules, and applies
// any new tags. Context cancellation stops the sweep early without error.
func (s *Sweeper) Sweep(ctx context.Context) error {
	runtime.LockOSThread()
	defer runtime.UnlockOSThread()
	sweepSetLowIOPrio()

	paths, err := s.idx.ListFilePaths(ctx)
	if err != nil {
		return err
	}
	slog.InfoContext(ctx, "sweep: starting", "files", len(paths))

	var processed, changed int
	for _, path := range paths {
		if ctx.Err() != nil {
			break
		}
		if c, err := s.sweepFile(ctx, path); err != nil {
			slog.DebugContext(ctx, "sweep: file error", "path", path, "err", err)
		} else if c {
			changed++
		}
		processed++
	}

	slog.InfoContext(ctx, "sweep: done", "processed", processed, "changed", changed)
	return ctx.Err()
}

// sweepFile processes a single file. Returns true if any tags were added.
func (s *Sweeper) sweepFile(ctx context.Context, path string) (bool, error) {
	existingTags, err := s.tags.ReadTags(ctx, path)
	if err != nil {
		return false, err
	}
	existingMeta, err := s.tags.ReadAllMeta(ctx, path)
	if err != nil {
		return false, err
	}

	// Convert string xattr values to typed MetaMap values.
	meta := make(harvester.MetaMap, len(existingMeta))
	for k, v := range existingMeta {
		meta[k] = harvester.ParseMetaValue(v)
	}

	mime, _ := meta["mime"].(string)
	input := harvester.Input{Path: path, MIME: mime, Existing: meta}

	additional, err := s.pipeline.Run(ctx, input)
	if err != nil {
		slog.DebugContext(ctx, "sweep: pipeline error", "path", path, "err", err)
	}

	// Merge harvester output into meta and persist new metadata to xattr + index.
	fileID, idErr := s.idx.GetFileIDByPath(ctx, path)
	for k, v := range additional {
		meta[k] = v
		if strings.HasPrefix(k, "_") {
			continue
		}
		strVal := harvester.ValueToString(v)
		if err := s.tags.WriteMeta(ctx, path, k, strVal); err != nil {
			slog.DebugContext(ctx, "sweep: write meta xattr error",
				"path", path, "key", k, "err", err)
		}
		if idErr == nil {
			if err := s.idx.UpsertMeta(ctx, fileID, k, strVal, "harvester"); err != nil {
				slog.DebugContext(ctx, "sweep: upsert meta index error",
					"path", path, "key", k, "err", err)
			}
		}
	}

	if idErr != nil {
		return false, idErr
	}

	overrides, err := s.idx.GetTagOverrides(ctx, fileID)
	if err != nil {
		return false, err
	}

	diff, err := s.engine.Eval(ctx, meta, existingTags, overrides)
	if err != nil {
		return false, err
	}
	if len(diff.Added) == 0 {
		return false, nil
	}

	newTags := make([]string, len(existingTags), len(existingTags)+len(diff.Added))
	copy(newTags, existingTags)
	newTags = append(newTags, diff.Added...)

	if err := s.tags.WriteTags(ctx, path, newTags); err != nil {
		return false, err
	}

	// Update provenance xattr.
	sourceMap, _ := s.tags.ReadSource(ctx, path)
	if sourceMap == nil {
		sourceMap = make(map[string]string)
	}
	for tag, src := range diff.Sources {
		sourceMap[tag] = src
	}
	if err := s.tags.WriteSource(ctx, path, sourceMap); err != nil {
		slog.DebugContext(ctx, "sweep: write source xattr error", "path", path, "err", err)
	}

	// Update index.
	if err := s.idx.SetFileTags(ctx, fileID, newTags); err != nil {
		return false, err
	}
	for tag, src := range diff.Sources {
		tagID, err := s.idx.UpsertTag(ctx, tag)
		if err != nil {
			continue
		}
		if err := s.idx.SetTagProvenance(ctx, fileID, tagID, src); err != nil {
			slog.DebugContext(ctx, "sweep: set provenance error",
				"path", path, "tag", tag, "err", err)
		}
	}

	slog.DebugContext(ctx, "sweep: applied tags", "path", path, "added", diff.Added)
	return true, nil
}

// sweepSetLowIOPrio sets the current thread to the lowest I/O scheduling class.
// Mirrors the implementation in internal/sync/syncer.go.
func sweepSetLowIOPrio() {
	const (
		ioPrioClassShift = 13
		ioPrioClassIdle  = 3
		ioPrioWhoProcess = 1
		sysIOPrioSet     = 251 // valid for amd64/arm64
	)
	unix.Syscall(sysIOPrioSet, uintptr(ioPrioWhoProcess), 0,
		uintptr(ioPrioClassIdle<<ioPrioClassShift))
}
