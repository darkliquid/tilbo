package ipc

import (
	"fmt"
	"io"

	"google.golang.org/protobuf/encoding/protojson"

	ipcv1 "github.com/darkliquid/tilbo/internal/ipc/gen/tilbo/ipc/v1"
)

// WriteEnvelope writes a JSON newline-delimited protobuf message to w.
func WriteEnvelope(w io.Writer, env *ipcv1.Envelope) error {
	m := protojson.MarshalOptions{
		EmitUnpopulated: true,
		UseProtoNames:   false,
	}
	buf, err := m.Marshal(env)
	if err != nil {
		return fmt.Errorf("marshal envelope: %w", err)
	}
	buf = append(buf, '\n')
	if _, err := w.Write(buf); err != nil {
		return fmt.Errorf("write envelope: %w", err)
	}
	return nil
}
