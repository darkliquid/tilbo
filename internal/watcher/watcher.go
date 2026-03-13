//go:build linux

package watcher

import (
	"bytes"
	"context"
	"encoding/binary"
	"errors"
	"fmt"
	"log/slog"
	"math"
	"os"
	"path/filepath"
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
	// Currently not emitted by the fanotify backend: FAN_RENAME is incompatible
	// with FAN_MARK_MOUNT, so renames appear as EventDelete + EventCreate pairs.
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

	watcherShutdownWait = 2 * time.Second
	fanHandleHeaderSize = 8
	mountInfoMinFields  = 5
)

// fanotifyMetaVersion matches FANOTIFY_METADATA_VERSION in linux/fanotify.h.
const fanotifyMetaVersion uint8 = 3

// fanMetaSize is the byte size of FanotifyEventMetadata.
const fanMetaSize = int(unsafe.Sizeof(unix.FanotifyEventMetadata{}))

const (
	fanInfoHeaderSize = 4
	fanInfoFidMinSize = 12 // header(4) + fsid(8)
	inotifyHybridMask = unix.IN_CREATE | unix.IN_DELETE | unix.IN_MOVED_FROM | unix.IN_MOVED_TO
)

// Watcher watches a filesystem mount point for changes using fanotify.
// If fanotify is unavailable (e.g. in rootless containers), it falls back
// transparently to an inotify-based recursive directory watcher.
type Watcher struct {
	mountPath       string
	fanfd           int
	mountFD         int
	inotify         *inotifyImpl // non-nil when using the inotify fallback
	fallbackWarning string
	out             chan Event

	mu      sync.Mutex
	pending map[string]*debounceEntry

	watchHidden  bool
	excludePaths []string // absolute paths to skip entirely
}

type debounceEntry struct {
	ev    Event
	timer *time.Timer
}

// Options configure the behavior of the Watcher.
type Options struct {
	WatchHidden bool // If true, hidden files and directories (starting with '.') are monitored.
	// ExcludePaths is a list of absolute paths that the watcher will never
	// recurse into or emit events for. Use this to exclude mount points such
	// as the FUSE virtual filesystem that must not be indexed.
	ExcludePaths []string
}

