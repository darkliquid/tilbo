// Package desktopfile parses XDG desktop entry files (.desktop) to support the
// "Open With" feature in the browser.
//
// It scans standard application directories (/usr/share/applications,
// ~/.local/share/applications) for .desktop files and matches them against a
// file's MIME type. The [FindAppsForMime] function returns a list of [AppEntry]
// values representing applications that can handle a given MIME type, including
// wildcard matches (e.g. "video/*" matching "video/x-matroska").
//
// Field codes in Exec values (e.g. %f, %u, %F, %U) are stripped when building
// the command to execute, as Tilbo handles file path substitution itself.
package desktopfile
