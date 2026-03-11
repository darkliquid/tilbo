package main

import (
	"context"
	"encoding/json"
	"log/slog"
	"os"

	"github.com/godbus/dbus/v5"
	"github.com/mappu/miqt/qt6"
	"github.com/mappu/miqt/qt6/qml"
)

type Browser struct {
	app          *qt6.QGuiApplication
	engine       *qml.QQmlApplicationEngine
	dbusConn     *dbus.Conn
	mainThreadCh chan func()
	ctx          context.Context
	cancel       context.CancelFunc
}

func NewBrowser() *Browser {
	ctx, cancel := context.WithCancel(context.Background())
	return &Browser{
		mainThreadCh: make(chan func(), 100),
		ctx:          ctx,
		cancel:       cancel,
	}
}

// Open handles the activation logic for the browser.
func (b *Browser) Open(mode, argsJSON string) {
	// Must execute within the Qt main thread
	b.mainThreadCh <- func() {
		slog.Info("Activating browser instance", "mode", mode, "args", argsJSON)

		var args map[string]interface{}
		if argsJSON != "" {
			if err := json.Unmarshal([]byte(argsJSON), &args); err != nil {
				slog.Error("Failed to parse portal args", "err", err)
			}
		}

		// TODO: Depending on mode ("browser", "portal", "search"), show the correct QML component
	}
}

// Hide dismisses the active window but keeps the process running.
func (b *Browser) Hide() {
	b.mainThreadCh <- func() {
		slog.Info("Hiding browser instance")
		// TODO: Hide Qt window
	}
}

// Quit forces the application to terminate.
func (b *Browser) Quit() {
	slog.Info("Browser instructed to quit")
	b.cancel()
	b.mainThreadCh <- func() {
		qt6.QCoreApplication_Quit()
	}
}

func (b *Browser) drainMainThreadChannel() {
	// Drain all pending tasks from the channel
	for {
		select {
		case fn := <-b.mainThreadCh:
			fn()
		default:
			return
		}
	}
}

func main() {
	slog.SetDefault(slog.New(slog.NewTextHandler(os.Stderr, &slog.HandlerOptions{Level: slog.LevelDebug})))

	b := NewBrowser()

	// Initialize D-Bus and check for existing instance BEFORE starting Qt
	conn, err := dbus.ConnectSessionBus()
	if err != nil {
		slog.Error("Failed to connect to session bus", "err", err)
		os.Exit(1)
	}
	defer conn.Close()
	b.dbusConn = conn

	reply, err := conn.RequestName("uk.co.darkliquid.tilbo.Browser", dbus.NameFlagDoNotQueue)
	if err != nil {
		slog.Error("Failed to request D-Bus name", "err", err)
		os.Exit(1)
	}

	if reply == dbus.RequestNameReplyExists {
		slog.Info("Existing instance detected. Forwarding activation request and exiting.")
		obj := conn.Object("uk.co.darkliquid.tilbo.Browser", "/uk/co/darkliquid/tilbo/Browser")
		// In a real invocation we'd parse os.Args to determine mode
		call := obj.Call("uk.co.darkliquid.tilbo.Browser.Open", 0, "browser", "")
		if call.Err != nil {
			slog.Error("Failed to activate existing instance", "err", call.Err)
			os.Exit(1)
		}
		os.Exit(0)
	}

	// We are the primary instance. Start the Qt application.
	os.Setenv("QT_QUICK_CONTROLS_STYLE", "Basic")
	b.app = qt6.NewQGuiApplication(os.Args)
	b.engine = qml.NewQQmlApplicationEngine()

	// Connect to daemon
	daemonClient, err := ConnectDaemon()
	if err != nil {
		slog.Error("Failed to connect to daemon", "err", err)
		// We shouldn't exit here, standalone browsing might still work, 
		// but tag fetching will fail gracefully.
	}

	// Initialize Traditional Tagged Filesystem Model
	fsModel := NewFileSystemModel(daemonClient, b.mainThreadCh)
	// Access the underlying QObject pointer correctly in miqt.
	b.engine.RootContext().SetContextProperty("fsModel", fsModel.QObject)

	// Setup thread-safety bridge
	timer := qt6.NewQTimer()
	timer.OnTimeout(func() {
		b.drainMainThreadChannel()
	})
	timer.Start(0)

	// Export D-Bus interface
	if err := b.exportDBus(); err != nil {
		slog.Error("Failed to export D-Bus interface", "err", err)
		os.Exit(1)
	}

	// Default open "browser" initially when launched directly
	b.Open("browser", "")

	// Give control to Qt event loop
	os.Exit(qt6.QGuiApplication_Exec())
}
