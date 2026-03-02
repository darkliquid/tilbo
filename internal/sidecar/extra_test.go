package sidecar

import (
	"context"
	"errors"
	"os"
	"path/filepath"
	"testing"
)

func TestSidecarStore_Remove(t *testing.T) {
	db := &mockDB{data: make(map[uint64][]byte)}
	s := New(db)
	ctx := context.Background()

	tmp := t.TempDir()
	path := filepath.Join(tmp, "file.txt")
	if err := os.WriteFile(path, []byte("x"), 0o644); err != nil {
		t.Fatal(err)
	}

	// Write something first.
	if err := s.Write(ctx, path, &Data{Tags: "a,b"}); err != nil {
		t.Fatalf("write: %v", err)
	}
	if len(db.data) != 1 {
		t.Fatalf("expected 1 sidecar entry, got %d", len(db.data))
	}

	// Remove should delete it.
	if err := s.Remove(ctx, path); err != nil {
		t.Fatalf("remove: %v", err)
	}
	if len(db.data) != 0 {
		t.Errorf("expected sidecar deleted after Remove, got %d entries", len(db.data))
	}
}

func TestSidecarStore_Remove_NonExistentFile(t *testing.T) {
	db := &mockDB{data: make(map[uint64][]byte)}
	s := New(db)
	ctx := context.Background()

	// Removing a path that doesn't exist on disk should be a no-op (not an error).
	if err := s.Remove(ctx, "/nonexistent/path/to/file.txt"); err != nil {
		t.Errorf("expected nil error for Remove on missing file, got: %v", err)
	}
}

func TestSidecarStore_Read_CorruptJSON(t *testing.T) {
	db := &mockDB{data: make(map[uint64][]byte)}
	s := New(db)
	ctx := context.Background()

	tmp := t.TempDir()
	path := filepath.Join(tmp, "file.txt")
	if err := os.WriteFile(path, []byte("x"), 0o644); err != nil {
		t.Fatal(err)
	}

	// Manually write corrupt JSON into the mock DB using the file's inode.
	inode, dev, err := getInodeDev(path)
	if err != nil {
		t.Fatalf("stat: %v", err)
	}
	_ = dev
	db.data[inode] = []byte(`{not valid json`)

	_, err = s.Read(ctx, path)
	if err == nil {
		t.Error("expected error reading corrupt JSON, got nil")
	}
}

func TestSidecarStore_Read_NonExistentFile(t *testing.T) {
	db := &mockDB{data: make(map[uint64][]byte)}
	s := New(db)
	ctx := context.Background()

	_, err := s.Read(ctx, "/does/not/exist.txt")
	if !errors.Is(err, ErrNoSidecar) {
		t.Errorf("expected ErrNoSidecar for missing file, got: %v", err)
	}
}

func TestSidecarStore_SourceFieldPreserved(t *testing.T) {
	db := &mockDB{data: make(map[uint64][]byte)}
	s := New(db)
	ctx := context.Background()

	tmp := t.TempDir()
	path := filepath.Join(tmp, "file.txt")
	if err := os.WriteFile(path, []byte("x"), 0o644); err != nil {
		t.Fatal(err)
	}

	data := &Data{
		Tags:   "work",
		Meta:   map[string]string{"author": "alice"},
		Source: map[string]string{"author": "image-harvester"},
	}
	if err := s.Write(ctx, path, data); err != nil {
		t.Fatalf("write: %v", err)
	}

	loaded, err := s.Read(ctx, path)
	if err != nil {
		t.Fatalf("read: %v", err)
	}
	if loaded.Source["author"] != "image-harvester" {
		t.Errorf("source not preserved: got %q, want image-harvester", loaded.Source["author"])
	}
}

func TestSidecarStore_Write_SourceOnly_NotDeleted(t *testing.T) {
	db := &mockDB{data: make(map[uint64][]byte)}
	s := New(db)
	ctx := context.Background()

	tmp := t.TempDir()
	path := filepath.Join(tmp, "file.txt")
	if err := os.WriteFile(path, []byte("x"), 0o644); err != nil {
		t.Fatal(err)
	}

	// Source-only data is non-empty; should be stored, not deleted.
	data := &Data{
		Source: map[string]string{"key": "harvester"},
	}
	if err := s.Write(ctx, path, data); err != nil {
		t.Fatalf("write: %v", err)
	}
	if len(db.data) == 0 {
		t.Error("expected sidecar stored for source-only data, but it was deleted")
	}
}

func TestSidecarStore_ReadBack_EmptyMapsNotNil(t *testing.T) {
	db := &mockDB{data: make(map[uint64][]byte)}
	s := New(db)
	ctx := context.Background()

	tmp := t.TempDir()
	path := filepath.Join(tmp, "file.txt")
	if err := os.WriteFile(path, []byte("x"), 0o644); err != nil {
		t.Fatal(err)
	}

	// Write with only Tags (no Meta/Source).
	if err := s.Write(ctx, path, &Data{Tags: "foo"}); err != nil {
		t.Fatalf("write: %v", err)
	}

	loaded, err := s.Read(ctx, path)
	if err != nil {
		t.Fatalf("read: %v", err)
	}
	if loaded.Meta == nil {
		t.Error("Read should initialise Meta to non-nil map")
	}
	if loaded.Source == nil {
		t.Error("Read should initialise Source to non-nil map")
	}
}
