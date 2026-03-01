package harvester

import (
	"context"
	"log/slog"
	"sort"
	"sync"
)

// Pipeline executes registered harvesters concurrently for a given file and merges
// their outputs into a single MetaMap. Higher-priority harvesters win on key conflicts.
type Pipeline struct {
	mu         sync.RWMutex
	harvesters []Harvester // sorted by priority ascending
}

// NewPipeline creates an empty Pipeline.
func NewPipeline() *Pipeline {
	return &Pipeline{}
}

// Register adds a harvester to the pipeline, maintaining ascending priority order.
func (p *Pipeline) Register(h Harvester) {
	p.mu.Lock()
	defer p.mu.Unlock()
	p.harvesters = append(p.harvesters, h)
	sort.Slice(p.harvesters, func(i, j int) bool {
		return p.harvesters[i].Priority() < p.harvesters[j].Priority()
	})
}

// Run executes all synchronous harvesters that match the input concurrently.
// Results are merged in priority order: higher-priority values overwrite lower ones
// on key conflicts. Async harvesters are skipped; use RunAsync for those.
func (p *Pipeline) Run(ctx context.Context, input Input) (MetaMap, error) {
	p.mu.RLock()
	hs := make([]Harvester, 0, len(p.harvesters))
	for _, h := range p.harvesters {
		if !h.Async() && h.Matches(input.Path, input.MIME) {
			hs = append(hs, h)
		}
	}
	p.mu.RUnlock()
	return runAndMerge(ctx, hs, input)
}

// RunAsync starts all async harvesters that match the input. onResult is called
// once per completing harvester with its name and output. RunAsync returns
// immediately; callbacks arrive asynchronously on separate goroutines.
func (p *Pipeline) RunAsync(ctx context.Context, input Input, onResult func(name string, meta MetaMap)) {
	p.mu.RLock()
	hs := make([]Harvester, 0, len(p.harvesters))
	for _, h := range p.harvesters {
		if h.Async() && h.Matches(input.Path, input.MIME) {
			hs = append(hs, h)
		}
	}
	p.mu.RUnlock()

	for _, h := range hs {
		h := h
		go func() {
			meta, err := h.Run(ctx, input)
			if err != nil {
				slog.WarnContext(ctx, "async harvester error",
					"harvester", h.Name(), "path", input.Path, "err", err)
				return
			}
			if len(meta) > 0 && onResult != nil {
				onResult(h.Name(), meta)
			}
		}()
	}
}

// runAndMerge runs all harvesters in hs concurrently and merges their outputs.
// Results are applied in ascending priority order so higher-priority values win.
func runAndMerge(ctx context.Context, hs []Harvester, input Input) (MetaMap, error) {
	if len(hs) == 0 {
		return MetaMap{}, nil
	}

	type result struct {
		priority int
		meta     MetaMap
	}
	ch := make(chan result, len(hs))

	for _, h := range hs {
		h := h
		go func() {
			meta, err := h.Run(ctx, input)
			if err != nil {
				slog.WarnContext(ctx, "harvester error",
					"harvester", h.Name(), "path", input.Path, "err", err)
			}
			ch <- result{priority: h.Priority(), meta: meta}
		}()
	}

	results := make([]result, 0, len(hs))
	for range hs {
		results = append(results, <-ch)
	}

	// Sort ascending so higher-priority harvester results overwrite lower ones.
	sort.Slice(results, func(i, j int) bool {
		return results[i].priority < results[j].priority
	})

	merged := make(MetaMap, 32)
	for _, r := range results {
		for k, v := range r.meta {
			merged[k] = v
		}
	}
	return merged, nil
}
