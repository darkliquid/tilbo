package harvester

import (
	"context"
	"testing"
)

// mockHarvester is a test double for Harvester.
type mockHarvester struct {
	name     string
	priority int
	async    bool
	mime     string // required MIME prefix; empty matches all
	output   MetaMap
	err      error
}

func (m *mockHarvester) Name() string  { return m.name }
func (m *mockHarvester) Priority() int { return m.priority }
func (m *mockHarvester) Async() bool   { return m.async }
func (m *mockHarvester) Matches(_, mime string) bool {
	if m.mime == "" {
		return true
	}
	return mime == m.mime
}
func (m *mockHarvester) Run(_ context.Context, _ Input) (MetaMap, error) {
	return m.output, m.err
}

func TestPipeline_EmptyReturnsEmptyMap(t *testing.T) {
	p := NewPipeline()
	meta, err := p.Run(context.Background(), Input{Path: "/tmp/x"})
	if err != nil {
		t.Fatal(err)
	}
	if len(meta) != 0 {
		t.Fatalf("expected empty map, got %v", meta)
	}
}

func TestPipeline_SingleHarvesterOutput(t *testing.T) {
	p := NewPipeline()
	p.Register(&mockHarvester{
		name:   "a",
		output: MetaMap{"mime": "image/jpeg", "width": float64(1920)},
	})

	meta, err := p.Run(context.Background(), Input{Path: "/tmp/photo.jpg", MIME: "image/jpeg"})
	if err != nil {
		t.Fatal(err)
	}
	if meta["mime"] != "image/jpeg" {
		t.Errorf("mime: got %v", meta["mime"])
	}
	if meta["width"] != float64(1920) {
		t.Errorf("width: got %v", meta["width"])
	}
}

func TestPipeline_PriorityMerge_HigherWins(t *testing.T) {
	p := NewPipeline()
	// Low priority sets codec = "h264".
	p.Register(&mockHarvester{
		name:     "low",
		priority: 10,
		output:   MetaMap{"codec": "h264", "source": "low"},
	})
	// High priority sets codec = "h265" (should win).
	p.Register(&mockHarvester{
		name:     "high",
		priority: 50,
		output:   MetaMap{"codec": "h265", "source": "high"},
	})

	meta, err := p.Run(context.Background(), Input{Path: "/tmp/video.mkv"})
	if err != nil {
		t.Fatal(err)
	}
	if meta["codec"] != "h265" {
		t.Errorf("expected high-priority codec h265, got %v", meta["codec"])
	}
}

func TestPipeline_NonMatchingHarvesterSkipped(t *testing.T) {
	p := NewPipeline()
	p.Register(&mockHarvester{
		name:   "video-only",
		mime:   "video/mp4",
		output: MetaMap{"duration": float64(100)},
	})

	meta, err := p.Run(context.Background(), Input{Path: "/tmp/photo.jpg", MIME: "image/jpeg"})
	if err != nil {
		t.Fatal(err)
	}
	if _, ok := meta["duration"]; ok {
		t.Error("expected video-only harvester to be skipped for image/jpeg")
	}
}

func TestPipeline_AsyncHarvesterSkippedInRun(t *testing.T) {
	p := NewPipeline()
	p.Register(&mockHarvester{
		name:   "async",
		async:  true,
		output: MetaMap{"extra": "value"},
	})

	meta, err := p.Run(context.Background(), Input{Path: "/tmp/x"})
	if err != nil {
		t.Fatal(err)
	}
	if _, ok := meta["extra"]; ok {
		t.Error("async harvester output should not appear in Run()")
	}
}

func TestPipeline_RunAsync_CallsCallback(t *testing.T) {
	p := NewPipeline()
	p.Register(&mockHarvester{
		name:   "async",
		async:  true,
		output: MetaMap{"extra": "value"},
	})

	done := make(chan MetaMap, 1)
	p.RunAsync(context.Background(), Input{Path: "/tmp/x"}, func(_ string, meta MetaMap) {
		done <- meta
	})

	got := <-done
	if got["extra"] != "value" {
		t.Errorf("async callback: expected extra=value, got %v", got)
	}
}
