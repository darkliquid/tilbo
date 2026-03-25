package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"

	"github.com/spf13/cobra"

	"github.com/darkliquid/tilbo/internal/config"
	"github.com/darkliquid/tilbo/internal/daemon"
	ipcv1 "github.com/darkliquid/tilbo/internal/ipc/gen/tilbo/ipc/v1"
	"github.com/darkliquid/tilbo/internal/watcher"
)

const (
	secondsPerMinute = 60
	secondsPerHour   = 60 * secondsPerMinute
	secondsPerDay    = 24 * secondsPerHour
)

// daemonOptions holds all runtime configuration flags for the daemon command.
// Values are populated from the config file first, then overridden by CLI flags,
// giving users a layered configuration approach (config file < CLI flags).
type daemonOptions struct {
	watchPath      string
	dbPath         string
	fuseMount      string
	socketOverride string
	logFormat      string
	logLevel       string
	watcherBackend string
	watchHidden    bool
	embedModel     string
	embedModelName string
	embedDisabled  bool
	printVersion   bool
}

func socketOverrideForCommand(cmd *cobra.Command, fallback string) string {
	flag := cmd.Flags().Lookup("socket")
	if flag == nil {
		flag = cmd.InheritedFlags().Lookup("socket")
	}
	if flag != nil && flag.Changed {
		return flag.Value.String()
	}
	return fallback
}

// runDaemon is the main entry point after CLI flag parsing. It configures logging,
// sets up signal handling for graceful shutdown (SIGTERM/SIGINT) and config reload
// (SIGHUP), then delegates to the run() function which owns the daemon lifecycle.
func runDaemon(ctx context.Context, cfgPath string, cfgErr error, opts *daemonOptions) error {
	// Fall back to the XDG runtime directory socket if no explicit override was given.
	sockPath := opts.socketOverride
	if sockPath == "" {
		sockPath = defaultSocketPath()
	}

	if err := setupLogging(opts.logFormat, opts.logLevel); err != nil {
		return fmt.Errorf("tilbo daemon: bad log flags: %w", err)
	}

	// Report any config load error as a warning rather than a hard failure,
	// because the daemon can operate entirely on defaults and CLI flags.
	if cfgErr != nil {
		slog.WarnContext(ctx, "tilbo daemon: config load error; using defaults", "path", cfgPath, "err", cfgErr)
	}

	slog.InfoContext(ctx, "tilbo daemon starting",
		"version", version,
		"commit", commit,
		"built", buildDate,
		"watch", opts.watchPath,
		"db", opts.dbPath,
		"fuse", opts.fuseMount,
		"pid", os.Getpid(),
	)

	// SIGTERM and SIGINT trigger a graceful shutdown via context cancellation.
	runCtx, stop := signal.NotifyContext(ctx, syscall.SIGTERM, syscall.SIGINT)
	defer stop()

	// SIGHUP is handled separately to trigger a live config/rule reload
	// without restarting the daemon (similar to nginx/systemd convention).
	hupCh := make(chan os.Signal, 1)
	signal.Notify(hupCh, syscall.SIGHUP)
	defer signal.Stop(hupCh)

	if err := daemon.Run(
		runCtx,
		hupCh,
		opts.watchPath,
		opts.dbPath,
		opts.fuseMount,
		sockPath,
		cfgPath,
		watcher.Backend(opts.watcherBackend),
		opts.watchHidden,
		opts.embedModel,
		opts.embedModelName,
		opts.embedDisabled,
	); err != nil {
		slog.ErrorContext(runCtx, "daemon error", "err", err)
		return err
	}

	slog.InfoContext(ctx, "tilbo daemon stopped")
	return nil
}

