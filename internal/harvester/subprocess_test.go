package harvester

import (
	"context"
	"testing"
	"time"
)

func makeSubprocess(name string, command []string, timeoutMS int) *SubprocessHarvester {
	return newSubprocessHarvester(Config{
		Harvester: HarvesterConfig{
			Name:      name,
			Command:   command,
			TimeoutMS: timeoutMS,
		},
	})
}

func TestSubprocessHarvester_ValidJSONOutput(t *testing.T) {
	h := makeSubprocess("echo-json",
		[]string{"sh", "-c", `echo '{"key":"value","count":42}'`}, 0)

	meta, err := h.Run(context.Background(), Input{Path: "/tmp/test.txt"})
	if err != nil {
		t.Fatalf("Run: %v", err)
	}
	if meta["key"] != "value" {
		t.Errorf("key: got %v, want value", meta["key"])
	}
	if meta["count"] != float64(42) {
		t.Errorf("count: got %v, want 42", meta["count"])
	}
}

func TestSubprocessHarvester_EmptyOutput(t *testing.T) {
	// A process that produces no output should return nil, nil.
	h := makeSubprocess("empty", []string{"sh", "-c", "true"}, 0)

	meta, err := h.Run(context.Background(), Input{Path: "/tmp/x.txt"})
	if err != nil {
		t.Fatalf("Run: %v", err)
	}
	if meta != nil {
		t.Errorf("expected nil meta for empty output, got %v", meta)
	}
}

func TestSubprocessHarvester_NonZeroExit(t *testing.T) {
	// Non-zero exit should return nil, nil (not an error).
	h := makeSubprocess("fail", []string{"sh", "-c", "exit 1"}, 0)

	meta, err := h.Run(context.Background(), Input{Path: "/tmp/x.txt"})
	if err != nil {
		t.Fatalf("expected nil error for non-zero exit, got: %v", err)
	}
	if meta != nil {
		t.Errorf("expected nil meta for non-zero exit, got %v", meta)
	}
}

func TestSubprocessHarvester_Timeout(t *testing.T) {
	// Process that sleeps longer than the timeout.
	h := makeSubprocess("slow", []string{"sh", "-c", "sleep 10"}, 50) // 50ms timeout

	start := time.Now()
	meta, err := h.Run(context.Background(), Input{Path: "/tmp/x.txt"})
	elapsed := time.Since(start)

	// Should return within ~500ms (generous allowance for process startup).
	if elapsed > 2*time.Second {
		t.Errorf("timeout not enforced: took %v", elapsed)
	}
	// A killed process should return nil,nil (treated as non-zero exit).
	if err != nil {
		t.Logf("Run returned error (acceptable for killed process): %v", err)
	}
	if meta != nil {
		t.Errorf("expected nil meta for timed-out process, got %v", meta)
	}
}

func TestSubprocessHarvester_InvalidJSON(t *testing.T) {
	h := makeSubprocess("bad-json",
		[]string{"sh", "-c", `echo "not json"`}, 0)

	_, err := h.Run(context.Background(), Input{Path: "/tmp/x.txt"})
	if err == nil {
		t.Error("expected parse error for invalid JSON output")
	}
}

func TestSubprocessHarvester_ReceivesInputOnStdin(t *testing.T) {
	// Script reads path from JSON on stdin and echoes it back as metadata.
	script := `
input=$(cat)
path=$(echo "$input" | grep -o '"path":"[^"]*"' | head -1 | sed 's/"path":"//;s/"//')
echo "{\"input_path\":\"$path\"}"
`
	h := makeSubprocess("stdin-reader", []string{"sh", "-c", script}, 0)

	meta, err := h.Run(context.Background(), Input{Path: "/files/test.txt"})
	if err != nil {
		t.Fatalf("Run: %v", err)
	}
	if meta["input_path"] != "/files/test.txt" {
		t.Errorf("input_path: got %v, want /files/test.txt", meta["input_path"])
	}
}

func TestSubprocessHarvester_Matches_MIMEFilter(t *testing.T) {
	h := newSubprocessHarvester(Config{
		Harvester: HarvesterConfig{
			Name:       "video-only",
			Command:    []string{"true"},
			MIMEFilter: []string{"video/*"},
		},
	})

	if !h.Matches("/f.mp4", "video/mp4") {
		t.Error("should match video/mp4")
	}
	if h.Matches("/f.jpg", "image/jpeg") {
		t.Error("should not match image/jpeg")
	}
}

func TestSubprocessHarvester_Matches_PathGlob(t *testing.T) {
	h := newSubprocessHarvester(Config{
		Harvester: HarvesterConfig{
			Name:     "py-only",
			Command:  []string{"true"},
			PathGlob: []string{"*.py"},
		},
	})

	if !h.Matches("/src/main.py", "") {
		t.Error("should match *.py")
	}
	if h.Matches("/src/main.go", "") {
		t.Error("should not match main.go")
	}
}
