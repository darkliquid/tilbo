package index

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"github.com/darkliquid/tilbo/internal/index/dbgen"
)

// SearchParams describes a file search query.
type SearchParams struct {
	Tags        []string          // required tags (AND unless TagsAny)
	TagsAny     bool              // if true, OR semantics on Tags
	TagExclude  []string          // tags that must NOT be present
	MetaFilters map[string]string // key → "op:value" (eq, gt, lt, gte, lte, contains)
	FTSQuery    string            // full-text query against metadata values
	MtimeSince  int64             // if > 0, only files with mtime >= MtimeSince (Unix seconds)
	Untagged    bool              // if true, only files with no tags
	Limit       uint32            // 0 = 50
	Offset      uint32
	SortBy      []string  // e.g. ["mtime:desc", "name:asc"]
	VectorQuery []float32 // optional embedding vector for semantic search
}

func buildOrderClauses(sortBy []string) []string {
	if len(sortBy) == 0 {
		return nil
	}

	orderClauses := make([]string, 0, len(sortBy))
	for _, s := range sortBy {
		col, dir, _ := strings.Cut(s, ":")
		if dir == "" {
			dir = "asc"
		}
		dir = strings.ToUpper(dir)
		if dir != "ASC" && dir != "DESC" {
			dir = "ASC"
		}

		switch col {
		case "mtime":
			orderClauses = append(orderClauses, "f.mtime "+dir)
		case "name":
			orderClauses = append(orderClauses, "f.path "+dir)
		case "size":
			orderClauses = append(orderClauses, "f.size_bytes "+dir)
		}
	}

	return orderClauses
}

// SearchResult is one file returned by Search.
type SearchResult struct {
	Path      string
	Tags      []string
	Metadata  map[string]string
	Mtime     int64
	SizeBytes int64
	Score     float64 // relevance score (FTS rank or vector distance)
}

const searchArgsCap = 16

