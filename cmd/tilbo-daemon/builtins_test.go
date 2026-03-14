package main

import (
	"context"
	"testing"

	"github.com/darkliquid/tilbo/internal/harvester"
)

type typedNilHarvester struct{}

func (*typedNilHarvester) Name() string { return "typed-nil" }

func (*typedNilHarvester) Priority() int { return 0 }

func (*typedNilHarvester) Async() bool { return false }

func (*typedNilHarvester) Matches(_, _ string) bool { return true }

func (*typedNilHarvester) Run(context.Context, harvester.Input) (harvester.MetaMap, error) {
	return harvester.MetaMap{}, nil
}

func TestIsNilHarvester_TypedNilPointer(t *testing.T) {
	var h harvester.Harvester = (*typedNilHarvester)(nil)
	if !isNilHarvester(h) {
		t.Fatal("typed nil pointer wrapped in interface should be treated as nil")
	}
}

func TestRegisterBuiltins_DoesNotRegisterTypedNilHarvesters(t *testing.T) {
	p := harvester.NewPipeline()
	registerBuiltins(p)

	for _, h := range p.List() {
		if isNilHarvester(h) {
			t.Fatalf("registerBuiltins registered typed-nil harvester of type %T", h)
		}
	}
}
