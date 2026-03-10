package index

import (
	"context"
	"encoding/binary"
	"fmt"
	"math"
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

	// virtual tables (vec0) do not support ON CONFLICT.
	tx, err := d.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback() //nolint:errcheck

	if _, err := tx.ExecContext(ctx, "DELETE FROM file_embeddings WHERE file_id = ?", fileID); err != nil {
		return fmt.Errorf("index: upsert embedding delete old file=%d: %w", fileID, err)
	}
	if _, err := tx.ExecContext(ctx, "INSERT INTO file_embeddings(file_id, embedding) VALUES (?, ?)", fileID, blob); err != nil {
		return fmt.Errorf("index: upsert embedding insert file=%d: %w", fileID, err)
	}

	return tx.Commit()
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
func (d *DB) KNNSearch(ctx context.Context, vec []float32, k int, filterTags []string) ([]KNNResult, error) {
	if len(vec) != EmbeddingDim {
		return nil, fmt.Errorf("index: KNN query vector must have %d dimensions, got %d", EmbeddingDim, len(vec))
	}
	if k <= 0 {
		k = 20
	}

	blob := SerializeFloat32(vec)

	var (
		query string
		args  []any
	)

	// In vec0, we use a subquery to match embeddings and join back to files.
	if len(filterTags) == 0 {
		query = `SELECT fe.file_id, f.path, fe.distance
			FROM file_embeddings fe
			JOIN files f ON f.id = fe.file_id
			WHERE fe.embedding MATCH ? AND k = ?
			ORDER BY fe.distance`
		args = []any{blob, k}
	} else {
		// When filtering tags, sqlite-vec allows filtering by rowid (which is file_id in our definition)
		// Or we can just join against the filtered set since `k` might need to be larger to compensate.
		// However, vec0 does not natively support pre-filtering by external joins yet in an optimal way
		// unless you do `where rowid in (...)`.
		ph := strings.Repeat("?,", len(filterTags))
		ph = ph[:len(ph)-1]
		query = fmt.Sprintf(`SELECT fe.file_id, f.path, fe.distance
			FROM file_embeddings fe
			JOIN files f ON f.id = fe.file_id
			WHERE fe.embedding MATCH ? AND k = ? AND fe.file_id IN (
				SELECT ft.file_id
				FROM file_tags ft
				JOIN tags t ON t.id = ft.tag_id
				WHERE t.name IN (%s)
				GROUP BY ft.file_id
				HAVING COUNT(DISTINCT t.name) = %d
			)
			ORDER BY fe.distance`, ph, len(filterTags))
		args = make([]any, 2+len(filterTags))
		args[0] = blob
		args[1] = k * 10 // increase k since we filter post-match 
		for i, t := range filterTags {
			args[2+i] = t
		}
	}

	rows, err := d.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("index: KNN search: %w", err)
	}
	defer rows.Close()

	var results []KNNResult

	for rows.Next() {
		var (
			fileID int64
			path   string
			dist   float64
		)
		if err := rows.Scan(&fileID, &path, &dist); err != nil {
			return nil, fmt.Errorf("index: KNN scan: %w", err)
		}
		
		results = append(results, KNNResult{FileID: fileID, Path: path, Distance: dist})
		if len(results) == k {
			break
		}
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return results, nil
}

// ListEmbeddings returns all file embeddings to populate the memory graph.
func (d *DB) ListEmbeddings(ctx context.Context) (map[string][]float32, error) {
	query := `SELECT f.path, vec_to_blob(fe.embedding) 
		FROM file_embeddings fe
		JOIN files f ON f.id = fe.file_id`
	rows, err := d.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("index: list embeddings: %w", err)
	}
	defer rows.Close()

	embs := make(map[string][]float32)
	for rows.Next() {
		var (
			path string
			blob []byte
		)
		if err := rows.Scan(&path, &blob); err != nil {
			return nil, fmt.Errorf("index: scan embedding: %w", err)
		}
		if len(blob) == EmbeddingDim*4 {
			embs[path] = DeserializeFloat32(blob)
		}
	}
	return embs, rows.Err()
}
