package main

import (
	"context"
	"strings"
	"time"

	"github.com/spf13/cobra"

	ipcv1 "github.com/darkliquid/tilbo/internal/ipc/gen/tilbo/ipc/v1"
)

// completionTimeout is the deadline for a daemon round-trip during completion.
// Kept short so a slow or unavailable daemon does not stall the shell prompt.
const completionTimeout = 2 * time.Second

const minMetaKeyArgs = 2

// completeTags returns tag names from the daemon that match toComplete,
// excluding any tags in the exclude list (already typed by the user).
func completeTags(
	exclude []string,
	cmd *cobra.Command,
	_ []string,
	toComplete string,
) ([]string, cobra.ShellCompDirective) {
	ctx, cancel := context.WithTimeout(cmd.Context(), completionTimeout)
	defer cancel()

	resp, err := call(ctx, &ipcv1.Request{Kind: &ipcv1.Request_ListTags{
		ListTags: &ipcv1.ListTagsRequest{Prefix: toComplete},
	}})
	if err != nil || daemonError(resp) != nil {
		return nil, cobra.ShellCompDirectiveNoFileComp
	}

	skip := make(map[string]struct{}, len(exclude))
	for _, t := range exclude {
		skip[t] = struct{}{}
	}

	all := resp.GetListTags().GetTags()
	out := make([]string, 0, len(all))
	for _, t := range all {
		if _, ok := skip[t]; !ok {
			out = append(out, t)
		}
	}
	return out, cobra.ShellCompDirectiveNoFileComp
}

// completeTagsVariadic is a ValidArgsFunction for commands where args[0] is a
// file path and subsequent args are tag names (e.g. "tag add", "tag set").
// The shell handles file completion for the first arg; tags after that.
func completeTagsVariadic(cmd *cobra.Command, args []string, toComplete string) ([]string, cobra.ShellCompDirective) {
	if len(args) == 0 {
		return nil, cobra.ShellCompDirectiveDefault
	}
	return completeTags(args[1:], cmd, args, toComplete)
}

// completeFileTags is a ValidArgsFunction for "tag remove": completes only the
// tags that the target file already has, fetched live from the daemon.
func completeFileTags(cmd *cobra.Command, args []string, toComplete string) ([]string, cobra.ShellCompDirective) {
	if len(args) == 0 {
		return nil, cobra.ShellCompDirectiveDefault
	}

	ctx, cancel := context.WithTimeout(cmd.Context(), completionTimeout)
	defer cancel()

	path := absPath(args[0])
	resp, err := call(ctx, &ipcv1.Request{Kind: &ipcv1.Request_Search{
		Search: &ipcv1.SearchRequest{
			MetaFilters: map[string]string{"__path__": "eq:" + path},
			Limit:       1,
		},
	}})
	if err != nil || daemonError(resp) != nil {
		return nil, cobra.ShellCompDirectiveNoFileComp
	}

	files := resp.GetSearch().GetFiles()
	if len(files) == 0 {
		return nil, cobra.ShellCompDirectiveNoFileComp
	}

	skip := make(map[string]struct{}, len(args)-1)
	for _, t := range args[1:] {
		skip[t] = struct{}{}
	}

	all := files[0].GetTags()
	out := make([]string, 0, len(all))
	for _, t := range all {
		if strings.HasPrefix(t, toComplete) {
			if _, ok := skip[t]; !ok {
				out = append(out, t)
			}
		}
	}
	return out, cobra.ShellCompDirectiveNoFileComp
}

// completeMetaKey completes the second arg (metadata key) from the keys
// present on the file named in args[0], fetched live from the daemon.
func completeMetaKey(cmd *cobra.Command, args []string, toComplete string) ([]string, cobra.ShellCompDirective) {
	if len(args) == 0 {
		return nil, cobra.ShellCompDirectiveDefault
	}
	if len(args) >= minMetaKeyArgs {
		return nil, cobra.ShellCompDirectiveNoFileComp
	}

	ctx, cancel := context.WithTimeout(cmd.Context(), completionTimeout)
	defer cancel()

	resp, err := call(ctx, &ipcv1.Request{Kind: &ipcv1.Request_Metadata{
		Metadata: &ipcv1.MetadataRequest{Path: absPath(args[0])},
	}})
	if err != nil || daemonError(resp) != nil {
		return nil, cobra.ShellCompDirectiveNoFileComp
	}

	meta := resp.GetMetadata().GetMetadata()
	out := make([]string, 0, len(meta))
	for k := range meta {
		if strings.HasPrefix(k, toComplete) {
			out = append(out, k)
		}
	}
	return out, cobra.ShellCompDirectiveNoFileComp
}

// completeFilePathOnly allows shell file completion for the first arg only.
func completeFilePathOnly(_ *cobra.Command, args []string, _ string) ([]string, cobra.ShellCompDirective) {
	if len(args) == 0 {
		return nil, cobra.ShellCompDirectiveDefault
	}
	return nil, cobra.ShellCompDirectiveNoFileComp
}

// completeEnum returns a ValidArgsFunction that suggests fixed enumerated values.
func completeEnum(values ...string) func(*cobra.Command, []string, string) ([]string, cobra.ShellCompDirective) {
	return func(_ *cobra.Command, _ []string, toComplete string) ([]string, cobra.ShellCompDirective) {
		out := make([]string, 0, len(values))
		for _, v := range values {
			if strings.HasPrefix(v, toComplete) {
				out = append(out, v)
			}
		}
		return out, cobra.ShellCompDirectiveNoFileComp
	}
}
