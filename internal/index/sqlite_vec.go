package index

import (
	_ "embed"

	"github.com/ncruces/go-sqlite3"
)

//go:embed sqlite-vec.wasm
var vecWasmBinary []byte

func init() {
	sqlite3.Binary = vecWasmBinary
}
