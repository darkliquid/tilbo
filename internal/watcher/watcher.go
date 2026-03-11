// Package watcher monitors a filesystem mount for changes using fanotify.
//
// On kernels older than 5.17, FAN_RENAME is unavailable; in that case a
// warning is logged and renames are reported as separate delete + create
// events instead of a single EventRename.
//
//go:build linux

package watcher

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"os"
	"strings"
	"sync"
	"time"
	"unsafe"

	"golang.org/x/sys/unix"
)

// Backend selects the filesystem-event notification mechanism.
type Backend string

const (
	// BackendAuto detects the best available backend at runtime,
	// preferring fanotify and falling back to inotify.
	BackendAuto Backend = "auto"
	// BackendFanotify forces fanotify; New returns an error if unavailable.
	BackendFanotify Backend = "fanotify"
	// BackendInotify forces the inotify-based recursive directory watcher.
	BackendInotify Backend = "inotify"
)

// EventKind identifies the type of filesystem change.
type EventKind uint

const (
	// EventCreate is emitted when a file or directory is created.
	EventCreate EventKind = iota + 1
	// EventModify is emitted when a file's content changes.
	EventModify
	// EventDelete is emitted when a file or directory is removed.
	EventDelete
	// EventRename is emitted when a file or directory is renamed.
	// OldPath holds the previous path; Path holds the new path.
	// Only emitted on kernels ≥ 5.17; older kernels emit EventDelete + EventCreate.
	EventRename
)

// Event describes a single filesystem change emitted by a Watcher.
type Event struct {
	// Path is the absolute path of the affected file or directory.
	Path string
	// OldPath is the previous absolute path; set only for EventRename.
	OldPath string
	// Kind is the type of change.
	Kind EventKind
}

const (
	// fanBufSize is the read buffer size for a single fanotify read call.
	fanBufSize = 4096 * 16

	// debounceDelay is the quiet period before emitting a debounced event.
	debounceDelay = 200 * time.Millisecond

	// outChanBuf is the Events channel capacity.
	outChanBuf = 512
)

// fanotifyMetaVersion matches FANOTIFY_METADATA_VERSION in linux/fanotify.h.
const fanotifyMetaVersion uint8 = 3

// fanMetaSize is the byte size of FanotifyEventMetadata.
const fanMetaSize = int(unsafe.Sizeof(unix.FanotifyEventMetadata{}))

// Watcher watches a filesystem mount point for changes using fanotify.
// If fanotify is unavailable (e.g. in rootless containers), it falls back
// transparently to an inotify-based recursive directory watcher.
type Watcher struct {
	mountPath string
	fanfd     int
	fanRename bool // true when FAN_RENAME is in use (kernel ≥ 5.17)
	inotify   *inotifyImpl // non-nil when using the inotify fallback
	out       chan Event

	mu      sync.Mutex
	pending map[string]*debounceEntry

	watchHidden bool
}

type debounceEntry struct {
	ev    Event
	timer *time.Timer
}

// Options configure the behavior of the Watcher.
type Options struct {
	WatchHidden bool // If true, hidden files and directories (starting with '.') are monitored.
}

