package helper

import (
	"testing"

	relayconstant "github.com/QuantumNous/new-api/relay/constant"
	"github.com/QuantumNous/new-api/setting/ratio_setting"
)

func TestResolveModelMappingNames(t *testing.T) {
	upstream, pricing, mapped, err := ResolveModelMappingNames(
		"gpt-111",
		`{"gpt-111":"Vendor2/GPT-5.5"}`,
		relayconstant.RelayModeChatCompletions,
	)
	if err != nil {
		t.Fatalf("ResolveModelMappingNames returned error: %v", err)
	}
	if !mapped {
		t.Fatalf("expected model to be mapped")
	}
	if upstream != "Vendor2/GPT-5.5" {
		t.Fatalf("upstream = %q, want %q", upstream, "Vendor2/GPT-5.5")
	}
	if pricing != "Vendor2/GPT-5.5" {
		t.Fatalf("pricing = %q, want %q", pricing, "Vendor2/GPT-5.5")
	}
}

func TestResolveModelMappingNamesChain(t *testing.T) {
	upstream, pricing, mapped, err := ResolveModelMappingNames(
		"client-model",
		`{"client-model":"mid-model","mid-model":"real-model"}`,
		relayconstant.RelayModeChatCompletions,
	)
	if err != nil {
		t.Fatalf("ResolveModelMappingNames returned error: %v", err)
	}
	if !mapped || upstream != "real-model" || pricing != "real-model" {
		t.Fatalf("unexpected result: upstream=%q pricing=%q mapped=%v", upstream, pricing, mapped)
	}
}

func TestResolveModelMappingNamesResponsesCompactPricing(t *testing.T) {
	upstream, pricing, mapped, err := ResolveModelMappingNames(
		ratio_setting.WithCompactModelSuffix("gpt-111"),
		`{"gpt-111":"Vendor2/GPT-5.5"}`,
		relayconstant.RelayModeResponsesCompact,
	)
	if err != nil {
		t.Fatalf("ResolveModelMappingNames returned error: %v", err)
	}
	wantPricing := ratio_setting.WithCompactModelSuffix("Vendor2/GPT-5.5")
	if !mapped || upstream != "Vendor2/GPT-5.5" || pricing != wantPricing {
		t.Fatalf("unexpected result: upstream=%q pricing=%q mapped=%v", upstream, pricing, mapped)
	}
}
