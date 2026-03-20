package builtin

import (
	"context"
	"encoding/json"
	"os/exec"
	"strconv"
	"time"

	"github.com/darkliquid/tilbo/internal/harvester"
)

// FFProbeHarvester extracts video and audio metadata by calling ffprobe.
// It runs asynchronously at priority 10 so it does not block rule evaluation.
// If ffprobe is not installed it is silently skipped.
type FFProbeHarvester struct {
	binary string
}

const (
	// ffprobePriority is 10, matching MediaHarvester's priority. Because
	// FFProbeHarvester runs asynchronously (Async() == true), its results
	// arrive after the synchronous MediaHarvester and override them, giving
	// ffprobe's more accurate data precedence when the binary is available.
	ffprobePriority = 10
	// ffprobeRunTimeout is generous because ffprobe may need to scan the
	// entire file for container-level metadata on large video files, and
	// it runs asynchronously so it does not block rule evaluation.
	ffprobeRunTimeout      = 30 * time.Second
	ffprobeMetaInitCap     = 12   // expected number of metadata fields produced
	bitrateKbpsDivisor     = 1000 // ffprobe reports bit_rate in bps; divide to get kbps
	splitFractionPartCount = 2    // numerator + denominator in a rational fraction
)

// NewFFProbeHarvester looks up ffprobe on PATH. Returns nil if not found.
func NewFFProbeHarvester() *FFProbeHarvester {
	bin, err := exec.LookPath("ffprobe")
	if err != nil {
		return nil
	}
	return &FFProbeHarvester{binary: bin}
}

func (h *FFProbeHarvester) Name() string  { return "builtin:ffprobe" }
func (h *FFProbeHarvester) Priority() int { return ffprobePriority }
func (h *FFProbeHarvester) Async() bool   { return true }
func (h *FFProbeHarvester) Matches(_ string, mime string) bool {
	return matchesMIMEPrefix(mime, "video/", "audio/")
}

// ffprobeOutput is the top-level structure of `ffprobe -print_format json -show_streams -show_format`.
type ffprobeOutput struct {
	Streams []ffprobeStream `json:"streams"`
	Format  ffprobeFormat   `json:"format"`
}

// ffprobeStream represents a single stream (video, audio, subtitle, etc.)
// from ffprobe's JSON output. Only fields relevant to metadata extraction are
// mapped; ffprobe emits many more fields that we intentionally ignore.
type ffprobeStream struct {
	CodecType      string         `json:"codec_type"`       // "video", "audio", "subtitle", etc.
	CodecName      string         `json:"codec_name"`       // short codec name, e.g. "h264", "aac"
	Width          int            `json:"width"`            // video pixel width (0 for audio)
	Height         int            `json:"height"`           // video pixel height (0 for audio)
	AvgFrameRate   string         `json:"avg_frame_rate"`   // rational "num/den" or bare float
	Channels       int            `json:"channels"`         // audio channel count
	ColorTransfer  string         `json:"color_transfer"`   // EOTF name, e.g. "smpte2084" for HDR10
	ColorPrimaries string         `json:"color_primaries"`  // color gamut, e.g. "bt2020"
	Tags           map[string]any `json:"tags"`             // per-stream key-value tags
}

// ffprobeFormat represents the container-level format block from ffprobe.
// Duration and BitRate are strings because ffprobe emits them as decimal
// number strings rather than typed JSON numbers.
type ffprobeFormat struct {
	Duration string         `json:"duration"` // total duration in seconds as a decimal string
	BitRate  string         `json:"bit_rate"` // overall bit rate in bps as a decimal string
	Tags     map[string]any `json:"tags"`     // container-level tags (title, artist, etc.)
}

