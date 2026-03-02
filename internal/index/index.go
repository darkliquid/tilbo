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


	"sort"
	"strings"
	"time"

	_ "github.com/ncruces/go-sqlite3/driver"
	_ "github.com/ncruces/go-sqlite3/embed"
)

//go:embed migrations/*.sql
var migrationsFS embed.FS

// DB wraps a SQLite database connection and provides the tilbo index API.
type DB struct {
	db *sql.DB
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
		db.Close()
		return nil, fmt.Errorf("index: set WAL: %w", err)
	}
	if _, err := db.ExecContext(ctx, "PRAGMA synchronous=NORMAL"); err != nil {
		db.Close()
		return nil, fmt.Errorf("index: set synchronous: %w", err)
	}
	if _, err := db.ExecContext(ctx, "PRAGMA foreign_keys=ON"); err != nil {
		db.Close()
		return nil, fmt.Errorf("index: enable foreign keys: %w", err)
	}

	idx := &DB{db: db}
	if err := idx.Migrate(ctx); err != nil {
		db.Close()
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
	// Last insert ID works for upserts in SQLite.
	id, err := res.LastInsertId()
	if err != nil {
		// Fall back to SELECT for conflict-updated rows.
		if err2 := d.db.QueryRowContext(ctx, "SELECT id FROM files WHERE path = ?", path).Scan(&id); err2 != nil {
			return 0, fmt.Errorf("index: resolve file id for %q: %w", path, err2)
		}
	}
	return id, nil
}

// DeleteFile removes the file record (and cascades to file_tags, metadata, etc.).
func (d *DB) DeleteFile(ctx context.Context, path string) error {
	if _, err := d.db.ExecContext(ctx, "DELETE FROM files WHERE path = ?", path); err != nil {
		return fmt.Errorf("index: delete file %q: %w", path, err)
	}
	return nil
}

// UpsertTag inserts the tag if it does not exist and returns its ID.
func (d *DB) UpsertTag(ctx context.Context, name string) (int64, error) {
	if _, err := d.db.ExecContext(ctx,
		"INSERT OR IGNORE INTO tags(name) VALUES (?)", name); err != nil {
		return 0, fmt.Errorf("index: upsert tag %q: %w", name, err)
	}
	var id int64
	if err := d.db.QueryRowContext(ctx, "SELECT id FROM tags WHERE name = ?", name).Scan(&id); err != nil {
		return 0, fmt.Errorf("index: resolve tag id for %q: %w", name, err)
	}
	return id, nil
}

// AddFileTag associates tagID with fileID. No-op if already present.
func (d *DB) AddFileTag(ctx context.Context, fileID, tagID int64) error {
	if _, err := d.db.ExecContext(ctx,
		"INSERT OR IGNORE INTO file_tags(file_id, tag_id) VALUES (?, ?)", fileID, tagID); err != nil {
		return fmt.Errorf("index: add file tag file=%d tag=%d: %w", fileID, tagID, err)
	}
	return nil
}

