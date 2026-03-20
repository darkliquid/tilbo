package extension

import (
	"context"
	"encoding/json"
	"log/slog"
	"os"
	"path/filepath"
	"slices"
	"strings"
	"sync"
	"time"

	"github.com/BurntSushi/toml"
)

// BadgeInput is the JSON sent to badge hook extensions.
type BadgeInput struct {
	Path     string            `json:"path"`
	Mime     string            `json:"mime"`
	Metadata map[string]string `json:"metadata"`
}

// BadgeOutput is the JSON returned by badge hook extensions.
type BadgeOutput struct {
	Badges []string `json:"badges"`
}

// ActionInput is the JSON sent to menu_action hook extensions.
type ActionInput struct {
	Path  string `json:"path"`
	IsDir bool   `json:"is_dir"`
}

// ExtAction is a context menu action returned by an extension.
type ExtAction struct {
	ID      string   `json:"id"`
	Label   string   `json:"label"`
	Command []string `json:"command"`
}

// ActionOutput is the JSON returned by menu_action hook extensions.
type ActionOutput struct {
	Actions []ExtAction `json:"actions"`
}

// Extension is the interface all extensions must implement.
type Extension interface {
	Name() string
	Hooks() []string
	BadgesFor(ctx context.Context, path, mime string, meta map[string]string) ([]string, error)
	ActionsFor(ctx context.Context, path string, isDir bool) ([]ExtAction, error)
}

// ExtensionConfig is the TOML configuration for an extension.
//
//nolint:revive // keep name for clarity
type ExtensionConfig struct {
	Name      string   `toml:"name"`
	Hooks     []string `toml:"hooks"`
	Command   []string `toml:"command"`
	TimeoutMS int      `toml:"timeout_ms"`
}

// Registry manages loaded extensions.
type Registry struct {
	mu         sync.RWMutex
	extensions []Extension
}

// NewRegistry creates an empty Registry.
func NewRegistry() *Registry {
	return &Registry{}
}

// DefaultDirs returns the directories to scan for extension TOML files.
func DefaultDirs() []string {
	var dirs []string
	if cfg, err := os.UserConfigDir(); err == nil {
		dirs = append(dirs, filepath.Join(cfg, "tilbo", "extensions"))
	}
	dirs = append(dirs, "/etc/tilbo/extensions")
	return dirs
}

// Load scans dirs for *.toml extension definitions and registers them.
func (r *Registry) Load(ctx context.Context, dirs []string) error {
	for _, dir := range dirs {
		entries, err := os.ReadDir(dir)
		if os.IsNotExist(err) {
			continue
		}
		if err != nil {
			slog.WarnContext(ctx, "extension: read dir", "dir", dir, "err", err)
			continue
		}
		for _, e := range entries {
			if e.IsDir() || !strings.HasSuffix(e.Name(), ".toml") {
				continue
			}
			path := filepath.Join(dir, e.Name())
			var cfg ExtensionConfig
			if _, err := toml.DecodeFile(path, &cfg); err != nil {
				slog.WarnContext(ctx, "extension: parse config", "path", path, "err", err)
				continue
			}
			if len(cfg.Command) == 0 {
				slog.WarnContext(ctx, "extension: no command", "path", path)
				continue
			}
			timeoutMS := cfg.TimeoutMS
			if timeoutMS <= 0 {
				timeoutMS = 500
			}
			ext := &subprocessExtension{
				name:      cfg.Name,
				hooks:     cfg.Hooks,
				command:   cfg.Command,
				timeoutMS: timeoutMS,
			}
			r.mu.Lock()
			r.extensions = append(r.extensions, ext)
			r.mu.Unlock()
			slog.InfoContext(ctx, "extension: loaded", "name", cfg.Name)
		}
	}
	return nil
}

