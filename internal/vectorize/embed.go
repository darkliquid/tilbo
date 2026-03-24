package vectorize

import (
	"context"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"sync"

	"github.com/knights-analytics/hugot"
	"github.com/knights-analytics/hugot/pipelines"
)

// DefaultModelName is the HuggingFace model used when no embed_model path is
// configured and embed_disabled is false.
const DefaultModelName = "sentence-transformers/all-MiniLM-L6-v2"

const defaultModelONNXFilePath = "onnx/model.onnx"

// DefaultModelDir returns the directory where auto-downloaded models are stored.
// Uses $XDG_DATA_HOME/tilbo/models or ~/.local/share/tilbo/models.
func DefaultModelDir() string {
	if dir := os.Getenv("XDG_DATA_HOME"); dir != "" {
		return filepath.Join(dir, "tilbo", "models")
	}
	if home, err := os.UserHomeDir(); err == nil {
		return filepath.Join(home, ".local", "share", "tilbo", "models")
	}
	return filepath.Join(os.TempDir(), "tilbo", "models")
}

// EnsureModel resolves a local model path for modelName, downloading it from
// HuggingFace into modelsDir if it is not already present.
// Returns the local path or an error if the download fails.
func EnsureModel(ctx context.Context, modelName, modelsDir string) (string, error) {
	// hugot.DownloadModel stores models at <modelsDir>/<model_name with "/" replaced by "_">.
	localPath := filepath.Join(modelsDir, strings.ReplaceAll(modelName, "/", "_"))

	if fi, err := os.Stat(localPath); err == nil && fi.IsDir() {
		return localPath, nil
	}

	if err := os.MkdirAll(modelsDir, 0o700); err != nil {
		return "", fmt.Errorf("vectorize: create models dir: %w", err)
	}

	opts := downloadOptionsForModel(modelName)

	select {
	case <-ctx.Done():
		return "", ctx.Err()
	default:
	}

	path, err := hugot.DownloadModel(modelName, modelsDir, opts)
	if err != nil {
		return "", fmt.Errorf("vectorize: download model %q: %w", modelName, err)
	}
	return path, nil
}

func downloadOptionsForModel(modelName string) hugot.DownloadOptions {
	opts := hugot.NewDownloadOptions()
	opts.Verbose = false
	if modelName == DefaultModelName {
		opts.OnnxFilePath = defaultModelONNXFilePath
	}
	return opts
}

// Embedder provides vector embeddings for strings.
type Embedder interface {
	EmbedText(ctx context.Context, text string) ([]float32, error)
	Close() error
}

// ONNXEmbedder implements Embedder using knights-analytics/hugot to run ONNX
// models locally without external API dependencies.
type ONNXEmbedder struct {
	session  *hugot.Session
	pipeline *pipelines.FeatureExtractionPipeline
	mu       sync.Mutex
}

// NewONNXEmbedder initializes an ONNX runtime session and loads the model from the
// specified directory. The model should be an all-MiniLM-L6-v2 ONNX export.
func NewONNXEmbedder(_ context.Context, modelPath string) (*ONNXEmbedder, error) {
	session, err := hugot.NewGoSession()
	if err != nil {
		return nil, fmt.Errorf("hugot session: %w", err)
	}

	config := hugot.FeatureExtractionConfig{
		ModelPath: modelPath,
		Name:      "tilbo_embedder",
	}

	pipeline, err := hugot.NewPipeline(session, config)
	if err != nil {
		_ = session.Destroy()
		return nil, fmt.Errorf("hugot pipeline: %w", err)
	}

	return &ONNXEmbedder{
		session:  session,
		pipeline: pipeline,
	}, nil
}

// EmbedText returns the embedding vector for the given text.
// It is safe for concurrent use.
func (e *ONNXEmbedder) EmbedText(_ context.Context, text string) ([]float32, error) {
	e.mu.Lock()
	defer e.mu.Unlock()

	result, err := e.pipeline.RunPipeline([]string{text})
	if err != nil {
		return nil, err
	}

	batchResult := result.GetOutput()
	if len(batchResult) == 0 {
		return nil, errors.New("no embedding returned")
	}

	// For feature extraction, output is [][]float32.
	// batchResult[0] is []float32.
	emb, ok := batchResult[0].([]float32)
	if !ok {
		return nil, errors.New("unexpected output type from hugot pipeline")
	}
	return emb, nil
}

// Close destroys the underlying ONNX session to free resources.
func (e *ONNXEmbedder) Close() error {
	e.mu.Lock()
	defer e.mu.Unlock()

	if e.session != nil {
		err := e.session.Destroy()
		e.session = nil
		return err
	}
	return nil
}
