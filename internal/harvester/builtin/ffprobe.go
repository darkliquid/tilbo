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

// NewFFProbeHarvester looks up ffprobe on PATH. Returns nil if not found.
func NewFFProbeHarvester() *FFProbeHarvester {
	bin, err := exec.LookPath("ffprobe")
	if err != nil {
		return nil
	}
	return &FFProbeHarvester{binary: bin}
}

func (h *FFProbeHarvester) Name() string  { return "builtin:ffprobe" }
func (h *FFProbeHarvester) Priority() int { return 10 }
func (h *FFProbeHarvester) Async() bool   { return true }
func (h *FFProbeHarvester) Matches(_ string, mime string) bool {
	return matchesMIMEPrefix(mime, "video/", "audio/")
}

// ffprobeOutput is the top-level structure of `ffprobe -print_format json -show_streams -show_format`.
type ffprobeOutput struct {
	Streams []ffprobeStream `json:"streams"`
	Format  ffprobeFormat   `json:"format"`
}

type ffprobeStream struct {
	CodecType        string         `json:"codec_type"`
	CodecName        string         `json:"codec_name"`
	Width            int            `json:"width"`
	Height           int            `json:"height"`
	AvgFrameRate     string         `json:"avg_frame_rate"`
	Channels         int            `json:"channels"`
	ColorTransfer    string         `json:"color_transfer"`
	ColorPrimaries   string         `json:"color_primaries"`
	Tags             map[string]any `json:"tags"`
}

type ffprobeFormat struct {
	Duration string         `json:"duration"`
	BitRate  string         `json:"bit_rate"`
	Tags     map[string]any `json:"tags"`
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
func (h *FFProbeHarvester) Run(ctx context.Context, input harvester.Input) (harvester.MetaMap, error) {
	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
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
		return nil, nil // ffprobe can't handle the file — skip gracefully
	}

	var fp ffprobeOutput
	if err := json.Unmarshal(out, &fp); err != nil {
		return nil, nil
	}

	meta := make(harvester.MetaMap, 12)

	// Duration and bitrate from format block.
	if d, err := strconv.ParseFloat(fp.Format.Duration, 64); err == nil && d > 0 {
		meta["duration_seconds"] = d
	}
	if br, err := strconv.ParseFloat(fp.Format.BitRate, 64); err == nil && br > 0 {
		meta["bitrate_kbps"] = br / 1000
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
		return nil, nil
	}
	return meta, nil
}

// parseFrameRate converts an ffprobe avg_frame_rate string ("30000/1001") to float64.
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
			return 2, nil
		}
	}
	return 0, strconv.ErrSyntax
}

func isHDRTransfer(s string) bool {
	return s == "smpte2084" || s == "arib-std-b67" || s == "smpte428"
}

func isHDRPrimaries(s string) bool {
	return s == "bt2020"
}

// capitalize uppercases the first letter, as some muxers title-case their tag keys.
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
