package main

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/darkliquid/tilbo/internal/ipc"
)

func withConnectDaemonHooks(t *testing.T) {
	t.Helper()
	origNewIPCClient := newIPCClient
	origSpawnDaemonProcess := spawnDaemonProcess
	origNowFn := nowFn
	origSleepFn := sleepFn

	t.Cleanup(func() {
		newIPCClient = origNewIPCClient
		spawnDaemonProcess = origSpawnDaemonProcess
		nowFn = origNowFn
		sleepFn = origSleepFn
	})
}

func TestConnectDaemon_SpawnsAndReconnects(t *testing.T) {
	withConnectDaemonHooks(t)

	connectAttempts := 0
	spawnCalls := 0

	newIPCClient = func(context.Context, string) (*ipc.Client, error) {
		connectAttempts++
		if connectAttempts == 1 {
			return nil, errors.New("dial failed")
		}
		return &ipc.Client{}, nil
	}

	spawnDaemonProcess = func() error {
		spawnCalls++
		return nil
	}

	nowCalls := 0
	nowFn = func() time.Time {
		nowCalls++
		switch nowCalls {
		case 1:
			return time.Unix(0, 0)
		default:
			return time.Unix(0, 0)
		}
	}
	sleepFn = func(time.Duration) {}

	client, err := ConnectDaemon(context.Background())
	if err != nil {
		t.Fatalf("expected reconnect success, got error: %v", err)
	}
	if client == nil {
		t.Fatal("expected daemon client, got nil")
	}
	if spawnCalls != 1 {
		t.Fatalf("expected spawn to be called once, got %d", spawnCalls)
	}
	if connectAttempts != 2 {
		t.Fatalf("expected two connect attempts, got %d", connectAttempts)
	}
}

func TestConnectDaemon_SpawnFailureReturnsError(t *testing.T) {
	withConnectDaemonHooks(t)

	spawnCalls := 0

	newIPCClient = func(context.Context, string) (*ipc.Client, error) {
		return nil, errors.New("dial failed")
	}

	spawnDaemonProcess = func() error {
		spawnCalls++
		return errors.New("spawn failed")
	}

	client, err := ConnectDaemon(context.Background())
	if err == nil {
		t.Fatal("expected error when spawn fails")
	}
	if client != nil {
		t.Fatal("expected nil client when spawn fails")
	}
	if spawnCalls != 1 {
		t.Fatalf("expected one spawn attempt, got %d", spawnCalls)
	}
}

func TestConnectDaemon_RetryTimeoutReturnsError(t *testing.T) {
	withConnectDaemonHooks(t)

	connectAttempts := 0
	spawnCalls := 0
	sleepCalls := 0

	newIPCClient = func(context.Context, string) (*ipc.Client, error) {
		connectAttempts++
		return nil, errors.New("dial failed")
	}

	spawnDaemonProcess = func() error {
		spawnCalls++
		return nil
	}

	nowValues := []time.Time{
		time.Unix(0, 0),
		time.Unix(0, 0),
		time.Unix(3, 0),
	}
	nowIdx := 0
	nowFn = func() time.Time {
		if nowIdx >= len(nowValues) {
			return nowValues[len(nowValues)-1]
		}
		v := nowValues[nowIdx]
		nowIdx++
		return v
	}

	sleepFn = func(time.Duration) {
		sleepCalls++
	}

	client, err := ConnectDaemon(context.Background())
	if err == nil {
		t.Fatal("expected timeout error when retries are exhausted")
	}
	if client != nil {
		t.Fatal("expected nil client on retry timeout")
	}
	if spawnCalls != 1 {
		t.Fatalf("expected one spawn call, got %d", spawnCalls)
	}
	if sleepCalls != 1 {
		t.Fatalf("expected one sleep between retries, got %d", sleepCalls)
	}
	if connectAttempts != 2 {
		t.Fatalf("expected two connect attempts (initial + one retry), got %d", connectAttempts)
	}
}
