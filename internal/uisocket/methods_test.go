package uisocket_test

import (
	"testing"

	"github.com/darkliquid/tilbo/internal/browser"
)

func TestDispatch_MoreMethods(t *testing.T) {
	m := &stubMethods{}
	sockPath, _, cancel := startServer(t, m)
	defer cancel()

	conn, scanner := dialAndScan(t, sockPath)
	defer conn.Close()

	cases := []struct {
		method string
		args   []any
		setup  func()
	}{
		{
			method: "ListDirectory",
			args:   []any{"/tmp", true},
			setup: func() {
				m.listDirectoryFn = func(_ string, _ bool) ([]browser.DirEntry, error) {
					return []browser.DirEntry{{Name: "file.txt"}}, nil
				}
			},
		},
		{
			method: "StatFile",
			args:   []any{"/tmp/file.txt"},
			setup: func() {
				m.statFileFn = func(_ string) (browser.FileStat, error) {
					return browser.FileStat{Size: 123}, nil
				}
			},
		},
		{
			method: "Search",
			args:   []any{[]string{"tag1"}, false, []string{}, map[string]string{}, "query", 10, 0, []string{}},
			setup: func() {
				m.searchFn = func(_ []string, _ bool, _ []string, _ map[string]string, _ string, _ uint32, _ uint32, _ []string) ([]browser.FileResult, uint32, error) {
					return []browser.FileResult{{Path: "/tmp/a"}}, 1, nil
				}
			},
		},
		{
			method: "GlobSearch",
			args:   []any{[]string{"*.txt"}, 10, false},
			setup: func() {
				m.globSearchFn = func(_ []string, _ uint32, _ bool) ([]browser.FileResult, error) {
					return []browser.FileResult{{Path: "/tmp/a.txt"}}, nil
				}
			},
		},
		{
			method: "GetMetadata",
			args:   []any{"/tmp/a.txt"},
			setup: func() {
				m.getMetadataFn = func(_ string) (map[string]string, map[string]string, error) {
					return map[string]string{"k": "v"}, map[string]string{"k": "manual"}, nil
				}
			},
		},
		{
			method: "SetMetadata",
			args:   []any{"/tmp/a.txt", "k", "v"},
			setup: func() {
				m.setMetadataFn = func(_, _, _ string) error {
					return nil
				}
			},
		},
		{
			method: "ModifyTags",
			args:   []any{[]string{"/tmp/a.txt"}, []string{"tag1"}, "add"},
			setup: func() {
				m.modifyTagsFn = func(_, _ []string, _ string) (browser.TagResult, error) {
					return browser.TagResult{}, nil
				}
			},
		},
		{
			method: "HydrateTags",
			args:   []any{[]string{"/tmp/a.txt"}},
			setup: func() {
				m.hydrateTagsFn = func(_ []string) ([]browser.PathTags, error) {
					return []browser.PathTags{{Path: "/tmp/a.txt", Tags: []string{"tag1"}}}, nil
				}
			},
		},
		{
			method: "RenameFile",
			args:   []any{"/tmp/old", "/tmp/new"},
			setup: func() {
				m.renameFileFn = func(_, _ string) (string, error) {
					return "/tmp/new", nil
				}
			},
		},
		{
			method: "DeleteFile",
			args:   []any{"/tmp/a.txt"},
			setup: func() {
				m.deleteFileFn = func(_ string) error {
					return nil
				}
			},
		},
		{
			method: "ChmodFile",
			args:   []any{"/tmp/a.txt", 0644},
			setup: func() {
				m.chmodFileFn = func(_ string, _ uint32) error {
					return nil
				}
			},
		},
	}

	for i, tc := range cases {
		t.Run(tc.method, func(t *testing.T) {
			if tc.setup != nil {
				tc.setup()
			}
			sendJSON(t, conn, map[string]any{
				"id":     i + 1,
				"method": tc.method,
				"args":   tc.args,
			})
			resp := readResponse(t, scanner)
			if resp["id"].(float64) != float64(i+1) {
				t.Errorf("%s: id mismatch, got %v", tc.method, resp["id"])
			}
			if resp["error"] != nil {
				t.Errorf("%s: unexpected error: %v", tc.method, resp["error"])
			}
		})
	}
}
