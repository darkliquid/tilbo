// Package index manages the SQLite-backed file index for tilbo.
// It is CGo-free, using the ncruces WASM-based SQLite driver.
package index

import (
	"context"
	"database/sql"
	"embed"
	"errors"
	"fmt"
	"log/slog"
	"math"

	"github.com/darkliquid/tilbo/internal/index/dbgen"

	"sort"
	"strings"
	"time"

	// sqlite3 driver registration.
	_ "github.com/ncruces/go-sqlite3/driver"
)

const tagArgMultiplier = 2

//go:embed migrations/*.sql
var migrationsFS embed.FS

// DB wraps a SQLite database connection and provides the tilbo index API.
type DB struct {
	db *sql.DB
	q  *dbgen.Queries
}

// Open opens (or creates) the SQLite database at path, configures it, and runs
// any pending migrations. The caller must call Close when done.
func Open(ctx context.Context, path string) (*DB, error) {
	db, err := sql.Open("sqlite3", path)
	if err != nil {
		return nil, fmt.Errorf("index: open %q: %w", path, err)
	}

	// Single writer connection is sufficient; serialise writes.
	db.SetMaxOpenConns(1)

	if _, err := db.ExecContext(ctx, "PRAGMA journal_mode=WAL"); err != nil {
		_ = db.Close()
		return nil, fmt.Errorf("index: set WAL: %w", err)
	}
	if _, err := db.ExecContext(ctx, "PRAGMA synchronous=NORMAL"); err != nil {
		_ = db.Close()
		return nil, fmt.Errorf("index: set synchronous: %w", err)
	}
	if _, err := db.ExecContext(ctx, "PRAGMA foreign_keys=ON"); err != nil {
		_ = db.Close()
		return nil, fmt.Errorf("index: enable foreign keys: %w", err)
	}
	// 128 MiB memory-mapped I/O: avoids kernel↔userspace copies on read paths.
	if _, err := db.ExecContext(ctx, "PRAGMA mmap_size=134217728"); err != nil {
		_ = db.Close()
		return nil, fmt.Errorf("index: set mmap_size: %w", err)
	}
	// 32 MiB page cache (negative value = KiB).
	if _, err := db.ExecContext(ctx, "PRAGMA cache_size=-32768"); err != nil {
		_ = db.Close()
		return nil, fmt.Errorf("index: set cache_size: %w", err)
	}

	idx := &DB{
		db: db,
		q:  dbgen.New(db),
	}
	if err := idx.Migrate(ctx); err != nil {
		_ = db.Close()
		return nil, err
	}
	return idx, nil
}

// Close closes the underlying database connection.
func (d *DB) Close() error {
	return d.db.Close()
}

// Migrate reads embedded migration files and applies any that have not yet been
// recorded in schema_migrations. It is idempotent.
func (d *DB) Migrate(ctx context.Context) error {
	// Ensure schema_migrations exists before reading it.
	if _, err := d.db.ExecContext(ctx, `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version    INTEGER PRIMARY KEY,
			applied_at INTEGER NOT NULL
		)`); err != nil {
		return fmt.Errorf("index: bootstrap schema_migrations: %w", err)
	}

	entries, err := migrationsFS.ReadDir("migrations")
	if err != nil {
		return fmt.Errorf("index: read migrations dir: %w", err)
	}

	// Sort by filename to guarantee ascending order.
	sort.Slice(entries, func(i, j int) bool {
		return entries[i].Name() < entries[j].Name()
	})

	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".sql") {
			continue
		}

		// Parse version number from prefix (e.g. "0001").
		var version int
		if _, err := fmt.Sscanf(entry.Name(), "%d", &version); err != nil {
			slog.WarnContext(ctx, "index: skipping migration with unparseable version", "file", entry.Name())
			continue
		}

		var applied int
		err := d.db.QueryRowContext(ctx,
			"SELECT COUNT(*) FROM schema_migrations WHERE version = ?", version).Scan(&applied)
		if err != nil {
			return fmt.Errorf("index: check migration %d: %w", version, err)
		}
		if applied > 0 {
			slog.DebugContext(ctx, "index: migration already applied", "version", version)
			continue
		}

		data, err := migrationsFS.ReadFile("migrations/" + entry.Name())
		if err != nil {
			return fmt.Errorf("index: read migration %q: %w", entry.Name(), err)
		}

		if _, err := d.db.ExecContext(ctx, string(data)); err != nil {
			return fmt.Errorf("index: apply migration %d (%s): %w", version, entry.Name(), err)
		}

		if _, err := d.db.ExecContext(ctx,
			"INSERT INTO schema_migrations(version, applied_at) VALUES (?, ?)",
			version, time.Now().Unix()); err != nil {
			return fmt.Errorf("index: record migration %d: %w", version, err)
		}
		slog.InfoContext(ctx, "index: applied migration", "version", version, "file", entry.Name())
	}
	return nil
}

