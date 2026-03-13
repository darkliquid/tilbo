package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"os"
	"os/signal"
	"runtime"
	"syscall"
	"time"

	"github.com/godbus/dbus/v5"
	"github.com/mappu/miqt/qt6"
	miqtqml "github.com/mappu/miqt/qt6/qml"

	"github.com/darkliquid/tilbo/cmd/tilbo-browser/commands/openportal"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/commands/refreshplaces"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/commands/shutdown"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/core"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/daemon"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/models"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/qml"
	"github.com/darkliquid/tilbo/cmd/tilbo-browser/state"
)

type Browser struct {
	app               *qt6.QGuiApplication
	engine            *miqtqml.QQmlApplicationEngine
	fsModel           *models.FileSystemModel
	acModel           *models.AutocompleteModel
	placesModel       *models.PlacesModel
	placesRefreshTick int
	dbusConn          *dbus.Conn
	mainThreadCh      chan func()
	ctx               context.Context
	cancel            context.CancelFunc
	timer             *qt6.QTimer
	controller        *state.Controller
	projections       state.Projections
	placesProjectionV uint64
	dirProjectionV    uint64
	searchProjectionV uint64
	autoProjectionV   uint64
	portalProjectionV uint64
	loadedMode        string
}

const mainThreadQueueSize = 100

const browserWindowMode = "browser"

// placesRefreshTickThreshold at 8ms/tick ≈ 2 seconds
const placesRefreshTickThreshold = 250

func NewBrowser(ctx context.Context) *Browser {
	// #nosec G118 -- the cancel func is stored on Browser and invoked on Quit and shutdown.
	browserCtx, cancel := context.WithCancel(ctx)
	return &Browser{
		mainThreadCh: make(chan func(), mainThreadQueueSize),
		ctx:          browserCtx,
		cancel:       cancel,
	}
}

func (b *Browser) postToMainThread(fn func()) {
	if fn == nil {
		return
	}

	select {
	case <-b.ctx.Done():
		return
	case b.mainThreadCh <- fn:
		return
	}
}

// loadMode sets up the QML interface directly. It must only be called from the Qt main thread.
func (b *Browser) loadMode(mode, argsJSON string) {
	if mode == "" {
		mode = browserWindowMode
	}
	if b.loadedMode == mode {
		return
	}

	slog.Info("Activating browser instance in main thread", "mode", mode)

	var args map[string]any
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
	b.loadedMode = mode
}

// Open handles the activation logic for the browser if called externally (e.g. from D-Bus in the future).
func (b *Browser) Open(mode, argsJSON string) *dbus.Error {
	slog.Info("Browser.Open requested via D-Bus API", "mode", mode)
	_ = argsJSON
	if mode == "" {
		mode = browserWindowMode
	}
	if b.controller == nil {
		return dbus.MakeFailedError(errors.New("controller not ready"))
	}

	err := b.controller.Dispatch(openportal.Command{
		CommandBase: core.Base{OpID: "dbus-open"},
		Mode:        mode,
	})
	if err != nil {
		return dbus.MakeFailedError(fmt.Errorf("dispatch open portal command: %w", err))
	}

	return nil
}

// Hide dismisses the active window but keeps the process running.
//
//nolint:unparam // D-Bus exported method signature requires *dbus.Error return
func (b *Browser) Hide() *dbus.Error {
	b.postToMainThread(func() {
		slog.Info("Hiding browser instance")
		// TODO: Hide Qt window
	})
	return nil
}

// Quit forces the application to terminate.
func (b *Browser) Quit() *dbus.Error {
	slog.Info("Browser instructed to quit")
	if b.controller == nil {
		return dbus.MakeFailedError(errors.New("controller not ready"))
	}

	err := b.controller.Dispatch(shutdown.Command{
		CommandBase: core.Base{OpID: "dbus-quit"},
		Reason:      "dbus-quit",
	})
	if err != nil {
		return dbus.MakeFailedError(fmt.Errorf("dispatch shutdown command: %w", err))
	}

	return nil
}

