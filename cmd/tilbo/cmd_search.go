package main

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"os"
	"strings"
	"text/tabwriter"
	"time"

	"github.com/spf13/cobra"

	ipcv1 "github.com/darkliquid/tilbo/internal/ipc/gen/tilbo/ipc/v1"
)

const (
	defaultSearchLimit = 50 // default --limit when not specified
	searchTabPadding   = 2  // tabwriter padding for human-readable output
)

var searchCmd = &cobra.Command{
	Use:   "search",
	Short: "Search files by tags, metadata, or full-text",
	Long: `Search the tilbo index.

Examples:
  tilbo search --tags photo,vacation
  tilbo search --tags photo --any --exclude archived
  tilbo search --fts "holiday 2023"
  tilbo search --vector "scenic mountain sunset"
  tilbo search --meta camera_make:eq:Canon --meta iso:gt:1600
  tilbo search --format json | jq '.[].path'`,
	RunE: func(cmd *cobra.Command, _ []string) error {
		ctx := cmd.Context()

		tags, _ := cmd.Flags().GetStringSlice("tags")
		tagsAny, _ := cmd.Flags().GetBool("any")
		exclude, _ := cmd.Flags().GetStringSlice("exclude")
		fts, _ := cmd.Flags().GetString("fts")
		vector, _ := cmd.Flags().GetString("vector")
		metaRaw, _ := cmd.Flags().GetStringToString("meta")
		sortBy, _ := cmd.Flags().GetStringSlice("sort")
		limit, _ := cmd.Flags().GetUint32("limit")
		offset, _ := cmd.Flags().GetUint32("offset")
		format, _ := cmd.Flags().GetString("format")

		resp, err := call(ctx, &ipcv1.Request{Kind: &ipcv1.Request_Search{
			Search: &ipcv1.SearchRequest{
				Tags:        tags,
				TagsAny:     tagsAny,
				TagExclude:  exclude,
				FtsQuery:    fts,
				VectorQuery: vector,
				MetaFilters: metaRaw,
				SortBy:      sortBy,
				Limit:       limit,
				Offset:      offset,
			},
		}})
		if err != nil {
			return err
		}
		if err := daemonError(resp); err != nil {
			return err
		}

		sr := resp.GetSearch()
		files := sr.GetFiles()

		switch format {
		case "json":
			return printSearchJSON(files)
		case "tsv":
			return printSearchTSV(files)
		default:
			printSearchHuman(files, sr.GetTotal())
		}
		return nil
	},
}

func init() {
	f := searchCmd.Flags()
	f.StringSlice("tags", nil, "required tags (AND by default, use --any for OR)")
	f.Bool("any", false, "use OR semantics for --tags")
	f.StringSlice("exclude", nil, "tags that must not be present")
	f.String("fts", "", "full-text search query against metadata values")
	f.String("vector", "", "semantic search query using vector embeddings")
	f.StringToString("meta", nil, "metadata filters: key=op:value (e.g. iso=gt:1600)")
	f.StringSlice("sort", []string{"mtime:desc"}, "sort order: field:asc|desc (mtime, name, size)")
	f.Uint32("limit", defaultSearchLimit, "maximum results to return")
	f.Uint32("offset", 0, "result offset for pagination")
	f.String("format", "human", "output format: human, json, tsv")

	_ = searchCmd.RegisterFlagCompletionFunc(
		"tags",
		func(cmd *cobra.Command, args []string, toComplete string) ([]string, cobra.ShellCompDirective) {
			already, _ := cmd.Flags().GetStringSlice("tags")
			return completeTags(already, cmd, args, toComplete)
		},
	)
	_ = searchCmd.RegisterFlagCompletionFunc(
		"exclude",
		func(cmd *cobra.Command, args []string, toComplete string) ([]string, cobra.ShellCompDirective) {
			already, _ := cmd.Flags().GetStringSlice("exclude")
			return completeTags(already, cmd, args, toComplete)
		},
	)
	_ = searchCmd.RegisterFlagCompletionFunc("format", completeEnum("human", "json", "tsv"))
	_ = searchCmd.RegisterFlagCompletionFunc("sort", completeEnum(
		"mtime:asc", "mtime:desc",
		"name:asc", "name:desc",
		"size:asc", "size:desc",
	))
}

type jsonFileResult struct {
	Path      string            `json:"path"`
	Tags      []string          `json:"tags"`
	Metadata  map[string]string `json:"metadata,omitempty"`
	Mtime     string            `json:"mtime"`
	SizeBytes int64             `json:"size_bytes"`
	Score     float64           `json:"score,omitempty"`
}

func printSearchJSON(files []*ipcv1.FileResult) error {
	out := make([]jsonFileResult, 0, len(files))
	for _, f := range files {
		out = append(out, jsonFileResult{
			Path:      f.GetPath(),
			Tags:      f.GetTags(),
			Metadata:  f.GetMetadata(),
			Mtime:     time.Unix(f.GetMtime(), 0).Format(time.RFC3339),
			SizeBytes: f.GetSizeBytes(),
			Score:     f.GetScore(),
		})
	}
	enc := json.NewEncoder(os.Stdout)
	enc.SetIndent("", "  ")
	return enc.Encode(out)
}

func printSearchTSV(files []*ipcv1.FileResult) error {
	w := tabwriter.NewWriter(os.Stdout, 0, 0, 1, ' ', 0)
	fmt.Fprintln(w, "PATH\tTAGS\tSIZE\tMTIME\tSCORE")
	for _, f := range files {
		fmt.Fprintf(w, "%s\t%s\t%d\t%s\t%.4f\n",
			f.GetPath(),
			strings.Join(f.GetTags(), ","),
			f.GetSizeBytes(),
			time.Unix(f.GetMtime(), 0).Format("2006-01-02 15:04"),
			f.GetScore(),
		)
	}
	return w.Flush()
}

func printSearchHuman(files []*ipcv1.FileResult, total uint32) {
	if len(files) == 0 {
		fmt.Println("no results")
		return
	}
	w := tabwriter.NewWriter(os.Stdout, 0, 0, searchTabPadding, ' ', 0)
	for _, f := range files {
		tags := "(no tags)"
		if len(f.GetTags()) > 0 {
			tags = strings.Join(f.GetTags(), ", ")
		}
		scoreStr := ""
		if f.GetScore() != 0 {
			scoreStr = fmt.Sprintf("\t(score: %.4f)", f.GetScore())
		}
		fmt.Fprintf(w, "%s\t[%s]%s\n", f.GetPath(), tags, scoreStr)
	}
	if err := w.Flush(); err != nil {
		slog.Warn("failed to flush search output", "err", err)
	}
	if int64(total) > int64(len(files)) {
		fmt.Printf("\nshowing %d of %d results\n", len(files), total)
	}
}