// UpsertFile inserts or updates the file record for path. Returns the row ID.
func (d *DB) UpsertFile(ctx context.Context, path string, inode, device, mtime, size int64) (int64, error) {
	now := time.Now().Unix()
	res, err := d.db.ExecContext(ctx, `
		INSERT INTO files(path, inode, device, mtime, size_bytes, indexed_at)
		VALUES (?, ?, ?, ?, ?, ?)
		ON CONFLICT(path) DO UPDATE SET
			inode      = excluded.inode,
			device     = excluded.device,
			mtime      = excluded.mtime,
			size_bytes = excluded.size_bytes,
			indexed_at = excluded.indexed_at`,
		path, inode, device, mtime, size, now)
	if err != nil {
		return 0, fmt.Errorf("index: upsert file %q: %w", path, err)
	}
	// Last insert ID works for upserts in SQLite, but may return 0 without
	// error when the ON CONFLICT DO UPDATE clause fires on some driver versions.
	id, err := res.LastInsertId()
	if err != nil || id == 0 {
		// Fall back to SELECT for conflict-updated rows.
		if err2 := d.db.QueryRowContext(ctx, "SELECT id FROM files WHERE path = ?", path).Scan(&id); err2 != nil {
			return 0, fmt.Errorf("index: resolve file id for %q: %w", path, err2)
		}
	}
	return id, nil
}

// DeleteFile removes the file record (and cascades to file_tags, metadata, etc.).
func (d *DB) DeleteFile(ctx context.Context, path string) error {
	tx, err := d.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback() //nolint:errcheck // best-effort rollback; commit path handles success

	var id int64
	if err := tx.QueryRowContext(ctx, "SELECT id FROM files WHERE path = ?", path).Scan(&id); err == nil {
		_, _ = tx.ExecContext(ctx, "DELETE FROM file_embeddings WHERE file_id = ?", id)
	}

	if _, err := tx.ExecContext(ctx, "DELETE FROM files WHERE path = ?", path); err != nil {
		return fmt.Errorf("index: delete file %q: %w", path, err)
	}
	return tx.Commit()
}

// UpsertTag inserts the tag if it does not exist and returns its ID.
func (d *DB) UpsertTag(ctx context.Context, name string) (int64, error) {
	id, err := d.q.UpsertTag(ctx, name)
	if err != nil {
		return 0, fmt.Errorf("index: upsert tag %q: %w", name, err)
	}
	return id, nil
}

// AddFileTag associates tagID with fileID. No-op if already present.
func (d *DB) AddFileTag(ctx context.Context, fileID, tagID int64) error {
	if err := d.q.AddFileTag(ctx, dbgen.AddFileTagParams{
		FileID: fileID,
		TagID:  tagID,
	}); err != nil {
		return fmt.Errorf("index: add file tag file=%d tag=%d: %w", fileID, tagID, err)
	}
	return nil
}

// RemoveFileTag removes the association between fileID and tagID.
func (d *DB) RemoveFileTag(ctx context.Context, fileID, tagID int64) error {
	if err := d.q.RemoveFileTag(ctx, dbgen.RemoveFileTagParams{
		FileID: fileID,
		TagID:  tagID,
	}); err != nil {
		return fmt.Errorf("index: remove file tag file=%d tag=%d: %w", fileID, tagID, err)
	}
	return nil
}

// SetFileTags replaces all tags for fileID with tagNames (by name).
// Tags not yet in the tags table are created automatically.
func (d *DB) SetFileTags(ctx context.Context, fileID int64, tagNames []string) error {
	tx, err := d.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("index: SetFileTags begin tx: %w", err)
	}
	defer tx.Rollback() //nolint:errcheck // best-effort rollback; commit path handles success

	if err := d.replaceFileTagsTx(ctx, tx, fileID, tagNames, "SetFileTags"); err != nil {
		return err
	}

	return tx.Commit()
}

