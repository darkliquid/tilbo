# Tilbo Taggings

_What has it gots in it's pocketses?_

Tilbo is a filesystem tagging and metadata system that provides a way to tag
files manually and automatically, and extract and associate metadata with them.

This data can then be used for file navigation using FUSE or a simple IPC system.

In addition to the daemon that maintains the tags and metadata, there is a CLI
tool for tagging, a GUI file browser and an xdg portal for exposing a custom file
picker.

Tags and metadata are stored via extended filesystem attributes by default, with
a fallback to storing the data in an sqlite database for filesystems that do not
support extended filesystem attributes.

## Optional external dependencies

The daemon's built-in harvester pipeline works without any external tools.
The following optional binaries can be installed to enable additional metadata
extraction. The daemon detects them at startup and logs which are active.

| Binary | Purpose | Install |
| --- | --- | --- |
| `ffprobe` | Richer video/audio metadata (codec, bitrate, frame rate, HDR, stream details) — overrides the built-in media harvester | Part of [FFmpeg](https://ffmpeg.org/download.html); most distros: `ffmpeg` package |
| `magika` | ML-based file-type detection — improves MIME accuracy for ambiguous files (Office formats, polyglot files, obscure text variants) | `pip install magika` or [pre-built release](https://github.com/google/magika/releases) |

### Why these are optional

All core metadata (EXIF/IPTC from images, PDF info, MP4/MKV/audio duration and
tags) is extracted in-process using pure-Go libraries — no external tools
required.  The optional binaries exist only to provide deeper or higher-accuracy
results for specific file categories when they are already present on the system.