// New creates a Watcher for the given mount point using the specified backend and options.
// Pass BackendAuto to prefer fanotify and fall back to inotify automatically.
// Call Run to start delivering events.
func New(ctx context.Context, mountPath string, backend Backend, opts Options) (*Watcher, error) {
	// When inotify is forced, skip fanotify entirely.
	if backend == BackendInotify {
		slog.InfoContext(ctx, "watcher: using inotify backend (forced)")
		impl, err := newInotify(ctx, mountPath, opts.WatchHidden)
		if err != nil {
			return nil, fmt.Errorf("watcher: inotify: %w", err)
		}
		return &Watcher{
			mountPath:   mountPath,
			fanfd:       -1,
			inotify:     impl,
			pending:     make(map[string]*debounceEntry),
			watchHidden: opts.WatchHidden,
		}, nil
	}

	major, minor, err := kernelVersion()
	if err != nil {
		return nil, err
	}
	fanRename := major > 5 || (major == 5 && minor >= 17)
	if !fanRename {
		slog.WarnContext(ctx, "watcher: FAN_RENAME requires kernel ≥ 5.17; renames will appear as delete+create",
			"kernel_major", major, "kernel_minor", minor)
	}

	fanfd, err := unix.FanotifyInit(
		unix.FAN_CLASS_NOTIF|unix.FAN_CLOEXEC|unix.FAN_NONBLOCK,
		unix.O_RDONLY|unix.O_CLOEXEC|unix.O_LARGEFILE,
	)
	if err != nil {
		// fanotify requires CAP_SYS_ADMIN in the initial user namespace.
		// Rootless containers only hold it in a child namespace, so
		// fanotify_init returns EPERM. In auto mode, fall back to inotify.
		// In fanotify mode, return the error so the caller knows.
		if (errors.Is(err, unix.EPERM) || errors.Is(err, unix.ENOSYS)) && backend == BackendAuto {
			slog.WarnContext(ctx, "watcher: fanotify unavailable; falling back to inotify",
				"err", err)
			impl, iErr := newInotify(ctx, mountPath, opts.WatchHidden)
			if iErr != nil {
				return nil, fmt.Errorf("watcher: inotify fallback: %w", iErr)
			}
			return &Watcher{
				mountPath:   mountPath,
				fanfd:       -1,
				inotify:     impl,
				pending:     make(map[string]*debounceEntry),
				watchHidden: opts.WatchHidden,
			}, nil
		}
		return nil, fmt.Errorf("watcher: fanotify_init: %w", err)
	}

	mask := uint64(unix.FAN_CREATE | unix.FAN_MODIFY | unix.FAN_CLOSE_WRITE |
		unix.FAN_DELETE | unix.FAN_ONDIR)
	if fanRename {
		mask |= unix.FAN_RENAME
	} else {
		mask |= unix.FAN_MOVED_FROM | unix.FAN_MOVED_TO
	}

	if err := unix.FanotifyMark(fanfd,
		unix.FAN_MARK_ADD|unix.FAN_MARK_MOUNT,
		mask,
		unix.AT_FDCWD, mountPath,
	); err != nil {
		unix.Close(fanfd)
		return nil, fmt.Errorf("watcher: fanotify_mark %q: %w", mountPath, err)
	}

	return &Watcher{
		mountPath:   mountPath,
		fanfd:       fanfd,
		fanRename:   fanRename,
		out:         make(chan Event, outChanBuf),
		pending:     make(map[string]*debounceEntry),
		watchHidden: opts.WatchHidden,
	}, nil
}

// Events returns the channel on which debounced filesystem events are delivered.
// The channel is closed when Run returns.
func (w *Watcher) Events() <-chan Event {
	if w.inotify != nil {
		return w.inotify.out
	}
	return w.out
}

// Run reads filesystem events until ctx is cancelled.
// It closes the Events channel on return.
func (w *Watcher) Run(ctx context.Context) error {
	if w.inotify != nil {
		return w.inotify.run(ctx)
	}
	defer unix.Close(w.fanfd)
	defer close(w.out)

	// A pipe lets ctx cancellation unblock the poll call.
	piper, pipew, err := os.Pipe()
	if err != nil {
		return fmt.Errorf("watcher: pipe: %w", err)
	}
	defer piper.Close()
	defer pipew.Close()

	go func() {
		<-ctx.Done()
		pipew.Close()
	}()

	pollfds := []unix.PollFd{
		{Fd: int32(w.fanfd), Events: unix.POLLIN},
		{Fd: int32(piper.Fd()), Events: unix.POLLIN},
	}
	buf := make([]byte, fanBufSize)

	for {
		n, err := unix.Poll(pollfds, -1)
		if err != nil {
			if err == unix.EINTR {
				continue
			}
			return fmt.Errorf("watcher: poll: %w", err)
		}
		if n == 0 {
			continue
		}

		// Cancellation pipe closed or became readable.
		if pollfds[1].Revents&(unix.POLLIN|unix.POLLHUP) != 0 {
			return ctx.Err()
		}

		if pollfds[0].Revents&unix.POLLIN == 0 {
			continue
		}

		nb, err := unix.Read(w.fanfd, buf)
		if err != nil {
			if err == unix.EAGAIN || err == unix.EWOULDBLOCK {
				continue
			}
			return fmt.Errorf("watcher: read: %w", err)
		}

		w.processBuffer(ctx, buf[:nb])
	}
}

