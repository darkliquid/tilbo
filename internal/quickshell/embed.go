// Package quickshell embeds the Quickshell QML application files so the tilbo
// binary can extract them to the user's data directory on first run.
package quickshell

import "embed"

// Files contains the embedded Quickshell QML application.
//
//go:embed shell.qml components services windows
var Files embed.FS
