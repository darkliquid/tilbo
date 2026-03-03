#!/bin/sh
# Stop and disable the daemon before package removal (best-effort).
systemctl --user stop tilbo-daemon 2>/dev/null || true
systemctl --user disable tilbo-daemon 2>/dev/null || true
