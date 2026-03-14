package fsutil_test

import (
	"testing"

	"github.com/darkliquid/tilbo/internal/fsutil"
)

func TestIsHiddenName(t *testing.T) {
	tests := []struct {
		name string
		in   string
		want bool
	}{
		{name: "empty", in: "", want: false},
		{name: "dot", in: ".", want: false},
		{name: "dotdot", in: "..", want: false},
		{name: "visible", in: "docs", want: false},
		{name: "hidden", in: ".cache", want: true},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			if got := fsutil.IsHiddenName(tc.in); got != tc.want {
				t.Fatalf("IsHiddenName(%q) = %v, want %v", tc.in, got, tc.want)
			}
		})
	}
}

func TestHasHiddenComponentBelowRoot(t *testing.T) {
	tests := []struct {
		name string
		root string
		path string
		want bool
	}{
		{
			name: "visible descendant",
			root: "/tmp/watch",
			path: "/tmp/watch/docs/file.txt",
			want: false,
		},
		{
			name: "hidden file below visible root",
			root: "/tmp/watch",
			path: "/tmp/watch/.env",
			want: true,
		},
		{
			name: "hidden directory below visible root",
			root: "/tmp/watch",
			path: "/tmp/watch/docs/.cache/file.txt",
			want: true,
		},
		{
			name: "explicit hidden root allowed",
			root: "/tmp/watch/.config",
			path: "/tmp/watch/.config/file.txt",
			want: false,
		},
		{
			name: "hidden descendant below hidden root still blocked",
			root: "/tmp/watch/.config",
			path: "/tmp/watch/.config/.cache/file.txt",
			want: true,
		},
		{
			name: "root itself never counts as hidden descendant",
			root: "/tmp/watch/.config",
			path: "/tmp/watch/.config",
			want: false,
		},
		{
			name: "outside root ignored",
			root: "/tmp/watch",
			path: "/tmp/other/.cache/file.txt",
			want: false,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			if got := fsutil.HasHiddenComponentBelowRoot(tc.root, tc.path); got != tc.want {
				t.Fatalf("HasHiddenComponentBelowRoot(%q, %q) = %v, want %v", tc.root, tc.path, got, tc.want)
			}
		})
	}
}
