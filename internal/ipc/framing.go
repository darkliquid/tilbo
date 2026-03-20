package ipc

import (
	"errors"
	"fmt"
	"io"

	"google.golang.org/protobuf/encoding/protojson"

	ipcv1 "github.com/darkliquid/tilbo/internal/ipc/gen/tilbo/ipc/v1"
)

// maxFrameSize is the maximum permitted size (in bytes) of a single encoded
// envelope. Both the write path and the scanner read path enforce this limit.
const maxFrameSize = 4 * 1024 * 1024 // 4 MiB

// ErrFrameTooLarge is returned by WriteEnvelope when the marshaled envelope
// exceeds maxFrameSize.
var ErrFrameTooLarge = errors.New("ipc: encoded frame exceeds maximum size")

// WriteEnvelope serialises an envelope as JSON and writes it to w followed by a
// newline delimiter. EmitUnpopulated is set so that zero-value fields are always
// present in the JSON output, which simplifies client-side parsing (especially
// in the QML/JS layer where missing keys require extra null checks).
func WriteEnvelope(w io.Writer, env *ipcv1.Envelope) error {
	m := protojson.MarshalOptions{
		EmitUnpopulated: true,  // always emit zero-value fields for predictable JSON shape
		UseProtoNames:   false, // use camelCase field names (matches protobufjs conventions)
	}
	buf, err := m.Marshal(env)
	if err != nil {
		return fmt.Errorf("marshal envelope: %w", err)
	}
	if len(buf) > maxFrameSize {
		return ErrFrameTooLarge
	}
	buf = append(buf, '\n')
	if _, err := w.Write(buf); err != nil {
		return fmt.Errorf("write envelope: %w", err)
	}
	return nil
}
