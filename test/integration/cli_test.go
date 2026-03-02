package integration_test

import (
	"context"
	"fmt"
	"strings"
	"testing"
	"time"
)

// TestTagAddListRemove exercises the full tag add → list → remove cycle.
func TestTagAddListRemove(t *testing.T) {
	ctx := testCtx(t)
	path := watchedFile(t, ctx, "tag-add-remove.txt", "hello tags")

	cliMust(t, ctx, "tag", "add", path, "alpha", "beta")

	out := cliMust(t, ctx, "tag", "list", path)
	for _, want := range []string{"alpha", "beta"} {
		if !strings.Contains(out, want) {
			t.Errorf("expected tag %q in list output, got: %q", want, out)
		}
	}

	cliMust(t, ctx, "tag", "remove", path, "alpha")

	out = cliMust(t, ctx, "tag", "list", path)
	if strings.Contains(out, "alpha") {
		t.Errorf("tag 'alpha' should be gone, still in: %q", out)
	}
	if !strings.Contains(out, "beta") {
		t.Errorf("tag 'beta' should remain, missing from: %q", out)
	}
}

// TestTagSet verifies that 'tag set' replaces all existing tags atomically.
func TestTagSet(t *testing.T) {
	ctx := testCtx(t)
	path := watchedFile(t, ctx, "tag-set.txt", "set test")

	cliMust(t, ctx, "tag", "add", path, "old1", "old2")
	cliMust(t, ctx, "tag", "set", path, "new1", "new2")

	out := cliMust(t, ctx, "tag", "list", path)
	for _, unwanted := range []string{"old1", "old2"} {
		if strings.Contains(out, unwanted) {
			t.Errorf("old tag %q should be gone after set, output: %q", unwanted, out)
		}
	}
	for _, want := range []string{"new1", "new2"} {
		if !strings.Contains(out, want) {
			t.Errorf("new tag %q should be present after set, output: %q", want, out)
		}
	}
}

// TestTagSetClear verifies 'tag set' with no tags clears all tags.
func TestTagSetClear(t *testing.T) {
	ctx := testCtx(t)
	path := watchedFile(t, ctx, "tag-set-clear.txt", "clear test")

	cliMust(t, ctx, "tag", "add", path, "tobecleared")
	cliMust(t, ctx, "tag", "set", path) // no tags → clear all

	out := cliMust(t, ctx, "tag", "list", path)
	if strings.Contains(out, "tobecleared") {
		t.Errorf("tag 'tobecleared' should be gone after set with no args, got: %q", out)
	}
}

// TestSearchByTagAND verifies that --tags with two values uses AND semantics.
func TestSearchByTagAND(t *testing.T) {
	ctx := testCtx(t)

	both := watchedFile(t, ctx, "search-and-both.txt", "both")
	onlyA := watchedFile(t, ctx, "search-and-only-a.txt", "only a")

	cliMust(t, ctx, "tag", "add", both, "srch-and-a", "srch-and-b")
	cliMust(t, ctx, "tag", "add", onlyA, "srch-and-a")

	out := cliMust(t, ctx, "search", "--tags", "srch-and-a,srch-and-b", "--format", "json")
	if !strings.Contains(out, "search-and-both.txt") {
		t.Errorf("expected 'both' file in AND results, got: %q", out)
	}
	if strings.Contains(out, "search-and-only-a.txt") {
		t.Errorf("'onlyA' should not appear in AND results, got: %q", out)
	}
}

// TestSearchByTagOR verifies --tags with --any uses OR semantics.
func TestSearchByTagOR(t *testing.T) {
	ctx := testCtx(t)

	fileA := watchedFile(t, ctx, "search-or-a.txt", "or a")
	fileB := watchedFile(t, ctx, "search-or-b.txt", "or b")

	cliMust(t, ctx, "tag", "add", fileA, "srch-or-x")
	cliMust(t, ctx, "tag", "add", fileB, "srch-or-y")

	out := cliMust(t, ctx, "search", "--tags", "srch-or-x,srch-or-y", "--any", "--format", "json")
	if !strings.Contains(out, "search-or-a.txt") {
		t.Errorf("expected file A in OR results, got: %q", out)
	}
	if !strings.Contains(out, "search-or-b.txt") {
		t.Errorf("expected file B in OR results, got: %q", out)
	}
}

