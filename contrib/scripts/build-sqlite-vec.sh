#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
GO_SQLITE3_VERSION="v0.27.1"
SQLITE_VEC_VERSION="v0.1.6"

echo "Building sqlite-vec.wasm with go-sqlite3 ${GO_SQLITE3_VERSION} and sqlite-vec ${SQLITE_VEC_VERSION}"

WORK_DIR=$(mktemp -d)
trap 'rm -rf "$WORK_DIR"' EXIT

mkdir -p "$WORK_DIR/output/sqlite3"

curl -#L "https://github.com/asg017/sqlite-vec/releases/download/${SQLITE_VEC_VERSION}/sqlite-vec-${SQLITE_VEC_VERSION#v}-amalgamation.tar.gz" \
  | tar xzC "$WORK_DIR/output/sqlite3"

curl -#L "https://github.com/ncruces/go-sqlite3/archive/refs/tags/${GO_SQLITE3_VERSION}.tar.gz" \
  | tar xzC "$WORK_DIR/output" --strip-components=1

# Match ncruces/sqlite-vec-go patching strategy.
sed -i 's|-DSQLITE_CUSTOM_INCLUDE=sqlite_opt.h \\|-DSQLITE_CUSTOM_INCLUDE=sqlite_opt.h \\\n       -DSQLITE_VEC_OMIT_FS=1 \\|' "$WORK_DIR/output/embed/build.sh"
sed -i 's|#include "vtab.c"|#include "vtab.c"\n#include "sqlite-vec.c"|' "$WORK_DIR/output/sqlite3/main.c"
sed -i '/sqlite3_auto_extension.*sqlite3_time_init/a\  sqlite3_auto_extension((void (*)(void))sqlite3_vec_init);' "$WORK_DIR/output/sqlite3/main.c"

"$WORK_DIR/output/sqlite3/tools.sh"
"$WORK_DIR/output/sqlite3/download.sh"
"$WORK_DIR/output/embed/build.sh"

cp "$WORK_DIR/output/embed/sqlite3.wasm" "$ROOT_DIR/internal/index/sqlite-vec.wasm"
echo "Successfully rebuilt and copied sqlite-vec.wasm to internal/index/"
