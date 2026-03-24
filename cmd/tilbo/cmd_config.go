package main

import (
	"errors"
	"fmt"
	"os"

	"github.com/spf13/cobra"

	"github.com/darkliquid/tilbo/internal/config"
)

var (
	configInitPath  string
	configInitForce bool
)

var configCmd = &cobra.Command{
	Use:   "config",
	Short: "Manage tilbo configuration",
}

var configInitCmd = &cobra.Command{
	Use:   "init",
	Short: "Write a baseline config file using the current CLI flags",
	Long:  "Writes a baseline config TOML file. The generated [cli] section reflects the flags used for this command invocation.",
	RunE: func(_ *cobra.Command, _ []string) error {
		if !configInitForce {
			if _, err := os.Stat(configInitPath); err == nil {
				return fmt.Errorf("config file already exists at %s (use --force to overwrite)", configInitPath)
			} else if !errors.Is(err, os.ErrNotExist) {
				return fmt.Errorf("check config path %s: %w", configInitPath, err)
			}
		}

		cfg, err := config.Load(configInitPath)
		if err != nil {
			return err
		}
		cfg.CLI.Socket = sockFlag

		if err := config.Save(configInitPath, cfg); err != nil {
			return err
		}
		fmt.Printf("wrote config to %s\n", configInitPath)
		return nil
	},
}

func init() {
	configInitPath = config.Path()
	configInitCmd.Flags().StringVar(&configInitPath, "path", config.Path(), "path to config file")
	configInitCmd.Flags().BoolVar(&configInitForce, "force", false, "overwrite existing config file")
	configCmd.AddCommand(configInitCmd)
}
