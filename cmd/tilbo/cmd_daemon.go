package main

import (
	"fmt"
	"strings"

	"github.com/spf13/cobra"

	daemoncmd "github.com/darkliquid/tilbo/cmd/tilbo-daemon"
	ipcv1 "github.com/darkliquid/tilbo/internal/ipc/gen/tilbo/ipc/v1"
)

const (
	secondsPerMinute = 60
	secondsPerHour   = 60 * secondsPerMinute
	secondsPerDay    = 24 * secondsPerHour
)

func newDaemonCmd() *cobra.Command {
	cmd := daemoncmd.NewCommand(daemoncmd.CommandMetadata{
		Version:   version,
		Commit:    commit,
		BuildDate: buildDate,
	})
	cmd.Short = "Run, inspect, or control the tilbo daemon"
	cmd.AddCommand(daemonStatusCmd, daemonReloadRulesCmd)
	return cmd
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

// formatUptime returns a human-readable duration string from seconds.
func formatUptime(seconds int64) string {
	d := seconds / secondsPerDay
	h := (seconds % secondsPerDay) / secondsPerHour
	m := (seconds % secondsPerHour) / secondsPerMinute
	s := seconds % secondsPerMinute
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