// newConfigCmd creates the "config" subcommand group for the daemon. Currently
// it only contains "config init", which snapshots the active daemon flags into
// a TOML config file so users can reproduce the same configuration without
// passing CLI flags every time.
func newConfigCmd(opts *daemonOptions, defaultConfigPath string) *cobra.Command {
	var initPath string
	var force bool

	cmd := &cobra.Command{
		Use:   "config",
		Short: "Manage daemon configuration",
	}

	initCmd := &cobra.Command{
		Use:   "init",
		Short: "Write a baseline config file using the current daemon flags",
		Long:  "Writes a baseline TOML config. The generated [daemon] section reflects the flags used for this command invocation.",
		RunE: func(cmd *cobra.Command, _ []string) error {
			opts.socketOverride = socketOverrideForCommand(cmd, opts.socketOverride)
			if !force {
				if _, err := os.Stat(initPath); err == nil {
					return fmt.Errorf("config file already exists at %s (use --force to overwrite)", initPath)
				} else if !errors.Is(err, os.ErrNotExist) {
					return fmt.Errorf("check config path %s: %w", initPath, err)
				}
			}

			cfg, err := config.Load(initPath)
			if err != nil {
				return err
			}
			cfg.Daemon = config.DaemonConfig{
				Watch:          opts.watchPath,
				DB:             opts.dbPath,
				FuseMount:      opts.fuseMount,
				Socket:         opts.socketOverride,
				LogFormat:      opts.logFormat,
				LogLevel:       opts.logLevel,
				Watcher:        opts.watcherBackend,
				WatchHidden:    opts.watchHidden,
				EmbedModel:     opts.embedModel,
				EmbedModelName: opts.embedModelName,
				EmbedDisabled:  opts.embedDisabled,
			}
			cfg.Browser = config.BrowserConfig{
				UseTrash:               new(true),
				InlineThumbnails:       new(true),
				AutoPropertiesSlideout: new(false),
				Theme:                  "nord",
				Keybindings:            map[string]string{},
			}

			if err := config.Save(initPath, cfg); err != nil {
				return err
			}
			fmt.Printf("wrote config to %s\n", initPath)
			return nil
		},
	}

	initPath = defaultConfigPath
	initCmd.Flags().StringVar(&initPath, "path", defaultConfigPath, "path to config file")
	initCmd.Flags().BoolVar(&force, "force", false, "overwrite existing config file")

	cmd.AddCommand(initCmd)
	return cmd
}

// newSystemdCmd creates the "systemd" subcommand group for installing user-mode
// systemd service and socket units. This enables socket activation so the daemon
// starts on-demand when a client connects to the IPC socket.
func newSystemdCmd() *cobra.Command {
	var (
		targetDir string
		enable    bool
		now       bool
	)

	cmd := &cobra.Command{
		Use:   "systemd",
		Short: "Install or manage user-mode systemd units",
	}

	installCmd := &cobra.Command{
		Use:   "install",
		Short: "Install user-mode systemd service and socket for the tilbo daemon",
		RunE: func(cmd *cobra.Command, _ []string) error {
			return installSystemdUnits(cmd.Context(), targetDir, enable, now)
		},
	}

	installCmd.Flags().StringVar(
		&targetDir,
		"dir",
		"",
		"target systemd user unit directory (defaults to $XDG_CONFIG_HOME/systemd/user)",
	)
	installCmd.Flags().BoolVar(&enable, "enable", true, "enable units after install")
	installCmd.Flags().BoolVar(&now, "now", true, "start units after install")

	cmd.AddCommand(installCmd)
	return cmd
}

func installSystemdUnits(ctx context.Context, targetDir string, enable, now bool) error {
	if targetDir == "" {
		d, err := userSystemdDir()
		if err != nil {
			return err
		}
		targetDir = d
	}
	if err := os.MkdirAll(targetDir, 0o750); err != nil {
		return fmt.Errorf("create systemd dir %s: %w", targetDir, err)
	}

	exePath, err := os.Executable()
	if err != nil {
		return fmt.Errorf("resolve executable path: %w", err)
	}
	exePath, err = filepath.EvalSymlinks(exePath)
	if err != nil {
		exePath = strings.TrimSpace(exePath)
	}

	servicePath := filepath.Join(targetDir, "tilbo-daemon.service")
	socketPath := filepath.Join(targetDir, "tilbo-daemon.socket")

	if err := os.WriteFile(servicePath, []byte(systemdServiceUnit(exePath)), 0o600); err != nil {
		return fmt.Errorf("write service unit %s: %w", servicePath, err)
	}
	if err := os.WriteFile(socketPath, []byte(systemdSocketUnit()), 0o600); err != nil {
		return fmt.Errorf("write socket unit %s: %w", socketPath, err)
	}

	if err := runSystemctl(ctx, "--user", "daemon-reload"); err != nil {
		return err
	}
	if enable {
		if err := runSystemctl(
			ctx,
			"--user",
			"enable",
			"tilbo-daemon.socket",
			"tilbo-daemon.service",
		); err != nil {
			return err
		}
	}
	if now {
		if err := runSystemctl(
			ctx,
			"--user",
			"start",
			"tilbo-daemon.socket",
			"tilbo-daemon.service",
		); err != nil {
			return err
		}
	}

	fmt.Printf("installed systemd units in %s\n", targetDir)
	return nil
}