// TestSearchExclude verifies --exclude removes files carrying a specific tag.
func TestSearchExclude(t *testing.T) {
	ctx := testCtx(t)

	keep := watchedFile(t, ctx, "search-excl-keep.txt", "keep")
	drop := watchedFile(t, ctx, "search-excl-drop.txt", "drop")

	cliMust(t, ctx, "tag", "add", keep, "srch-excl-base")
	cliMust(t, ctx, "tag", "add", drop, "srch-excl-base", "srch-excl-bad")

	out := cliMust(t, ctx, "search",
		"--tags", "srch-excl-base",
		"--exclude", "srch-excl-bad",
		"--format", "json")
	if !strings.Contains(out, "search-excl-keep.txt") {
		t.Errorf("expected keep file in results, got: %q", out)
	}
	if strings.Contains(out, "search-excl-drop.txt") {
		t.Errorf("excluded file should not appear, got: %q", out)
	}
}

// TestMetaSetShowDelete exercises the meta set → show → delete cycle.
func TestMetaSetShowDelete(t *testing.T) {
	ctx := testCtx(t)
	path := watchedFile(t, ctx, "meta-test.txt", "meta content")

	cliMust(t, ctx, "meta", "set", path, "author", "alice")

	out := cliMust(t, ctx, "meta", "show", path)
	if !strings.Contains(out, "author") || !strings.Contains(out, "alice") {
		t.Errorf("expected author=alice in meta show, got: %q", out)
	}

	cliMust(t, ctx, "meta", "delete", path, "author")

	out = cliMust(t, ctx, "meta", "show", path)
	if strings.Contains(out, "alice") {
		t.Errorf("deleted key should be gone, still in: %q", out)
	}
}

// TestRelatedFiles verifies that 'related' returns non-empty results when
// files share at least one tag.
func TestRelatedFiles(t *testing.T) {
	ctx := testCtx(t)

	seed := watchedFile(t, ctx, "related-seed.txt", "seed")
	peer := watchedFile(t, ctx, "related-peer.txt", "peer")

	cliMust(t, ctx, "tag", "add", seed, "rel-shared")
	cliMust(t, ctx, "tag", "add", peer, "rel-shared")

	out := cliMust(t, ctx, "related", seed, "--format", "json")
	if !strings.Contains(out, "related-peer.txt") {
		t.Errorf("expected peer file in related results, got: %q", out)
	}
}

// TestDaemonStatusCmd verifies the 'daemon status' output contains expected fields.
func TestDaemonStatusCmd(t *testing.T) {
	ctx := testCtx(t)
	out := cliMust(t, ctx, "daemon", "status")
	for _, field := range []string{"state:", "files indexed:"} {
		if !strings.Contains(out, field) {
			t.Errorf("expected %q in status output, got: %q", field, out)
		}
	}
}

// --- helpers -----------------------------------------------------------------

// cliMust runs tilbo-cli against the main daemon socket and fails the test on
// any error. Returns stdout+stderr output.
func cliMust(t *testing.T, ctx context.Context, args ...string) string {
	t.Helper()
	out, err := suite.CLI(ctx, mainSock, args...)
	if err != nil {
		t.Fatalf("tilbo-cli %v: %v\noutput: %s", args, err, out)
	}
	return out
}

// watchedFile creates a file inside the daemon's watched directory and waits
// for it to appear in the index. Returns the absolute container-side path.
func watchedFile(t *testing.T, ctx context.Context, name, content string) string {
	t.Helper()
	path := fmt.Sprintf("%s/%s", mainWatch, name)
	if _, err := suite.Shell(ctx, fmt.Sprintf("printf '%%s' '%s' > '%s'", content, path)); err != nil {
		t.Fatalf("create watched file %s: %v", name, err)
	}
	t.Cleanup(func() {
		suite.Shell(context.Background(), fmt.Sprintf("rm -f '%s'", path)) //nolint:errcheck
	})
	// Wait for the daemon to pick up the new file (fanotify + 200ms debounce).
	if err := suite.WaitIndexed(ctx, mainSock, path, 5*time.Second); err != nil {
		t.Logf("note: %s not yet indexed (may be fine for tag-only tests): %v", name, err)
	}
	return path
}
