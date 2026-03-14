package helpers

import (
	"context"
	"strings"
	"testing"
)

// Caps describes which privileged capabilities are available in the test
// environment. It is populated by Probe after the primary daemon starts.
type Caps struct {
	// Fanotify is true when the daemon successfully initialised fanotify
	// (i.e. it did NOT fall back to inotify due to missing capabilities).
	Fanotify bool

	// Fuse is true when the daemon successfully mounted its FUSE filesystem
	// (i.e. the mount did not fail or time out).
	Fuse bool

	// UserXattr is true when the primary watch filesystem supports user.*
	// extended attributes (required for xattr-backed tag storage).
	UserXattr bool
}

// Probe detects available capabilities from the running daemon's log output
// and a direct filesystem probe.
//
//   - daemonLog is the container-side path to the daemon's log file.
//   - watchMount is the mount used by the primary daemon; its filesystem is
//     probed for user.* xattr support.
func Probe(ctx context.Context, s *Suite, daemonLog string, watchMount *Mount) Caps {
	log := s.DaemonLog(ctx, daemonLog)
	// Detect explicit inotify selection and runtime fallback messages.
	fanotify := !strings.Contains(log, "using inotify backend (forced)") &&
		!strings.Contains(log, "fanotify unavailable; using inotify fallback") &&
		!strings.Contains(log, "inotify fallback active")
	// The daemon logs "fuse: mounted" on success; absence means failure/timeout.
	fuse := strings.Contains(log, "fuse: mounted")

	hasXattr, _ := watchMount.HasXattr(ctx)

	return Caps{
		Fanotify:  fanotify,
		Fuse:      fuse,
		UserXattr: hasXattr,
	}
}

// RequireFanotify skips t if fanotify is not available in this environment.
// Use this guard on tests that specifically exercise fanotify behaviour.
func (c Caps) RequireFanotify(t *testing.T) {
	t.Helper()
	if !c.Fanotify {
		t.Skip("skipping: fanotify unavailable in this environment (daemon using inotify fallback)")
	}
}

// RequireFuse skips t if the FUSE virtual filesystem was not successfully
// mounted by the primary daemon.
func (c Caps) RequireFuse(t *testing.T) {
	t.Helper()
	if !c.Fuse {
		t.Skip("skipping: FUSE unavailable in this environment (mount failed or timed out)")
	}
}

// RequireUserXattr skips t if the primary watch filesystem does not support
// user.* extended attributes.
func (c Caps) RequireUserXattr(t *testing.T) {
	t.Helper()
	if !c.UserXattr {
		t.Skip("skipping: user.* xattrs not supported on this filesystem")
	}
}
