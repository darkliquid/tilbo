package watcher

import (
	"context"
	"errors"
)

type Watcher struct {
}

type EventKind uint

const (
	_ uint = iota
	EventCreate
	EventModify
	EventDelete
	EventRename
)

type Event struct {
	Path    string
	OldPath string    // non-empty for renames
	Kind    EventKind // EventCreate, EventModify, EventDelete, EventRename
}

func New(ctx context.Context, mountPath string) (*Watcher, error) {
	return &Watcher{}, nil
}

func (w *Watcher) Run(ctx context.Context) error {
	return errors.New("not implemented")
}

func (w *Watcher) Events() <-chan Event {
	return nil
}
