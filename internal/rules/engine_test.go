package rules

import (
	"context"
	"testing"

	"github.com/darkliquid/tilbo/internal/harvester"
)

func TestEngine_EmptyReturnsEmptyDiff(t *testing.T) {
	e := NewEngine()
	diff, err := e.Eval(context.Background(), harvester.MetaMap{}, nil, nil)
	if err != nil {
		t.Fatal(err)
	}
	if len(diff.Added) != 0 {
		t.Fatalf("expected no added tags, got %v", diff.Added)
	}
}

func TestEngine_TOMLRule_GlobMatchFires(t *testing.T) {
	e := NewEngine()
	e.Register(&TOMLRule{
		name:  "video-rule",
		tags:  []string{"video"},
		match: map[string]matchCond{"mime": {glob: "video/*"}},
	})

	diff, err := e.Eval(context.Background(),
		harvester.MetaMap{"mime": "video/mp4"}, nil, nil)
	if err != nil {
		t.Fatal(err)
	}
	if len(diff.Added) != 1 || diff.Added[0] != "video" {
		t.Fatalf("expected [video], got %v", diff.Added)
	}
	if diff.Sources["video"] != "rule:video-rule" {
		t.Errorf("provenance: got %q", diff.Sources["video"])
	}
}

func TestEngine_TOMLRule_NoMatchDoesNotFire(t *testing.T) {
	e := NewEngine()
	e.Register(&TOMLRule{
		name:  "video-rule",
		tags:  []string{"video"},
		match: map[string]matchCond{"mime": {glob: "video/*"}},
	})

	diff, err := e.Eval(context.Background(),
		harvester.MetaMap{"mime": "image/jpeg"}, nil, nil)
	if err != nil {
		t.Fatal(err)
	}
	if len(diff.Added) != 0 {
		t.Fatalf("expected no tags, got %v", diff.Added)
	}
}

func TestEngine_ExistingTagExcludedFromDiff(t *testing.T) {
	e := NewEngine()
	e.Register(&TOMLRule{
		name:  "video-rule",
		tags:  []string{"video"},
		match: map[string]matchCond{"mime": {glob: "video/*"}},
	})

	diff, err := e.Eval(context.Background(),
		harvester.MetaMap{"mime": "video/mp4"},
		[]string{"video"}, // already tagged
		nil,
	)
	if err != nil {
		t.Fatal(err)
	}
	if len(diff.Added) != 0 {
		t.Fatalf("expected no new tags (already tagged), got %v", diff.Added)
	}
}

func TestEngine_Override_SuppressesRule(t *testing.T) {
	e := NewEngine()
	e.Register(&TOMLRule{
		name:  "video-rule",
		tags:  []string{"video"},
		match: map[string]matchCond{"mime": {glob: "video/*"}},
	})

	overrides := map[string][]string{
		"video": {"video-rule"}, // suppress "video" from "video-rule"
	}
	diff, err := e.Eval(context.Background(),
		harvester.MetaMap{"mime": "video/mp4"}, nil, overrides)
	if err != nil {
		t.Fatal(err)
	}
	if len(diff.Added) != 0 {
		t.Fatalf("expected suppressed tag not added, got %v", diff.Added)
	}
}

func TestEngine_HigherPriorityRuleAttributedAsSource(t *testing.T) {
	e := NewEngine()
	// Both rules add "HD"; higher priority rule (hd-50) should be the source.
	e.Register(&TOMLRule{
		name:     "hd-10",
		priority: 10,
		tags:     []string{"HD"},
		match:    map[string]matchCond{"mime": {glob: "video/*"}},
	})
	e.Register(&TOMLRule{
		name:     "hd-50",
		priority: 50,
		tags:     []string{"HD"},
		match:    map[string]matchCond{"mime": {glob: "video/*"}},
	})

	diff, err := e.Eval(context.Background(),
		harvester.MetaMap{"mime": "video/mp4"}, nil, nil)
	if err != nil {
		t.Fatal(err)
	}
	if len(diff.Added) != 1 || diff.Added[0] != "HD" {
		t.Fatalf("expected [HD], got %v", diff.Added)
	}
	if diff.Sources["HD"] != "rule:hd-50" {
		t.Errorf("expected source rule:hd-50, got %q", diff.Sources["HD"])
	}
}

func TestEngine_NumericCondition_GTE(t *testing.T) {
	e := NewEngine()
	gte := float64(1280)
	e.Register(&TOMLRule{
		name:  "hd-rule",
		tags:  []string{"HD"},
		match: map[string]matchCond{"width": {gte: &gte}},
	})

	// Should fire for width=1920.
	diff, err := e.Eval(context.Background(),
		harvester.MetaMap{"width": float64(1920)}, nil, nil)
	if err != nil {
		t.Fatal(err)
	}
	if len(diff.Added) == 0 {
		t.Fatal("expected HD tag for width=1920")
	}

	// Should not fire for width=720.
	diff2, _ := e.Eval(context.Background(),
		harvester.MetaMap{"width": float64(720)}, nil, nil)
	if len(diff2.Added) != 0 {
		t.Fatalf("expected no HD tag for width=720, got %v", diff2.Added)
	}
}

func TestEngine_LuaRule(t *testing.T) {
	e := NewEngine()
	e.Register(newLuaRule("lua-video", 0, `
function apply(meta)
  if not meta.mime or not meta.mime:match("^video/") then
    return {}
  end
  return {"video"}
end
`))

	diff, err := e.Eval(context.Background(),
		harvester.MetaMap{"mime": "video/mp4"}, nil, nil)
	if err != nil {
		t.Fatal(err)
	}
	if len(diff.Added) != 1 || diff.Added[0] != "video" {
		t.Fatalf("expected [video] from lua rule, got %v", diff.Added)
	}
}

func TestMatchCond_InOperator(t *testing.T) {
	cond := matchCond{in: []any{"image/x-canon-cr2", "image/x-nikon-nef"}}
	if !evalCond(cond, "image/x-canon-cr2") {
		t.Error("expected in-match for image/x-canon-cr2")
	}
	if evalCond(cond, "image/jpeg") {
		t.Error("expected no match for image/jpeg")
	}
}

func TestMatchCond_NotOperator(t *testing.T) {
	inner := matchCond{glob: "video/*"}
	cond := matchCond{not: &inner}
	if !evalCond(cond, "image/jpeg") {
		t.Error("not(video/*) should match image/jpeg")
	}
	if evalCond(cond, "video/mp4") {
		t.Error("not(video/*) should not match video/mp4")
	}
}

func TestMatchCond_BetweenOperator(t *testing.T) {
	cond := matchCond{between: [2]float64{1.0, 3.0}, hasBetween: true}
	if !evalCond(cond, float64(2)) {
		t.Error("2 should be between 1 and 3")
	}
	if evalCond(cond, float64(4)) {
		t.Error("4 should not be between 1 and 3")
	}
}

func TestParseMetaValue(t *testing.T) {
	cases := []struct {
		in  string
		out any
	}{
		{"true", true},
		{"false", false},
		{"42", float64(42)},
		{"3.14", float64(3.14)},
		{"hello", "hello"},
	}
	for _, c := range cases {
		got := harvester.ParseMetaValue(c.in)
		if got != c.out {
			t.Errorf("ParseMetaValue(%q): got %v (%T), want %v (%T)",
				c.in, got, got, c.out, c.out)
		}
	}
}
