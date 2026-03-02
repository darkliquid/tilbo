package builtin

import (
	"context"
	"os"
	"syscall"
	"time"

	"github.com/darkliquid/tilbo/internal/harvester"
)

// StatHarvester extracts file-system metadata from os.Stat: size tiers, mtime
// components, and basic permission flags. It runs at priority -100 alongside
// the MIME harvester so this data is available to all rules.
type StatHarvester struct{}

// NewStatHarvester returns a StatHarvester.
func NewStatHarvester() *StatHarvester { return &StatHarvester{} }

func (*StatHarvester) Name() string          { return "builtin:stat" }
func (*StatHarvester) Priority() int         { return -100 }
func (*StatHarvester) Async() bool           { return false }
func (*StatHarvester) Matches(_, _ string) bool { return true }

// sizeTier maps a byte count to a human-readable bucket name.
//
//	tiny   < 64 KiB
//	small  < 10 MiB
//	medium < 1 GiB
//	large  < 100 GiB
//	huge   ≥ 100 GiB
func sizeTier(n int64) string {
	const (
		KiB = 1024
		MiB = 1024 * KiB
		GiB = 1024 * MiB
	)
	switch {
	case n < 64*KiB:
		return "tiny"
	case n < 10*MiB:
		return "small"
	case n < GiB:
		return "medium"
	case n < 100*GiB:
		return "large"
	default:
		return "huge"
	}
}

// Run returns a MetaMap containing:
//   - "size_bytes"   — file size in bytes (float64)
//   - "size_tier"    — "tiny" | "small" | "medium" | "large" | "huge"
//   - "mtime"        — modification time as Unix timestamp (float64)
//   - "mtime_year"   — year component of mtime (float64)
//   - "mtime_month"  — month component 1–12 (float64)
//   - "is_executable" — true if any execute bit is set (bool)
//   - "is_symlink"   — true if the path is a symbolic link (bool)
func (*StatHarvester) Run(_ context.Context, input harvester.Input) (harvester.MetaMap, error) {
	fi, err := os.Lstat(input.Path)
	if err != nil {
		return nil, nil
	}

	mode := fi.Mode()
	mt := fi.ModTime().UTC()

	meta := harvester.MetaMap{
		"size_bytes":    float64(fi.Size()),
		"size_tier":     sizeTier(fi.Size()),
		"mtime":         float64(mt.Unix()),
		"mtime_year":    float64(mt.Year()),
		"mtime_month":   float64(mt.Month()),
		"is_executable": mode.Perm()&0o111 != 0,
		"is_symlink":    mode.Type()&os.ModeSymlink != 0,
	}

	// inode / device — useful for de-duplication rules.
	if sys, ok := fi.Sys().(*syscall.Stat_t); ok {
		meta["inode"] = float64(sys.Ino)
		meta["device"] = float64(sys.Dev)
	}

	// mtime_age_days — days since last modification; convenient for archive rules.
	ageDays := time.Since(mt).Hours() / 24
	if ageDays >= 0 {
		meta["mtime_age_days"] = ageDays
	}

	return meta, nil
}