// BadgesFor fans out to all badge extensions concurrently and merges results.
func (r *Registry) BadgesFor(ctx context.Context, path, mime string, meta map[string]string) []string {
	r.mu.RLock()
	exts := append([]Extension(nil), r.extensions...)
	r.mu.RUnlock()

	type result struct {
		badges []string
	}
	ch := make(chan result, len(exts))

	for _, ext := range exts {
		hasHook := slices.Contains(ext.Hooks(), "badge")
		if !hasHook {
			continue
		}
		go func(e Extension) {
			badges, err := e.BadgesFor(ctx, path, mime, meta)
			if err != nil {
				slog.DebugContext(ctx, "extension badge error", "ext", e.Name(), "err", err)
				ch <- result{}
				return
			}
			ch <- result{badges: badges}
		}(ext)
	}

	seen := make(map[string]bool)
	var all []string
	for _, ext := range exts {
		if slices.Contains(ext.Hooks(), "badge") {
			res := <-ch
			for _, b := range res.badges {
				if !seen[b] {
					seen[b] = true
					all = append(all, b)
				}
			}
		}
	}
	return all
}

// ActionsFor fans out to all menu_action extensions and merges results.
func (r *Registry) ActionsFor(ctx context.Context, path string, isDir bool) []ExtAction {
	r.mu.RLock()
	exts := append([]Extension(nil), r.extensions...)
	r.mu.RUnlock()

	var all []ExtAction
	for _, ext := range exts {
		for _, h := range ext.Hooks() {
			if h == "menu_action" {
				actions, err := ext.ActionsFor(ctx, path, isDir)
				if err != nil {
					slog.DebugContext(ctx, "extension action error", "ext", ext.Name(), "err", err)
					continue
				}
				all = append(all, actions...)
				break
			}
		}
	}
	return all
}

// RunAction executes a specific action by ID for the given path.
func (r *Registry) RunAction(ctx context.Context, path, actionID string) error {
	// Get all actions for this path, find the one with matching ID, run its command
	exts := r.ActionsFor(ctx, path, false)
	for _, a := range exts {
		if a.ID == actionID {
			return runActionCommand(ctx, a.Command, path)
		}
	}
	return nil
}

func runActionCommand(ctx context.Context, command []string, path string) error {
	if len(command) == 0 {
		return nil
	}
	args := make([]string, len(command))
	for i, arg := range command {
		args[i] = strings.ReplaceAll(arg, "{path}", path)
	}

	cmd := newExecCommand(ctx, args[0], args[1:]...)
	cmd.Stdin = nil
	return cmd.Start()
}

// subprocessExtension runs an external process to get badges/actions.
type subprocessExtension struct {
	name      string
	hooks     []string
	command   []string
	timeoutMS int
}

func (e *subprocessExtension) Name() string    { return e.name }
func (e *subprocessExtension) Hooks() []string { return e.hooks }

func (e *subprocessExtension) BadgesFor(
	ctx context.Context,
	path, mime string,
	meta map[string]string,
) ([]string, error) {
	if len(e.command) == 0 {
		return nil, nil
	}
	input := BadgeInput{Path: path, Mime: mime, Metadata: meta}
	inJSON, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}

	timeout := time.Duration(e.timeoutMS) * time.Millisecond
	runCtx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	cmd := newExecCommand(runCtx, e.command[0], e.command[1:]...)
	cmd.Stdin = strings.NewReader(string(inJSON))
	out, err := cmd.Output()
	if err != nil {
		return nil, nil // non-zero exit = no contribution
	}

	var output BadgeOutput
	if err := json.Unmarshal(out, &output); err != nil {
		return nil, err
	}
	return output.Badges, nil
}

func (e *subprocessExtension) ActionsFor(ctx context.Context, path string, isDir bool) ([]ExtAction, error) {
	if len(e.command) == 0 {
		return nil, nil
	}
	input := ActionInput{Path: path, IsDir: isDir}
	inJSON, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}

	timeout := time.Duration(e.timeoutMS) * time.Millisecond
	runCtx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	cmd := newExecCommand(runCtx, e.command[0], e.command[1:]...)
	cmd.Stdin = strings.NewReader(string(inJSON))
	out, err := cmd.Output()
	if err != nil {
		return nil, nil
	}

	var output ActionOutput
	if err := json.Unmarshal(out, &output); err != nil {
		return nil, err
	}
	return output.Actions, nil
}
