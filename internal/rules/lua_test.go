package rules

import (
	"context"
	"strings"
	"testing"

	"github.com/darkliquid/tilbo/internal/harvester"
)

func TestLuaRule_SyntaxError(t *testing.T) {
	r := newLuaRule("bad-syntax", 0, `this is not lua !!!`)
	_, err := r.Eval(context.Background(), harvester.MetaMap{})
	if err == nil {
		t.Error("expected error for syntax-invalid Lua script, got nil")
	}
}

func TestLuaRule_MissingApplyFunction(t *testing.T) {
	r := newLuaRule("no-apply", 0, `local x = 1`)
	_, err := r.Eval(context.Background(), harvester.MetaMap{})
	if err == nil {
		t.Error("expected error when apply() is not defined")
	}
	if !strings.Contains(err.Error(), "missing function apply") {
		t.Errorf("expected 'missing function apply' in error, got: %v", err)
	}
}

func TestLuaRule_WrongReturnType(t *testing.T) {
	r := newLuaRule("wrong-return", 0, `
function apply(meta)
  return "should-be-a-table"
end
`)
	_, err := r.Eval(context.Background(), harvester.MetaMap{})
	if err == nil {
		t.Error("expected error when apply() returns non-table")
	}
}

func TestLuaRule_RuntimeError(t *testing.T) {
	r := newLuaRule("runtime-err", 0, `
function apply(meta)
  error("deliberate runtime error")
end
`)
	_, err := r.Eval(context.Background(), harvester.MetaMap{})
	if err == nil {
		t.Error("expected error for runtime error in apply()")
	}
}

func TestLuaRule_EmptyReturn(t *testing.T) {
	r := newLuaRule("empty-return", 0, `
function apply(meta)
  return {}
end
`)
	tags, err := r.Eval(context.Background(), harvester.MetaMap{})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(tags) != 0 {
		t.Errorf("expected empty tags, got %v", tags)
	}
}

func TestLuaRule_StringMetaAccess(t *testing.T) {
	r := newLuaRule("string-meta", 0, `
function apply(meta)
  if meta.author == "alice" then
    return {"known-author"}
  end
  return {}
end
`)
	tags, err := r.Eval(context.Background(), harvester.MetaMap{"author": "alice"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(tags) != 1 || tags[0] != "known-author" {
		t.Errorf("expected [known-author], got %v", tags)
	}
}

func TestLuaRule_NumericMetaAccess(t *testing.T) {
	r := newLuaRule("numeric-meta", 0, `
function apply(meta)
  if meta.width and meta.width >= 1920 then
    return {"4k"}
  end
  return {}
end
`)
	tags, err := r.Eval(context.Background(), harvester.MetaMap{"width": float64(3840)})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(tags) != 1 || tags[0] != "4k" {
		t.Errorf("expected [4k], got %v", tags)
	}

	// Should not fire for small width.
	tags2, _ := r.Eval(context.Background(), harvester.MetaMap{"width": float64(720)})
	if len(tags2) != 0 {
		t.Errorf("expected no tags for width=720, got %v", tags2)
	}
}

func TestLuaRule_BoolMetaAccess(t *testing.T) {
	r := newLuaRule("bool-meta", 0, `
function apply(meta)
  if meta.draft == true then
    return {"wip"}
  end
  return {}
end
`)
	tags, err := r.Eval(context.Background(), harvester.MetaMap{"draft": true})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(tags) != 1 || tags[0] != "wip" {
		t.Errorf("expected [wip], got %v", tags)
	}
}

func TestLuaRule_Sandboxed_NoIO(t *testing.T) {
	r := newLuaRule("sandbox-io", 0, `
function apply(meta)
  if io ~= nil then
    return {"io-accessible"}
  end
  return {}
end
`)
	tags, err := r.Eval(context.Background(), harvester.MetaMap{})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(tags) != 0 {
		t.Errorf("io should not be accessible in sandbox, got tags: %v", tags)
	}
}

func TestLuaRule_Sandboxed_NoOS(t *testing.T) {
	r := newLuaRule("sandbox-os", 0, `
function apply(meta)
  if os ~= nil then
    return {"os-accessible"}
  end
  return {}
end
`)
	tags, err := r.Eval(context.Background(), harvester.MetaMap{})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(tags) != 0 {
		t.Errorf("os should not be accessible in sandbox, got tags: %v", tags)
	}
}

func TestLuaRule_MultipleTagsReturned(t *testing.T) {
	r := newLuaRule("multi-tag", 0, `
function apply(meta)
  return {"alpha", "beta", "gamma"}
end
`)
	tags, err := r.Eval(context.Background(), harvester.MetaMap{})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(tags) != 3 {
		t.Fatalf("expected 3 tags, got %v", tags)
	}
}

func TestLuaRule_NameAndPriority(t *testing.T) {
	r := newLuaRule("my-rule", 42, `function apply(meta) return {} end`)
	if r.Name() != "my-rule" {
		t.Errorf("Name(): got %q, want my-rule", r.Name())
	}
	if r.Priority() != 42 {
		t.Errorf("Priority(): got %d, want 42", r.Priority())
	}
}