// New creates a Watcher for the given mount point using the specified backend and options.
// Pass BackendAuto to prefer fanotify and fall back to inotify automatically.
// Call Run to start delivering events.
//
//nolint:funlen,gocognit // backend selection and capability fallback are centralized for startup correctness
func New(ctx context.Context, mountPath string, backend Backend, opts Options) (*Watcher, error) {
	watchRoot := filepath.Clean(mountPath)
	markPath := watchRoot
	if mp, err := mountPointForPath(watchRoot); err == nil {
		markPath = mp
	} else {
		slog.DebugContext(ctx, "watcher: unable to resolve mount point, using watch root as mark target",
			"watchRoot", watchRoot, "err", err)
	}

	// When inotify is forced, skip fanotify entirely.
	if backend == BackendInotify {
		slog.InfoContext(ctx, "watcher: using inotify backend (forced)")
		impl, err := newInotify(ctx, mountPath, opts.WatchHidden, opts.ExcludePaths)
		if err != nil {
			return nil, fmt.Errorf("watcher: inotify: %w", err)
		}
		return &Watcher{
			mountPath:       watchRoot,
			fanfd:           -1,
			mountFD:         -1,
			inotify:         impl,
			fallbackWarning: "",
			pending:         make(map[string]*debounceEntry),
			watchHidden:     opts.WatchHidden,
			excludePaths:    opts.ExcludePaths,
		}, nil
	}

	fallbackToInotify := func(reason, markType string, cause error) (*Watcher, error) {
		if backend != BackendAuto {
			if cause != nil {
				return nil, fmt.Errorf("watcher: %s: %w", reason, cause)
			}
			return nil, fmt.Errorf("watcher: %s", reason)
		}

		hint := fanotifyFailureHint(cause)

		slog.WarnContext(ctx, "watcher: fanotify unavailable; using inotify fallback",
			"path", watchRoot, "markPath", markPath, "reason", reason, "markType", markType, "err", cause, "hint", hint)
		impl, iErr := newInotify(ctx, watchRoot, opts.WatchHidden, opts.ExcludePaths)
		if iErr != nil {
			return nil, fmt.Errorf("watcher: inotify fallback: %w", iErr)
		}
		warn := "fanotify degraded: " + reason
		if markType != "" {
			warn = fmt.Sprintf("%s (%s)", warn, markType)
		}
		if cause != nil {
			warn = fmt.Sprintf("%s: %v", warn, cause)
		}
		if hint != "" {
			warn += "; " + hint
		}
		warn += "; inotify fallback active"

		return &Watcher{
			mountPath:       watchRoot,
			fanfd:           -1,
			mountFD:         -1,
			inotify:         impl,
			fallbackWarning: warn,
			pending:         make(map[string]*debounceEntry),
			watchHidden:     opts.WatchHidden,
			excludePaths:    opts.ExcludePaths,
		}, nil
	}

	fanfd, err := unix.FanotifyInit(
		unix.FAN_CLASS_NOTIF|unix.FAN_CLOEXEC|unix.FAN_NONBLOCK|
			unix.FAN_REPORT_DFID_NAME|unix.FAN_REPORT_FID,
		unix.O_RDONLY|unix.O_CLOEXEC|unix.O_LARGEFILE,
	)
	if err != nil {
		return fallbackToInotify("fanotify_init failed", "fanotify_init", err)
	}
	cleanupFanFD := true
	defer func() {
		if cleanupFanFD {
			_ = unix.Close(fanfd)
		}
	}()

	mountFD, err := unix.Open(markPath, unix.O_PATH|unix.O_CLOEXEC|unix.O_DIRECTORY, 0)
	if err != nil {
		return fallbackToInotify("open watch root for open_by_handle_at failed", "open_watch_root", err)
	}
	cleanupMountFD := true
	defer func() {
		if cleanupMountFD {
			_ = unix.Close(mountFD)
		}
	}()

	// With FAN_REPORT_DFID_NAME/FID, directory-entry events carry handles and names,
	// allowing us to resolve full paths via open_by_handle_at.
	mask := uint64(unix.FAN_CREATE | unix.FAN_MODIFY | unix.FAN_CLOSE_WRITE |
		unix.FAN_DELETE | unix.FAN_ONDIR |
		unix.FAN_MOVED_FROM | unix.FAN_MOVED_TO)
	mountMask := uint64(unix.FAN_MODIFY | unix.FAN_CLOSE_WRITE)

	slog.DebugContext(ctx, "watcher: attempting fanotify_mark",
		"path", watchRoot, "markPath", markPath, "markType", "FAN_MARK_FILESYSTEM", "mask", fmt.Sprintf("0x%x", mask))

	err = unix.FanotifyMark(fanfd,
		unix.FAN_MARK_ADD|unix.FAN_MARK_FILESYSTEM,
		mask,
		unix.AT_FDCWD, markPath,
	)
	if err == nil {
		slog.DebugContext(
			ctx,
			"watcher: fanotify_mark succeeded",
			"path",
			watchRoot,
			"markPath",
			markPath,
			"markType",
			"FAN_MARK_FILESYSTEM",
		)

		cleanupFanFD = false
		cleanupMountFD = false
		return &Watcher{
			mountPath:       watchRoot,
			fanfd:           fanfd,
			mountFD:         mountFD,
			fallbackWarning: "",
			out:             make(chan Event, outChanBuf),
			pending:         make(map[string]*debounceEntry),
			watchHidden:     opts.WatchHidden,
			excludePaths:    opts.ExcludePaths,
		}, nil
	}

	slog.DebugContext(
		ctx,
		"watcher: FAN_MARK_FILESYSTEM failed",
		"path",
		watchRoot,
		"markPath",
		markPath,
		"err",
		err,
	)
	if !errors.Is(err, unix.EXDEV) {
		return fallbackToInotify("fanotify mark failed", "FAN_MARK_FILESYSTEM", err)
	}

	slog.DebugContext(
		ctx,
		"watcher: filesystem mark returned EXDEV; enabling hybrid mode",
		"path",
		watchRoot,
		"markPath",
		markPath,
		"fanotifyMask",
		fmt.Sprintf("0x%x", mountMask),
		"inotifyMask",
		fmt.Sprintf("0x%x", inotifyHybridMask),
	)

	err = unix.FanotifyMark(fanfd,
		unix.FAN_MARK_ADD|unix.FAN_MARK_MOUNT,
		mountMask,
		unix.AT_FDCWD, markPath,
	)
	if err != nil {
		slog.DebugContext(
			ctx,
			"watcher: FAN_MARK_MOUNT for hybrid also failed",
			"path",
			watchRoot,
			"markPath",
			markPath,
			"err",
			err,
		)
		return fallbackToInotify("fanotify hybrid mark failed", "FAN_MARK_MOUNT", err)
	}

	impl, iErr := newInotifyWithMask(ctx, watchRoot, opts.WatchHidden, opts.ExcludePaths, inotifyHybridMask)
	if iErr != nil {
		return fallbackToInotify("inotify companion for hybrid failed", "inotify_hybrid", iErr)
	}

	slog.InfoContext(ctx, "watcher: hybrid mode active (fanotify mount + inotify tree)",
		"path", watchRoot, "markPath", markPath)
	cleanupFanFD = false
	cleanupMountFD = false
	return &Watcher{
		mountPath:       watchRoot,
		fanfd:           fanfd,
		mountFD:         mountFD,
		inotify:         impl,
		fallbackWarning: "fanotify degraded: FAN_MARK_FILESYSTEM returned EXDEV on subvolume; hybrid mode active (fanotify mount + inotify tree)",
		out:             make(chan Event, outChanBuf),
		pending:         make(map[string]*debounceEntry),
		watchHidden:     opts.WatchHidden,
		excludePaths:    opts.ExcludePaths,
	}, nil
}

