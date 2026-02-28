package ipc

import (
	"encoding/binary"
	"fmt"
	"io"

	ipcv1 "github.com/darkliquid/tilbo/internal/ipc/gen/tilbo/ipc/v1"
)

// WriteEnvelope writes a length-prefixed protobuf message to w.
func WriteEnvelope(w io.Writer, env *ipcv1.Envelope) error {
	size := env.SizeVT()
	if size > 100*1024*1024 { // 100MB sanity limit
		return fmt.Errorf("message too large: %d bytes", size)
	}

	buf := make([]byte, 4+size)
	binary.LittleEndian.PutUint32(buf[0:4], uint32(size))

	if _, err := env.MarshalToVT(buf[4:]); err != nil {
		return fmt.Errorf("marshal envelope: %w", err)
	}

	if _, err := w.Write(buf); err != nil {
		return fmt.Errorf("write envelope: %w", err)
	}

	return nil
}

// ReadEnvelope reads a length-prefixed protobuf message from r.
func ReadEnvelope(r io.Reader) (*ipcv1.Envelope, error) {
	var lenBuf [4]byte
	if _, err := io.ReadFull(r, lenBuf[:]); err != nil {
		return nil, fmt.Errorf("read frame length: %w", err)
	}

	size := binary.LittleEndian.Uint32(lenBuf[:])
	if size > 100*1024*1024 { // 100MB sanity limit
		return nil, fmt.Errorf("message too large: %d bytes", size)
	}

	buf := make([]byte, size)
	if _, err := io.ReadFull(r, buf); err != nil {
		return nil, fmt.Errorf("read frame payload: %w", err)
	}

	env := &ipcv1.Envelope{}
	if err := env.UnmarshalVT(buf); err != nil {
		return nil, fmt.Errorf("unmarshal envelope: %w", err)
	}

	return env, nil
}
