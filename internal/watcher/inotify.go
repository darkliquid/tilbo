//go:build linux

package watcher

import (
	"bytes"
	"context"
	"fmt"
	"log/slog"
	"os"
	"path/filepath"
	"sync"
	"time"
	"unsafe"

	"golang.org/x/sys/unix"
)

// inotifyEventBaseSize is the fixed-header size of a single inotify event
// (Wd + Mask + Cookie + Len fields; the variable-length Name follows).
var inotifyEventBaseSize = int(unsafe.Sizeof(unix.InotifyEvent{}))

const inotifyMask = unix.IN_CREATE | unix.IN_CLOSE_WRITE | unix.IN_MODIFY |
	unix.IN_DELETE | unix.IN_MOVED_FROM | unix.IN_MOVED_TO

// inotifyImpl is an inotify-based fallback used when fanotify is unavailable.
// It watches directories recursively, adding new watches as subdirectories are
// created at runtime.
type inotifyImpl struct {
	fd      int
	mu      sync.Mutex
	wdToDir map[int32]string // watch descriptor → absolute directory path
	out     chan Event

	pendMu  sync.Mutex
	pending map[string]*debounceEntry
}

// newInotify creates an inotify watcher rooted at mountPath.
func newInotify(ctx context.Context, mountPath string) (*inotifyImpl, error) {
	fd, err := unix.InotifyInit1(unix.IN_CLOEXEC | unix.IN_NONBLOCK)
	if err != nil {
		return nil, fmt.Errorf("inotify_init: %w", err)
	}

	impl := &inotifyImpl{
		fd:      fd,
		wdToDir: make(map[int32]string),
		out:     make(chan Event, outChanBuf),
		pending: make(map[string]*debounceEntry),
	}

	if err := impl.addWatchRecursive(mountPath); err != nil {
		unix.Close(fd)
		return nil, err
	}

	slog.InfoContext(ctx, "watcher: using inotify fallback", "root", mountPath)
	return impl, nil
}

// addWatch registers dir with inotify. Missing or non-directory paths are
// silently ignored so that a race between creation and watch-add is safe.
func (i *inotifyImpl) addWatch(dir string) error {
	wd, err := unix.InotifyAddWatch(i.fd, dir, inotifyMask)
	if err != nil {
		if err == unix.ENOTDIR || err == unix.ENOENT {
			return nil
		}
		return fmt.Errorf("inotify_add_watch %q: %w", dir, err)
	}
	i.mu.Lock()
	i.wdToDir[int32(wd)] = dir
	i.mu.Unlock()
	return nil
}

// addWatchRecursive walks root and calls addWatch on every directory found.
func (i *inotifyImpl) addWatchRecursive(root string) error {
	return filepath.WalkDir(root, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return nil // skip unreadable entries; don't abort the walk
		}
		if d.IsDir() {
			return i.addWatch(path)
		}
		return nil
	})
}

// run is the event loop. It blocks until ctx is cancelled.
func (i *inotifyImpl) run(ctx context.Context) error {
	defer unix.Close(i.fd)
	defer close(i.out)

	piper, pipew, err := os.Pipe()
	if err != nil {
		return fmt.Errorf("inotify: pipe: %w", err)
	}
	defer piper.Close()
	defer pipew.Close()

	go func() {
		<-ctx.Done()
		pipew.Close()
	}()

	pollfds := []unix.PollFd{
		{Fd: int32(i.fd), Events: unix.POLLIN},
		{Fd: int32(piper.Fd()), Events: unix.POLLIN},
	}
	buf := make([]byte, fanBufSize)

	for {
		n, err := unix.Poll(pollfds, -1)
		if err != nil {
			if err == unix.EINTR {
				continue
			}
			return fmt.Errorf("inotify: poll: %w", err)
		}
		if n == 0 {
			continue
		}
		if pollfds[1].Revents&(unix.POLLIN|unix.POLLHUP) != 0 {
			return ctx.Err()
		}
		if pollfds[0].Revents&unix.POLLIN == 0 {
			continue
		}

		nb, err := unix.Read(i.fd, buf)
		if err != nil {
			if err == unix.EAGAIN || err == unix.EWOULDBLOCK {
				continue
			}
			return fmt.Errorf("inotify: read: %w", err)
		}

		i.processEvents(ctx, buf[:nb])
	}
}

// processEvents parses a raw inotify read buffer and dispatches events.
func (i *inotifyImpl) processEvents(ctx context.Context, buf []byte) {
	for offset := 0; offset+inotifyEventBaseSize <= len(buf); {
		ev := (*unix.InotifyEvent)(unsafe.Pointer(&buf[offset]))
		nameLen := int(ev.Len)

		var name string
		nameStart := offset + inotifyEventBaseSize
		if nameLen > 0 && nameStart+nameLen <= len(buf) {
			raw := buf[nameStart : nameStart+nameLen]
			if end := bytes.IndexByte(raw, 0); end >= 0 {
				name = string(raw[:end])
			} else {
				name = string(raw)
			}
		}
		offset += inotifyEventBaseSize + nameLen

		i.mu.Lock()
		dir, ok := i.wdToDir[ev.Wd]
		i.mu.Unlock()
		if !ok {
			continue
		}

		path := dir
		if name != "" {
			path = dir + "/" + name
		}

		mask := ev.Mask

		// Recursively watch newly created subdirectories.
		if mask&unix.IN_CREATE != 0 && mask&unix.IN_ISDIR != 0 {
			if err := i.addWatchRecursive(path); err != nil {
				slog.DebugContext(ctx, "inotify: failed to watch new dir",
					"path", path, "err", err)
			}
		}

		// Map inotify mask to Event; skip directory events and unhandled masks.
		if mask&unix.IN_ISDIR != 0 {
			continue
		}
		var event Event
		event.Path = path
		switch {
		case mask&unix.IN_CREATE != 0:
			event.Kind = EventCreate
		case mask&unix.IN_CLOSE_WRITE != 0:
			event.Kind = EventModify
		case mask&unix.IN_MODIFY != 0:
			event.Kind = EventModify
		case mask&unix.IN_DELETE != 0:
			event.Kind = EventDelete
		case mask&unix.IN_MOVED_FROM != 0:
			event.Kind = EventDelete
		case mask&unix.IN_MOVED_TO != 0:
			event.Kind = EventCreate
		default:
			continue
		}
		i.debounce(event)
	}
}

// debounce coalesces rapid events for the same path, identical in logic to
// Watcher.debounce but operating on inotifyImpl's own pending map.
func (i *inotifyImpl) debounce(ev Event) {
	i.pendMu.Lock()
	defer i.pendMu.Unlock()

	key := ev.Path
	if old, ok := i.pending[key]; ok {
		old.timer.Stop()
	}

	entry := &debounceEntry{ev: ev}
	entry.timer = time.AfterFunc(debounceDelay, func() {
		i.pendMu.Lock()
		cur, ok := i.pending[key]
		if !ok || cur != entry {
			i.pendMu.Unlock()
			return
		}
		out := entry.ev
		delete(i.pending, key)
		i.pendMu.Unlock()

		select {
		case i.out <- out:
		default:
		}
	})
	i.pending[key] = entry
}