// SyncFileApply atomically applies file row, tags, metadata, and tag provenance.
// Keeping this in a single transaction prevents concurrent delete/rename events
// from interleaving between per-step writes and violating foreign keys.
func (d *DB) SyncFileApply(
	ctx context.Context,
	path string,
	inode, device, mtime, size int64,
	tagNames []string,
	meta map[string]string,
	sourceMap map[string]string,
) (int64, error) {
	now := time.Now().Unix()

	tx, err := d.db.BeginTx(ctx, nil)
	if err != nil {
		return 0, fmt.Errorf("index: SyncFileApply begin tx: %w", err)
	}
	defer tx.Rollback() //nolint:errcheck // best-effort rollback; commit path handles success

	fileID, err := d.upsertFileTx(ctx, tx, path, inode, device, mtime, size, now)
	if err != nil {
		return 0, err
	}

	if err := d.replaceFileTagsTx(ctx, tx, fileID, tagNames, "SyncFileApply"); err != nil {
		return 0, err
	}

	if err := d.upsertMetadataTx(ctx, tx, fileID, meta); err != nil {
		return 0, err
	}

	if err := d.upsertTagProvenanceTx(ctx, tx, fileID, sourceMap, now); err != nil {
		return 0, err
	}

	if err := tx.Commit(); err != nil {
		return 0, fmt.Errorf("index: SyncFileApply commit: %w", err)
	}

	return fileID, nil
}

func (d *DB) upsertFileTx(
	ctx context.Context,
	tx *sql.Tx,
	path string,
	inode int64,
	device int64,
	mtime int64,
	size int64,
	now int64,
) (int64, error) {
	var fileID int64
	if err := tx.QueryRowContext(ctx, `
		INSERT INTO files(path, inode, device, mtime, size_bytes, indexed_at)
		VALUES (?, ?, ?, ?, ?, ?)
		ON CONFLICT(path) DO UPDATE SET
			inode      = excluded.inode,
			device     = excluded.device,
			mtime      = excluded.mtime,
			size_bytes = excluded.size_bytes,
			indexed_at = excluded.indexed_at
		RETURNING id`,
		path, inode, device, mtime, size, now,
	).Scan(&fileID); err != nil {
		return 0, fmt.Errorf("index: SyncFileApply upsert file %q: %w", path, err)
	}
	return fileID, nil
}

func (d *DB) replaceFileTagsTx(
	ctx context.Context,
	tx *sql.Tx,
	fileID int64,
	tagNames []string,
	op string,
) error {
	if _, err := tx.ExecContext(ctx, "DELETE FROM file_tags WHERE file_id = ?", fileID); err != nil {
		return fmt.Errorf("index: %s clear tags file=%d: %w", op, fileID, err)
	}

	for _, name := range tagNames {
		tagID, err := resolveTagIDTx(ctx, tx, name, op, "tag")
		if err != nil {
			return err
		}
		if _, err := tx.ExecContext(
			ctx,
			"INSERT OR IGNORE INTO file_tags(file_id, tag_id) VALUES (?, ?)",
			fileID,
			tagID,
		); err != nil {
			return fmt.Errorf("index: %s add tag %q: %w", op, name, err)
		}
	}

	return nil
}

func (d *DB) upsertMetadataTx(
	ctx context.Context,
	tx *sql.Tx,
	fileID int64,
	meta map[string]string,
) error {
	for k, v := range meta {
		if _, err := tx.ExecContext(ctx, `
			INSERT INTO metadata(file_id, key, value, source)
			VALUES (?, ?, ?, ?)
			ON CONFLICT(file_id, key) DO UPDATE SET
				value  = excluded.value,
				source = excluded.source`,
			fileID, k, v, "manual",
		); err != nil {
			return fmt.Errorf("index: SyncFileApply upsert meta file=%d key=%q: %w", fileID, k, err)
		}
	}
	return nil
}

