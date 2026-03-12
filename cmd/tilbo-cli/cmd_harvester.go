package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	"github.com/spf13/cobra"

	"github.com/darkliquid/tilbo/internal/harvester"
)

var harvesterCmd = &cobra.Command{
	Use:   "harvester",
	Short: "Manage and test harvester plugins",
	Annotations: map[string]string{
		"no_daemon": "true",
	},
}

var harvesterListCmd = &cobra.Command{
	Use:   "list",
	Short: "List all configured harvester plugins",
	RunE: func(cmd *cobra.Command, _ []string) error {
		pipeline := harvester.NewPipeline()
		reg := harvester.NewRegistry(harvester.DefaultDirs(), nil)
		if err := reg.Load(cmd.Context(), pipeline); err != nil {
			return fmt.Errorf("failed to load harvesters: %w", err)
		}

		fmt.Println("Configured harvesters:")
		for _, h := range pipeline.List() {
			fmt.Printf("  - %s (Priority: %d, Async: %t)\n", h.Name(), h.Priority(), h.Async())
		}
		return nil
	},
}

var harvesterTestCmd = &cobra.Command{
	Use:               "test <path>",
	Short:             "Test the harvester pipeline against a local file",
	Args:              cobra.ExactArgs(1),
	ValidArgsFunction: completeFilePathOnly,
	RunE: func(cmd *cobra.Command, args []string) error {
		path := absPath(args[0])

		pipeline := harvester.NewPipeline()
		reg := harvester.NewRegistry(harvester.DefaultDirs(), nil)
		if err := reg.Load(cmd.Context(), pipeline); err != nil {
			return fmt.Errorf("failed to load harvesters: %w", err)
		}

		ctx := context.Background()
		// Simple mock for MIME type for testing. In reality this wouldn't strictly match the daemon's internal detection
		// exactly but enough for pipeline debug.

		input := harvester.Input{
			Path: path,
			// For testing we just assume we don't have existing metadata or we might want a flag to provide it.
		}

		meta, err := pipeline.Run(ctx, input)
		if err != nil {
			return fmt.Errorf("pipeline run failed: %w", err)
		}

		enc := json.NewEncoder(os.Stdout)
		enc.SetIndent("", "  ")
		return enc.Encode(meta)
	},
}

func init() {
	harvesterCmd.AddCommand(harvesterListCmd, harvesterTestCmd)
}
