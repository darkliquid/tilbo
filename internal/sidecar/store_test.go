package sidecar

import (
	"context"
	"errors"
	"os"
	"path/filepath"
	"testing"
)

type mockDB struct {
	data map[uint64][]byte
}

func (m *mockDB) ReadSidecar(ctx context.Context, inode, dev uint64) ([]byte, error) {
	if b, ok := m.data[inode]; ok {
		return b, nil
	}
	return nil, nil
}

func (m *mockDB) WriteSidecar(ctx context.Context, inode, dev uint64, data []byte) error {
	m.data[inode] = data
	return nil
}

func (m *mockDB) DeleteSidecar(ctx context.Context, inode, dev uint64) error {
	delete(m.data, inode)
	return nil
}

func TestSidecarStore(t *testing.T) {
	db := &mockDB{data: make(map[uint64][]byte)}
	s := New(db)
	ctx := context.Background()

	tmp := t.TempDir()
	path := filepath.Join(tmp, "test.txt")
	if err := os.WriteFile(path, []byte("hello"), 0o644); err != nil {
		t.Fatal(err)
	}

	// 1. Read non-existent
	if _, err := s.Read(ctx, path); !errors.Is(err, ErrNoSidecar) {
		t.Fatalf("expected ErrNoSidecar, got %v", err)
	}

	// 2. Write sidecar
	data := &Data{
		Tags: "foo,bar",
		Meta: map[string]string{"author": "alice"},
	}

	if err := s.Write(ctx, path, data); err != nil {
		t.Fatalf("write sidecar: %v", err)
	}

	// 3. Read it back
	loaded, err := s.Read(ctx, path)
	if err != nil {
		t.Fatalf("read sidecar: %v", err)
	}
	if loaded.Tags != "foo,bar" {
		t.Errorf("got tags %q, want %q", loaded.Tags, "foo,bar")
	}
	if loaded.Meta["author"] != "alice" {
		t.Errorf("got meta author %q, want alice", loaded.Meta["author"])
	}

	// 4. Update data to empty
	loaded.Tags = ""
	loaded.Meta = nil
	if err := s.Write(ctx, path, loaded); err != nil {
		t.Fatalf("write empty sidecar: %v", err)
	}

	// 5. It should be deleted
	if len(db.data) != 0 {
		t.Errorf("expected sidecar data to be deleted")
	}
}
