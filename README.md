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
