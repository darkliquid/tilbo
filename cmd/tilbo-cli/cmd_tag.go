package main

import (
	"fmt"
	"strings"

	"github.com/spf13/cobra"

	ipcv1 "github.com/darkliquid/tilbo/internal/ipc/gen/tilbo/ipc/v1"
)

const minTagArgs = 2

var tagCmd = &cobra.Command{
	Use:   "tag",
	Short: "Manage file tags",
}

var tagAddCmd = &cobra.Command{
	Use:               "add <path> <tag>...",
	Short:             "Add one or more tags to a file",
	Args:              cobra.MinimumNArgs(minTagArgs),
	ValidArgsFunction: completeTagsVariadic,
	RunE: func(cmd *cobra.Command, args []string) error {
		ctx := cmd.Context()
		path := absPath(args[0])
		tags := args[1:]
		resp, err := call(ctx, &ipcv1.Request{Kind: &ipcv1.Request_Tag{
			Tag: &ipcv1.TagRequest{
				Paths:     []string{path},
				Tags:      tags,
				Operation: ipcv1.TagOperation_TAG_OPERATION_ADD,
			},
		}})
		if err != nil {
			return err
		}
		if err := daemonError(resp); err != nil {
			return err
		}
		if errs := resp.GetTag().GetErrors(); len(errs) > 0 {
			return fmt.Errorf("tag failed: %s", errs[path])
		}
		fmt.Printf("tagged %s: +%s\n", path, strings.Join(tags, " +"))
		return nil
	},
}

var tagRemoveCmd = &cobra.Command{
	Use:               "remove <path> <tag>...",
	Aliases:           []string{"rm"},
	Short:             "Remove one or more tags from a file",
	Args:              cobra.MinimumNArgs(minTagArgs),
	ValidArgsFunction: completeFileTags,
	RunE: func(cmd *cobra.Command, args []string) error {
		ctx := cmd.Context()
		path := absPath(args[0])
		tags := args[1:]
		resp, err := call(ctx, &ipcv1.Request{Kind: &ipcv1.Request_Tag{
			Tag: &ipcv1.TagRequest{
				Paths:     []string{path},
				Tags:      tags,
				Operation: ipcv1.TagOperation_TAG_OPERATION_REMOVE,
			},
		}})
		if err != nil {
			return err
		}
		if err := daemonError(resp); err != nil {
			return err
		}
		if errs := resp.GetTag().GetErrors(); len(errs) > 0 {
			return fmt.Errorf("tag remove failed: %s", errs[path])
		}
		fmt.Printf("untagged %s: -%s\n", path, strings.Join(tags, " -"))
		return nil
	},
}

var tagSetCmd = &cobra.Command{
	Use:               "set <path> [tag]...",
	Short:             "Replace all tags on a file (pass no tags to clear all)",
	Args:              cobra.MinimumNArgs(1),
	ValidArgsFunction: completeTagsVariadic,
	RunE: func(cmd *cobra.Command, args []string) error {
		ctx := cmd.Context()
		path := absPath(args[0])
		tags := args[1:]
		resp, err := call(ctx, &ipcv1.Request{Kind: &ipcv1.Request_Tag{
			Tag: &ipcv1.TagRequest{
				Paths:     []string{path},
				Tags:      tags,
				Operation: ipcv1.TagOperation_TAG_OPERATION_SET,
			},
		}})
		if err != nil {
			return err
		}
		if err := daemonError(resp); err != nil {
			return err
		}
		if errs := resp.GetTag().GetErrors(); len(errs) > 0 {
			return fmt.Errorf("tag set failed: %s", errs[path])
		}
		if len(tags) == 0 {
			fmt.Printf("cleared all tags on %s\n", path)
		} else {
			fmt.Printf("set tags on %s: %s\n", path, strings.Join(tags, ", "))
		}
		return nil
	},
}

var tagListCmd = &cobra.Command{
	Use:               "list <path>",
	Aliases:           []string{"ls"},
	Short:             "List tags on a file",
	Args:              cobra.ExactArgs(1),
	ValidArgsFunction: completeFilePathOnly,
	RunE: func(cmd *cobra.Command, args []string) error {
		ctx := cmd.Context()
		path := absPath(args[0])

		resp, err := call(ctx, &ipcv1.Request{Kind: &ipcv1.Request_Search{
			Search: &ipcv1.SearchRequest{
				MetaFilters: map[string]string{"__path__": "eq:" + path},
				Limit:       1,
			},
		}})
		if err != nil {
			return err
		}
		if err := daemonError(resp); err != nil {
			return err
		}
		files := resp.GetSearch().GetFiles()
		if len(files) == 0 {
			fmt.Printf("%s: (not in index)\n", path)
			return nil
		}
		ts := files[0].GetTags()
		if len(ts) == 0 {
			fmt.Printf("%s: (no tags)\n", path)
		} else {
			for _, t := range ts {
				fmt.Println(t)
			}
		}
		return nil
	},
}

func init() {
	tagCmd.AddCommand(tagAddCmd, tagRemoveCmd, tagSetCmd, tagListCmd)
}
