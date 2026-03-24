# Integration Tests

End-to-end integration tests for tilbo. They run inside a privileged Docker
container and prove out the full stack: daemon lifecycle, IPC, fanotify
live-indexing, FUSE virtual filesystem, and xattr/sidecar behaviour across
multiple real filesystem types.

## Requirements

| Requirement | Notes |
|---|---|
| Linux host | Tests use fanotify and FUSE; macOS/Windows not supported |
| Docker or Podman | Container must support `--privileged` |
| `go` on PATH | Used to build the tilbo binaries before starting the container |
| Internet access (first run) | `go mod tidy` pulls testcontainers-go |

## Setup (first time only)

```sh
cd test/integration
go mod tidy
```

## Running

```sh
cd test/integration
go test ./... -v -timeout 15m
```

Run a single suite:

```sh
go test ./... -v -timeout 5m -run TestFUSE
go test ./... -v -timeout 5m -run TestFanotify
go test ./... -v -timeout 5m -run TestDaemon
```

## What the tests prove

| Test file | Coverage |
|---|---|
| `daemon_test.go` | Daemon starts, socket appears, IPC responds, SIGHUP reload, restart retains index |
| `cli_test.go` | All `tag`, `search`, `meta`, `related`, `daemon status` commands |
| `fuse_test.go` | Tag dirs appear, file reads/writes, rename→retag, intersection/union/negation, `@recent`, `@similar` |
| `fanotify_test.go` | Create/modify/delete/rename auto-index, cross-dir rename, 20-file rapid burst |
| `filesystems_test.go` | Tag roundtrip on ext4/btrfs/vfat/tmpfs; xattr verified on capable FSes; sidecar verified on non-xattr FSes; cross-FS copy; fanotify works on loop mounts |

## Filesystem matrix

| Filesystem | xattr | Backing |
|---|---|---|
| ext4 | Yes | 64 MB loopback image |
| btrfs | Yes | 300 MB loopback image |
| vfat | No | 32 MB loopback image |
| tmpfs | No | In-kernel tmpfs |

## Architecture

```
host machine
  go test (orchestrator)
    ↓ build binaries (go build, linux/amd64)
    ↓ start container (privileged Docker/Podman)
    ↓ mount loop devices (ext4, btrfs, vfat, tmpfs) via container.Exec
    ↓ start tilbo daemon inside container
    ↓ run tests via container.Exec(tilbo ...)
    ↓ assert output
    ↓ teardown
```

The test binary never runs inside the container. The container is purely the
execution environment for the daemon, CLI, and loop mounts.
