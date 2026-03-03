package index

import (
	"context"
	"encoding/binary"
	"fmt"
	"math"
	"sort"
	"strings"
)

// EmbeddingDim is the vector dimension expected by the file_embeddings table.
// Matches all-MiniLM-L6-v2 output.
const EmbeddingDim = 384

// KNNResult is one file returned by KNNSearch.
type KNNResult struct {
	FileID   int64
	Path     string
	Distance float64 // squared L2 distance (lower is more similar)
}

// SerializeFloat32 encodes a float32 slice as a little-endian byte blob
// suitable for storage in the file_embeddings table.
// The format is identical to the one expected by the sqlite-vec extension,
// so the data is compatible if a vec0 table is used in future.
func SerializeFloat32(v []float32) []byte {
	b := make([]byte, len(v)*4)
	for i, f := range v {
		binary.LittleEndian.PutUint32(b[i*4:], math.Float32bits(f))
	}
	return b
}

// DeserializeFloat32 decodes a little-endian byte blob produced by
// SerializeFloat32 back into a float32 slice.
func DeserializeFloat32(b []byte) []float32 {
	v := make([]float32, len(b)/4)
	for i := range v {
		v[i] = math.Float32frombits(binary.LittleEndian.Uint32(b[i*4:]))
	}
	return v
}

// UpsertEmbedding stores the embedding vector for fileID. Any existing
// embedding for the same fileID is replaced.
func (d *DB) UpsertEmbedding(ctx context.Context, fileID int64, vec []float32) error {
	if len(vec) != EmbeddingDim {
		return fmt.Errorf("index: embedding must have %d dimensions, got %d", EmbeddingDim, len(vec))
	}
	blob := SerializeFloat32(vec)
	if _, err := d.db.ExecContext(ctx,
		`INSERT INTO file_embeddings(file_id, embedding) VALUES (?, ?)
		 ON CONFLICT(file_id) DO UPDATE SET embedding = excluded.embedding`,
		fileID, blob); err != nil {
		return fmt.Errorf("index: upsert embedding file=%d: %w", fileID, err)
	}
	return nil
}

// DeleteEmbedding removes the embedding for fileID. It is a no-op if no
// embedding exists.
func (d *DB) DeleteEmbedding(ctx context.Context, fileID int64) error {
	if _, err := d.db.ExecContext(ctx,
		"DELETE FROM file_embeddings WHERE file_id = ?", fileID); err != nil {
		return fmt.Errorf("index: delete embedding file=%d: %w", fileID, err)
	}
	return nil
}

// KNNSearch returns the k nearest neighbours to vec by squared L2 distance.
// If filterTags is non-empty, only files that carry ALL of those tags are
// considered (AND semantics). Results are ordered by ascending distance.
//
// The search is performed in Go: candidate embeddings are fetched from SQLite
// and distances are computed in-process. This is efficient for corpora up to
// tens of thousands of files. When a compatible sqlite-vec WASM build is
// available the implementation can be swapped to a single SQL KNN query.
func (d *DB) KNNSearch(ctx context.Context, vec []float32, k int, filterTags []string) ([]KNNResult, error) {
	if len(vec) != EmbeddingDim {
		return nil, fmt.Errorf("index: KNN query vector must have %d dimensions, got %d", EmbeddingDim, len(vec))
	}
	if k <= 0 {
		k = 20
	}

	var (
		query string
		args  []any
	)

	if len(filterTags) == 0 {
		query = `SELECT fe.file_id, f.path, fe.embedding
			FROM file_embeddings fe
			JOIN files f ON f.id = fe.file_id`
	} else {
		ph := strings.Repeat("?,", len(filterTags))
		ph = ph[:len(ph)-1]
		query = fmt.Sprintf(`SELECT fe.file_id, f.path, fe.embedding
			FROM file_embeddings fe
			JOIN files f ON f.id = fe.file_id
			WHERE fe.file_id IN (
				SELECT ft.file_id
				FROM file_tags ft
				JOIN tags t ON t.id = ft.tag_id
				WHERE t.name IN (%s)
				GROUP BY ft.file_id
				HAVING COUNT(DISTINCT t.name) = %d
			)`, ph, len(filterTags))
		args = make([]any, len(filterTags))
		for i, t := range filterTags {
			args[i] = t
		}
	}

	rows, err := d.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("index: KNN fetch candidates: %w", err)
	}
	defer rows.Close()

	type candidate struct {
		fileID int64
		path   string
		dist   float64
	}
	var candidates []candidate

	for rows.Next() {
		var (
			fileID int64
			path   string
			blob   []byte
		)
		if err := rows.Scan(&fileID, &path, &blob); err != nil {
			return nil, fmt.Errorf("index: KNN scan: %w", err)
		}
		if len(blob) != EmbeddingDim*4 {
			continue // skip corrupt entries
		}
		cand := DeserializeFloat32(blob)
		dist := squaredL2(vec, cand)
		candidates = append(candidates, candidate{fileID: fileID, path: path, dist: dist})
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	sort.Slice(candidates, func(i, j int) bool {
		return candidates[i].dist < candidates[j].dist
	})
	if len(candidates) > k {
		candidates = candidates[:k]
	}

	results := make([]KNNResult, len(candidates))
	for i, c := range candidates {
		results[i] = KNNResult{FileID: c.fileID, Path: c.path, Distance: c.dist}
	}
	return results, nil
}

// squaredL2 returns the squared Euclidean distance between a and b.
// Both slices must have the same length.
func squaredL2(a, b []float32) float64 {
	var sum float64
	for i := range a {
		d := float64(a[i]) - float64(b[i])
		sum += d * d
	}
	return sum
}