// CapabilityWarnings reports watcher capability degradations detected at startup.
func (w *Watcher) CapabilityWarnings() []string {
	if w == nil || w.fallbackWarning == "" {
		return nil
	}
	return []string{w.fallbackWarning}
}

// Events returns the channel on which debounced filesystem events are delivered.
// The channel is closed when Run returns.
func (w *Watcher) Events() <-chan Event {
	if w.fanfd < 0 && w.inotify != nil {
		return w.inotify.out
	}
	return w.out
}

// Run reads filesystem events until ctx is cancelled.
// It closes the Events channel on return.
//
//nolint:gocognit // event-loop branching keeps fanotify/inotify/hybrid semantics explicit
func (w *Watcher) Run(ctx context.Context) error {
	if w.fanfd < 0 && w.inotify != nil {
		return w.inotify.run(ctx)
	}
	defer unix.Close(w.fanfd)
	if w.mountFD >= 0 {
		defer unix.Close(w.mountFD)
	}
	defer close(w.out)

	if w.inotify != nil {
		inErrCh := make(chan error, 1)
		go func() {
			inErrCh <- w.inotify.run(ctx)
		}()
		go func() {
			for ev := range w.inotify.out {
				select {
				case w.out <- ev:
				default:
				}
			}
		}()
		defer func() {
			select {
			case err := <-inErrCh:
				if err != nil && !errors.Is(err, context.Canceled) {
					slog.WarnContext(ctx, "watcher: hybrid inotify exited with error", "err", err)
				}
			case <-time.After(watcherShutdownWait):
				slog.WarnContext(ctx, "watcher: hybrid inotify shutdown timed out")
			}
		}()
	}

	// A pipe lets ctx cancellation unblock the poll call.
	piper, pipew, err := os.Pipe()
	if err != nil {
		return fmt.Errorf("watcher: pipe: %w", err)
	}
	defer piper.Close()
	defer pipew.Close()

	go func() {
		<-ctx.Done()
		_ = pipew.Close()
	}()

	pollfds, err := makePollFDPair(w.fanfd, piper.Fd(), "fanotify fd", "watcher cancel pipe fd")
	if err != nil {
		return err
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
		w.handleMetaFID(ctx, buf[offset:offset+eventLen])
		offset += eventLen
	}
}

