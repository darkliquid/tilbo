package vectorize

import (
	"context"
	"errors"
	"fmt"
	"sync"

	"github.com/knights-analytics/hugot"
	"github.com/knights-analytics/hugot/pipelines"
)

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
