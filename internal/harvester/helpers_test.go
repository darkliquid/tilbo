package harvester

import (
	"testing"
)

func TestMatchesMIME_Exact(t *testing.T) {
	if !matchesMIME("image/jpeg", []string{"image/jpeg"}) {
		t.Error("exact match should pass")
	}
	if matchesMIME("image/png", []string{"image/jpeg"}) {
		t.Error("non-matching exact should fail")
	}
}

func TestMatchesMIME_Wildcard(t *testing.T) {
	if !matchesMIME("video/mp4", []string{"video/*"}) {
		t.Error("video/* should match video/mp4")
	}
	if !matchesMIME("video/webm", []string{"video/*"}) {
		t.Error("video/* should match video/webm")
	}
	if matchesMIME("image/jpeg", []string{"video/*"}) {
		t.Error("video/* should not match image/jpeg")
	}
}

func TestMatchesMIME_Empty(t *testing.T) {
	// Empty filter list: the function returns false (callers guard with len>0).
	if matchesMIME("image/jpeg", nil) {
		t.Error("empty filter list should return false from matchesMIME (callers short-circuit)")
	}
	if matchesMIME("image/jpeg", []string{}) {
		t.Error("empty filter slice should return false from matchesMIME")
	}
}

func TestMatchesMIME_Multiple(t *testing.T) {
	filters := []string{"image/*", "video/mp4"}
	if !matchesMIME("image/jpeg", filters) {
		t.Error("image/jpeg should match image/*")
	}
	if !matchesMIME("video/mp4", filters) {
		t.Error("video/mp4 should match exact")
	}
	if matchesMIME("video/webm", filters) {
		t.Error("video/webm should not match")
	}
}

func TestMatchesGlob_Base(t *testing.T) {
	// *.py matches the basename.
	if !matchesGlob("/home/user/script.py", []string{"*.py"}) {
		t.Error("*.py should match /home/user/script.py by basename")
	}
	if matchesGlob("/home/user/script.go", []string{"*.py"}) {
		t.Error("*.py should not match .go files")
	}
}

func TestMatchesGlob_FullPath(t *testing.T) {
	if !matchesGlob("/home/user/file.txt", []string{"/home/user/*.txt"}) {
		t.Error("full path glob should match")
	}
}

func TestMatchesGlob_Empty(t *testing.T) {
	// Empty glob list: the function returns false (callers guard with len>0).
	if matchesGlob("/any/path.txt", nil) {
		t.Error("empty glob list should return false from matchesGlob (callers short-circuit)")
	}
}

func TestValueToString_Float(t *testing.T) {
	cases := []struct {
		in   float64
		want string
	}{
		{1920, "1920"},
		{3.14, "3.14"},
		{0, "0"},
		{-1, "-1"},
		{100.5, "100.5"},
	}
	for _, c := range cases {
		got := ValueToString(c.in)
		if got != c.want {
			t.Errorf("ValueToString(%v): got %q, want %q", c.in, got, c.want)
		}
	}
}

func TestValueToString_Bool(t *testing.T) {
	if ValueToString(true) != "true" {
		t.Error("true → true")
	}
	if ValueToString(false) != "false" {
		t.Error("false → false")
	}
}

func TestValueToString_String(t *testing.T) {
	if ValueToString("hello") != "hello" {
		t.Error("string passthrough")
	}
}

func TestParseMetaValue_Types(t *testing.T) {
	cases := []struct {
		in  string
		out any
	}{
		{"true", true},
		{"false", false},
		{"42", float64(42)},
		{"-7", float64(-7)},
		{"3.14", float64(3.14)},
		{"hello world", "hello world"},
		{"", ""},
	}
	for _, c := range cases {
		got := ParseMetaValue(c.in)
		if got != c.out {
			t.Errorf("ParseMetaValue(%q): got %v (%T), want %v (%T)",
				c.in, got, got, c.out, c.out)
		}
	}
}

func TestExpandPath_Tilde(t *testing.T) {
	result := ExpandPath("~/documents")
	if result == "~/documents" {
		t.Error("~/documents should be expanded")
	}
	if len(result) == 0 {
		t.Error("expanded path should not be empty")
	}
}

func TestExpandPath_NoTilde(t *testing.T) {
	p := "/absolute/path"
	if ExpandPath(p) != p {
		t.Error("absolute path should be unchanged")
	}
}
