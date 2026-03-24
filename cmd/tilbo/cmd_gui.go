package main

import (
	"fmt"

	"github.com/spf13/cobra"

	ipcv1 "github.com/darkliquid/tilbo/internal/ipc/gen/tilbo/ipc/v1"
)

var guiCmd = &cobra.Command{
	Use:   "gui [path]",
	Short: "Open the tilbo file browser GUI",
	Long:  "Launch the Quickshell GUI via the daemon, or raise an existing window. Optionally navigate to the given path.",
	Args:  cobra.MaximumNArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		ctx := cmd.Context()

		var path string
		if len(args) > 0 {
			path = absPath(args[0])
		}

		resp, err := call(ctx, &ipcv1.Request{Kind: &ipcv1.Request_LaunchGui{
			LaunchGui: &ipcv1.LaunchGUIRequest{Path: path},
		}})
		if err != nil {
			return err
		}
		if err := daemonError(resp); err != nil {
			return err
		}

		lg := resp.GetLaunchGui()
		if lg.GetAlreadyRunning() {
			fmt.Println("GUI already running; showing window")
		} else {
			fmt.Println("GUI launched")
		}
		return nil
	},
}

func init() {
	rootCmd.AddCommand(guiCmd)
}
