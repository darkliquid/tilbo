// Package watcher monitors a filesystem mount for changes using fanotify.
//
// Renames are always reported as paired EventDelete + EventCreate events.
// FAN_RENAME cannot be combined with FAN_MARK_MOUNT and requires FAN_REPORT_FID
// (which changes the event format), so FAN_MOVED_FROM / FAN_MOVED_TO are used
// instead.
package watcher
