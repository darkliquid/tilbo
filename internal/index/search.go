package index

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strconv"
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
	SortBy      []string // "mtime:desc", "name:asc", "size:desc"
}

// SearchResult is one file returned by Search.
type SearchResult struct {
	Path      string
	Tags      []string
	Metadata  map[string]string
	Mtime     int64
	SizeBytes int64
}

// Search returns files matching params and the total count before limit/offset.
func (d *DB) Search(ctx context.Context, p SearchParams) ([]SearchResult, int, error) {
	limit := int(p.Limit)
	if limit <= 0 {
		limit = 50
	}

	var sb strings.Builder
	args := make([]any, 0, 16)

	sb.WriteString("SELECT f.id, f.path, f.mtime, f.size_bytes FROM files f WHERE 1=1")

	// FTS filter.
	if p.FTSQuery != "" {
		sb.WriteString(` AND f.id IN (
			SELECT m.file_id FROM metadata m
			JOIN metadata_fts fts ON fts.rowid = m.rowid
			WHERE fts.value MATCH ?)`)
		args = append(args, p.FTSQuery)
	}

	// Tag include.
	if len(p.Tags) > 0 {
		placeholders := strings.Repeat("?,", len(p.Tags))
		placeholders = placeholders[:len(placeholders)-1]
		if p.TagsAny {
			sb.WriteString(fmt.Sprintf(` AND EXISTS (
				SELECT 1 FROM file_tags ft JOIN tags t ON t.id = ft.tag_id
				WHERE ft.file_id = f.id AND t.name IN (%s))`, placeholders))
		} else {
			sb.WriteString(fmt.Sprintf(` AND (
				SELECT COUNT(DISTINCT t.name) FROM file_tags ft
				JOIN tags t ON t.id = ft.tag_id
				WHERE ft.file_id = f.id AND t.name IN (%s)) = %d`, placeholders, len(p.Tags)))
		}
		for _, t := range p.Tags {
			args = append(args, t)
		}
	}

	// Tag exclude.
	if len(p.TagExclude) > 0 {
		placeholders := strings.Repeat("?,", len(p.TagExclude))
		placeholders = placeholders[:len(placeholders)-1]
		sb.WriteString(fmt.Sprintf(` AND NOT EXISTS (
			SELECT 1 FROM file_tags ft JOIN tags t ON t.id = ft.tag_id
			WHERE ft.file_id = f.id AND t.name IN (%s))`, placeholders))
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
	for key, opval := range p.MetaFilters {
		if key == "__path__" {
			continue
		}
		op, val, _ := strings.Cut(opval, ":")
		var cond string
		switch op {
		case "eq", "":
			cond = fmt.Sprintf(`AND EXISTS (SELECT 1 FROM metadata WHERE file_id = f.id AND key = ? AND value = ?)`)
			args = append(args, key, val)
		case "contains":
			cond = fmt.Sprintf(`AND EXISTS (SELECT 1 FROM metadata WHERE file_id = f.id AND key = ? AND value LIKE ?)`)
			args = append(args, key, "%"+val+"%")
		case "gt", "gte", "lt", "lte":
			sqlOp := map[string]string{"gt": ">", "gte": ">=", "lt": "<", "lte": "<="}[op]
			cond = fmt.Sprintf(`AND EXISTS (SELECT 1 FROM metadata WHERE file_id = f.id AND key = ? AND CAST(value AS REAL) %s ?)`, sqlOp)
			args = append(args, key, val)
		default:
			continue
		}
		sb.WriteString(" ")
		sb.WriteString(cond)
	}

	// Count query (before limit/offset).
	countQuery := "SELECT COUNT(*) FROM (" + sb.String() + ")"
	var total int
	if err := d.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, fmt.Errorf("index: search count: %w", err)
	}

	// ORDER BY.
	sb.WriteString(" ORDER BY ")
	if len(p.SortBy) > 0 {
		var orderClauses []string
		for _, s := range p.SortBy {
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
		if len(orderClauses) > 0 {
			sb.WriteString(strings.Join(orderClauses, ", "))
		} else {
			sb.WriteString("f.mtime DESC")
		}
	} else {
		sb.WriteString("f.mtime DESC")
	}

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
	}
	var fileRows []fileRow
	for rows.Next() {
		var r fileRow
		if err := rows.Scan(&r.id, &r.path, &r.mtime, &r.sizeBytes); err != nil {
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
		}

		// Tags.
		trows, err := d.db.QueryContext(ctx,
			"SELECT t.name FROM file_tags ft JOIN tags t ON t.id = ft.tag_id WHERE ft.file_id = ?", fr.id)
		if err == nil {
			for trows.Next() {
				var name string
				if err := trows.Scan(&name); err == nil {
					sr.Tags = append(sr.Tags, name)
				}
			}
			trows.Close()
		}

		// Metadata.
		mrows, err := d.db.QueryContext(ctx,
			"SELECT key, value FROM metadata WHERE file_id = ?", fr.id)
		if err == nil {
			sr.Metadata = make(map[string]string)
			for mrows.Next() {
				var k, v string
				if err := mrows.Scan(&k, &v); err == nil {
					sr.Metadata[k] = v
				}
			}
			mrows.Close()
		}

		results = append(results, sr)
	}
	return results, total, nil
}

// GetFileMeta returns all metadata key-value pairs and their sources for path.
func (d *DB) GetFileMeta(ctx context.Context, path string) (vals map[string]string, sources map[string]string, err error) {
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

	vals = make(map[string]string)
	sources = make(map[string]string)
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

// ModifyFileTags adds or removes tags for a file identified by path.
// For TAG_OPERATION_ADD/REMOVE the file must already be in the index.
// For TAG_OPERATION_SET the existing tags are fully replaced.
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

// metaValueToString converts any meta value to its string representation for
// display. Numeric float64 values from the index are stored as text.
func metaValueToString(v any) string {
	switch n := v.(type) {
	case float64:
		return strconv.FormatFloat(n, 'f', -1, 64)
	case string:
		return n
	default:
		return fmt.Sprintf("%v", v)
	}
}