func (d *DB) upsertTagProvenanceTx(
	ctx context.Context,
	tx *sql.Tx,
	fileID int64,
	sourceMap map[string]string,
	now int64,
) error {
	for tagName, sourceName := range sourceMap {
		tagID, err := resolveTagIDTx(ctx, tx, tagName, "SyncFileApply", "source tag")
		if err != nil {
			return err
		}
		if _, err := tx.ExecContext(ctx, `
			INSERT INTO tag_provenance(file_id, tag_id, source, set_at)
			VALUES (?, ?, ?, ?)
			ON CONFLICT(file_id, tag_id) DO UPDATE SET
				source = excluded.source,
				set_at = excluded.set_at`,
			fileID, tagID, sourceName, now,
		); err != nil {
			return fmt.Errorf("index: SyncFileApply set tag provenance file=%d tag=%d: %w", fileID, tagID, err)
		}
	}
	return nil
}

func resolveTagIDTx(
	ctx context.Context,
	tx *sql.Tx,
	name string,
	op string,
	label string,
) (int64, error) {
	if _, err := tx.ExecContext(ctx, "INSERT OR IGNORE INTO tags(name) VALUES (?)", name); err != nil {
		return 0, fmt.Errorf("index: %s upsert %s %q: %w", op, label, name, err)
	}

	var tagID int64
	if err := tx.QueryRowContext(ctx, "SELECT id FROM tags WHERE name = ?", name).Scan(&tagID); err != nil {
		return 0, fmt.Errorf("index: %s resolve %s %q: %w", op, label, name, err)
	}

	return tagID, nil
}

// UpsertMeta inserts or replaces a metadata key-value pair for fileID.
func (d *DB) UpsertMeta(ctx context.Context, fileID int64, key, value, source string) error {
	if err := d.q.UpsertMeta(ctx, dbgen.UpsertMetaParams{
		FileID: fileID,
		Key:    key,
		Value:  value,
		Source: source,
	}); err != nil {
		return fmt.Errorf("index: upsert meta file=%d key=%q: %w", fileID, key, err)
	}
	return nil
}

// SetTagProvenance records which source applied a tag to a file.
func (d *DB) SetTagProvenance(ctx context.Context, fileID, tagID int64, source string) error {
	if err := d.q.SetTagProvenance(ctx, dbgen.SetTagProvenanceParams{
		FileID: fileID,
		TagID:  tagID,
		Source: source,
		SetAt:  time.Now().Unix(),
	}); err != nil {
		return fmt.Errorf("index: set tag provenance file=%d tag=%d: %w", fileID, tagID, err)
	}
	return nil
}

// Stats contains aggregated index metrics.
type Stats struct {
	FilesCount int64
	TagsCount  int64
}

// GetStats returns aggregated metrics from the index.
func (d *DB) GetStats(ctx context.Context) (Stats, error) {
	row, err := d.q.GetStats(ctx)
	if err != nil {
		return Stats{}, fmt.Errorf("index: get stats: %w", err)
	}
	return Stats{
		FilesCount: row.FilesCount,
		TagsCount:  row.TagsCount,
	}, nil
}

// DeleteStaleFiles deletes files from the index that were not seen during a recent scan.
// Only files within the base_path whose indexed_at timestamp is strictly less than sinceUnix are removed.
func (d *DB) DeleteStaleFiles(ctx context.Context, basePath string, sinceUnix int64) error {
	// Add a trailing slash to basePath to ensure we only match files inside it,
	// and use the LIKE operator to match the prefix.
	prefix := basePath
	if !strings.HasSuffix(prefix, "/") {
		prefix += "/"
	}
	prefix += "%"

	tx, err := d.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback() //nolint:errcheck // best-effort rollback; commit path handles success

	if _, err := tx.ExecContext(
		ctx,
		"DELETE FROM file_embeddings WHERE file_id IN (SELECT id FROM files WHERE path LIKE ? AND indexed_at < ?)",
		prefix,
		sinceUnix,
	); err != nil {
		return fmt.Errorf("index: delete stale embeddings: %w", err)
	}

	if err := d.q.WithTx(tx).DeleteStaleFiles(ctx, dbgen.DeleteStaleFilesParams{
		Path:      prefix,
		IndexedAt: sinceUnix,
	}); err != nil {
		return fmt.Errorf("index: delete stale files prefix %q since %d: %w", basePath, sinceUnix, err)
	}
	return tx.Commit()
}

