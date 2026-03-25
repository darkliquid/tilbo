//nolint:testpackage // allow testing unexported functions
package vectorize

import "testing"

func TestDownloadOptionsForModel(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name      string
		modelName string
		wantONNX  string
	}{
		{
			name:      "default model pins canonical onnx path",
			modelName: DefaultModelName,
			wantONNX:  defaultModelONNXFilePath,
		},
		{
			name:      "custom model leaves onnx path unspecified",
			modelName: "sentence-transformers/paraphrase-MiniLM-L3-v2",
			wantONNX:  "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			opts := downloadOptionsForModel(tt.modelName)
			if opts.OnnxFilePath != tt.wantONNX {
				t.Fatalf(
					"downloadOptionsForModel(%q).OnnxFilePath = %q, want %q",
					tt.modelName,
					opts.OnnxFilePath,
					tt.wantONNX,
				)
			}
		})
	}
}