// Search returns files matching params and the total count before limit/offset.
//
//nolint:funlen,gocognit // SQL builder keeps filter and ordering semantics centralized
func (d *DB) Search(ctx context.Context, p SearchParams) ([]SearchResult, int, error) {
	if len(p.VectorQuery) > 0 {
		return d.vectorSearch(ctx, p)
	}

	limit := int(p.Limit)
	if limit <= 0 {
		limit = 50
	}

	var sb strings.Builder
	args := make([]any, 0, searchArgsCap)

	if p.FTSQuery != "" {
		sb.WriteString("SELECT f.id, f.path, f.mtime, f.size_bytes, fts.rank FROM files f")
		sb.WriteString(` JOIN metadata m ON m.file_id = f.id
			JOIN metadata_fts fts ON fts.rowid = m.rowid
			WHERE fts.value MATCH ?`)
		args = append(args, p.FTSQuery)
	} else {
		sb.WriteString("SELECT f.id, f.path, f.mtime, f.size_bytes, 0.0 as rank FROM files f WHERE 1=1")
	}

	// Tag include.
	// Both branches use an upfront IN-subquery so SQLite can drive the join
	// from file_tags(tag_id) rather than running a correlated subquery for
	// every row in the files table.
	if len(p.Tags) > 0 {
		placeholders := strings.Repeat("?,", len(p.Tags))
		placeholders = placeholders[:len(placeholders)-1]
		if p.TagsAny {
			// OR: file must have at least one of the tags.
			fmt.Fprintf(&sb, ` AND f.id IN (
				SELECT DISTINCT ft.file_id FROM file_tags ft
				JOIN tags t ON t.id = ft.tag_id
				WHERE t.name IN (%s))`, placeholders)
		} else {
			// AND: file must have every one of the tags.
			fmt.Fprintf(&sb, ` AND f.id IN (
				SELECT ft.file_id FROM file_tags ft
				JOIN tags t ON t.id = ft.tag_id
				WHERE t.name IN (%s)
				GROUP BY ft.file_id
				HAVING COUNT(DISTINCT t.name) = %d)`, placeholders, len(p.Tags))
		}
		for _, t := range p.Tags {
			args = append(args, t)
		}
	}

	// Tag exclude.
	if len(p.TagExclude) > 0 {
		placeholders := strings.Repeat("?,", len(p.TagExclude))
		placeholders = placeholders[:len(placeholders)-1]
		fmt.Fprintf(&sb, ` AND NOT EXISTS (
			SELECT 1 FROM file_tags ft JOIN tags t ON t.id = ft.tag_id
			WHERE ft.file_id = f.id AND t.name IN (%s))`, placeholders)
		for _, t := range p.TagExclude {
			args = append(args, t)
		}
	}

	// Mtime lower bound (used by FUSE @recent).
	if p.MtimeSince > 0 {
		sb.WriteString(" AND f.mtime >= ?")
		args = append(args, p.MtimeSince)
	}

	// Untagged filter (used by FUSE @untagged).
	if p.Untagged {
		sb.WriteString(" AND NOT EXISTS (SELECT 1 FROM file_tags ft WHERE ft.file_id = f.id)")
	}

	// Special __path__ pseudo-filter: exact file path match (internal CLI use).
	if pf, ok := p.MetaFilters["__path__"]; ok {
		_, pathVal, _ := strings.Cut(pf, ":")
		sb.WriteString(" AND f.path = ?")
		args = append(args, pathVal)
	}

	// Meta filters.
	d.applyMetaFilters(&sb, &args, p.MetaFilters)

	// Count query (before limit/offset).
	countQuery := "SELECT COUNT(*) FROM (" + sb.String() + ")"
	var total int
	if err := d.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, fmt.Errorf("index: search count: %w", err)
	}

	// ORDER BY.
	var orderBy string
	if p.FTSQuery != "" {
		orderBy = "fts.rank"
	} else {
		orderBy = "f.mtime DESC"
	}
	if orderClauses := buildOrderClauses(p.SortBy); len(orderClauses) > 0 {
		orderBy = strings.Join(orderClauses, ", ")
	}
	sb.WriteString(" ORDER BY ")
	sb.WriteString(orderBy)

	sb.WriteString(" LIMIT ? OFFSET ?")
	args = append(args, limit, int(p.Offset))

	rows, err := d.db.QueryContext(ctx, sb.String(), args...)
	if err != nil {
		return nil, 0, fmt.Errorf("index: search query: %w", err)
	}
	defer rows.Close()

	type fileRow struct {
		id        int64
		path      string
		mtime     int64
		sizeBytes int64
		score     float64
	}
	var fileRows []fileRow
	for rows.Next() {
		var r fileRow
		if err := rows.Scan(&r.id, &r.path, &r.mtime, &r.sizeBytes, &r.score); err != nil {
			return nil, 0, fmt.Errorf("index: search scan: %w", err)
		}
		fileRows = append(fileRows, r)
	}
	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	// Enrich each result with tags and metadata.
	results := make([]SearchResult, 0, len(fileRows))
	for _, fr := range fileRows {
		sr := SearchResult{
			Path:      fr.path,
			Mtime:     fr.mtime,
			SizeBytes: fr.sizeBytes,
			Score:     fr.score,
		}

		// Tags.
		trows, err := d.db.QueryContext(ctx,
			"SELECT t.name FROM file_tags ft JOIN tags t ON t.id = ft.tag_id WHERE ft.file_id = ?", fr.id)
		if err == nil {
			func() {
				defer trows.Close()
				for trows.Next() {
					var name string
					if scanErr := trows.Scan(&name); scanErr == nil {
						sr.Tags = append(sr.Tags, name)
					}
				}
				_ = trows.Err()
			}()
		}

		// Metadata.
		mrows, err := d.db.QueryContext(ctx,
			"SELECT key, value FROM metadata WHERE file_id = ?", fr.id)
		if err == nil {
			func() {
				defer mrows.Close()
				sr.Metadata = make(map[string]string)
				for mrows.Next() {
					var k, v string
					if err := mrows.Scan(&k, &v); err == nil {
						sr.Metadata[k] = v
					}
				}
				_ = mrows.Err()
			}()
		}

		results = append(results, sr)
	}
	return results, total, nil
}

