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

// Server wraps the FUSE mount server and manages its lifecycle.
type Server struct {
	server *gofuse.Server
	root   *Root
	mnt    string
}

// Mount mounts the tilbo virtual filesystem at mountPoint.
// The returned Server must be stopped via Unmount.
func Mount(ctx context.Context, mountPoint string, idx *index.DB, g *graph.Graph) (*Server, error) {
	if err := os.MkdirAll(mountPoint, 0o755); err != nil {
		return nil, fmt.Errorf("fuse: create mount point %s: %w", mountPoint, err)
	}

	// Pre-check /dev/fuse access. Without it the kernel mount call blocks
	// silently and only times out seconds later.
	if f, err := os.OpenFile("/dev/fuse", os.O_RDWR, 0); err != nil {
		return nil, fmt.Errorf("fuse: /dev/fuse not accessible (add user to 'fuse' group or install fuse package): %w", err)
	} else {
		f.Close()
	}
	slog.DebugContext(ctx, "fuse: /dev/fuse accessible, attempting mount", "path", mountPoint)

	root := NewRoot(idx, g)

	cacheTTLDir := 2 * time.Second
	cacheTTLAttr := 30 * time.Second

	fuseOpts := &fs.Options{
		MountOptions: gofuse.MountOptions{
			AllowOther:    false,
			Debug:         false,
			FsName:        "tilbo",
			Name:          "tilbo",
			DirectMount:   false,
			Options:       []string{"auto_unmount", "default_permissions"},
		},
		EntryTimeout: &cacheTTLDir,
		AttrTimeout:  &cacheTTLAttr,
	}

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
