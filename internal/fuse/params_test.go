package fuse

import (
	"testing"
	"time"
)

func TestToSearchParams_TagAnd(t *testing.T) {
	e, err := ParseExpr("python+work")
	if err != nil {
		t.Fatalf("ParseExpr: %v", err)
	}
	p, err := e.ToSearchParams(100)
	if err != nil {
		t.Fatalf("ToSearchParams: %v", err)
	}
	if !sliceEq(p.Tags, []string{"python", "work"}) {
		t.Errorf("Tags: %v", p.Tags)
	}
	if p.TagsAny {
		t.Error("TagsAny should be false for AND expression")
	}
	if p.Limit != 100 {
		t.Errorf("Limit: got %d, want 100", p.Limit)
	}
}

func TestToSearchParams_TagOr(t *testing.T) {
	e, err := ParseExpr("python,work")
	if err != nil {
		t.Fatalf("ParseExpr: %v", err)
	}
	p, err := e.ToSearchParams(50)
	if err != nil {
		t.Fatalf("ToSearchParams: %v", err)
	}
	if !p.TagsAny {
		t.Error("TagsAny should be true for OR expression")
	}
	if !sliceEq(p.Tags, []string{"python", "work"}) {
		t.Errorf("Tags: %v", p.Tags)
	}
}

func TestToSearchParams_TagExclude(t *testing.T) {
	e, err := ParseExpr("work+!archived")
	if err != nil {
		t.Fatalf("ParseExpr: %v", err)
	}
	p, err := e.ToSearchParams(50)
	if err != nil {
		t.Fatalf("ToSearchParams: %v", err)
	}
	if !sliceEq(p.Tags, []string{"work"}) {
		t.Errorf("Tags: %v", p.Tags)
	}
	if !sliceEq(p.TagExclude, []string{"archived"}) {
		t.Errorf("TagExclude: %v", p.TagExclude)
	}
}

func TestToSearchParams_Recent(t *testing.T) {
	e, err := ParseExpr("@recent")
	if err != nil {
		t.Fatalf("ParseExpr: %v", err)
	}
	p, err := e.ToSearchParams(0)
	if err != nil {
		t.Fatalf("ToSearchParams: %v", err)
	}
	// MtimeSince should be approximately 7 days ago.
	sevenDaysAgo := time.Now().AddDate(0, 0, -7).Unix()
	diff := p.MtimeSince - sevenDaysAgo
	if diff < -2 || diff > 2 {
		t.Errorf("MtimeSince off by %d seconds", diff)
	}
	if len(p.Tags) != 0 {
		t.Errorf("expected no tags for @recent, got %v", p.Tags)
	}
}

func TestToSearchParams_Recent_Custom(t *testing.T) {
	e, err := ParseExpr("@recent:14d")
	if err != nil {
		t.Fatalf("ParseExpr: %v", err)
	}
	p, err := e.ToSearchParams(0)
	if err != nil {
		t.Fatalf("ToSearchParams: %v", err)
	}
	fourteenDaysAgo := time.Now().AddDate(0, 0, -14).Unix()
	diff := p.MtimeSince - fourteenDaysAgo
	if diff < -2 || diff > 2 {
		t.Errorf("MtimeSince off by %d seconds for 14d", diff)
	}
}

func TestToSearchParams_FTSSearch(t *testing.T) {
	e, err := ParseExpr("@search:hello world")
	if err != nil {
		t.Fatalf("ParseExpr: %v", err)
	}
	p, err := e.ToSearchParams(50)
	if err != nil {
		t.Fatalf("ToSearchParams: %v", err)
	}
	if p.FTSQuery != "hello world" {
		t.Errorf("FTSQuery: got %q, want %q", p.FTSQuery, "hello world")
	}
	if len(p.Tags) != 0 {
		t.Errorf("Tags should be empty for @search")
	}
}

func TestToSearchParams_Untagged(t *testing.T) {
	e, err := ParseExpr("@untagged")
	if err != nil {
		t.Fatalf("ParseExpr: %v", err)
	}
	p, err := e.ToSearchParams(50)
	if err != nil {
		t.Fatalf("ToSearchParams: %v", err)
	}
	if !p.Untagged {
		t.Error("Untagged should be true")
	}
	if len(p.Tags) != 0 {
		t.Errorf("Tags should be empty")
	}
}

func TestToSearchParams_Meta_Eq(t *testing.T) {
	e, err := ParseExpr("@meta:author:alice")
	if err != nil {
		t.Fatalf("ParseExpr: %v", err)
	}
	p, err := e.ToSearchParams(50)
	if err != nil {
		t.Fatalf("ToSearchParams: %v", err)
	}
	got, ok := p.MetaFilters["author"]
	if !ok {
		t.Fatalf("MetaFilters missing 'author' key: %v", p.MetaFilters)
	}
	if got != "eq:alice" {
		t.Errorf("MetaFilters[author]: got %q, want eq:alice", got)
	}
}

func TestToSearchParams_Meta_GTE(t *testing.T) {
	e, err := ParseExpr("@meta:iso:gte:1600")
	if err != nil {
		t.Fatalf("ParseExpr: %v", err)
	}
	p, err := e.ToSearchParams(50)
	if err != nil {
		t.Fatalf("ToSearchParams: %v", err)
	}
	got := p.MetaFilters["iso"]
	if got != "gte:1600" {
		t.Errorf("MetaFilters[iso]: got %q, want gte:1600", got)
	}
}

func TestToSearchParams_Similar_ReturnsEmpty(t *testing.T) {
	e, err := ParseExpr("@similar:/home/user/photo.jpg")
	if err != nil {
		t.Fatalf("ParseExpr: %v", err)
	}
	if !e.IsSimilar() {
		t.Error("IsSimilar() should be true")
	}
	p, err := e.ToSearchParams(50)
	if err != nil {
		t.Fatalf("ToSearchParams: %v", err)
	}
	// Similar returns empty sentinel params.
	if len(p.Tags) != 0 || p.FTSQuery != "" || p.Limit != 0 {
		t.Errorf("expected zero SearchParams for @similar, got %+v", p)
	}
}

func TestToSearchParams_DefaultLimit(t *testing.T) {
	e, err := ParseExpr("work")
	if err != nil {
		t.Fatalf("ParseExpr: %v", err)
	}
	p, err := e.ToSearchParams(0) // 0 → default
	if err != nil {
		t.Fatalf("ToSearchParams: %v", err)
	}
	if p.Limit != 10_000 {
		t.Errorf("default limit: got %d, want 10000", p.Limit)
	}
}

func TestToSearchParams_SortByMtimeDesc(t *testing.T) {
	e, err := ParseExpr("work")
	if err != nil {
		t.Fatalf("ParseExpr: %v", err)
	}
	p, err := e.ToSearchParams(50)
	if err != nil {
		t.Fatalf("ToSearchParams: %v", err)
	}
	if len(p.SortBy) != 1 || p.SortBy[0] != "mtime:desc" {
		t.Errorf("SortBy: got %v, want [mtime:desc]", p.SortBy)
	}
}