// RemoveFileTag removes the association between fileID and tagID.
func (d *DB) RemoveFileTag(ctx context.Context, fileID, tagID int64) error {
	if _, err := d.db.ExecContext(ctx,
		"DELETE FROM file_tags WHERE file_id = ? AND tag_id = ?", fileID, tagID); err != nil {
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
	defer tx.Rollback() //nolint:errcheck

	// Remove existing tags.
	if _, err := tx.ExecContext(ctx, "DELETE FROM file_tags WHERE file_id = ?", fileID); err != nil {
		return fmt.Errorf("index: SetFileTags clear tags: %w", err)
	}

	for _, name := range tagNames {
		if _, err := tx.ExecContext(ctx,
			"INSERT OR IGNORE INTO tags(name) VALUES (?)", name); err != nil {
			return fmt.Errorf("index: SetFileTags upsert tag %q: %w", name, err)
		}
		var tagID int64
		if err := tx.QueryRowContext(ctx, "SELECT id FROM tags WHERE name = ?", name).Scan(&tagID); err != nil {
			return fmt.Errorf("index: SetFileTags resolve tag %q: %w", name, err)
		}
		if _, err := tx.ExecContext(ctx,
			"INSERT OR IGNORE INTO file_tags(file_id, tag_id) VALUES (?, ?)", fileID, tagID); err != nil {
			return fmt.Errorf("index: SetFileTags add tag %q: %w", name, err)
		}
	}

	return tx.Commit()
}

// UpsertMeta inserts or replaces a metadata key-value pair for fileID.
func (d *DB) UpsertMeta(ctx context.Context, fileID int64, key, value, source string) error {
	if _, err := d.db.ExecContext(ctx, `
		INSERT INTO metadata(file_id, key, value, source)
		VALUES (?, ?, ?, ?)
		ON CONFLICT(file_id, key) DO UPDATE SET
			value  = excluded.value,
			source = excluded.source`,
		fileID, key, value, source); err != nil {
		return fmt.Errorf("index: upsert meta file=%d key=%q: %w", fileID, key, err)
	}
	return nil
}

// SetTagProvenance records which source applied a tag to a file.
func (d *DB) SetTagProvenance(ctx context.Context, fileID, tagID int64, source string) error {
	now := time.Now().Unix()
	if _, err := d.db.ExecContext(ctx, `
		INSERT INTO tag_provenance(file_id, tag_id, source, set_at)
		VALUES (?, ?, ?, ?)
		ON CONFLICT(file_id, tag_id) DO UPDATE SET
			source = excluded.source,
			set_at = excluded.set_at`,
		fileID, tagID, source, now); err != nil {
		return fmt.Errorf("index: set tag provenance file=%d tag=%d: %w", fileID, tagID, err)
	}
	return nil
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

	if _, err := d.db.ExecContext(ctx, "DELETE FROM files WHERE path LIKE ? AND indexed_at < ?", prefix, sinceUnix); err != nil {
		return fmt.Errorf("index: delete stale files prefix %q since %d: %w", basePath, sinceUnix, err)
	}
	return nil
}
// ReadSidecar returns the JSON payload for the given path.
// ReadSidecar returns the JSON payload for the given inode/device.
func (d *DB) ReadSidecar(ctx context.Context, inode, device uint64) ([]byte, error) {
	var data []byte
	err := d.db.QueryRowContext(ctx, "SELECT data FROM sidecar_data WHERE inode = ? AND device = ?", inode, device).Scan(&data)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil // Return nil, nil when not found
		}
		return nil, fmt.Errorf("index: read sidecar for %d/%d: %w", inode, device, err)
	}
	return data, nil
}

// WriteSidecar upserts the JSON payload for the given inode/device.
func (d *DB) WriteSidecar(ctx context.Context, inode, device uint64, data []byte) error {
	if _, err := d.db.ExecContext(ctx,
		"INSERT INTO sidecar_data(inode, device, data) VALUES (?, ?, ?) ON CONFLICT(inode, device) DO UPDATE SET data=excluded.data",
		inode, device, data); err != nil {
		return fmt.Errorf("index: write sidecar for %d/%d: %w", inode, device, err)
	}
	return nil
}

// ListFilePaths returns the absolute paths of all files currently in the index.
func (d *DB) ListFilePaths(ctx context.Context) ([]string, error) {
	rows, err := d.db.QueryContext(ctx, "SELECT path FROM files ORDER BY path")
	if err != nil {
		return nil, fmt.Errorf("index: list file paths: %w", err)
	}
	defer rows.Close()

	var paths []string
	for rows.Next() {
		var p string
		if err := rows.Scan(&p); err != nil {
			return nil, fmt.Errorf("index: scan file path: %w", err)
		}
		paths = append(paths, p)
	}
	return paths, rows.Err()
}

// ListAllTags returns all tag names in the index ordered by name.
func (d *DB) ListAllTags(ctx context.Context) ([]string, error) {
	rows, err := d.db.QueryContext(ctx, "SELECT name FROM tags ORDER BY name")
	if err != nil {
		return nil, fmt.Errorf("index: list all tags: %w", err)
	}
	defer rows.Close()
	var tags []string
	for rows.Next() {
		var name string
		if err := rows.Scan(&name); err != nil {
			return nil, fmt.Errorf("index: scan tag name: %w", err)
		}
		tags = append(tags, name)
	}
	return tags, rows.Err()
}