//nolint:funlen,gocognit // fanotify record decoding needs linear handling of kernel info variants
func (w *Watcher) handleMetaFID(ctx context.Context, event []byte) {
	if len(event) < fanMetaSize {
		return
	}

	meta := (*unix.FanotifyEventMetadata)(unsafe.Pointer(&event[0]))
	if meta.Mask&unix.FAN_Q_OVERFLOW != 0 {
		slog.WarnContext(ctx, "watcher: fanotify queue overflow; some events were lost")
		return
	}

	var (
		parentPath string
		entryName  string
		objectPath string
	)

	metaLen := max(int(meta.Metadata_len), fanMetaSize)

	for off := metaLen; off+fanInfoHeaderSize <= len(event); {
		infoType := event[off]
		infoLen := int(binary.LittleEndian.Uint16(event[off+2 : off+4]))
		if infoLen < fanInfoHeaderSize || off+infoLen > len(event) {
			break
		}

		chunk := event[off : off+infoLen]
		switch infoType {
		case unix.FAN_EVENT_INFO_TYPE_DFID_NAME,
			unix.FAN_EVENT_INFO_TYPE_OLD_DFID_NAME,
			unix.FAN_EVENT_INFO_TYPE_NEW_DFID_NAME:
			p, name, err := w.parseDFIDNameInfo(chunk)
			if err == nil {
				parentPath = p
				entryName = name
			}
		case unix.FAN_EVENT_INFO_TYPE_DFID, unix.FAN_EVENT_INFO_TYPE_FID:
			p, err := w.parseFIDInfo(chunk)
			if err == nil {
				objectPath = p
			}
		}

		off += infoLen
	}

	path := objectPath
	if parentPath != "" && entryName != "" {
		path = parentPath
		if path != "/" {
			path += "/"
		}
		path += entryName
	}
	if path == "" {
		return
	}
	if !pathUnderWatchRoot(path, w.mountPath) {
		return
	}
	if w.isExcluded(path) {
		return
	}

	if !w.watchHidden && strings.Contains(path, "/.") {
		return
	}

	var ev Event
	ev.Path = path

	switch {
	case meta.Mask&unix.FAN_MOVED_FROM != 0:
		ev.Kind = EventDelete
	case meta.Mask&unix.FAN_MOVED_TO != 0:
		ev.Kind = EventCreate
	case meta.Mask&unix.FAN_CREATE != 0:
		ev.Kind = EventCreate
	case meta.Mask&unix.FAN_DELETE != 0:
		ev.Kind = EventDelete
	case meta.Mask&unix.FAN_CLOSE_WRITE != 0:
		ev.Kind = EventModify
	case meta.Mask&unix.FAN_MODIFY != 0:
		ev.Kind = EventModify
	default:
		return
	}

	w.debounce(ev)
}

func (w *Watcher) parseFIDInfo(info []byte) (string, error) {
	if len(info) < fanInfoFidMinSize+fanHandleHeaderSize {
		return "", errors.New("short fanotify fid info")
	}
	return w.pathFromHandle(info[fanInfoFidMinSize:])
}

func (w *Watcher) parseDFIDNameInfo(info []byte) (string, string, error) {
	if len(info) < fanInfoFidMinSize+fanHandleHeaderSize {
		return "", "", errors.New("short fanotify dfid_name info")
	}
	parent, err := w.pathFromHandle(info[fanInfoFidMinSize:])
	if err != nil {
		return "", "", err
	}

	hBytes := int(binary.LittleEndian.Uint32(info[fanInfoFidMinSize : fanInfoFidMinSize+4]))
	nameOff := fanInfoFidMinSize + fanHandleHeaderSize + hBytes
	if nameOff >= len(info) {
		return parent, "", nil
	}
	nameData := info[nameOff:]
	if idx := bytes.IndexByte(nameData, 0); idx >= 0 {
		nameData = nameData[:idx]
	}
	return parent, string(nameData), nil
}

func (w *Watcher) pathFromHandle(handleChunk []byte) (string, error) {
	if len(handleChunk) < fanHandleHeaderSize {
		return "", errors.New("short file_handle")
	}
	hBytes := int(binary.LittleEndian.Uint32(handleChunk[:4]))
	hType, err := uint32ToInt32Checked(binary.LittleEndian.Uint32(handleChunk[4:8]), "file_handle type")
	if err != nil {
		return "", err
	}
	if hBytes < 0 || fanHandleHeaderSize+hBytes > len(handleChunk) {
		return "", errors.New("invalid file_handle length")
	}

	fh := unix.NewFileHandle(hType, handleChunk[fanHandleHeaderSize:fanHandleHeaderSize+hBytes])
	fd, err := unix.OpenByHandleAt(w.mountFD, fh, unix.O_PATH|unix.O_CLOEXEC)
	if err != nil {
		return "", err
	}
	defer unix.Close(fd)

	path, err := os.Readlink(fmt.Sprintf("/proc/self/fd/%d", fd))
	if err != nil {
		return "", err
	}
	return path, nil
}

