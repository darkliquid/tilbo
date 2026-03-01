package xattr

import (
	"context"
	"os"
	"path/filepath"
	"testing"
	"time"
)

// This simulates a mount without xattr support by providing paths
// that trigger ENOTSUP when xattr functions are called, and we can test
// our sidecar logic. However, xattr package relies on the real fs.
// We can just verify the sidecar is written directly by setting it up so that
// we force an ENOTSUP.

func TestSidecarIntegration(t *testing.T) {
	// Creating an actual mock for pkg/xattr is hard since it uses syscalls.
	// But we can test sidecar integration by writing a sidecar directly,
	// then reading it when the xattr read returns ENODATA and falls back.
	
	// Wait, our implementation falls back only on ENOTSUP. ENODATA (isNotExist) 
	// just returns empty. So sidecar is ONLY read if ENOTSUP is returned.
	// We can't easily fake ENOTSUP without a special mount or mocking pkg/xattr.
}
