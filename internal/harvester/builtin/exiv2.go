package builtin

import (
	"context"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/bep/imagemeta"

	"github.com/darkliquid/tilbo/internal/harvester"
)

// EXIFHarvester extracts EXIF/IPTC/XMP metadata from image files in-process
// using github.com/bep/imagemeta. No external binary is required.
// Supports JPEG, TIFF, PNG, WebP, HEIF/HEIC, AVIF, DNG, CR2, NEF, ARW, PEF.
// Runs synchronously at priority 10 against image/* MIME types.
type EXIFHarvester struct{}

// NewEXIFHarvester returns an EXIFHarvester.
func NewEXIFHarvester() *EXIFHarvester { return &EXIFHarvester{} }

func (*EXIFHarvester) Name() string  { return "builtin:exif" }
func (*EXIFHarvester) Priority() int { return 10 }
func (*EXIFHarvester) Async() bool   { return false }
func (*EXIFHarvester) Matches(_ string, mime string) bool {
	return matchesMIMEPrefix(mime, "image/")
}

// Run returns a MetaMap containing:
//   - "camera_make"     — Exif.Image.Make
//   - "camera_model"    — Exif.Image.Model
//   - "lens_model"      — Exif.Photo.LensModel
//   - "focal_length"    — mm (float64)
//   - "aperture"        — f-number (float64)
//   - "iso"             — ISO sensitivity (float64)
//   - "exposure_time"   — seconds (float64)
//   - "flash"           — true if flash fired (bool)
//   - "orientation"     — EXIF orientation 1–8 (float64)
//   - "date_taken"      — Unix timestamp (float64)
//   - "gps_lat"         — decimal degrees, positive = N (float64)
//   - "gps_lon"         — decimal degrees, positive = E (float64)
//   - "image_width"     — pixel width from EXIF (float64)
//   - "image_height"    — pixel height from EXIF (float64)
func (*EXIFHarvester) Run(_ context.Context, input harvester.Input) (harvester.MetaMap, error) {
	imgfmt := mimeToImageFormat(input.MIME, input.Path)
	if imgfmt == imagemeta.ImageFormatAuto {
		return nil, nil // unsupported format
	}

	f, err := os.Open(input.Path)
	if err != nil {
		return nil, nil
	}
	defer f.Close()

	var tags imagemeta.Tags
	_, err = imagemeta.Decode(imagemeta.Options{
		R:           f,
		ImageFormat: imgfmt,
		Sources:     imagemeta.EXIF,
		// Return true for ALL tags including sub-IFDs (FNumber, FocalLength, etc.)
		ShouldHandleTag: func(imagemeta.TagInfo) bool { return true },
		HandleTag: func(ti imagemeta.TagInfo) error {
			tags.Add(ti)
			return nil
		},
	})
	if err != nil {
		if imagemeta.IsInvalidFormat(err) {
			return nil, nil
		}
		return nil, nil
	}

	exif := tags.EXIF()
	meta := make(harvester.MetaMap, 14)

	getStr := func(key string) (string, bool) {
		if ti, ok := exif[key]; ok {
			s := strings.TrimSpace(fmt.Sprintf("%v", ti.Value))
			if s != "" && s != "<nil>" {
				return s, true
			}
		}
		return "", false
	}
	getFloat := func(key string) (float64, bool) {
		if ti, ok := exif[key]; ok {
			return exifFloat64(ti.Value)
		}
		return 0, false
	}

	if v, ok := getStr("Make"); ok {
		meta["camera_make"] = v
	}
	if v, ok := getStr("Model"); ok {
		meta["camera_model"] = v
	}
	if v, ok := getStr("LensModel"); ok {
		meta["lens_model"] = v
	}
	if v, ok := getFloat("FNumber"); ok && v > 0 {
		meta["aperture"] = v
	}
	if v, ok := getFloat("FocalLength"); ok && v > 0 {
		meta["focal_length"] = v
	}
	if v, ok := getFloat("ISOSpeedRatings"); ok && v > 0 {
		meta["iso"] = v
	}
	if v, ok := getFloat("ExposureTime"); ok && v > 0 {
		meta["exposure_time"] = v
	}
	if v, ok := getFloat("Flash"); ok {
		// Flash tag bit 0 is the "Flash fired" indicator per EXIF 2.32
		// spec (JEITA CP-3451D, Table 9). Higher bits encode return light
		// detected, strobe return, flash mode, red-eye reduction, etc.
		meta["flash"] = int(v)&0x1 == 1
	}
	if v, ok := getFloat("Orientation"); ok && v > 0 {
		meta["orientation"] = v
	}
	if v, ok := getFloat("PixelXDimension"); ok && v > 0 {
		meta["image_width"] = v
	}
	if v, ok := getFloat("PixelYDimension"); ok && v > 0 {
		meta["image_height"] = v
	}

	// Date taken via imagemeta helper (handles multiple EXIF date fields).
	if t, err := tags.GetDateTime(); err == nil && !t.IsZero() {
		meta["date_taken"] = float64(t.Unix())
	}

	// GPS via imagemeta helper.
	if lat, lon, err := tags.GetLatLong(); err == nil {
		meta["gps_lat"] = lat
		meta["gps_lon"] = lon
	}

	if len(meta) == 0 {
		return nil, nil
	}
	return meta, nil
}

