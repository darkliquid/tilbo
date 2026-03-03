package helpers

import (
	"context"
	"fmt"
	"strings"
)

// FSType identifies a filesystem type for test volumes.
type FSType string

const (
	FSExt4  FSType = "ext4"
	FSBtrfs FSType = "btrfs"
	FSVfat  FSType = "vfat"
	FSTmpfs FSType = "tmpfs"
)

// NoXattr reports whether this filesystem type supports user extended attributes.
// vfat and tmpfs do not; ext4 and btrfs do.
func (f FSType) NoXattr() bool {
	return f == FSVfat || f == FSTmpfs
}

// Mount represents a filesystem mounted inside the container.
type Mount struct {
	Type      FSType
	MountPath string // absolute path inside container
	ImagePath string // always empty; retained for API compatibility
	Device    string // always empty; retained for API compatibility
	suite     *Suite
}

// NewMount creates a filesystem mount inside the container.
//
// Loop devices and image-backed filesystems are not used because rootless
// Podman containers cannot create block device nodes (mknod for block devices
// is blocked by the Linux user-namespace even with --privileged).
//
// Instead, the mount type is chosen by the xattr requirement:
//
//   - ext4, btrfs, tmpfs: plain tmpfs. On modern kernels (CONFIG_TMPFS_XATTR)
//     tmpfs supports user.* xattrs, satisfying the "xattr-capable" requirement
//     for ext4 and btrfs tests.
//
//   - vfat: ramfs. The ramfs VFS inode operations include no xattr handlers, so
//     any setxattr call returns EOPNOTSUPP regardless of kernel configuration.
//     This reliably models the "no xattr" behaviour of vfat without needing a
//     loop device or a FUSE vfat driver.
//
// The caller must call Cleanup when done.
func NewMount(ctx context.Context, suite *Suite, fsType FSType, mountPath string) (*Mount, error) {
	m := &Mount{
		Type:      fsType,
		MountPath: mountPath,
		suite:     suite,
	}

	if _, err := suite.Shell(ctx, fmt.Sprintf("mkdir -p '%s'", mountPath)); err != nil {
		return nil, fmt.Errorf("mkdir %s: %w", mountPath, err)
	}

	// vfat uses ramfs (no xattr support); everything else uses tmpfs.
	mountType := "tmpfs"
	if fsType == FSVfat {
		mountType = "ramfs"
	}

	if _, err := suite.Shell(ctx, fmt.Sprintf("mount -t %s %s '%s'", mountType, mountType, mountPath)); err != nil {
		return nil, fmt.Errorf("mount %s at %s: %w", mountType, mountPath, err)
	}
	return m, nil
}

// Cleanup unmounts the filesystem.
func (m *Mount) Cleanup(ctx context.Context) error {
	_, err := m.suite.Shell(ctx, fmt.Sprintf("umount -l '%s' 2>/dev/null || true", m.MountPath))
	if err != nil {
		return fmt.Errorf("cleanup %s mount: %w", m.Type, err)
	}
	return nil
}

// HasXattr probes whether the filesystem at m.MountPath supports user extended
// attributes by writing and immediately removing a test attribute on a temp file.
func (m *Mount) HasXattr(ctx context.Context) (bool, error) {
	script := fmt.Sprintf(`
		f='%s/.xattr-probe'
		touch "$f"
		if setfattr -n user.tilbo_probe -v 1 "$f" 2>/dev/null; then
			setfattr -x user.tilbo_probe "$f" 2>/dev/null || true
			rm -f "$f"
			echo yes
		else
			rm -f "$f"
			echo no
		fi
	`, m.MountPath)
	out, err := m.suite.Shell(ctx, script)
	if err != nil {
		return false, err
	}
	return strings.TrimSpace(out) == "yes", nil
}
