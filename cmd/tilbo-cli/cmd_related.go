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

const outputFormatJSON = "json"

const (
	defaultRelatedLimit = 20
	defaultRelatedHops  = 3
	defaultVecWeight    = 0.4
	relatedTabPadding   = 2
)

var relatedCmd = &cobra.Command{
	Use:               "related <path>",
	Short:             "Find files related to a given file via the tag graph",
	Args:              cobra.ExactArgs(1),
	ValidArgsFunction: completeFilePathOnly,
	RunE: func(cmd *cobra.Command, args []string) error {
		ctx := cmd.Context()
		path := absPath(args[0])
		limit, _ := cmd.Flags().GetUint32("limit")
		hops, _ := cmd.Flags().GetUint32("hops")
		format, _ := cmd.Flags().GetString("format")
		hopWeight, _ := cmd.Flags().GetFloat32("hop-weight")
		vecWeight, _ := cmd.Flags().GetFloat32("vec-weight")

		resp, err := call(ctx, &ipcv1.Request{Kind: &ipcv1.Request_Related{
			Related: &ipcv1.RelatedRequest{
				SeedPath:  path,
				Limit:     limit,
				MaxHops:   hops,
				HopWeight: hopWeight,
				VecWeight: vecWeight,
			},
		}})
		if err != nil {
			return err
		}
		if err := daemonError(resp); err != nil {
			return err
		}

		files := resp.GetRelated().GetFiles()

		switch format {
		case outputFormatJSON:
			return printRelatedJSON(files)
		case "tsv":
			return printRelatedTSV(files)
		default:
			printRelatedHuman(files)
		}
		return nil
	},
}

func init() {
	relatedCmd.Flags().Uint32("limit", defaultRelatedLimit, "maximum results to return")
	relatedCmd.Flags().Uint32("hops", defaultRelatedHops, "maximum graph hops from seed")
	relatedCmd.Flags().Float32("hop-weight", 1.0, "weight multiplier for graph hop distance")
	relatedCmd.Flags().Float32("vec-weight", defaultVecWeight, "weight multiplier for vector similarity")
	relatedCmd.Flags().String("format", "human", "output format: human, json, tsv")
	_ = relatedCmd.RegisterFlagCompletionFunc("format", completeEnum("human", outputFormatJSON, "tsv"))
}

type jsonRelatedResult struct {
	Path        string            `json:"path"`
	Score       float64           `json:"score"`
	HopDistance uint32            `json:"hop_distance"`
	Tags        []string          `json:"tags"`
	Metadata    map[string]string `json:"metadata,omitempty"`
	Mtime       string            `json:"mtime"`
	SizeBytes   int64             `json:"size_bytes"`
}

func printRelatedJSON(files []*ipcv1.ScoredFile) error {
	out := make([]jsonRelatedResult, 0, len(files))
	for _, sf := range files {
		f := sf.GetFile()
		out = append(out, jsonRelatedResult{
			Path:        f.GetPath(),
			Score:       sf.GetScore(),
			HopDistance: sf.GetHopDistance(),
			Tags:        f.GetTags(),
			Metadata:    f.GetMetadata(),
			Mtime:       time.Unix(f.GetMtime(), 0).Format(time.RFC3339),
			SizeBytes:   f.GetSizeBytes(),
		})
	}
	enc := json.NewEncoder(os.Stdout)
	enc.SetIndent("", "  ")
	return enc.Encode(out)
}

func printRelatedTSV(files []*ipcv1.ScoredFile) error {
	w := tabwriter.NewWriter(os.Stdout, 0, 0, 1, ' ', 0)
	fmt.Fprintln(w, "PATH\tSCORE\tHOPS\tTAGS")
	for _, sf := range files {
		f := sf.GetFile()
		fmt.Fprintf(w, "%s\t%.3f\t%d\t%s\n",
			f.GetPath(),
			sf.GetScore(),
			sf.GetHopDistance(),
			strings.Join(f.GetTags(), ","),
		)
	}
	return w.Flush()
}

func printRelatedHuman(files []*ipcv1.ScoredFile) {
	if len(files) == 0 {
		fmt.Println("no related files found")
		return
	}
	w := tabwriter.NewWriter(os.Stdout, 0, 0, relatedTabPadding, ' ', 0)
	for _, sf := range files {
		f := sf.GetFile()
		tags := "(no tags)"
		if ts := f.GetTags(); len(ts) > 0 {
			tags = strings.Join(ts, ", ")
		}
		fmt.Fprintf(w, "%s\t[%s]\t(score %.3f, %d hops)\n",
			f.GetPath(), tags, sf.GetScore(), sf.GetHopDistance())
	}
	if err := w.Flush(); err != nil {
		slog.Warn("failed to flush related output", "err", err)
	}
}