// ReadSidecar returns the JSON payload for the given inode/device.
func (d *DB) ReadSidecar(ctx context.Context, inode, device uint64) ([]byte, error) {
	data, err := d.q.ReadSidecar(ctx, dbgen.ReadSidecarParams{
		Inode:  saturatingInt64FromUint64(inode),
		Device: saturatingInt64FromUint64(device),
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil // Return nil, nil when not found
		}
		return nil, fmt.Errorf("index: read sidecar for %d/%d: %w", inode, device, err)
	}
	return []byte(data), nil
}

// WriteSidecar upserts the JSON payload for the given inode/device.
func (d *DB) WriteSidecar(ctx context.Context, inode, device uint64, data []byte) error {
	if err := d.q.WriteSidecar(ctx, dbgen.WriteSidecarParams{
		Inode:  saturatingInt64FromUint64(inode),
		Device: saturatingInt64FromUint64(device),
		Data:   string(data),
	}); err != nil {
		return fmt.Errorf("index: write sidecar for %d/%d: %w", inode, device, err)
	}
	return nil
}

// ListFilePaths returns the absolute paths of all files currently in the index.
func (d *DB) ListFilePaths(ctx context.Context) ([]string, error) {
	paths, err := d.q.ListFilePaths(ctx)
	if err != nil {
		return nil, fmt.Errorf("index: list file paths: %w", err)
	}
	return paths, nil
}

// ListCooccurringTags returns tag names that appear on files matching all
// includeTags (AND semantics) and none of the excludeTags. Tags in either
// list are omitted from the result. If includeTags is empty, all tags are
// returned (equivalent to ListAllTags minus excludeTags). The result is
// ordered by name.
func (d *DB) ListCooccurringTags(ctx context.Context, includeTags, excludeTags []string) ([]string, error) {
	var sb strings.Builder
	args := make([]any, 0, (len(includeTags)+len(excludeTags))*tagArgMultiplier)

	// Build the set of qualifying file IDs upfront so the outer query can
	// drive from file_tags(tag_id) without a correlated subquery per row.
	sb.WriteString(`SELECT DISTINCT t.name
		FROM tags t
		JOIN file_tags ft ON ft.tag_id = t.id
		WHERE ft.file_id IN (SELECT f.id FROM files f WHERE 1=1`)

	// File must have ALL include tags: intersect via GROUP BY / HAVING.
	if len(includeTags) > 0 {
		ph := strings.Repeat("?,", len(includeTags))
		ph = ph[:len(ph)-1]
		fmt.Fprintf(&sb, ` AND f.id IN (
			SELECT ft2.file_id FROM file_tags ft2
			JOIN tags t2 ON ft2.tag_id = t2.id
			WHERE t2.name IN (%s)
			GROUP BY ft2.file_id
			HAVING COUNT(DISTINCT t2.name) = %d)`, ph, len(includeTags))
		for _, t := range includeTags {
			args = append(args, t)
		}
	}

	// File must have NONE of the exclude tags.
	if len(excludeTags) > 0 {
		ph := strings.Repeat("?,", len(excludeTags))
		ph = ph[:len(ph)-1]
		fmt.Fprintf(&sb, ` AND f.id NOT IN (
			SELECT ft3.file_id FROM file_tags ft3
			JOIN tags t3 ON ft3.tag_id = t3.id
			WHERE t3.name IN (%s))`, ph)
		for _, t := range excludeTags {
			args = append(args, t)
		}
	}

	sb.WriteString(")")

	// Omit tags already in include or exclude from the result.
	allUsed := append(append([]string(nil), includeTags...), excludeTags...)
	if len(allUsed) > 0 {
		ph := strings.Repeat("?,", len(allUsed))
		ph = ph[:len(ph)-1]
		fmt.Fprintf(&sb, ` AND t.name NOT IN (%s)`, ph)
		for _, t := range allUsed {
			args = append(args, t)
		}
	}

	sb.WriteString(" ORDER BY t.name")

	rows, err := d.db.QueryContext(ctx, sb.String(), args...)
	if err != nil {
		return nil, fmt.Errorf("index: list cooccurring tags: %w", err)
	}
	defer rows.Close()

	var tags []string
	for rows.Next() {
		var name string
		if err := rows.Scan(&name); err != nil {
			return nil, fmt.Errorf("index: scan cooccurring tag: %w", err)
		}
		tags = append(tags, name)
	}
	return tags, rows.Err()
}

