package builtin

import (
	"context"
	"os"
	"strings"

	mp4 "github.com/abema/go-mp4"
	"github.com/dhowden/tag"
	mkvparse "github.com/remko/go-mkvparse"

	"github.com/darkliquid/tilbo/internal/harvester"
)

// MediaHarvester extracts technical and tag metadata from audio/video files
// in-process using pure-Go libraries:
//   - MP4/M4A/MOV:  github.com/abema/go-mp4 (Probe)
//   - MKV/WebM:     github.com/remko/go-mkvparse
//   - Audio tags:   github.com/dhowden/tag  (MP3/FLAC/OGG/MP4/M4A)
//
// Runs synchronously at priority 5. The optional FFProbeHarvester (priority 10)
// will override these results when ffprobe is installed.
type MediaHarvester struct{}

const (
	// mediaPriority is lower than FFProbeHarvester (10) so the pure-Go results
	// serve as a baseline that ffprobe can override with more accurate data.
	mediaPriority    = 5
	mediaMetaInitCap = 12 // expected number of metadata fields produced
	// mkvDefaultTimecodeScale is the Matroska spec default: 1,000,000 nanoseconds
	// per timecode unit (i.e. 1 ms resolution). Files that omit TimecodeScale
	// from Segment/Info implicitly use this value per IETF RFC 8794 Section 8.1.
	mkvDefaultTimecodeScale = 1_000_000
	nanosPerSecond          = 1e9
)

// NewMediaHarvester returns a MediaHarvester.
func NewMediaHarvester() *MediaHarvester { return &MediaHarvester{} }

func (*MediaHarvester) Name() string  { return "builtin:media" }
func (*MediaHarvester) Priority() int { return mediaPriority }
func (*MediaHarvester) Async() bool   { return false }
func (*MediaHarvester) Matches(_ string, mime string) bool {
	return matchesMIMEPrefix(mime, "video/") || matchesMIMEPrefix(mime, "audio/")
}

// Run returns a MetaMap that may contain:
//   - "duration_seconds" — total duration in seconds (float64)
//   - "width"            — video width in pixels (float64)
//   - "height"           — video height in pixels (float64)
//   - "codec"            — primary video codec string (string)
//   - "audio_codec"      — primary audio codec string (string)
//   - "audio_channels"   — audio channel count (float64)
//   - "title"            — track title from tags (string)
//   - "artist"           — track artist from tags (string)
//   - "album"            — album name from tags (string)
//   - "genre"            — genre from tags (string)
//   - "year"             — release year from tags (float64)
//   - "track"            — track number (float64)
func (*MediaHarvester) Run(_ context.Context, input harvester.Input) (harvester.MetaMap, error) {
	meta := make(harvester.MetaMap, mediaMetaInitCap)

	switch {
	case isMP4MIME(input.MIME) || isMP4Ext(input.Path):
		probeMP4(input.Path, meta)
	case isMKVMIME(input.MIME) || isMKVExt(input.Path):
		probeMKV(input.Path, meta)
	}

	// Audio tag reading works across MP3, FLAC, OGG, MP4, M4A, etc.
	readAudioTags(input.Path, meta)

	if len(meta) == 0 {
		return harvester.MetaMap{}, nil
	}
	return meta, nil
}

// probeMP4 uses go-mp4 to extract duration and track info from MP4/M4A/MOV.
func probeMP4(path string, meta harvester.MetaMap) {
	f, err := os.Open(path)
	if err != nil {
		return
	}
	defer f.Close()

	info, err := mp4.Probe(f)
	if err != nil || info == nil {
		return
	}

	if info.Timescale > 0 {
		meta["duration_seconds"] = float64(info.Duration) / float64(info.Timescale)
	}

	for _, t := range info.Tracks {
		switch t.Codec {
		case mp4.CodecAVC1:
			if t.AVC != nil {
				meta["codec"] = "h264"
				// Width/height come from track edit list/sample dimensions. go-mp4
				// doesn't expose pixel dimensions directly in ProbeInfo, so ffprobe
				// remains the source for those fields when available.
			}
		case mp4.CodecMP4A:
			meta["audio_codec"] = "aac"
			if t.MP4A != nil {
				meta["audio_channels"] = float64(t.MP4A.ChannelCount)
			}
		default:
			// other codecs (HEVC, AV1, etc.) are not extracted here
		}
	}
}

// mkvHandler is a go-mkvparse Handler that extracts segment info and track
// metadata from MKV/WebM files.
type mkvHandler struct {
	mkvparse.DefaultHandler

	timecodeScale uint64 // nanoseconds per timecode unit (default 1 000 000)
	duration      float64
	title         string
	videoCodec    string
	audioCodec    string
	audioChannels float64
	inInfo        bool
	inVideo       bool
	inAudio       bool
}

func (h *mkvHandler) HandleMasterBegin(id mkvparse.ElementID, _ mkvparse.ElementInfo) (bool, error) {
	switch id {
	case mkvparse.InfoElement:
		h.inInfo = true
	case mkvparse.VideoElement:
		h.inVideo = true
	case mkvparse.AudioElement:
		h.inAudio = true
	default:
		// other elements are not tracked
	}
	return true, nil
}

