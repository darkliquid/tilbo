// Package extension implements the file-action extension system that allows
// users to define custom context-menu actions for the browser.
//
// Extensions are discovered from executable files in standard plugin directories
// (~/.local/lib/tilbo/plugins/, /usr/lib/tilbo/plugins/) and from shell commands
// defined in configuration. Each extension can provide:
//
//   - **Badges**: Short labels displayed on file entries in the browser (e.g. "git", "encrypted")
//   - **Actions**: Named operations that appear in the file context menu and execute
//     a subprocess when invoked
//
// Extensions communicate via a simple subprocess protocol: the daemon invokes the
// extension binary with the file path as an argument and reads JSON output from
// stdout. A configurable timeout prevents hung extensions from blocking the UI.
package extension
