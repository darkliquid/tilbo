package main

import (
	"fmt"

	"github.com/godbus/dbus/v5"
	"github.com/godbus/dbus/v5/introspect"
	"github.com/godbus/dbus/v5/prop"
)

var _ = (*Browser).exportDBus

// exportDBus registers the custom Browser interface and the XDG FileChooser interface.
func (b *Browser) exportDBus() error {
	// Export standard browser methods
	err := b.dbusConn.Export(b, "/uk/co/darkliquid/tilbo/Browser", "uk.co.darkliquid.tilbo.Browser")
	if err != nil {
		return fmt.Errorf("export browser interface: %w", err)
	}

	// Export FileChooser portal interface
	err = b.dbusConn.Export(b, "/uk/co/darkliquid/tilbo/Browser", "org.freedesktop.impl.portal.FileChooser")
	if err != nil {
		return fmt.Errorf("export portal interface: %w", err)
	}

	// Add introspection
	node := &introspect.Node{
		Name: "/uk/co/darkliquid/tilbo/Browser",
		Interfaces: []introspect.Interface{
			introspect.IntrospectData,
			prop.IntrospectData,
			{
				Name: "uk.co.darkliquid.tilbo.Browser",
				Methods: []introspect.Method{
					{
						Name: "Open",
						Args: []introspect.Arg{
							{Name: "mode", Type: "s", Direction: "in"},
							{Name: "argsJSON", Type: "s", Direction: "in"},
						},
					},
					{Name: "Hide"},
					{Name: "Quit"},
				},
				Signals: []introspect.Signal{
					{
						Name: "WindowShown",
						Args: []introspect.Arg{
							{Name: "mode", Type: "s"},
						},
					},
					{
						Name: "WindowHidden",
					},
				},
			},
			{
				Name: "org.freedesktop.impl.portal.FileChooser",
				Methods: []introspect.Method{
					{
						Name: "OpenFile",
						Args: []introspect.Arg{
							{Name: "handle", Type: "o", Direction: "in"},
							{Name: "app_id", Type: "s", Direction: "in"},
							{Name: "parent_window", Type: "s", Direction: "in"},
							{Name: "title", Type: "s", Direction: "in"},
							{Name: "options", Type: "a{sv}", Direction: "in"},
							{Name: "response", Type: "u", Direction: "out"},
							{Name: "results", Type: "a{sv}", Direction: "out"},
						},
					},
				},
			},
		},
	}
	err = b.dbusConn.Export(
		introspect.NewIntrospectable(node),
		"/uk/co/darkliquid/tilbo/Browser",
		"org.freedesktop.DBus.Introspectable",
	)
	if err != nil {
		return fmt.Errorf("export introspectable: %w", err)
	}

	return nil
}

// OpenFile implements the org.freedesktop.impl.portal.FileChooser interface.
// Because it must return (uint32, map[string]dbus.Variant, *dbus.Error), this method
// blocks the D-Bus handler goroutine. We use a channel internally to wait for Qt to respond.
func (b *Browser) OpenFile(
	_ dbus.ObjectPath,
	_ string,
	_ string,
	_ string,
	_ map[string]dbus.Variant,
) (uint32, map[string]dbus.Variant, *dbus.Error) {
	resultCh := make(chan struct {
		response uint32
		results  map[string]dbus.Variant
	}, 1)

	// Instruct Qt to open the portal dialog
	b.mainThreadCh <- func() {
		// Emit signal / Create QML window for portal mode
		// ...

		// Simulate user selection for now
		resultCh <- struct {
			response uint32
			results  map[string]dbus.Variant
		}{
			response: 0, // Success
			results: map[string]dbus.Variant{
				"uris": dbus.MakeVariant([]string{"file:///simulated/path/to/file.txt"}),
			},
		}
	}

	// Wait for user interaction from Qt UI
	select {
	case result := <-resultCh:
		return result.response, result.results, nil
	case <-b.ctx.Done():
		return 1, nil, dbus.NewError("org.freedesktop.DBus.Error.Cancelled", []any{"Daemon shutting down"})
	}
}