// processBuffer parses a raw fanotify read buffer and handles each event record.
func (w *Watcher) processBuffer(ctx context.Context, buf []byte) {
	for offset := 0; offset+fanMetaSize <= len(buf); {
		meta := (*unix.FanotifyEventMetadata)(unsafe.Pointer(&buf[offset]))
		if meta.Vers != fanotifyMetaVersion {
			slog.WarnContext(ctx, "watcher: unexpected fanotify metadata version",
				"got", meta.Vers, "want", fanotifyMetaVersion)
			return
		}
		eventLen := int(meta.Event_len)
		if eventLen < fanMetaSize || offset+eventLen > len(buf) {
			return
		}
		w.handleMeta(ctx, meta)
		offset += eventLen
	}
}

// handleMeta processes a single fanotify event metadata record.
func (w *Watcher) handleMeta(ctx context.Context, meta *unix.FanotifyEventMetadata) {
	if meta.Mask&unix.FAN_Q_OVERFLOW != 0 {
		slog.WarnContext(ctx, "watcher: fanotify queue overflow; some events were lost")
		return
	}

	if meta.Fd < 0 {
		return // FAN_NOFD; shouldn't happen for FAN_CLASS_NOTIF events
	}
	fd := int(meta.Fd)

	// Resolve path before closing the fd — the kernel keeps a reference.
	path, err := os.Readlink(fmt.Sprintf("/proc/self/fd/%d", fd))
	unix.Close(fd)
	if err != nil {
		slog.DebugContext(ctx, "watcher: proc fd readlink failed", "err", err)
		return
	}

	var ev Event
	ev.Path = path

	if !w.watchHidden && strings.Contains(path, "/.") {
		return // Ignore hidden files/directories
	}

	switch {
	case meta.Mask&unix.FAN_RENAME != 0:
		// OldPath is not available without FAN_REPORT_DFID_NAME parsing.
		ev.Kind = EventRename
	case meta.Mask&unix.FAN_MOVED_FROM != 0:
		// Pre-5.17 rename source: the file has left this path.
		ev.Kind = EventDelete
	case meta.Mask&unix.FAN_MOVED_TO != 0:
		// Pre-5.17 rename destination: a file has arrived at this path.
		ev.Kind = EventCreate
	case meta.Mask&unix.FAN_CREATE != 0:
		ev.Kind = EventCreate
	case meta.Mask&unix.FAN_CLOSE_WRITE != 0:
		ev.Kind = EventModify
	case meta.Mask&unix.FAN_MODIFY != 0:
		ev.Kind = EventModify
	case meta.Mask&unix.FAN_DELETE != 0:
		ev.Kind = EventDelete
	default:
		return
	}

	w.debounce(ev)
}

// debounce coalesces rapid events for the same path into a single emission
// after debounceDelay of quiet time. Each call to debounce for an already-pending
// path replaces the stored event and resets the timer.
func (w *Watcher) debounce(ev Event) {
	w.mu.Lock()
	defer w.mu.Unlock()

	key := ev.Path
	if old, ok := w.pending[key]; ok {
		old.timer.Stop()
	}

	entry := &debounceEntry{ev: ev}
	entry.timer = time.AfterFunc(debounceDelay, func() {
		w.mu.Lock()
		cur, ok := w.pending[key]
		if !ok || cur != entry {
			// A newer event superseded this one.
			w.mu.Unlock()
			return
		}
		out := entry.ev
		delete(w.pending, key)
		w.mu.Unlock()

		select {
		case w.out <- out:
		default:
			// Channel full; drop. The startup xattr→index sync will catch missed events.
		}
	})
	w.pending[key] = entry
}

// kernelVersion returns the running kernel's major and minor version numbers.
func kernelVersion() (major, minor int, err error) {
	var uts unix.Utsname
	if err = unix.Uname(&uts); err != nil {
		return 0, 0, fmt.Errorf("watcher: uname: %w", err)
	}
	release := unix.ByteSliceToString(uts.Release[:])
	if _, err = fmt.Sscanf(release, "%d.%d", &major, &minor); err != nil {
		return 0, 0, fmt.Errorf("watcher: parse kernel version %q: %w", release, err)
	}
	return
}
