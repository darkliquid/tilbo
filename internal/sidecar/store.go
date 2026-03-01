package sidecar

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"syscall"
)

// Data represents the structure of the sidecar JSON.
type Data struct {
	Tags   string            `json:"tags,omitempty"`
	Meta   map[string]string `json:"meta,omitempty"`
	Source map[string]string `json:"source,omitempty"`
}

var (
	// ErrNoSidecar is returned when reading from a file that has no sidecar.
	ErrNoSidecar = errors.New("no sidecar data exists")
)

// Backend defines the interface required by the sidecar store.
type Backend interface {
	ReadSidecar(ctx context.Context, inode, device uint64) ([]byte, error)
	WriteSidecar(ctx context.Context, inode, device uint64, data []byte) error
	DeleteSidecar(ctx context.Context, inode, device uint64) error
}

// Store provides access to sidecar metadata files for file systems that do not support xattrs.
type Store struct {
	db Backend
}

// New creates a new Store instance.
func New(db Backend) *Store {
	return &Store{db: db}
}

func getInodeDev(path string) (uint64, uint64, error) {
	var stat syscall.Stat_t
	if err := syscall.Stat(path, &stat); err != nil {
		return 0, 0, err
	}
	return stat.Ino, stat.Dev, nil
}

// Read loads the sidecar metadata for the given file path.
// If the sidecar data doesn't exist, it returns ErrNoSidecar.
func (s *Store) Read(ctx context.Context, path string) (*Data, error) {
	inode, dev, err := getInodeDev(path)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, ErrNoSidecar
		}
		return nil, fmt.Errorf("stat file: %w", err)
	}

	b, err := s.db.ReadSidecar(ctx, inode, dev)
	if err != nil {
		return nil, fmt.Errorf("read sidecar from db: %w", err)
	}

	if len(b) == 0 {
		return nil, ErrNoSidecar
	}

	var data Data
	if err := json.Unmarshal(b, &data); err != nil {
		return nil, fmt.Errorf("parse sidecar JSON: %w", err)
	}
	
	if data.Meta == nil {
		data.Meta = make(map[string]string)
	}
	if data.Source == nil {
		data.Source = make(map[string]string)
	}

	return &data, nil
}

// Write saves the sidecar metadata for the given file path.
func (s *Store) Write(ctx context.Context, path string, data *Data) error {
	inode, dev, err := getInodeDev(path)
	if err != nil {
		return fmt.Errorf("stat file: %w", err)
	}

	// If everything is empty, we can just delete the sidecar to keep things clean.
	if data.Tags == "" && len(data.Meta) == 0 && len(data.Source) == 0 {
		if err := s.db.DeleteSidecar(ctx, inode, dev); err != nil {
			return fmt.Errorf("remove sidecar from db: %w", err)
		}
		return nil
	}

	b, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("marshal sidecar JSON: %w", err)
	}

	if err := s.db.WriteSidecar(ctx, inode, dev, b); err != nil {
		return fmt.Errorf("write sidecar to db: %w", err)
	}

	return nil
}

// Remove deletes the sidecar data if it exists.
func (s *Store) Remove(ctx context.Context, path string) error {
	inode, dev, err := getInodeDev(path)
	if err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return fmt.Errorf("stat file: %w", err)
	}

	if err := s.db.DeleteSidecar(ctx, inode, dev); err != nil {
		return fmt.Errorf("remove sidecar from db: %w", err)
	}
	return nil
}
