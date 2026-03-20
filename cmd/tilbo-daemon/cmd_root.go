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
	"github.com/darkliquid/tilbo/internal/watcher"
)

// daemonOptions holds all runtime configuration flags for tilbo-daemon.
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

// newRootCmd builds the top-level cobra command for tilbo-daemon. It loads the
// config file eagerly so that config values can serve as flag defaults. If the
// config file is missing or malformed, the error is deferred — the daemon will
// still start with built-in defaults and log a warning at startup.
func newRootCmd() *cobra.Command {
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
		logFormat:      orDefault(cfg.Daemon.LogFormat, "text"),
		logLevel:       orDefault(cfg.Daemon.LogLevel, "info"),
		watcherBackend: orDefault(cfg.Daemon.Watcher, "auto"),
		watchHidden:    cfg.Daemon.WatchHidden,
		embedModel:     cfg.Daemon.EmbedModel,
		embedModelName: cfg.Daemon.EmbedModelName,
		embedDisabled:  cfg.Daemon.EmbedDisabled,
	}

	rootCmd := &cobra.Command{
		Use:   "tilbo-daemon",
		Short: "Tilbo daemon",
		Long:  "tilbo-daemon watches files, indexes tags/metadata, and serves IPC requests.",
		RunE: func(cmd *cobra.Command, _ []string) error {
			if opts.printVersion {
				fmt.Printf("tilbo-daemon %s (commit %s, built %s)\n", version, commit, buildDate)
				return nil
			}
			return runDaemon(cmd.Context(), cfgPath, cfgErr, opts)
		},
	}
	rootCmd.Version = version
	rootCmd.SetVersionTemplate(fmt.Sprintf("tilbo-daemon %s (commit %s, built %s)\n", version, commit, buildDate))

	rootCmd.Flags().StringVar(&opts.watchPath, "watch", opts.watchPath, "filesystem path to watch")
	rootCmd.Flags().StringVar(&opts.dbPath, "db", opts.dbPath, "path to the SQLite index database")
	rootCmd.Flags().StringVar(
		&opts.fuseMount,
		"fuse-mount",
		opts.fuseMount,
		"FUSE virtual filesystem mount point (empty to disable)",
	)
	rootCmd.Flags().StringVar(&opts.socketOverride, "socket", opts.socketOverride, "override default Unix socket path")
	rootCmd.Flags().StringVar(&opts.logFormat, "log-format", opts.logFormat, "log format: text or json")
	rootCmd.Flags().StringVar(&opts.logLevel, "log-level", opts.logLevel, "log level: debug, info, warn, error")
	rootCmd.Flags().StringVar(
		&opts.watcherBackend,
		"watcher",
		opts.watcherBackend,
		"filesystem watcher backend: auto, fanotify, inotify",
	)
	rootCmd.Flags().BoolVar(&opts.watchHidden, "watch-hidden", opts.watchHidden, "watch hidden files and directories")
	rootCmd.Flags().StringVar(
		&opts.embedModel,
		"embed-model",
		opts.embedModel,
		"path to local ONNX tokenizer/model directory for embeddings (overrides auto-download)",
	)
	rootCmd.Flags().StringVar(
		&opts.embedModelName,
		"embed-model-name",
		opts.embedModelName,
		"HuggingFace model name to auto-download when embed-model is unset (default: sentence-transformers/all-MiniLM-L6-v2)",
	)
	rootCmd.Flags().BoolVar(
		&opts.embedDisabled,
		"embed-disabled",
		opts.embedDisabled,
		"disable vector embeddings entirely",
	)
	rootCmd.Flags().BoolVar(&opts.printVersion, "version", false, "print version information and exit")

	rootCmd.AddCommand(newConfigCmd(opts, cfgPath))
	rootCmd.AddCommand(newCompletionCmd())
	rootCmd.AddCommand(newSystemdCmd())

	return rootCmd
}

// runDaemon is the main entry point after CLI flag parsing. It configures logging,
// sets up signal handling for graceful shutdown (SIGTERM/SIGINT) and config reload
// (SIGHUP), then delegates to the run() function which owns the daemon lifecycle.
func runDaemon(ctx context.Context, cfgPath string, cfgErr error, opts *daemonOptions) error {
	// Fall back to the XDG runtime directory socket if no explicit override was given.
	sockPath := opts.socketOverride
	if sockPath == "" {
		sockPath = socketPath()
	}

	if err := setupLogging(opts.logFormat, opts.logLevel); err != nil {
		return fmt.Errorf("tilbo-daemon: bad log flags: %w", err)
	}

	// Report any config load error as a warning rather than a hard failure,
	// because the daemon can operate entirely on defaults and CLI flags.
	if cfgErr != nil {
		slog.WarnContext(ctx, "tilbo-daemon: config load error; using defaults", "path", cfgPath, "err", cfgErr)
	}

	slog.InfoContext(ctx, "tilbo-daemon starting",
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

	if err := run(
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

	slog.InfoContext(ctx, "tilbo-daemon stopped")
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
		RunE: func(_ *cobra.Command, _ []string) error {
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

// newCompletionCmd creates the "completion" subcommand that outputs shell
// completion scripts for bash, zsh, fish, and powershell. Users typically
// pipe the output into their shell's completion directory (e.g.,
// "tilbo-daemon completion fish > ~/.config/fish/completions/tilbo-daemon.fish").
func newCompletionCmd() *cobra.Command {
	return &cobra.Command{
		Use:       "completion [bash|zsh|fish|powershell]",
		Short:     "Generate shell completion scripts",
		Args:      cobra.ExactArgs(1),
		ValidArgs: []string{"bash", "zsh", "fish", "powershell"},
		RunE: func(cmd *cobra.Command, args []string) error {
			switch args[0] {
			case "bash":
				return cmd.Root().GenBashCompletionV2(os.Stdout, true)
			case "zsh":
				return cmd.Root().GenZshCompletion(os.Stdout)
			case "fish":
				return cmd.Root().GenFishCompletion(os.Stdout, true)
			case "powershell":
				return cmd.Root().GenPowerShellCompletionWithDesc(os.Stdout)
			default:
				return fmt.Errorf("unsupported shell %q", args[0])
			}
		},
	}
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
		Short: "Install user-mode systemd service and socket for tilbo-daemon",
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
		"ExecStart=" + shellQuote(exePath) + "\n" +
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
