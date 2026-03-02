package main

import (
	"fmt"
	"strings"

	"github.com/spf13/cobra"

	ipcv1 "github.com/darkliquid/tilbo/internal/ipc/gen/tilbo/ipc/v1"
)

var daemonCmd = &cobra.Command{
	Use:   "daemon",
	Short: "Inspect or control the tilbo daemon",
}

var daemonStatusCmd = &cobra.Command{
	Use:   "status",
	Short: "Show daemon status",
	RunE: func(cmd *cobra.Command, _ []string) error {
		ctx := cmd.Context()

		resp, err := call(ctx, &ipcv1.Request{Kind: &ipcv1.Request_Status{
			Status: &ipcv1.StatusRequest{},
		}})
		if err != nil {
			return err
		}
		if err := daemonError(resp); err != nil {
			return err
		}

		s := resp.GetStatus()
		stateName := strings.TrimPrefix(s.GetState().String(), "DAEMON_STATE_")
		fmt.Printf("state:         %s\n", stateName)
		fmt.Printf("files indexed: %d\n", s.GetFilesIndexed())
		if s.GetTagsTotal() > 0 {
			fmt.Printf("tags total:    %d\n", s.GetTagsTotal())
		}
		if s.GetIndexSizeMb() > 0 {
			fmt.Printf("index size:    %.1f MB\n", s.GetIndexSizeMb())
		}
		if s.GetUptimeSeconds() > 0 {
			fmt.Printf("uptime:        %s\n", formatUptime(s.GetUptimeSeconds()))
		}
		for _, w := range s.GetWarnings() {
			fmt.Printf("warning:       %s\n", w)
		}
		return nil
	},
}

var daemonReloadRulesCmd = &cobra.Command{
	Use:   "reload-rules",
	Short: "Reload rule configuration and re-evaluate all files",
	RunE: func(cmd *cobra.Command, _ []string) error {
		ctx := cmd.Context()

		resp, err := call(ctx, &ipcv1.Request{Kind: &ipcv1.Request_ReloadRules{
			ReloadRules: &ipcv1.ReloadRulesRequest{},
		}})
		if err != nil {
			return err
		}
		if err := daemonError(resp); err != nil {
			return err
		}

		rr := resp.GetReloadRules()
		if errs := rr.GetErrors(); len(errs) > 0 {
			fmt.Printf("rules reloaded with %d error(s):\n", len(errs))
			for _, e := range errs {
				fmt.Printf("  - %s\n", e)
			}
			return nil
		}
		fmt.Println("rules reloaded successfully")
		return nil
	},
}

func init() {
	daemonCmd.AddCommand(daemonStatusCmd, daemonReloadRulesCmd)
}

// formatUptime returns a human-readable duration string from seconds.
func formatUptime(seconds int64) string {
	d := seconds / 86400
	h := (seconds % 86400) / 3600
	m := (seconds % 3600) / 60
	s := seconds % 60
	if d > 0 {
		return fmt.Sprintf("%dd %dh %dm %ds", d, h, m, s)
	}
	if h > 0 {
		return fmt.Sprintf("%dh %dm %ds", h, m, s)
	}
	if m > 0 {
		return fmt.Sprintf("%dm %ds", m, s)
	}
	return fmt.Sprintf("%ds", s)
}