func intToInt32Checked(v int, field string) (int32, error) {
	if v < math.MinInt32 || v > math.MaxInt32 {
		return 0, fmt.Errorf("watcher: %s out of int32 range: %d", field, v)
	}
	return int32(v), nil
}

func uintptrToInt32Checked(v uintptr, field string) (int32, error) {
	if v > uintptr(math.MaxInt32) {
		return 0, fmt.Errorf("watcher: %s out of int32 range: %d", field, v)
	}
	return int32(v), nil
}

func uint32ToInt32Checked(v uint32, field string) (int32, error) {
	if v > math.MaxInt32 {
		return 0, fmt.Errorf("watcher: %s out of int32 range: %d", field, v)
	}
	return int32(v), nil
}

func makePollFDPair(fd int, pipeFD uintptr, fdField, pipeField string) ([]unix.PollFd, error) {
	pollFD, err := intToInt32Checked(fd, fdField)
	if err != nil {
		return nil, err
	}
	cancelFD, err := uintptrToInt32Checked(pipeFD, pipeField)
	if err != nil {
		return nil, err
	}
	return []unix.PollFd{
		{Fd: pollFD, Events: unix.POLLIN},
		{Fd: cancelFD, Events: unix.POLLIN},
	}, nil
}

func fanotifyFailureHint(err error) string {
	if err == nil {
		return ""
	}
	switch {
	case errors.Is(err, unix.EPERM), errors.Is(err, unix.EACCES):
		return "requires CAP_SYS_ADMIN in the initial user namespace"
	case errors.Is(err, unix.EXDEV):
		return "watch path is on a subvolume (for example btrfs) with a different fsid; FAN_MARK_FILESYSTEM with FID events is not supported here"
	case errors.Is(err, unix.EINVAL):
		return "kernel/filesystem rejected mark flags for this path"
	case errors.Is(err, unix.ENOSYS):
		return "fanotify not available in this kernel"
	default:
		return ""
	}
}

// isExcluded reports whether path falls under any of the watcher's excluded paths.
func (w *Watcher) isExcluded(path string) bool {
	for _, ex := range w.excludePaths {
		if path == ex || strings.HasPrefix(path, ex+"/") {
			return true
		}
	}
	return false
}

func pathUnderWatchRoot(path, root string) bool {
	path = filepath.Clean(path)
	root = filepath.Clean(root)
	if root == "/" {
		return true
	}
	if path == root {
		return true
	}
	return strings.HasPrefix(path, root+"/")
}

func mountPointForPath(path string) (string, error) {
	path = filepath.Clean(path)
	data, err := os.ReadFile("/proc/self/mountinfo")
	if err != nil {
		return "", err
	}

	best := ""
	for line := range strings.SplitSeq(string(data), "\n") {
		if line == "" {
			continue
		}
		fields := strings.Fields(line)
		if len(fields) < mountInfoMinFields {
			continue
		}
		mp := unescapeMountInfoPath(fields[4])
		if path == mp || strings.HasPrefix(path, mp+"/") {
			if len(mp) > len(best) {
				best = mp
			}
		}
	}
	if best == "" {
		return "", fmt.Errorf("no mount point found for %q", path)
	}
	return best, nil
}

func unescapeMountInfoPath(s string) string {
	replacer := strings.NewReplacer("\\040", " ", "\\011", "\t", "\\012", "\n", "\\134", "\\")
	return replacer.Replace(s)
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
func kernelVersion() (int, int, error) {
	var uts unix.Utsname
	if err := unix.Uname(&uts); err != nil {
		return 0, 0, fmt.Errorf("watcher: uname: %w", err)
	}
	release := unix.ByteSliceToString(uts.Release[:])
	var major, minor int
	if _, err := fmt.Sscanf(release, "%d.%d", &major, &minor); err != nil {
		return 0, 0, fmt.Errorf("watcher: parse kernel version %q: %w", release, err)
	}
	return major, minor, nil
}