// ListAllTags returns all tag names in the index ordered by name.
func (d *DB) ListAllTags(ctx context.Context) ([]string, error) {
	tags, err := d.q.ListAllTags(ctx)
	if err != nil {
		return nil, fmt.Errorf("index: list all tags: %w", err)
	}
	return tags, nil
}

// GetFileIDByPath returns the row ID for the file at path.
// Returns an error wrapping [sql.ErrNoRows] if the file is not in the index.
func (d *DB) GetFileIDByPath(ctx context.Context, path string) (int64, error) {
	id, err := d.q.GetFileIDByPath(ctx, path)
	if err != nil {
		return 0, fmt.Errorf("index: get file id for %q: %w", path, err)
	}
	return id, nil
}

// GetTagOverrides returns a map of tag name → suppressed rule names for fileID.
// The map is empty (not nil) when there are no overrides.
func (d *DB) GetTagOverrides(ctx context.Context, fileID int64) (map[string][]string, error) {
	rows, err := d.q.GetTagOverrides(ctx, fileID)
	if err != nil {
		return nil, fmt.Errorf("index: get tag overrides for file %d: %w", fileID, err)
	}

	overrides := make(map[string][]string)
	for _, r := range rows {
		overrides[r.Name] = append(overrides[r.Name], r.RuleName)
	}
	return overrides, nil
}

// FileSummary holds the index-stored summary for a file, used to build IPC responses.
type FileSummary struct {
	Path      string
	Tags      []string
	Mtime     int64
	SizeBytes int64
}

// ListFileTagPairs returns all (path, tagname) pairs currently in the index.
// Each element is [path, tagname]. The result is used to bulk-load the
// in-memory graph.
func (d *DB) ListFileTagPairs(ctx context.Context) ([][2]string, error) {
	rows, err := d.q.ListFileTagPairs(ctx)
	if err != nil {
		return nil, fmt.Errorf("index: list file-tag pairs: %w", err)
	}

	var pairs [][2]string
	for _, r := range rows {
		pairs = append(pairs, [2]string{r.Path, r.Name})
	}
	return pairs, nil
}

// GetFileSummary returns the stored summary for path, including its tags,
// mtime, and size. Returns [sql.ErrNoRows] (wrapped) if not found.
func (d *DB) GetFileSummary(ctx context.Context, path string) (*FileSummary, error) {
	row, err := d.q.GetFileSummary(ctx, path)
	if err != nil {
		return nil, fmt.Errorf("index: get file summary for %q: %w", path, err)
	}

	tags, err := d.q.GetFileTags(ctx, row.ID)
	if err != nil {
		return nil, fmt.Errorf("index: get tags for file %q: %w", path, err)
	}

	return &FileSummary{
		Path:      path,
		Tags:      tags,
		Mtime:     row.Mtime,
		SizeBytes: row.SizeBytes,
	}, nil
}

// DeleteSidecar removes the sidecar payload for the given inode/device.
func (d *DB) DeleteSidecar(ctx context.Context, inode, device uint64) error {
	if err := d.q.DeleteSidecar(ctx, dbgen.DeleteSidecarParams{
		Inode:  saturatingInt64FromUint64(inode),
		Device: saturatingInt64FromUint64(device),
	}); err != nil {
		return fmt.Errorf("index: delete sidecar for %d/%d: %w", inode, device, err)
	}
	return nil
}

func saturatingInt64FromUint64(v uint64) int64 {
	if v > math.MaxInt64 {
		return math.MaxInt64
	}
	return int64(v)
}

// GetFileMime returns the MIME type stored in file_meta for the given path.
// Returns an empty string (not an error) if the file is not indexed or has no
// MIME type recorded.
func (d *DB) GetFileMime(ctx context.Context, path string) (string, error) {
	var mime string
	err := d.db.QueryRowContext(ctx,
		`SELECT fm.value FROM file_meta fm
		 JOIN files f ON f.id = fm.file_id
		 WHERE f.path = ? AND fm.key = 'mime.type'
		 LIMIT 1`,
		path,
	).Scan(&mime)
	if errors.Is(err, sql.ErrNoRows) {
		return "", nil
	}
	if err != nil {
		return "", fmt.Errorf("index: get mime for %q: %w", path, err)
	}
	return mime, nil
}