// GetFileMeta returns all metadata key-value pairs and their sources for path.
func (d *DB) GetFileMeta(
	ctx context.Context,
	path string,
) (map[string]string, map[string]string, error) {
	fileID, err := d.q.GetFileIDByPath(ctx, path)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil, nil
		}
		return nil, nil, fmt.Errorf("index: get file for meta %q: %w", path, err)
	}

	rows, err := d.q.GetFileMeta(ctx, fileID)
	if err != nil {
		return nil, nil, fmt.Errorf("index: get meta %q: %w", path, err)
	}

	vals := make(map[string]string)
	sources := make(map[string]string)
	for _, r := range rows {
		vals[r.Key] = r.Value
		sources[r.Key] = r.Source
	}
	return vals, sources, nil
}

// DeleteMeta removes a metadata key for path.
func (d *DB) DeleteMeta(ctx context.Context, path string, key string) error {
	fileID, err := d.q.GetFileIDByPath(ctx, path)
	if err != nil {
		return fmt.Errorf("index: get file for delete meta %q: %w", path, err)
	}
	if err := d.q.DeleteMeta(ctx, dbgen.DeleteMetaParams{
		FileID: fileID,
		Key:    key,
	}); err != nil {
		return fmt.Errorf("index: delete meta %q key %q: %w", path, key, err)
	}
	return nil
}

// GetFileTags returns the tag names for path.
func (d *DB) GetFileTags(ctx context.Context, path string) ([]string, error) {
	fileID, err := d.q.GetFileIDByPath(ctx, path)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return []string{}, nil
		}
		return nil, fmt.Errorf("index: get file id for tags %q: %w", path, err)
	}
	tags, err := d.q.GetFileTags(ctx, fileID)
	if err != nil {
		return nil, fmt.Errorf("index: get tags for %q: %w", path, err)
	}
	// Return empty slice instead of nil for consistency
	if tags == nil {
		tags = []string{}
	}
	return tags, nil
}

// GetFileTagsBatch returns tag names for each requested path in one query.
// Missing files are returned with empty tag slices.
func (d *DB) GetFileTagsBatch(ctx context.Context, paths []string) (map[string][]string, error) {
	if len(paths) == 0 {
		return map[string][]string{}, nil
	}

	// Keep output deterministic and preserve missing-file behavior.
	result := make(map[string][]string, len(paths))
	unique := make([]string, 0, len(paths))
	seen := make(map[string]struct{}, len(paths))
	for _, p := range paths {
		if _, ok := seen[p]; ok {
			continue
		}
		seen[p] = struct{}{}
		unique = append(unique, p)
		result[p] = []string{}
	}

	placeholders := strings.Repeat("?,", len(unique))
	placeholders = placeholders[:len(placeholders)-1]
	//nolint:gosec // G202: placeholders contains only "?,..." generated by strings.Repeat, never user input.
	query := `
		SELECT f.path, t.name
		FROM files f
		LEFT JOIN file_tags ft ON ft.file_id = f.id
		LEFT JOIN tags t ON t.id = ft.tag_id
		WHERE f.path IN (` + placeholders + `)
		ORDER BY f.path, t.name`

	args := make([]any, 0, len(unique))
	for _, p := range unique {
		args = append(args, p)
	}

	rows, err := d.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("index: batch get tags: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var path string
		var tag sql.NullString
		if err := rows.Scan(&path, &tag); err != nil {
			return nil, fmt.Errorf("index: batch get tags scan: %w", err)
		}
		if tag.Valid && tag.String != "" {
			result[path] = append(result[path], tag.String)
		}
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("index: batch get tags rows: %w", err)
	}

	return result, nil
}