func (b *Browser) drainMainThreadChannel() {
	t0 := time.Now()
	// Periodically request places refresh from the controller (~every 2 seconds at timer tick rate).
	b.placesRefreshTick++
	if b.placesRefreshTick >= placesRefreshTickThreshold {
		b.placesRefreshTick = 0
		_ = b.controller.Dispatch(refreshplaces.Command{
			CommandBase: core.Base{OpID: "places-tick"},
		})
	}
	// Drain all pending tasks from the channel
	for {
		select {
		case fn := <-b.mainThreadCh:
			fn()
		default:
			b.applyPortalProjection()
			b.applyAutocompleteProjection()
			b.applySearchProjection()
			b.applyDirectoryProjection()
			b.applyPlacesProjection()
			if d := time.Since(t0); d > 5*time.Millisecond {
				slog.Debug("drainMainThread slow", "dur", d.Round(time.Millisecond))
			}
			return
		}
	}
}

func (b *Browser) applyPortalProjection() {
	if b.projections.Portal == nil {
		return
	}
	if v := b.projections.Portal.Version(); v == 0 || v == b.portalProjectionV {
		return
	}

	state, version := b.projections.Portal.Snapshot()
	if version == 0 || version == b.portalProjectionV {
		return
	}

	b.portalProjectionV = version
	b.loadMode(state.WindowMode, "")
	b.engine.RootContext().SetContextProperty2("portalSelectedFiles", qt6.NewQVariant15(state.PortalSelection))
}

func (b *Browser) applyAutocompleteProjection() {
	if b.acModel == nil || b.projections.Auto == nil {
		return
	}
	if v := b.projections.Auto.Version(); v == 0 || v == b.autoProjectionV {
		return
	}

	state, version := b.projections.Auto.Snapshot()
	if version == 0 || version == b.autoProjectionV {
		return
	}

	b.autoProjectionV = version
	b.acModel.ApplyProjectionAutocomplete(state.Autocomplete)
}

func (b *Browser) applySearchProjection() {
	if b.fsModel == nil || b.projections.Search == nil {
		return
	}
	if v := b.projections.Search.Version(); v == 0 || v == b.searchProjectionV {
		return
	}

	state, version := b.projections.Search.Snapshot()
	if version == 0 || version == b.searchProjectionV {
		return
	}

	b.searchProjectionV = version
	b.fsModel.ApplyProjectionSearch(state.SearchResults)
}

func (b *Browser) applyDirectoryProjection() {
	if b.fsModel == nil || b.projections.Directory == nil {
		return
	}
	if v := b.projections.Directory.Version(); v == 0 || v == b.dirProjectionV {
		return
	}

	state, version := b.projections.Directory.Snapshot()
	if version == 0 || version == b.dirProjectionV {
		return
	}

	b.dirProjectionV = version
	b.fsModel.ApplyProjectionDirectory(state.CurrentPath, state.DirectoryEntries)
}

func (b *Browser) applyPlacesProjection() {
	if b.placesModel == nil || b.projections.Places == nil {
		return
	}
	if v := b.projections.Places.Version(); v == 0 || v == b.placesProjectionV {
		return
	}

	state, version := b.projections.Places.Snapshot()
	if version == 0 || version == b.placesProjectionV {
		return
	}

	b.placesProjectionV = version
	b.placesModel.ApplyProjectionPlaces(state.Places)
}

