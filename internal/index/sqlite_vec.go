package index

import (
	_ "embed"

	"github.com/ncruces/go-sqlite3"
)

//go:embed sqlite-vec.wasm
var vecWasmBinary []byte

//nolint:gochecknoinits // sqlite driver extension requires package init-time registration
func init() {
	//nolint:reassign // sqlite3 extension entrypoint is configured via package variable
	sqlite3.Binary = vecWasmBinary
}
