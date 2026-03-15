package fuse

import (
	"testing"
	"time"
)

//nolint:gocognit // table assertions intentionally enumerate parser edge cases
func TestParseExpr_Tags(t *testing.T) {
	cases := []struct {
		name       string
		wantTags   []string
		wantAny    bool
		wantExcl   []string
		wantErrStr string
	}{
		// Basic AND expressions
		{"python", []string{"python"}, false, nil, ""},
		{"python+work", []string{"python", "work"}, false, nil, ""},

		// NOT uses ! prefix; - is a literal character in tag names
		{"python+work+!draft", []string{"python", "work"}, false, []string{"draft"}, ""},
		{"low-priority", []string{"low-priority"}, false, nil, ""},
		{"low-priority+!draft", []string{"low-priority"}, false, []string{"draft"}, ""},
		{"a-b+c-d", []string{"a-b", "c-d"}, false, nil, ""},

		// OR expressions
		{"python,work", []string{"python", "work"}, true, nil, ""},
		{"low-priority,urgent", []string{"low-priority", "urgent"}, true, nil, ""},

		// Percent-encoded tag names
		{"c%2B%2B", []string{"c++"}, false, nil, ""},
		{"a%2Cb", []string{"a,b"}, false, nil, ""},
		{"c%2B%2B+work", []string{"c++", "work"}, false, nil, ""},
		{"c%2B%2B+!draft", []string{"c++"}, false, []string{"draft"}, ""},

		// Error cases
		{"!draft", nil, false, nil, "negation-only"},
		{"!draft+work", nil, false, nil, "negation-only"},
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

//nolint:gocognit // table assertions intentionally enumerate parser edge cases
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

	t.Run("@similar:%2Fhome%2Fuser%2Ffile.txt", func(t *testing.T) {
		e, err := ParseExpr("@similar:%2Fhome%2Fuser%2Ffile.txt")
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

func TestPercentEncode(t *testing.T) {
	cases := []struct{ in, want string }{
		{"normal", "normal"},
		{"low-priority", "low-priority"},
		{"c++", "c%2B%2B"},
		{"a,b", "a%2Cb"},
		{"100%", "100%25"},
		{"!draft", "%21draft"},
		{"a+b,c!d%e", "a%2Bb%2Cc%21d%25e"},
	}
	for _, tc := range cases {
		got := percentEncode(tc.in)
		if got != tc.want {
			t.Errorf("percentEncode(%q) = %q, want %q", tc.in, got, tc.want)
		}
	}
}

func TestPercentDecode(t *testing.T) {
	cases := []struct {
		in      string
		want    string
		wantErr bool
	}{
		{"normal", "normal", false},
		{"low-priority", "low-priority", false},
		{"c%2B%2B", "c++", false},
		{"a%2Cb", "a,b", false},
		{"100%25", "100%", false},
		{"%21draft", "!draft", false},
		{"a%2Bb%2Cc%21d%25e", "a+b,c!d%e", false},
		// Error cases
		{"%", "", true},
		{"%2", "", true},
		{"%ZZ", "", true},
	}
	for _, tc := range cases {
		got, err := percentDecode(tc.in)
		if tc.wantErr {
			if err == nil {
				t.Errorf("percentDecode(%q): expected error, got %q", tc.in, got)
			}
			continue
		}
		if err != nil {
			t.Errorf("percentDecode(%q): unexpected error: %v", tc.in, err)
			continue
		}
		if got != tc.want {
			t.Errorf("percentDecode(%q) = %q, want %q", tc.in, got, tc.want)
		}
	}
}

func TestPercentRoundTrip(t *testing.T) {
	tags := []string{"c++", "low-priority", "100%", "!important", "a,b", "normal", "café"}
	for _, tag := range tags {
		encoded := percentEncode(tag)
		decoded, err := percentDecode(encoded)
		if err != nil {
			t.Errorf("round-trip %q → %q: decode error: %v", tag, encoded, err)
			continue
		}
		if decoded != tag {
			t.Errorf("round-trip %q → %q → %q: mismatch", tag, encoded, decoded)
		}
	}
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