//nolint:funlen,gocognit // process bootstrap includes Qt, D-Bus, and singleton activation wiring
func main() {
	slog.SetDefault(slog.New(slog.NewTextHandler(os.Stderr, &slog.HandlerOptions{Level: slog.LevelDebug})))

	signalCtx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	b := NewBrowser(signalCtx)

	go func() {
		<-signalCtx.Done()
		// b.ctx is derived from signalCtx, so it's already done when this fires.
		// postToMainThread guards on b.ctx.Done() and would return early without
		// posting the quit function.  QCoreApplication_Quit is thread-safe per Qt docs.
		b.cancel()
		qt6.QCoreApplication_Quit()
	}()

	// Initialize D-Bus and check for existing instance BEFORE starting Qt
	conn, err := dbus.ConnectSessionBus(dbus.WithContext(b.ctx))
	if err != nil {
		slog.Error("Failed to connect to session bus", "err", err)
		stop()
		os.Exit(1)
	}
	b.dbusConn = conn

	reply, err := conn.RequestName("uk.co.darkliquid.tilbo.Browser", dbus.NameFlagDoNotQueue)
	if err != nil {
		slog.Error("Failed to request D-Bus name", "err", err)
		stop()
		os.Exit(1)
	}

	if reply == dbus.RequestNameReplyExists {
		slog.Info("Existing instance detected. Forwarding activation request and exiting.")
		obj := conn.Object("uk.co.darkliquid.tilbo.Browser", "/uk/co/darkliquid/tilbo/Browser")
		// In a real invocation we'd parse os.Args to determine mode
		call := obj.Call("uk.co.darkliquid.tilbo.Browser.Open", 0, "browser", "")
		if call.Err != nil {
			slog.Error("Failed to activate existing instance", "err", call.Err)
			_ = conn.Close()
			stop()
			os.Exit(1)
		}
		_ = conn.Close()
		stop()
		os.Exit(0)
	}

	// We are the primary instance. Start the Qt application.
	if setEnvErr := os.Setenv("QT_QUICK_CONTROLS_STYLE", "Basic"); setEnvErr != nil {
		slog.Warn("Failed to set QT_QUICK_CONTROLS_STYLE", "err", setEnvErr)
	}
	b.app = qt6.NewQGuiApplication(os.Args)
	qt6.QGuiApplication_SetQuitOnLastWindowClosed(false)
	b.engine = miqtqml.NewQQmlApplicationEngine()

	// Connect to daemon
	daemonClient, err := ConnectDaemon(b.ctx)
	if err != nil {
		slog.Error("Failed to connect to daemon", "err", err)
		// We shouldn't exit here, standalone browsing might still work,
		// but tag fetching will fail gracefully.
	}

	// Initialize Traditional Tagged Filesystem Model
	b.fsModel = models.NewFileSystemModel(b.ctx, b.app.QObject)
	b.fsModel.BindMainThread(b.postToMainThread)
	// Access the underlying QObject pointer correctly in miqt.
	b.engine.RootContext().SetContextProperty("fsModel", b.fsModel.QObject)

	b.acModel = models.NewAutocompleteModel(b.app.QObject)
	b.engine.RootContext().SetContextProperty("acModel", b.acModel.QObject)

	b.placesModel = models.NewPlacesModel(b.app.QObject)
	b.engine.RootContext().SetContextProperty("placesModel", b.placesModel.QObject)

	b.controller = state.NewController(b.ctx)
	if daemonClient != nil {
		b.controller.SetDaemonAdapter(daemon.NewAdapter(daemonClient))
	}
	b.controller.EventBus().
		Subscribe(core.EventShutdownInitiated, func(_ context.Context, evt core.Event) {
			if _, ok := evt.(core.ShutdownInitiatedEvent); !ok {
				return
			}

			b.postToMainThread(func() {
				b.cancel()
				qt6.QCoreApplication_Quit()
			})
		})
	b.controller.EventBus().
		Subscribe(core.EventFileOperationDone, func(_ context.Context, evt core.Event) {
			if _, ok := evt.(core.FileOperationDoneEvent); !ok {
				return
			}

			b.postToMainThread(func() {
				if b.fsModel != nil {
					b.fsModel.Refresh()
				}
			})
		})
	projSubs, projections := state.NewProjectionSet()
	b.controller.RegisterProjectionSubscribers(projSubs)
	b.projections = projections
	b.fsModel.BindController(b.controller)
	b.acModel.BindController(b.controller)
	_ = b.controller.Dispatch(openportal.Command{
		CommandBase: core.Base{OpID: "startup-open"},
		Mode:        browserWindowMode,
	})
	startPath := "/"
	if cwd, cwdErr := os.Getwd(); cwdErr == nil && cwd != "" {
		startPath = cwd
	}
	b.fsModel.SetPath(startPath)
	_ = b.controller.Dispatch(refreshplaces.Command{
		CommandBase: core.Base{OpID: "places-initial"},
	})

	b.engine.RootContext().SetContextProperty2("daemonConnected", qt6.NewQVariant8(daemonClient != nil))
	b.engine.RootContext().SetContextProperty2("portalSelectedFiles", qt6.NewQVariant15([]string{}))
	b.engine.RootContext().SetContextProperty2("browserInitialPath", qt6.NewQVariant14(startPath))

	// Export model role IDs so QML command actions do not rely on hardcoded numbers.
	b.engine.RootContext().SetContextProperty2("fsRoleOpen", qt6.NewQVariant4(models.ActionOpenRole))
	b.engine.RootContext().SetContextProperty2("fsRoleRename", qt6.NewQVariant4(models.ActionRenameRole))
	b.engine.RootContext().SetContextProperty2("fsRoleDelete", qt6.NewQVariant4(models.ActionDeleteRole))
	b.engine.RootContext().SetContextProperty2("fsRoleCD", qt6.NewQVariant4(models.ActionCDRole))
	b.engine.RootContext().SetContextProperty2("fsRoleToggleHidden", qt6.NewQVariant4(models.ActionToggleHiddenRole))
	b.engine.RootContext().SetContextProperty2("fsRoleSearch", qt6.NewQVariant4(models.ActionSearchRole))
	b.engine.RootContext().SetContextProperty2("fsRoleStatFile", qt6.NewQVariant4(models.ActionStatFileRole))
	b.engine.RootContext().SetContextProperty2("fsRoleSize", qt6.NewQVariant4(models.SizeRole))
	b.engine.RootContext().SetContextProperty2("fsRoleModified", qt6.NewQVariant4(models.ModifiedRole))
	b.engine.RootContext().SetContextProperty2("acRoleTrigger", qt6.NewQVariant4(models.AcTriggerRole))

	// Setup thread-safety bridge
	b.timer = qt6.NewQTimer()
	b.timer.OnTimeout(func() {
		b.drainMainThreadChannel()
	})
	b.timer.Start(8) // Every 8ms (~120hz); sub-frame polling with reduced main-thread lock churn

	// Create tmp path for QML
	dumbTmpPath := os.TempDir() + "/tilbo-qml"
	_ = os.MkdirAll(dumbTmpPath+"/windows", 0o700)
	_ = os.MkdirAll(dumbTmpPath+"/components", 0o700)

	_ = os.WriteFile(dumbTmpPath+"/windows/BrowserWindow.qml", []byte(qml.BrowserWindow), 0o600)
	_ = os.WriteFile(dumbTmpPath+"/windows/PortalDialog.qml", []byte(qml.PortalDialog), 0o600)
	_ = os.WriteFile(dumbTmpPath+"/components/TagSearchBar.qml", []byte(qml.TagSearchBar), 0o600)
	_ = os.WriteFile(dumbTmpPath+"/components/FileGrid.qml", []byte(qml.FileGrid), 0o600)
	_ = os.WriteFile(dumbTmpPath+"/components/FileList.qml", []byte(qml.FileList), 0o600)

	// Export D-Bus interface
	/*
		if err := b.exportDBus(); err != nil {
			slog.Error("Failed to export D-Bus interface", "err", err)
			os.Exit(1)
		}
	*/

	// Give control to Qt event loop
	exitCode := qt6.QGuiApplication_Exec()
	b.cancel()
	if daemonClient != nil {
		if err := daemonClient.Close(); err != nil {
			slog.Debug("Failed to close daemon client", "err", err)
		}
	}
	if b.dbusConn != nil {
		_ = b.dbusConn.Close()
	}
	stop()

	// Ensure Go pointer semantics do not garbage collect our wrapper structs
	// before the Qt engine terminates.
	runtime.KeepAlive(b)
	runtime.KeepAlive(daemonClient)

	os.Exit(exitCode)
}