func runSystemctl(ctx context.Context, args ...string) error {
	out, err := exec.CommandContext(ctx, "systemctl", args...).CombinedOutput()
	if err != nil {
		trimmed := strings.TrimSpace(string(out))
		if trimmed == "" {
			return fmt.Errorf("systemctl %s failed: %w", strings.Join(args, " "), err)
		}
		return fmt.Errorf("systemctl %s failed: %w: %s", strings.Join(args, " "), err, trimmed)
	}
	return nil
}

func userSystemdDir() (string, error) {
	if cfg, err := os.UserConfigDir(); err == nil {
		return filepath.Join(cfg, "systemd", "user"), nil
	}
	if home, err := os.UserHomeDir(); err == nil {
		return filepath.Join(home, ".config", "systemd", "user"), nil
	}
	return "", errors.New("cannot determine user config dir")
}

func systemdServiceUnit(exePath string) string {
	return "[Unit]\n" +
		"Description=Tilbo file tagging daemon\n" +
		"Documentation=https://github.com/darkliquid/tilbo\n" +
		"After=dbus.socket local-fs.target\n\n" +
		"[Service]\n" +
		"Type=simple\n" +
		"ExecStart=" + shellQuote(exePath) + " daemon\n" +
		"Restart=on-failure\n" +
		"RestartSec=5s\n" +
		"StandardOutput=journal\n" +
		"StandardError=journal\n" +
		"SyslogIdentifier=tilbo-daemon\n" +
		"NoNewPrivileges=yes\n" +
		"PrivateTmp=yes\n" +
		"ProtectSystem=strict\n" +
		"ReadWritePaths=%h\n\n" +
		"[Install]\n" +
		"WantedBy=default.target\n"
}

func systemdSocketUnit() string {
	return "[Unit]\n" +
		"Description=Tilbo IPC Socket\n\n" +
		"[Socket]\n" +
		"ListenStream=%t/tilbo.sock\n" +
		"SocketMode=0600\n\n" +
		"[Install]\n" +
		"WantedBy=sockets.target\n"
}

func shellQuote(v string) string {
	if v == "" {
		return "''"
	}
	return "'" + strings.ReplaceAll(v, "'", "'\\''") + "'"
}