// Run calls ffprobe and returns a MetaMap with video/audio metadata:
//   - "width", "height"          — video dimensions (float64)
//   - "framerate"                — frames per second (float64)
//   - "codec"                    — video codec name (string)
//   - "hdr"                      — true if transfer is bt2084 / arib-std-b67 (bool)
//   - "audio_codec"              — audio codec name (string)
//   - "audio_channels"           — number of audio channels (float64)
//   - "duration_seconds"         — total duration (float64)
//   - "bitrate_kbps"             — bit rate in kbps (float64)
//   - "title", "artist", "album" — audio tag fields when present (string)
//
//nolint:gocognit // stream/tag extraction keeps codec-specific branches explicit
func (h *FFProbeHarvester) Run(ctx context.Context, input harvester.Input) (harvester.MetaMap, error) {
	ctx, cancel := context.WithTimeout(ctx, ffprobeRunTimeout)
	defer cancel()

	//nolint:gosec // binary path comes from exec.LookPath; input.Path is a daemon-trusted file path.
	cmd := exec.CommandContext(ctx, h.binary,
		"-v", "quiet",
		"-print_format", "json",
		"-show_streams",
		"-show_format",
		input.Path,
	)

	out, err := cmd.Output()
	if err != nil {
		return harvester.MetaMap{}, nil // ffprobe can't handle the file — skip gracefully
	}

	var fp ffprobeOutput
	if err := json.Unmarshal(out, &fp); err != nil {
		return harvester.MetaMap{}, nil
	}

	meta := make(harvester.MetaMap, ffprobeMetaInitCap)

	// Duration and bitrate from format block.
	if d, err := strconv.ParseFloat(fp.Format.Duration, 64); err == nil && d > 0 {
		meta["duration_seconds"] = d
	}
	if br, err := strconv.ParseFloat(fp.Format.BitRate, 64); err == nil && br > 0 {
		meta["bitrate_kbps"] = br / bitrateKbpsDivisor
	}

	// Audio tags (title, artist, album) from format tags.
	for _, key := range []string{"title", "artist", "album", "genre", "track", "date"} {
		if v, ok := fp.Format.Tags[key]; ok {
			if s, ok := v.(string); ok && s != "" {
				meta[key] = s
			}
		}
		// Also check capitalised variants written by some muxers.
		if v, ok := fp.Format.Tags[capitalize(key)]; ok {
			if _, already := meta[key]; !already {
				if s, ok := v.(string); ok && s != "" {
					meta[key] = s
				}
			}
		}
	}

	// Per-stream metadata.
	for _, s := range fp.Streams {
		switch s.CodecType {
		case "video":
			if _, ok := meta["codec"]; !ok { // first video stream wins
				meta["codec"] = s.CodecName
			}
			if s.Width > 0 {
				meta["width"] = float64(s.Width)
			}
			if s.Height > 0 {
				meta["height"] = float64(s.Height)
			}
			// OR the transfer and primaries checks because some containers
			// omit one or the other: some MKV files carry bt2020 primaries
			// but write color_transfer as "unspecified", while some MP4 files
			// have smpte2084 transfer but no primaries metadata at all.
			meta["hdr"] = isHDRTransfer(s.ColorTransfer) || isHDRPrimaries(s.ColorPrimaries)
			if fps := parseFrameRate(s.AvgFrameRate); fps > 0 {
				meta["framerate"] = fps
			}
		case "audio":
			if _, ok := meta["audio_codec"]; !ok {
				meta["audio_codec"] = s.CodecName
			}
			if s.Channels > 0 {
				meta["audio_channels"] = float64(s.Channels)
			}
		}
	}

	if len(meta) == 0 {
		return harvester.MetaMap{}, nil
	}
	return meta, nil
}

// parseFrameRate converts an ffprobe avg_frame_rate string to float64.
// ffprobe always represents frame rates as rational numbers ("num/den") to
// preserve exact values for non-integer rates such as NTSC 29.97 fps
// (30000/1001) and 23.976 fps (24000/1001). Plain integer rates like 24 or 60
// may appear as a bare float string; we try that first.
func parseFrameRate(s string) float64 {
	if s == "" || s == "0/0" {
		return 0
	}
	// Try plain float first.
	if f, err := strconv.ParseFloat(s, 64); err == nil {
		return f
	}
	// Fractional form "num/den".
	var num, den int64
	if _, err := splitFraction(s, &num, &den); err == nil && den != 0 {
		return float64(num) / float64(den)
	}
	return 0
}

