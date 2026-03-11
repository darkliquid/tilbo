package main

import (
	"context"
	"encoding/json"
	"log/slog"
	"os"
	"runtime"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/qml"
	"github.com/godbus/dbus/v5"
	"github.com/mappu/miqt/qt6"
	miqtqml "github.com/mappu/miqt/qt6/qml"
)

type Browser struct {
	app          *qt6.QGuiApplication
	engine       *miqtqml.QQmlApplicationEngine
	fsModel      *FileSystemModel
	dbusConn     *dbus.Conn
	mainThreadCh chan func()
	ctx          context.Context
	cancel       context.CancelFunc
	timer        *qt6.QTimer
}

func NewBrowser() *Browser {
	ctx, cancel := context.WithCancel(context.Background())
	return &Browser{
		mainThreadCh: make(chan func(), 100),
		ctx:          ctx,
		cancel:       cancel,
	}
}

// loadMode sets up the QML interface directly. It must only be called from the Qt main thread.
func (b *Browser) loadMode(mode, argsJSON string) {
	slog.Info("Activating browser instance in main thread", "mode", mode)

	var args map[string]interface{}
	if argsJSON != "" {
		if err := json.Unmarshal([]byte(argsJSON), &args); err != nil {
			slog.Error("Failed to parse portal args", "err", err)
		}
	}

	// Depending on mode ("browser", "portal", "search"), show the correct QML component
	var componentPath string
	switch mode {
	case "portal":
		componentPath = os.TempDir() + "/tilbo-qml/windows/PortalDialog.qml"
	case "browser", "search":
		componentPath = os.TempDir() + "/tilbo-qml/windows/BrowserWindow.qml"
	default:
		componentPath = os.TempDir() + "/tilbo-qml/windows/BrowserWindow.qml"
	}
	
	// Ensure safe memory management for miqt/Qt
	componentURL := qt6.QUrl_FromLocalFile(componentPath)
	b.engine.Load(componentURL)
	// IMPORTANT: Keep QUrl alive during QML processing
	// runtime.KeepAlive isn't explicitly needed if componentURL is used after, but just in case
	_ = componentURL
	
	if len(b.engine.RootObjects()) == 0 {
		slog.Error("Failed to load QML for mode", "mode", mode)
	}
}

// Open handles the activation logic for the browser if called externally (e.g. from D-Bus in the future).
func (b *Browser) Open(mode, argsJSON string) *dbus.Error {
	slog.Info("Browser.Open requested via D-Bus API", "mode", mode)
	// Must execute within the Qt main thread
	b.mainThreadCh <- func() {
		b.loadMode(mode, argsJSON)
	}
	return nil
}

// Hide dismisses the active window but keeps the process running.
func (b *Browser) Hide() *dbus.Error {
	b.mainThreadCh <- func() {
		slog.Info("Hiding browser instance")
		// TODO: Hide Qt window
	}
	return nil
}

// Quit forces the application to terminate.
func (b *Browser) Quit() *dbus.Error {
	slog.Info("Browser instructed to quit")
	b.cancel()
	b.mainThreadCh <- func() {
		qt6.QCoreApplication_Quit()
	}
	return nil
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
	qt6.QGuiApplication_SetQuitOnLastWindowClosed(false)
	b.engine = miqtqml.NewQQmlApplicationEngine()

	// Connect to daemon
	daemonClient, err := ConnectDaemon()
	if err != nil {
		slog.Error("Failed to connect to daemon", "err", err)
		// We shouldn't exit here, standalone browsing might still work, 
		// but tag fetching will fail gracefully.
	}

	// Initialize Traditional Tagged Filesystem Model
	b.fsModel = NewFileSystemModel(b.app.QObject, daemonClient, b.mainThreadCh)
	// Access the underlying QObject pointer correctly in miqt.
	b.engine.RootContext().SetContextProperty("fsModel", b.fsModel.QObject)

	// Setup thread-safety bridge
	b.timer = qt6.NewQTimer()
	b.timer.OnTimeout(func() {
		b.drainMainThreadChannel()
	})
	b.timer.Start(1) // Every 1ms
	
	// Create tmp path for QML
	dumbTmpPath := os.TempDir() + "/tilbo-qml"
	_ = os.MkdirAll(dumbTmpPath+"/windows", 0755)
	_ = os.MkdirAll(dumbTmpPath+"/components", 0755)
	
	_ = os.WriteFile(dumbTmpPath+"/windows/BrowserWindow.qml", []byte(qml.BrowserWindow), 0644)
	_ = os.WriteFile(dumbTmpPath+"/windows/PortalDialog.qml", []byte(qml.PortalDialog), 0644)
	_ = os.WriteFile(dumbTmpPath+"/components/TagSearchBar.qml", []byte(qml.TagSearchBar), 0644)
	_ = os.WriteFile(dumbTmpPath+"/components/FileGrid.qml", []byte(qml.FileGrid), 0644)

	// Export D-Bus interface
	/*
	if err := b.exportDBus(); err != nil {
		slog.Error("Failed to export D-Bus interface", "err", err)
		os.Exit(1)
	}
	*/

	// Default open "browser" initially when launched directly.
	// Since we haven't started Exec() yet, we are ON the main thread right now.
	// We can safely call loadMode directly.
	b.loadMode("browser", "")

	// Give control to Qt event loop
	exitCode := qt6.QGuiApplication_Exec()

	// Ensure Go pointer semantics do not garbage collect our wrapper structs
	// before the Qt engine terminates.
	runtime.KeepAlive(b)
	runtime.KeepAlive(daemonClient)

	os.Exit(exitCode)
}