// mimeToImageFormat maps a MIME type (and optionally a file path for extension
// fallback) to an imagemeta.ImageFormat constant.
// Returns ImageFormatAuto when the format is not supported.
func mimeToImageFormat(mime, path string) imagemeta.ImageFormat {
	switch mime {
	case "image/jpeg", "image/jpg":
		return imagemeta.JPEG
	case "image/tiff":
		return imagemeta.TIFF
	case "image/png":
		return imagemeta.PNG
	case "image/webp":
		return imagemeta.WebP
	case "image/heif", "image/heic", "image/heif-sequence", "image/heic-sequence":
		return imagemeta.HEIF
	case "image/avif", "image/avif-sequence":
		return imagemeta.AVIF
	case "image/x-adobe-dng", "image/dng":
		return imagemeta.DNG
	case "image/x-canon-cr2", "image/x-canon-cr3":
		return imagemeta.CR2
	case "image/x-nikon-nef":
		return imagemeta.NEF
	case "image/x-sony-arw":
		return imagemeta.ARW
	case "image/x-pentax-pef", "image/x-raw":
		return imagemeta.PEF
	}
	// Extension fallback when MIME is unknown or generic.
	if path != "" {
		ext := strings.ToLower(extensionOf(path))
		switch ext {
		case ".jpg", ".jpeg":
			return imagemeta.JPEG
		case ".tif", ".tiff":
			return imagemeta.TIFF
		case ".png":
			return imagemeta.PNG
		case ".webp":
			return imagemeta.WebP
		case ".heif", ".heic":
			return imagemeta.HEIF
		case ".avif":
			return imagemeta.AVIF
		case ".dng":
			return imagemeta.DNG
		case ".cr2", ".cr3":
			return imagemeta.CR2
		case ".nef":
			return imagemeta.NEF
		case ".arw":
			return imagemeta.ARW
		case ".pef":
			return imagemeta.PEF
		}
	}
	return imagemeta.ImageFormatAuto
}

// extensionOf returns the file extension (dot included) from path.
// It scans backwards and stops at '/' so that a dot in a parent directory
// name (e.g. "/photos.2024/img") is never mistaken for an extension.
// This is equivalent to path/filepath.Ext but avoids importing that package
// in files that do not otherwise need it.
func extensionOf(path string) string {
	for i := len(path) - 1; i >= 0 && path[i] != '/'; i-- {
		if path[i] == '.' {
			return path[i:]
		}
	}
	return ""
}

// exifFloat64 converts an EXIF tag value to float64.
// imagemeta returns different concrete types depending on the underlying EXIF
// data type: integers of varying signed/unsigned widths for SHORT/LONG/SLONG
// tags, float32/float64 for FLOAT/DOUBLE tags, and rational values for
// RATIONAL/SRATIONAL tags (returned as Rat[uint32] or Rat[int32] respectively).
// The type switch enumerates each integer width explicitly because Go's type
// system does not allow a single numeric case. The floater interface catch-all
// at the end handles both rational types, which both expose Float64() but share
// no named interface in the imagemeta library.
func exifFloat64(v any) (float64, bool) {
	switch n := v.(type) {
	case float64:
		return n, true
	case float32:
		return float64(n), true
	case int:
		return float64(n), true
	case int16:
		return float64(n), true
	case int32:
		return float64(n), true
	case int64:
		return float64(n), true
	case uint:
		return float64(n), true
	case uint16:
		return float64(n), true
	case uint32:
		return float64(n), true
	case uint64:
		return float64(n), true
	case time.Time:
		return float64(n.Unix()), true
	}
	// Rat[uint32] and Rat[int32] from imagemeta both expose Float64().
	type floater interface{ Float64() float64 }
	if r, ok := v.(floater); ok {
		f := r.Float64()
		return f, true
	}
	return 0, false
}