// splitFraction parses a "num/den" rational string and writes the components
// into *num and *den. Returns (2, nil) on success — the integer follows the
// [fmt.Sscanf] convention of returning the count of successfully parsed items.
func splitFraction(s string, num, den *int64) (int, error) {
	for i, c := range s {
		if c == '/' {
			n, err := strconv.ParseInt(s[:i], 10, 64)
			if err != nil {
				return 0, err
			}
			d, err := strconv.ParseInt(s[i+1:], 10, 64)
			if err != nil {
				return 0, err
			}
			*num, *den = n, d
			return splitFractionPartCount, nil
		}
	}
	return 0, strconv.ErrSyntax
}

// isHDRTransfer reports whether s is an HDR transfer function as reported by
// ffprobe's "color_transfer" stream field. The strings come from libavcodec's
// AVColorTransferCharacteristic enum, converted to names by av_color_transfer_name().
//
// Recognised HDR transfer functions:
//   - "smpte2084": SMPTE ST 2084 Perceptual Quantizer (PQ) EOTF. Used in HDR10,
//     HDR10+, and Dolby Vision. Maps code values 0–1 to absolute luminance
//     0–10,000 cd/m² (nits); requires at least 10-bit signal depth.
//     Ref: SMPTE ST 2084:2014.
//   - "arib-std-b67": ARIB STD-B67 Hybrid Log-Gamma (HLG). Jointly developed by
//     BBC and NHK; standardised in ITU-R BT.2100. Used in broadcast HDR
//     (ATSC 3.0, DVB UHD-1). Combines a gamma curve for low values with a
//     logarithmic curve for high values. Backward-compatible with SDR displays
//     and requires no embedded metadata. Ref: ARIB STD-B67 2015.
//   - "smpte428": SMPTE ST 428-1 D-Cinema (DCDM) transfer function, used in
//     digital cinema distribution masters. Indicates content mastered for
//     theatrical projection; carries a wider dynamic range than standard
//     SDR broadcast gamma, though it is not "HDR" in the consumer HDR10/HLG
//     sense. Ref: SMPTE ST 428-1:2019.
func isHDRTransfer(s string) bool {
	return s == "smpte2084" || s == "arib-std-b67" || s == "smpte428"
}

// isHDRPrimaries reports whether s indicates HDR-capable wide-gamut primaries
// as reported by ffprobe's "color_primaries" stream field (libavcodec
// AVColorPrimaries → av_color_primaries_name()).
//
// "bt2020" is ITU-R BT.2020 / BT.2100, the wide color gamut used by virtually
// all consumer HDR formats (HDR10, HLG, Dolby Vision). BT.2020 primaries alone
// do NOT confirm HDR — an SDR stream may use them — but their presence is a
// reliable secondary indicator when the transfer function field is absent or
// reported as "unspecified" by the container.
// Ref: ITU-R BT.2020-2 (2015).
func isHDRPrimaries(s string) bool {
	return s == "bt2020"
}

// capitalize uppercases the first letter, as some muxers title-case their tag keys.
// ASCII lowercase letters a–z (0x61–0x7A) are exactly 32 greater than their
// uppercase equivalents A–Z (0x41–0x5A), so subtracting 32 from the first byte
// converts case without importing "strings" or "unicode". This is safe here
// because every key we pass is a known ASCII-only string ("title", "artist", etc.).
func capitalize(s string) string {
	if s == "" {
		return s
	}
	return string([]byte{s[0] - 32}) + s[1:]
}

// matchesMIMEPrefix reports whether mime starts with any of the given prefixes.
func matchesMIMEPrefix(mime string, prefixes ...string) bool {
	for _, p := range prefixes {
		if len(mime) >= len(p) && mime[:len(p)] == p {
			return true
		}
	}
	return false
}
