package rules

import (
	"context"
	"fmt"

	lua "github.com/yuin/gopher-lua"

	"github.com/darkliquid/tilbo/internal/harvester"
)

// LuaRule evaluates a Lua script to produce tags. The script must define a
// function apply(meta) that receives the metadata as a Lua table and returns
// a list (table) of tag strings.
//
// Sandbox: io, os, require, load, loadfile, dofile, loadstring, package, and
// debug globals are removed after loading standard libraries.
type LuaRule struct {
	name     string
	priority int
	source   string
}

func newLuaRule(name string, priority int, source string) *LuaRule {
	return &LuaRule{name: name, priority: priority, source: source}
}

// Name returns the rule's name.
func (r *LuaRule) Name() string { return r.name }

// Priority returns the rule's priority.
func (r *LuaRule) Priority() int { return r.priority }

// Eval creates a sandboxed Lua VM, executes the script, and calls apply(meta).
func (r *LuaRule) Eval(_ context.Context, meta harvester.MetaMap) ([]string, error) {
	L := lua.NewState()
	defer L.Close()

	// Remove unsafe globals.
	for _, name := range []string{
		"io", "os", "require", "load", "loadfile", "dofile", "loadstring",
		"package", "debug",
	} {
		L.SetGlobal(name, lua.LNil)
	}

	if err := L.DoString(r.source); err != nil {
		return nil, fmt.Errorf("lua rule %q: load script: %w", r.name, err)
	}

	applyFn := L.GetGlobal("apply")
	if applyFn == lua.LNil {
		return nil, fmt.Errorf("lua rule %q: missing function apply(meta)", r.name)
	}

	metaTable := metaMapToLua(L, meta)

	if err := L.CallByParam(lua.P{
		Fn:      applyFn,
		NRet:    1,
		Protect: true,
	}, metaTable); err != nil {
		return nil, fmt.Errorf("lua rule %q: call apply: %w", r.name, err)
	}

	ret := L.Get(-1)
	L.Pop(1)

	tbl, ok := ret.(*lua.LTable)
	if !ok {
		return nil, fmt.Errorf("lua rule %q: apply must return a table, got %T", r.name, ret)
	}

	var tags []string
	tbl.ForEach(func(_, v lua.LValue) {
		if s, ok := v.(lua.LString); ok {
			tags = append(tags, string(s))
		}
	})
	return tags, nil
}

// metaMapToLua converts a MetaMap to a Lua table for passing to apply(meta).
func metaMapToLua(L *lua.LState, meta harvester.MetaMap) *lua.LTable {
	t := L.NewTable()
	for k, v := range meta {
		switch val := v.(type) {
		case string:
			t.RawSetString(k, lua.LString(val))
		case float64:
			t.RawSetString(k, lua.LNumber(val))
		case int64:
			t.RawSetString(k, lua.LNumber(float64(val)))
		case bool:
			t.RawSetString(k, lua.LBool(val))
		}
	}
	return t
}
