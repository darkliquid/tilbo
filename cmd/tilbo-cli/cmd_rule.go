package main

import (
	"context"
	"fmt"

	"github.com/spf13/cobra"

	"github.com/darkliquid/tilbo/internal/harvester"
	"github.com/darkliquid/tilbo/internal/rules"
)

var ruleCmd = &cobra.Command{
	Use:   "rule",
	Short: "Manage and test tagging rules",
	Annotations: map[string]string{
		"no_daemon": "true",
	},
}

var ruleListCmd = &cobra.Command{
	Use:   "list",
	Short: "List all configured tagging rules",
	RunE: func(cmd *cobra.Command, args []string) error {
		engine := rules.NewEngine()
		reg := rules.NewRegistry(rules.DefaultDirs(), nil)
		if err := reg.Load(cmd.Context(), engine); err != nil {
			return fmt.Errorf("failed to load rules: %w", err)
		}

		fmt.Println("Configured rules:")
		for _, r := range engine.List() {
			fmt.Printf("  - %s (Priority: %d)\n", r.Name(), r.Priority())
		}
		return nil
	},
}

var ruleValidateCmd = &cobra.Command{
	Use:   "validate",
	Short: "Validate rule syntax and configuration",
	RunE: func(cmd *cobra.Command, args []string) error {
		engine := rules.NewEngine()
		reg := rules.NewRegistry(rules.DefaultDirs(), nil)
		err := reg.Load(cmd.Context(), engine)
		if err != nil {
			fmt.Printf("Validation failed: %v\n", err)
			return err // Or os.Exit(1)
		}
		fmt.Printf("Successfully validated %d rules.\n", len(engine.List()))
		return nil
	},
}

var ruleTestCmd = &cobra.Command{
	Use:   "test <path>",
	Short: "Test rules evaluation against a local file",
	Args:  cobra.ExactArgs(1),
	ValidArgsFunction: completeFilePathOnly,
	RunE: func(cmd *cobra.Command, args []string) error {
		path := absPath(args[0])
		ctx := context.Background()

		// Run Harvesters first to get the metadata to test against
		pipeline := harvester.NewPipeline()
		regHarv := harvester.NewRegistry(harvester.DefaultDirs(), nil)
		if err := regHarv.Load(ctx, pipeline); err != nil {
			fmt.Printf("Warning: failed to load harvesters for testing context: %v\n", err)
		}

		input := harvester.Input{Path: path}
		meta, _ := pipeline.Run(ctx, input)
		if meta == nil {
			meta = make(harvester.MetaMap)
		}

		engine := rules.NewEngine()
		reg := rules.NewRegistry(rules.DefaultDirs(), nil)
		if err := reg.Load(ctx, engine); err != nil {
			return fmt.Errorf("failed to load rules: %w", err)
		}

		// Empty existing tags and overrides for isolated testing
		diff, err := engine.Eval(ctx, meta, nil, nil)
		if err != nil {
			return fmt.Errorf("rule evaluation failed: %w", err)
		}

		if len(diff.Added) == 0 {
			fmt.Printf("No rules matched %s\n", path)
		} else {
			fmt.Printf("Rules matched %s:\n", path)
			for _, t := range diff.Added {
				fmt.Printf("  + %s (from %s)\n", t, diff.Sources[t])
			}
		}

		return nil
	},
}

func init() {
	ruleCmd.AddCommand(ruleListCmd, ruleValidateCmd, ruleTestCmd)
}