// ModifyFileTags adds or removes tags for a file identified by path.
// For TAG_OPERATION_ADD/REMOVE the file must already be in the index.
// For TAG_OPERATION_SET the existing tags are fully replaced.
//
//nolint:gocognit // explicit operation handling keeps DB and graph updates aligned
func (d *DB) ModifyFileTags(ctx context.Context, path string, tags []string, op string) error {
	fileID, err := d.GetFileIDByPath(ctx, path)
	if err != nil {
		return fmt.Errorf("index: modify tags: file not in index %q: %w", path, err)
	}

	switch op {
	case "add":
		for _, name := range tags {
			tagID, err := d.UpsertTag(ctx, name)
			if err != nil {
				return err
			}
			if err := d.AddFileTag(ctx, fileID, tagID); err != nil {
				return err
			}
		}
	case "remove":
		for _, name := range tags {
			var tagID int64
			err := d.db.QueryRowContext(ctx, "SELECT id FROM tags WHERE name = ?", name).Scan(&tagID)
			if err != nil {
				if err == sql.ErrNoRows {
					continue // tag doesn't exist; nothing to remove
				}
				return fmt.Errorf("index: resolve tag %q: %w", name, err)
			}
			if err := d.RemoveFileTag(ctx, fileID, tagID); err != nil {
				return err
			}
		}
	case "set":
		return d.SetFileTags(ctx, fileID, tags)
	default:
		return fmt.Errorf("index: unknown tag operation %q", op)
	}
	return nil
}

func (d *DB) vectorSearch(ctx context.Context, p SearchParams) ([]SearchResult, int, error) {
	limit := int(p.Limit)
	if limit <= 0 {
		limit = 50
	}

	// For vector search, we use KNNSearch which already handles tag inclusion filters (AND semantics).
	// We don't support p.TagsAny or p.TagExclude or p.MetaFilters or p.FTSQuery in the optimized path yet.
	// For now, we'll support p.Tags (AND) if p.TagsAny is false and p.TagExclude is empty.
	var filterTags []string
	if !p.TagsAny &&
		len(p.TagExclude) == 0 &&
		len(p.MetaFilters) == 0 &&
		p.FTSQuery == "" &&
		p.MtimeSince == 0 &&
		!p.Untagged {
		filterTags = p.Tags
	}

	knnResults, err := d.KNNSearch(ctx, p.VectorQuery, limit+int(p.Offset), filterTags)
	if err != nil {
		return nil, 0, err
	}

	// Pagination.
	if int(p.Offset) >= len(knnResults) {
		return nil, len(knnResults), nil
	}
	start := int(p.Offset)
	end := min(int(p.Offset)+limit, len(knnResults))
	knnResults = knnResults[start:end]

	results := make([]SearchResult, 0, len(knnResults))
	for _, kr := range knnResults {
		summary, err := d.GetFileSummary(ctx, kr.Path)
		if err != nil {
			continue
		}

		// Metadata.
		mrows, err := d.db.QueryContext(ctx,
			"SELECT key, value FROM metadata WHERE file_id = ?", kr.FileID)
		meta := make(map[string]string)
		if err == nil {
			func() {
				defer mrows.Close()
				for mrows.Next() {
					var k, v string
					if err := mrows.Scan(&k, &v); err == nil {
						meta[k] = v
					}
				}
				_ = mrows.Err()
			}()
		}

		results = append(results, SearchResult{
			Path:      summary.Path,
			Tags:      summary.Tags,
			Metadata:  meta,
			Mtime:     summary.Mtime,
			SizeBytes: summary.SizeBytes,
			Score:     kr.Distance,
		})
	}

	return results, len(results), nil // Total is approximate for KNN
}

func (d *DB) applyMetaFilters(sb *strings.Builder, args *[]any, metaFilters map[string]string) {
	for key, opval := range metaFilters {
		if key == "__path__" {
			continue
		}
		op, val, _ := strings.Cut(opval, ":")
		var cond string
		switch op {
		case "eq", "":
			cond = "AND EXISTS (SELECT 1 FROM metadata WHERE file_id = f.id AND key = ? AND value = ?)"
			*args = append(*args, key, val)
		case "contains":
			cond = "AND EXISTS (SELECT 1 FROM metadata WHERE file_id = f.id AND key = ? AND value LIKE ?)"
			*args = append(*args, key, "%"+val+"%")
		case "gt", "gte", "lt", "lte":
			sqlOp := map[string]string{"gt": ">", "gte": ">=", "lt": "<", "lte": "<="}[op]
			cond = fmt.Sprintf(
				"AND EXISTS (SELECT 1 FROM metadata WHERE file_id = f.id AND key = ? AND CAST(value AS REAL) %s ?)",
				sqlOp,
			)
			*args = append(*args, key, val)
		default:
			continue
		}
		sb.WriteString(" ")
		sb.WriteString(cond)
	}
}