func newDaemonCmd() *cobra.Command {
	cfgPath := config.Path()
	cfg, cfgErr := config.Load(cfgPath)

	// orDefault returns cfgVal when non-empty, otherwise the hardcoded fallback.
	// This enables config file values to override compiled defaults while still
	// allowing CLI flags to override everything.
	orDefault := func(cfgVal, fallback string) string {
		if cfgVal != "" {
			return cfgVal
		}
		return fallback
	}

	opts := &daemonOptions{
		watchPath:      orDefault(cfg.Daemon.Watch, defaultWatchPath()),
		dbPath:         orDefault(cfg.Daemon.DB, defaultDBPath()),
		fuseMount:      orDefault(cfg.Daemon.FuseMount, defaultFuseMountPath()),
		socketOverride: cfg.Daemon.Socket,
		logFormat:      orDefault(cfg.Daemon.LogFormat, outputFormatText),
		logLevel:       orDefault(cfg.Daemon.LogLevel, "info"),
		watcherBackend: orDefault(cfg.Daemon.Watcher, "auto"),
		watchHidden:    cfg.Daemon.WatchHidden,
		embedModel:     cfg.Daemon.EmbedModel,
		embedModelName: cfg.Daemon.EmbedModelName,
		embedDisabled:  cfg.Daemon.EmbedDisabled,
	}

	cmd := &cobra.Command{
		Use:   "daemon",
		Short: "Run or manage the tilbo daemon",
		Long:  "Run or manage the tilbo daemon. The daemon watches files, indexes tags and metadata, and serves IPC requests.",
		RunE: func(cmd *cobra.Command, _ []string) error {
			opts.socketOverride = socketOverrideForCommand(cmd, opts.socketOverride)
			if opts.printVersion {
				fmt.Printf("tilbo daemon %s (commit %s, built %s)\n", version, commit, buildDate)
				return nil
			}
			return runDaemon(cmd.Context(), cfgPath, cfgErr, opts)
		},
	}

	cmd.Flags().StringVar(&opts.watchPath, "watch", opts.watchPath, "filesystem path to watch")
	cmd.Flags().StringVar(&opts.dbPath, "db", opts.dbPath, "path to the SQLite index database")
	cmd.Flags().StringVar(
		&opts.fuseMount,
		"fuse-mount",
		opts.fuseMount,
		"FUSE virtual filesystem mount point (empty to disable)",
	)
	cmd.Flags().StringVar(&opts.logFormat, "log-format", opts.logFormat, "log format: text or json")
	cmd.Flags().StringVar(&opts.logLevel, "log-level", opts.logLevel, "log level: debug, info, warn, error")
	cmd.Flags().StringVar(
		&opts.watcherBackend,
		"watcher",
		opts.watcherBackend,
		"filesystem watcher backend: auto, fanotify, inotify",
	)
	cmd.Flags().BoolVar(&opts.watchHidden, "watch-hidden", opts.watchHidden, "watch hidden files and directories")
	cmd.Flags().StringVar(
		&opts.embedModel,
		"embed-model",
		opts.embedModel,
		"path to local ONNX tokenizer/model directory for embeddings (overrides auto-download)",
	)
	cmd.Flags().StringVar(
		&opts.embedModelName,
		"embed-model-name",
		opts.embedModelName,
		"HuggingFace model name to auto-download when embed-model is unset (default: sentence-transformers/all-MiniLM-L6-v2)",
	)
	cmd.Flags().BoolVar(
		&opts.embedDisabled,
		"embed-disabled",
		opts.embedDisabled,
		"disable vector embeddings entirely",
	)
	cmd.Flags().BoolVar(&opts.printVersion, "version", false, "print version information and exit")

	cmd.AddCommand(newConfigCmd(opts, cfgPath))
	cmd.AddCommand(newSystemdCmd())
	cmd.AddCommand(daemonStatusCmd)
	cmd.AddCommand(daemonReloadRulesCmd)
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

// setupLogging configures the default slog handler.
func setupLogging(format, level string) error {
	var lvl slog.Level
	if err := lvl.UnmarshalText([]byte(level)); err != nil {
		return fmt.Errorf("invalid log level %q: %w", level, err)
	}

	opts := &slog.HandlerOptions{Level: lvl}
	var h slog.Handler
	switch format {
	case outputFormatJSON:
		h = slog.NewJSONHandler(os.Stderr, opts)
	case outputFormatText, outputFormatHuman:
		h = slog.NewTextHandler(os.Stderr, opts)
	default:
		return fmt.Errorf("invalid log format %q: want text or json", format)
	}
	slog.SetDefault(slog.New(h))
	return nil
}

// defaultFuseMountPath returns the default FUSE mount point for the current user.
func defaultFuseMountPath() string {
	if dir := os.Getenv("XDG_RUNTIME_DIR"); dir != "" {
		return filepath.Join(dir, "tilbo", "tags")
	}
	return fmt.Sprintf("/run/user/%d/tilbo/tags", os.Getuid())
}

// defaultWatchPath returns the path to watch when none is specified.
// Defaults to the user's home directory.
func defaultWatchPath() string {
	if h, err := os.UserHomeDir(); err == nil {
		return h
	}
	return "/"
}

// defaultDBPath returns the default SQLite database path for the current user.
func defaultDBPath() string {
	if dir := os.Getenv("XDG_STATE_HOME"); dir != "" {
		return filepath.Join(dir, "tilbo", "index.db")
	}
	if h, err := os.UserHomeDir(); err == nil {
		return filepath.Join(h, ".local", "state", "tilbo", "index.db")
	}
	return "tilbo-index.db"
}
