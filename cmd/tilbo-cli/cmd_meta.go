package main

import (
	"encoding/json"
	"fmt"
	"os"
	"sort"
	"text/tabwriter"

	"github.com/spf13/cobra"

	ipcv1 "github.com/darkliquid/tilbo/internal/ipc/gen/tilbo/ipc/v1"
)

var metaCmd = &cobra.Command{
	Use:   "meta",
	Short: "Manage file metadata",
}

var metaShowCmd = &cobra.Command{
	Use:               "show <path>",
	Short:             "Show all metadata for a file",
	Args:              cobra.ExactArgs(1),
	ValidArgsFunction: completeFilePathOnly,
	RunE: func(cmd *cobra.Command, args []string) error {
		ctx := cmd.Context()
		path := absPath(args[0])
		format, _ := cmd.Flags().GetString("format")

		resp, err := call(ctx, &ipcv1.Request{Kind: &ipcv1.Request_Metadata{
			Metadata: &ipcv1.MetadataRequest{Path: path},
		}})
		if err != nil {
			return err
		}
		if err := daemonError(resp); err != nil {
			return err
		}

		mr := resp.GetMetadata()
		meta := mr.GetMetadata()
		sources := mr.GetSources()

		switch format {
		case "json":
			type jsonEntry struct {
				Key    string `json:"key"`
				Value  string `json:"value"`
				Source string `json:"source,omitempty"`
			}
			out := make([]jsonEntry, 0, len(meta))
			for k, v := range meta {
				out = append(out, jsonEntry{Key: k, Value: v, Source: sources[k]})
			}
			sort.Slice(out, func(i, j int) bool { return out[i].Key < out[j].Key })
			enc := json.NewEncoder(os.Stdout)
			enc.SetIndent("", "  ")
			return enc.Encode(out)
		default:
			if len(meta) == 0 {
				fmt.Printf("%s: (no metadata)\n", path)
				return nil
			}
			keys := make([]string, 0, len(meta))
			for k := range meta {
				keys = append(keys, k)
			}
			sort.Strings(keys)
			w := tabwriter.NewWriter(os.Stdout, 0, 0, 2, ' ', 0)
			fmt.Fprintln(w, "KEY\tVALUE\tSOURCE")
			for _, k := range keys {
				fmt.Fprintf(w, "%s\t%s\t%s\n", k, meta[k], sources[k])
			}
			return w.Flush()
		}
	},
}

var metaSetCmd = &cobra.Command{
	Use:               "set <path> <key> <value>",
	Short:             "Set a metadata key on a file",
	Args:              cobra.ExactArgs(3),
	ValidArgsFunction: completeFilePathOnly, // key and value are free-form
	RunE: func(cmd *cobra.Command, args []string) error {
		ctx := cmd.Context()
		path := absPath(args[0])
		key := args[1]
		value := args[2]

		resp, err := call(ctx, &ipcv1.Request{Kind: &ipcv1.Request_MetadataSet{
			MetadataSet: &ipcv1.MetadataSetRequest{
				Path:  path,
				Key:   key,
				Value: value,
			},
		}})
		if err != nil {
			return err
		}
		if err := daemonError(resp); err != nil {
			return err
		}
		fmt.Printf("set %s[%s] = %s\n", path, key, value)
		return nil
	},
}

var metaDeleteCmd = &cobra.Command{
	Use:               "delete <path> <key>",
	Aliases:           []string{"del", "rm"},
	Short:             "Delete a metadata key from a file",
	Args:              cobra.ExactArgs(2),
	ValidArgsFunction: completeMetaKey,
	RunE: func(cmd *cobra.Command, args []string) error {
		ctx := cmd.Context()
		path := absPath(args[0])
		key := args[1]

		resp, err := call(ctx, &ipcv1.Request{Kind: &ipcv1.Request_MetadataSet{
			MetadataSet: &ipcv1.MetadataSetRequest{
				Path:  path,
				Key:   key,
				Value: "", // empty value signals deletion
			},
		}})
		if err != nil {
			return err
		}
		if err := daemonError(resp); err != nil {
			return err
		}
		fmt.Printf("deleted %s[%s]\n", path, key)
		return nil
	},
}

func init() {
	metaShowCmd.Flags().String("format", "human", "output format: human, json")
	_ = metaShowCmd.RegisterFlagCompletionFunc("format", completeEnum("human", "json"))
	metaCmd.AddCommand(metaShowCmd, metaSetCmd, metaDeleteCmd)
}
