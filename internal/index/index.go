// Package index manages the SQLite-backed file index for tilbo.
// It is CGo-free, using the ncruces WASM-based SQLite driver.
package index

import (
	"context"
	"database/sql"
	"embed"
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