// GetFileIDByPath returns the row ID for the file at path.
// Returns an error wrapping sql.ErrNoRows if the file is not in the index.
func (d *DB) GetFileIDByPath(ctx context.Context, path string) (int64, error) {
	var id int64
	err := d.db.QueryRowContext(ctx, "SELECT id FROM files WHERE path = ?", path).Scan(&id)
	if err != nil {
		return 0, fmt.Errorf("index: get file id for %q: %w", path, err)
	}
	return id, nil
}

// GetTagOverrides returns a map of tag name → suppressed rule names for fileID.
// The map is empty (not nil) when there are no overrides.
func (d *DB) GetTagOverrides(ctx context.Context, fileID int64) (map[string][]string, error) {
	rows, err := d.db.QueryContext(ctx, `
		SELECT t.name, o.rule_name
		FROM tag_overrides o
		JOIN tags t ON t.id = o.tag_id
		WHERE o.file_id = ?`, fileID)
	if err != nil {
		return nil, fmt.Errorf("index: get tag overrides for file %d: %w", fileID, err)
	}
	defer rows.Close()

	overrides := make(map[string][]string)
	for rows.Next() {
		var tagName, ruleName string
		if err := rows.Scan(&tagName, &ruleName); err != nil {
			return nil, fmt.Errorf("index: scan tag override: %w", err)
		}
		overrides[tagName] = append(overrides[tagName], ruleName)
	}
	return overrides, rows.Err()
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
	const q = `SELECT f.path, t.name
		FROM file_tags ft
		JOIN files f ON f.id = ft.file_id
		JOIN tags  t ON t.id = ft.tag_id`
	rows, err := d.db.QueryContext(ctx, q)
	if err != nil {
		return nil, fmt.Errorf("index: list file-tag pairs: %w", err)
	}
	defer rows.Close()

	var pairs [][2]string
	for rows.Next() {
		var path, tag string
		if err := rows.Scan(&path, &tag); err != nil {
			return nil, fmt.Errorf("index: scan file-tag pair: %w", err)
		}
		pairs = append(pairs, [2]string{path, tag})
	}
	return pairs, rows.Err()
}

// GetFileSummary returns the stored summary for path, including its tags,
// mtime, and size. Returns sql.ErrNoRows (wrapped) if not found.
func (d *DB) GetFileSummary(ctx context.Context, path string) (*FileSummary, error) {
	const fq = `SELECT id, mtime, size_bytes FROM files WHERE path = ? LIMIT 1`
	var id, mtime, size int64
	if err := d.db.QueryRowContext(ctx, fq, path).Scan(&id, &mtime, &size); err != nil {
		return nil, fmt.Errorf("index: get file summary for %q: %w", path, err)
	}

	const tq = `SELECT t.name FROM file_tags ft JOIN tags t ON t.id = ft.tag_id WHERE ft.file_id = ?`
	rows, err := d.db.QueryContext(ctx, tq, id)
	if err != nil {
		return nil, fmt.Errorf("index: get tags for file %q: %w", path, err)
	}
	defer rows.Close()

	var tags []string
	for rows.Next() {
		var name string
		if err := rows.Scan(&name); err != nil {
			return nil, fmt.Errorf("index: scan tag name: %w", err)
		}
		tags = append(tags, name)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return &FileSummary{
		Path:      path,
		Tags:      tags,
		Mtime:     mtime,
		SizeBytes: size,
	}, nil
}

// DeleteSidecar removes the sidecar payload for the given inode/device.
func (d *DB) DeleteSidecar(ctx context.Context, inode, device uint64) error {
	if _, err := d.db.ExecContext(ctx, "DELETE FROM sidecar_data WHERE inode = ? AND device = ?", inode, device); err != nil {
		return fmt.Errorf("index: delete sidecar for %d/%d: %w", inode, device, err)
	}
	return nil
}
