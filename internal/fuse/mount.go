package fuse

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"time"

	"github.com/hanwen/go-fuse/v2/fs"
	gofuse "github.com/hanwen/go-fuse/v2/fuse"

	"github.com/darkliquid/tilbo/internal/graph"
	"github.com/darkliquid/tilbo/internal/index"
)

const (
	defaultCacheTTLDir  = 2 * time.Second
	defaultCacheTTLAttr = 30 * time.Second
)

// Server wraps the FUSE mount server and manages its lifecycle.
type Server struct {
	server *gofuse.Server
	root   *Root
	mnt    string
}

// Mount mounts the tilbo virtual filesystem at mountPoint.
// The returned Server must be stopped via Unmount.
func Mount(ctx context.Context, mountPoint string, idx *index.DB, g *graph.Graph) (*Server, error) {
	if err := os.MkdirAll(mountPoint, 0o750); err != nil {
		return nil, fmt.Errorf("fuse: create mount point %s: %w", mountPoint, err)
	}

	// Pre-check /dev/fuse access. Without it the kernel mount call blocks
	// silently and only times out seconds later.
	f, err := os.OpenFile("/dev/fuse", os.O_RDWR, 0)
	if err != nil {
		return nil, fmt.Errorf(
			"fuse: /dev/fuse not accessible (add user to 'fuse' group or install fuse package): %w",
			err,
		)
	}
	_ = f.Close()

	// Enable go-fuse internal debug output when slog is at debug level.
	// This logs the fusermount3 command and FUSE init exchange.
	// Logger is left nil so go-fuse uses log.Default() internally; the
	// depguard rule forbids importing "log" directly in non-main packages.
	fuseDebug := slog.Default().Handler().Enabled(ctx, slog.LevelDebug)

	root := NewRoot(idx, g)

	cacheTTLDir := defaultCacheTTLDir
	cacheTTLAttr := defaultCacheTTLAttr

	fuseOpts := &fs.Options{
		MountOptions: gofuse.MountOptions{
			AllowOther: false,
			Debug:      fuseDebug,
			FsName:     "tilbo",
			Name:       "tilbo",
			// DirectMount=true tries a direct syscall first (no fusermount3
			// dependency), then falls back to fusermount3 if permission is denied.
			DirectMount: true,
			// default_permissions lets the kernel enforce permission checks from
			// file attributes rather than deferring everything to the daemon.
			// auto_unmount is intentionally omitted: the daemon handles unmount
			// via Unmount() on ctx.Done(), so we don't need fusermount3 to stay
			// alive monitoring us.
			Options: []string{"default_permissions"},
		},
		EntryTimeout: &cacheTTLDir,
		AttrTimeout:  &cacheTTLAttr,
	}

	slog.DebugContext(ctx, "fuse: calling fs.Mount", "path", mountPoint, "directMount", true, "debug", fuseDebug)
	srv, err := fs.Mount(mountPoint, root, fuseOpts)
	if err != nil {
		return nil, fmt.Errorf("fuse: mount %s: %w", mountPoint, err)
	}

	slog.InfoContext(ctx, "fuse: mounted", "path", mountPoint)

	return &Server{
		server: srv,
		root:   root,
		mnt:    mountPoint,
	}, nil
}

// Unmount unmounts the FUSE filesystem and waits for the server to exit.
func (s *Server) Unmount() error {
	if err := s.server.Unmount(); err != nil {
		return fmt.Errorf("fuse: unmount %s: %w", s.mnt, err)
	}
	s.server.Wait()
	slog.Info("fuse: unmounted", "path", s.mnt)
	return nil
}

// Wait blocks until the FUSE server exits (e.g., after kernel unmount).
func (s *Server) Wait() {
	s.server.Wait()
}
