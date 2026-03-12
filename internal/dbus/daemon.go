package dbus

import (
	"errors"
	"fmt"
	"log/slog"

	godbus "github.com/godbus/dbus/v5"
)

const (
	DaemonInterface = "uk.co.darkliquid.tilbo.Daemon"
	DaemonPath      = "/uk/co/darkliquid/tilbo"
)

// DaemonBus wraps a D-Bus connection for emitting tilbo daemon signals.
type DaemonBus struct {
	conn *godbus.Conn
}

// NewDaemonBus connects to the session bus and requests the daemon name.
func NewDaemonBus() (*DaemonBus, error) {
	conn, err := godbus.ConnectSessionBus()
	if err != nil {
		return nil, fmt.Errorf("connect session bus: %w", err)
	}

	reply, err := conn.RequestName(DaemonInterface, godbus.NameFlagDoNotQueue)
	if err != nil {
		_ = conn.Close()
		return nil, fmt.Errorf("request name: %w", err)
	}

	if reply != godbus.RequestNameReplyPrimaryOwner {
		_ = conn.Close()
		return nil, errors.New("name already taken")
	}

	return &DaemonBus{conn: conn}, nil
}

// Close closes the D-Bus connection.
func (b *DaemonBus) Close() error {
	if b.conn != nil {
		return b.conn.Close()
	}
	return nil
}

// EmitFileTagged emits the FileTagged signal.
func (b *DaemonBus) EmitFileTagged(path string, added, removed []string) {
	if b.conn == nil {
		return
	}
	err := b.conn.Emit(DaemonPath, DaemonInterface+".FileTagged", path, added, removed)
	if err != nil {
		slog.Debug("dbus: failed to emit FileTagged", "err", err)
	}
}

// EmitIndexUpdated emits the IndexUpdated signal.
func (b *DaemonBus) EmitIndexUpdated(filesTotal, tagsTotal uint64) {
	if b.conn == nil {
		return
	}
	err := b.conn.Emit(DaemonPath, DaemonInterface+".IndexUpdated", filesTotal, tagsTotal)
	if err != nil {
		slog.Debug("dbus: failed to emit IndexUpdated", "err", err)
	}
}

// EmitDaemonStateChanged emits the DaemonStateChanged signal.
func (b *DaemonBus) EmitDaemonStateChanged(state string) {
	if b.conn == nil {
		return
	}
	err := b.conn.Emit(DaemonPath, DaemonInterface+".DaemonStateChanged", state)
	if err != nil {
		slog.Debug("dbus: failed to emit DaemonStateChanged", "err", err)
	}
}
