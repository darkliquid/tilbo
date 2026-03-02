package helpers

import (
	"context"
	"fmt"
	"strings"
)

// FSType identifies a filesystem type for loop-mounted test volumes.
type FSType string

const (
	FSExt4  FSType = "ext4"
	FSBtrfs FSType = "btrfs"
	FSVfat  FSType = "vfat"
	FSTmpfs FSType = "tmpfs" // special: no loop device, just a tmpfs mount
)

// NoXattr reports whether this filesystem type supports user extended attributes.
// vfat and tmpfs do not; ext4 and btrfs do.
func (f FSType) NoXattr() bool {
	return f == FSVfat || f == FSTmpfs
}

// Mount represents a loop-device-backed filesystem mounted inside the container.
type Mount struct {
	Type      FSType
	MountPath string // absolute path inside container (e.g. /mnt/ext4)
	ImagePath string // backing image file path inside container (empty for tmpfs)
	Device    string // /dev/loopN (empty for tmpfs)
	suite     *Suite
}

// defaultImageSizeMB returns a sane image size for each filesystem type.
func defaultImageSizeMB(fsType FSType) int {
	switch fsType {
	case FSBtrfs:
		return 300 // btrfs requires ~109 MiB minimum; use 300 to be safe
	case FSExt4:
		return 64
	case FSVfat:
		return 32
	default:
		return 64
	}
}

// NewMount creates a loop-backed filesystem image inside the container, formats
// it with the appropriate mkfs tool, and mounts it at mountPath.
//
// For FSTmpfs no image is created; a plain tmpfs is mounted instead.
//
// The caller must call Cleanup when done to unmount and release the loop device.
func NewMount(ctx context.Context, suite *Suite, fsType FSType, mountPath string) (*Mount, error) {
	m := &Mount{
		Type:      fsType,
		MountPath: mountPath,
		suite:     suite,
	}

	// Ensure mount point exists.
	if _, err := suite.Shell(ctx, fmt.Sprintf("mkdir -p '%s'", mountPath)); err != nil {
		return nil, fmt.Errorf("mkdir %s: %w", mountPath, err)
	}

	if fsType == FSTmpfs {
		if _, err := suite.Shell(ctx, fmt.Sprintf("mount -t tmpfs tmpfs '%s'", mountPath)); err != nil {
			return nil, fmt.Errorf("mount tmpfs at %s: %w", mountPath, err)
		}
		return m, nil
	}

	sizeMB := defaultImageSizeMB(fsType)
	imgPath := fmt.Sprintf("/tilbo/images/%s.img", fsType)
	m.ImagePath = imgPath

	// Create sparse image file.
	createScript := fmt.Sprintf(
		"dd if=/dev/zero of='%s' bs=1M count=%d status=none",
		imgPath, sizeMB,
	)
	if _, err := suite.Shell(ctx, createScript); err != nil {
		return nil, fmt.Errorf("create %s image: %w", fsType, err)
	}

	// Format the image.
	var mkfsCmd string
	switch fsType {
	case FSExt4:
		mkfsCmd = fmt.Sprintf("mkfs.ext4 -F -q '%s'", imgPath)
	case FSBtrfs:
		mkfsCmd = fmt.Sprintf("mkfs.btrfs -f -q '%s'", imgPath)
	case FSVfat:
		mkfsCmd = fmt.Sprintf("mkfs.vfat -F 32 '%s'", imgPath)
	default:
		return nil, fmt.Errorf("unknown filesystem type: %s", fsType)
	}
	if _, err := suite.Shell(ctx, mkfsCmd); err != nil {
		return nil, fmt.Errorf("mkfs.%s: %w", fsType, err)
	}

	// Attach loop device.
	dev, err := suite.Shell(ctx, fmt.Sprintf("losetup -f --show '%s'", imgPath))
	if err != nil {
		return nil, fmt.Errorf("losetup %s: %w", imgPath, err)
	}
	m.Device = strings.TrimSpace(dev)

	// Mount the loop device.
	var mountOpts string
	switch fsType {
	case FSExt4:
		mountOpts = "-o user_xattr"
	case FSBtrfs:
		mountOpts = ""
	case FSVfat:
		mountOpts = ""
	}
	mountCmd := fmt.Sprintf("mount %s '%s' '%s'", mountOpts, m.Device, mountPath)
	if _, err := suite.Shell(ctx, mountCmd); err != nil {
		_, _ = suite.Shell(ctx, fmt.Sprintf("losetup -d '%s'", m.Device))
		return nil, fmt.Errorf("mount %s loop device: %w", fsType, err)
	}

	return m, nil
}

// Cleanup unmounts the filesystem and detaches the loop device.
func (m *Mount) Cleanup(ctx context.Context) error {
	var errs []string

	if _, err := m.suite.Shell(ctx, fmt.Sprintf("umount -l '%s' 2>/dev/null || true", m.MountPath)); err != nil {
		errs = append(errs, fmt.Sprintf("umount %s: %v", m.MountPath, err))
	}

	if m.Device != "" {
		if _, err := m.suite.Shell(ctx, fmt.Sprintf("losetup -d '%s' 2>/dev/null || true", m.Device)); err != nil {
			errs = append(errs, fmt.Sprintf("losetup -d %s: %v", m.Device, err))
		}
	}

	if m.ImagePath != "" {
		if _, err := m.suite.Shell(ctx, fmt.Sprintf("rm -f '%s'", m.ImagePath)); err != nil {
			errs = append(errs, fmt.Sprintf("rm image %s: %v", m.ImagePath, err))
		}
	}

	if len(errs) > 0 {
		return fmt.Errorf("cleanup %s mount: %s", m.Type, strings.Join(errs, "; "))
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