func (h *mkvHandler) HandleMasterEnd(id mkvparse.ElementID, _ mkvparse.ElementInfo) error {
	switch id {
	case mkvparse.InfoElement:
		h.inInfo = false
	case mkvparse.VideoElement:
		h.inVideo = false
	case mkvparse.AudioElement:
		h.inAudio = false
	default:
		// other elements are not tracked
	}
	return nil
}

func (h *mkvHandler) HandleFloat(id mkvparse.ElementID, value float64, _ mkvparse.ElementInfo) error {
	if h.inInfo && id == mkvparse.DurationElement {
		h.duration = value
	}
	return nil
}

func (h *mkvHandler) HandleInteger(id mkvparse.ElementID, value int64, _ mkvparse.ElementInfo) error {
	switch {
	case h.inInfo && id == mkvparse.TimecodeScaleElement:
		if value > 0 {
			h.timecodeScale = uint64(value)
		}
	case h.inAudio && id == mkvparse.ChannelsElement:
		h.audioChannels = float64(value)
	default:
		// other integer elements are not extracted
	}
	return nil
}

func (h *mkvHandler) HandleString(id mkvparse.ElementID, value string, _ mkvparse.ElementInfo) error {
	switch {
	case h.inInfo && id == mkvparse.TitleElement:
		h.title = value
	case h.inVideo && id == mkvparse.CodecIDElement:
		h.videoCodec = value
	case h.inAudio && id == mkvparse.CodecIDElement:
		h.audioCodec = value
	default:
		// other string elements are not extracted
	}
	return nil
}

// probeMKV uses go-mkvparse to extract duration and track info from MKV/WebM.
func probeMKV(path string, meta harvester.MetaMap) {
	f, err := os.Open(path)
	if err != nil {
		return
	}
	defer f.Close()

	h := &mkvHandler{timecodeScale: mkvDefaultTimecodeScale} // default per Matroska spec
	if err := mkvparse.ParseSections(f, h,
		mkvparse.InfoElement,
		mkvparse.TracksElement,
	); err != nil {
		return
	}

	if h.duration > 0 && h.timecodeScale > 0 {
		// duration is in timecode units; timecodeScale is ns per unit.
		meta["duration_seconds"] = h.duration * float64(h.timecodeScale) / nanosPerSecond
	}
	if h.title != "" {
		meta["title"] = h.title
	}
	if h.videoCodec != "" {
		meta["codec"] = normaliseCodecID(h.videoCodec)
	}
	if h.audioCodec != "" {
		meta["audio_codec"] = normaliseCodecID(h.audioCodec)
	}
	if h.audioChannels > 0 {
		meta["audio_channels"] = h.audioChannels
	}
}

// readAudioTags reads embedded tags (ID3, Vorbis Comment, MP4 atoms) using
// dhowden/tag and merges them into meta without overwriting existing keys.
func readAudioTags(path string, meta harvester.MetaMap) {
	f, err := os.Open(path)
	if err != nil {
		return
	}
	defer f.Close()

	m, err := tag.ReadFrom(f)
	if err != nil {
		return
	}

	set := func(key, val string) {
		if val = strings.TrimSpace(val); val != "" {
			if _, exists := meta[key]; !exists {
				meta[key] = val
			}
		}
	}
	setF := func(key string, val float64) {
		if val != 0 {
			if _, exists := meta[key]; !exists {
				meta[key] = val
			}
		}
	}

	set("title", m.Title())
	set("artist", m.Artist())
	set("album", m.Album())
	set("genre", m.Genre())
	setF("year", float64(m.Year()))
	if n, _ := m.Track(); n > 0 {
		setF("track", float64(n))
	}
}

// normaliseCodecID maps Matroska CodecID strings (e.g. "V_MPEG4/ISO/AVC")
// to short human-readable names.
func normaliseCodecID(id string) string {
	id = strings.ToUpper(id)
	switch {
	case strings.Contains(id, "AVC") || strings.Contains(id, "H264"):
		return "h264"
	case strings.Contains(id, "HEVC") || strings.Contains(id, "H265"):
		return "h265"
	case strings.Contains(id, "AV1"):
		return "av1"
	case strings.Contains(id, "VP9"):
		return "vp9"
	case strings.Contains(id, "VP8"):
		return "vp8"
	case strings.Contains(id, "AAC"):
		return "aac"
	case strings.Contains(id, "MP3") || strings.Contains(id, "MPEG"):
		return "mp3"
	case strings.Contains(id, "OPUS"):
		return "opus"
	case strings.Contains(id, "VORBIS"):
		return "vorbis"
	case strings.Contains(id, "FLAC"):
		return "flac"
	}
	return strings.ToLower(id)
}

func isMP4MIME(mime string) bool {
	switch mime {
	case "video/mp4", "video/quicktime", "video/x-m4v",
		"audio/mp4", "audio/x-m4a", "audio/aac":
		return true
	}
	return false
}

func isMP4Ext(path string) bool {
	ext := strings.ToLower(extensionOf(path))
	switch ext {
	case ".mp4", ".m4v", ".m4a", ".mov":
		return true
	}
	return false
}

func isMKVMIME(mime string) bool {
	switch mime {
	case "video/x-matroska", "video/webm", "audio/webm", "audio/x-matroska":
		return true
	}
	return false
}

func isMKVExt(path string) bool {
	ext := strings.ToLower(extensionOf(path))
	switch ext {
	case ".mkv", ".mka", ".webm":
		return true
	}
	return false
}
