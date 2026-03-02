package fuse

import (
	"testing"
	"time"
)

func TestParseExpr_Tags(t *testing.T) {
	cases := []struct {
		name       string
		wantTags   []string
		wantAny    bool
		wantExcl   []string
		wantErrStr string
	}{
		{"python", []string{"python"}, false, nil, ""},
		{"python+work", []string{"python", "work"}, false, nil, ""},
		{"python+work-draft", []string{"python", "work"}, false, []string{"draft"}, ""},
		{"python,work", []string{"python", "work"}, true, nil, ""},
		{"-draft", nil, false, nil, "negation-only"},
		{"", nil, false, nil, "empty"},
		{"a+b,c", nil, false, nil, "mixed"},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			e, err := ParseExpr(tc.name)
			if tc.wantErrStr != "" {
				if err == nil {
					t.Fatalf("expected error containing %q, got nil", tc.wantErrStr)
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if e.kind != exprTag {
				t.Fatalf("expected exprTag, got %d", e.kind)
			}
			if !sliceEq(e.Tags, tc.wantTags) {
				t.Errorf("Tags: got %v, want %v", e.Tags, tc.wantTags)
			}
			if e.TagsAny != tc.wantAny {
				t.Errorf("TagsAny: got %v, want %v", e.TagsAny, tc.wantAny)
			}
			if !sliceEq(e.TagExclude, tc.wantExcl) {
				t.Errorf("TagExclude: got %v, want %v", e.TagExclude, tc.wantExcl)
			}
		})
	}
}

func TestParseExpr_Special(t *testing.T) {
	t.Run("@recent", func(t *testing.T) {
		e, err := ParseExpr("@recent")
		if err != nil {
			t.Fatal(err)
		}
		if e.kind != exprRecent {
			t.Errorf("expected exprRecent")
		}
		diff := time.Since(e.Since) - 7*24*time.Hour
		if diff < 0 {
			diff = -diff
		}
		if diff > time.Second {
			t.Errorf("Since not ~7 days ago: %v", e.Since)
		}
	})

	t.Run("@recent:30d", func(t *testing.T) {
		e, err := ParseExpr("@recent:30d")
		if err != nil {
			t.Fatal(err)
		}
		diff := time.Since(e.Since) - 30*24*time.Hour
		if diff < 0 {
			diff = -diff
		}
		if diff > time.Second {
			t.Errorf("Since not ~30 days ago: %v", e.Since)
		}
	})

	t.Run("@untagged", func(t *testing.T) {
		e, err := ParseExpr("@untagged")
		if err != nil {
			t.Fatal(err)
		}
		if e.kind != exprUntagged {
			t.Errorf("expected exprUntagged")
		}
	})

	t.Run("@search:foo bar", func(t *testing.T) {
		e, err := ParseExpr("@search:foo bar")
		if err != nil {
			t.Fatal(err)
		}
		if e.kind != exprSearch || e.FTSQuery != "foo bar" {
			t.Errorf("unexpected: %+v", e)
		}
	})

	t.Run("@similar:/home/user/file.txt", func(t *testing.T) {
		e, err := ParseExpr("@similar:/home/user/file.txt")
		if err != nil {
			t.Fatal(err)
		}
		if e.kind != exprSimilar || e.SeedPath != "/home/user/file.txt" {
			t.Errorf("unexpected: %+v", e)
		}
	})

	t.Run("@meta:iso:gte:1600", func(t *testing.T) {
		e, err := ParseExpr("@meta:iso:gte:1600")
		if err != nil {
			t.Fatal(err)
		}
		if e.kind != exprMeta || e.MetaKey != "iso" || e.MetaOp != "gte" || e.MetaVal != "1600" {
			t.Errorf("unexpected: %+v", e)
		}
	})

	t.Run("@unknown", func(t *testing.T) {
		_, err := ParseExpr("@unknown")
		if err == nil {
			t.Error("expected error")
		}
	})
}

func sliceEq(a, b []string) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}
