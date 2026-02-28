// Package xattr provides read and write access to the extended attributes used
// by tilbo for tag and metadata storage.
//
// Schema:
//
//	user.xdg.tags      — comma-separated list of tag names (XDG standard)
//	user.meta.<key>    — arbitrary string metadata values
//	user.tags.source   — JSON object mapping tag name → harvester name
package xattr

import (
	"context"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"strings"

	"github.com/pkg/xattr"
)

const (
	// XattrTagKey is the xattr attribute name used to store the comma-separated tag list (XDG standard).
	XattrTagKey = "user.xdg.tags"

	// XattrMetaPrefix is the xattr attribute prefix for arbitrary metadata key-value pairs.
	XattrMetaPrefix = "user.meta."

	// XattrSourceKey is the xattr attribute name for the JSON map of tag→harvester provenance.
	XattrSourceKey = "user.tags.source"
)

// ReadTags returns the tags stored on the file at path.
// Returns an empty slice (not an error) if no tags are set.
func ReadTags(ctx context.Context, path string) ([]string, error) {
	if err := ctx.Err(); err != nil {
		return nil, err
	}
	val, err := xattr.Get(path, XattrTagKey)
	if isNotExist(err) {
		return []string{}, nil
	}
	if err != nil {
		return nil, fmt.Errorf("xattr read tags %q: %w", path, err)
	}
	s := strings.TrimSpace(string(val))
	if s == "" {
		return []string{}, nil
	}
	record, err := csv.NewReader(strings.NewReader(s)).Read()
	if err != nil && err != io.EOF {
		return nil, fmt.Errorf("xattr parse tags %q: %w", path, err)
	}
	tags := record[:0:0]
	for _, t := range record {
		if t != "" {
			tags = append(tags, t)
		}
	}
	return tags, nil
}

// WriteTags writes tags to the file at path, replacing any existing tags.
func WriteTags(ctx context.Context, path string, tags []string) error {
	if err := ctx.Err(); err != nil {
		return err
	}
	var buf strings.Builder
	w := csv.NewWriter(&buf)
	if err := w.Write(tags); err != nil {
		return fmt.Errorf("xattr marshal tags: %w", err)
	}
	w.Flush()
	if err := w.Error(); err != nil {
		return fmt.Errorf("xattr marshal tags: %w", err)
	}
	val := strings.TrimRight(buf.String(), "\r\n")
	if err := xattr.Set(path, XattrTagKey, []byte(val)); err != nil {
		return fmt.Errorf("xattr write tags %q: %w", path, err)
	}
	return nil
}

// ReadMeta returns the metadata value stored under the given key for the file at path.
// Returns ("", nil) if the key is not set.
func ReadMeta(ctx context.Context, path, key string) (string, error) {
	if err := ctx.Err(); err != nil {
		return "", err
	}
	val, err := xattr.Get(path, XattrMetaPrefix+key)
	if isNotExist(err) {
		return "", nil
	}
	if err != nil {
		return "", fmt.Errorf("xattr read meta %q key %q: %w", path, key, err)
	}
	return string(val), nil
}

// WriteMeta writes a metadata value under the given key for the file at path.
func WriteMeta(ctx context.Context, path, key, value string) error {
	if err := ctx.Err(); err != nil {
		return err
	}
	if err := xattr.Set(path, XattrMetaPrefix+key, []byte(value)); err != nil {
		return fmt.Errorf("xattr write meta %q key %q: %w", path, key, err)
	}
	return nil
}

// ReadAllMeta returns all metadata key-value pairs for the file at path.
// Only attributes with the user.meta. prefix are returned; the prefix is stripped from keys.
func ReadAllMeta(ctx context.Context, path string) (map[string]string, error) {
	if err := ctx.Err(); err != nil {
		return nil, err
	}
	attrs, err := xattr.List(path)
	if err != nil {
		return nil, fmt.Errorf("xattr list %q: %w", path, err)
	}
	result := make(map[string]string)
	for _, attr := range attrs {
		if !strings.HasPrefix(attr, XattrMetaPrefix) {
			continue
		}
		key := strings.TrimPrefix(attr, XattrMetaPrefix)
		val, err := xattr.Get(path, attr)
		if err != nil {
			return nil, fmt.Errorf("xattr read meta %q attr %q: %w", path, attr, err)
		}
		result[key] = string(val)
	}
	return result, nil
}

// ReadSource returns the tag provenance map for the file at path.
// The map keys are tag names; values are harvester names (e.g. "manual", "rule:hd-video").
// Returns an empty map (not an error) if no provenance is set.
func ReadSource(ctx context.Context, path string) (map[string]string, error) {
	if err := ctx.Err(); err != nil {
		return nil, err
	}
	val, err := xattr.Get(path, XattrSourceKey)
	if isNotExist(err) {
		return map[string]string{}, nil
	}
	if err != nil {
		return nil, fmt.Errorf("xattr read source %q: %w", path, err)
	}
	var m map[string]string
	if err := json.Unmarshal(val, &m); err != nil {
		return nil, fmt.Errorf("xattr parse source %q: %w", path, err)
	}
	return m, nil
}

// WriteSource writes the tag provenance map to the file at path.
func WriteSource(ctx context.Context, path string, source map[string]string) error {
	if err := ctx.Err(); err != nil {
		return err
	}
	data, err := json.Marshal(source)
	if err != nil {
		return fmt.Errorf("xattr marshal source: %w", err)
	}
	if err := xattr.Set(path, XattrSourceKey, data); err != nil {
		return fmt.Errorf("xattr write source %q: %w", path, err)
	}
	return nil
}

// BatchReadTags reads tags from multiple files concurrently.
// The returned map keys are file paths; files with no tags are included with empty slices.
// Files that return errors are omitted from the result; the first error encountered is returned.
func BatchReadTags(ctx context.Context, paths []string) (map[string][]string, error) {
	if err := ctx.Err(); err != nil {
		return nil, err
	}

	type result struct {
		path string
		tags []string
		err  error
	}

	ch := make(chan result, len(paths))
	for _, p := range paths {
		p := p
		go func() {
			tags, err := ReadTags(ctx, p)
			ch <- result{path: p, tags: tags, err: err}
		}()
	}

	out := make(map[string][]string, len(paths))
	var firstErr error
	for range paths {
		r := <-ch
		if r.err != nil {
			if firstErr == nil {
				firstErr = r.err
			}
			continue
		}
		out[r.path] = r.tags
	}
	if firstErr != nil {
		return out, firstErr
	}
	return out, nil
}

// isNotExist reports whether the error indicates the attribute does not exist.
func isNotExist(err error) bool {
	if err == nil {
		return false
	}
	// pkg/xattr wraps the underlying errno; check the string representation
	// for ENODATA (Linux) and ENOATTR (macOS/BSD).
	s := err.Error()
	return strings.Contains(s, "no data available") ||
		strings.Contains(s, "no such attribute") ||
		strings.Contains(s, "ENODATA") ||
		strings.Contains(s, "ENOATTR")
}
