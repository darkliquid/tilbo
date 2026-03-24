package main

import (
	"bytes"
	"context"
	"log/slog"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/darkliquid/tilbo/internal/graph"
	"github.com/darkliquid/tilbo/internal/harvester"
	"github.com/darkliquid/tilbo/internal/index"
	"github.com/darkliquid/tilbo/internal/rules"
	isync "github.com/darkliquid/tilbo/internal/sync"
	"github.com/darkliquid/tilbo/internal/vectorize"
	"github.com/darkliquid/tilbo/internal/watcher"
	"github.com/darkliquid/tilbo/internal/xattr"
)

type safeBuffer struct {
	mu sync.Mutex
	b  bytes.Buffer
}

func (s *safeBuffer) Write(p []byte) (int, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.b.Write(p)
}

func (s *safeBuffer) String() string {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.b.String()
}

func runCreateRenameModifyBurst(
	ctx context.Context,
	loops int,
	pathA string,
	pathB string,
	syncer *isync.Syncer,
	idx *index.DB,
	proc *Processor,
) {
	for range loops {
		if err := os.WriteFile(pathA, []byte("data-a"), 0o644); err == nil {
			handleFSEvent(ctx, watcher.Event{Kind: watcher.EventCreate, Path: pathA}, syncer, idx, proc)
		}

		if err := os.Rename(pathA, pathB); err == nil {
			handleFSEvent(
				ctx,
				watcher.Event{Kind: watcher.EventRename, OldPath: pathA, Path: pathB},
				syncer,
				idx,
				proc,
			)
		}

		if err := os.WriteFile(pathB, []byte("data-b"), 0o644); err == nil {
			handleFSEvent(ctx, watcher.Event{Kind: watcher.EventModify, Path: pathB}, syncer, idx, proc)
		}

		if err := os.Rename(pathB, pathA); err == nil {
			handleFSEvent(
				ctx,
				watcher.Event{Kind: watcher.EventRename, OldPath: pathB, Path: pathA},
				syncer,
				idx,
				proc,
			)
		}
	}
}

func runDeleteBurst(
	ctx context.Context,
	loops int,
	pathA string,
	pathB string,
	syncer *isync.Syncer,
	idx *index.DB,
	proc *Processor,
) {
	for range loops * 2 {
		if err := os.Remove(pathA); err == nil {
			handleFSEvent(ctx, watcher.Event{Kind: watcher.EventDelete, Path: pathA}, syncer, idx, proc)
		}
		if err := os.Remove(pathB); err == nil {
			handleFSEvent(ctx, watcher.Event{Kind: watcher.EventDelete, Path: pathB}, syncer, idx, proc)
		}
	}
}

func TestResolveEmbedModelSource(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name           string
		embedModelPath string
		embedModelName string
		wantPath       string
		wantModelName  string
		wantDownload   bool
	}{
		{
			name:           "explicit path wins",
			embedModelPath: "/models/local",
			embedModelName: "sentence-transformers/custom",
			wantPath:       "/models/local",
			wantModelName:  "",
			wantDownload:   false,
		},
		{
			name:           "custom model name preserved",
			embedModelName: "sentence-transformers/custom",
			wantPath:       "",
			wantModelName:  "sentence-transformers/custom",
			wantDownload:   true,
		},
		{
			name:          "default model name filled in",
			wantPath:      "",
			wantModelName: vectorize.DefaultModelName,
			wantDownload:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			gotPath, gotModelName, gotDownload := resolveEmbedModelSource(tt.embedModelPath, tt.embedModelName)
			if gotPath != tt.wantPath || gotModelName != tt.wantModelName || gotDownload != tt.wantDownload {
				t.Fatalf(
					"resolveEmbedModelSource(%q, %q) = (%q, %q, %t), want (%q, %q, %t)",
					tt.embedModelPath,
					tt.embedModelName,
					gotPath,
					gotModelName,
					gotDownload,
					tt.wantPath,
					tt.wantModelName,
					tt.wantDownload,
				)
			}
		})
	}
}

func TestHandleFSEvent_CreateRenameDeleteBurst_NoForeignKeyErrors(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	root := t.TempDir()
	dbPath := filepath.Join(root, "index.db")

	idx, err := index.Open(ctx, dbPath)
	if err != nil {
		t.Fatalf("open index: %v", err)
	}
	t.Cleanup(func() { _ = idx.Close() })

	tags := xattr.New(nil)
	syncer := isync.New(idx, tags, root, true, nil)
	proc := newProcessor(idx, tags, harvester.NewPipeline(), rules.NewEngine(), graph.New(), nil)

	logBuf := &safeBuffer{}
	prev := slog.Default()
	slog.SetDefault(slog.New(slog.NewTextHandler(logBuf, &slog.HandlerOptions{Level: slog.LevelDebug})))
	t.Cleanup(func() { slog.SetDefault(prev) })

	pathA := filepath.Join(root, "burst-a.jpg")
	pathB := filepath.Join(root, "burst-b.jpg")
	if err := os.WriteFile(pathA, []byte("seed"), 0o644); err != nil {
		t.Fatalf("seed file: %v", err)
	}

	const loops = 120
	var wg sync.WaitGroup

	wg.Go(func() {
		runCreateRenameModifyBurst(ctx, loops, pathA, pathB, syncer, idx, proc)
	})

	wg.Go(func() {
		runDeleteBurst(ctx, loops, pathA, pathB, syncer, idx, proc)
	})

	wg.Wait()

	logs := logBuf.String()
	if strings.Contains(logs, "FOREIGN KEY constraint failed") {
		t.Fatalf("unexpected foreign key error in daemon event handling logs:\n%s", logs)
	}
}
