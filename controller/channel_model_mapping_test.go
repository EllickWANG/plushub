package controller

import (
	"testing"

	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/setting/ratio_setting"
)

func TestParseChannelModelMapping(t *testing.T) {
	raw := `{" GPT-5-pro ":" Vendor2/GPT-5-pro ","empty":"","":"ignored"}`
	mapping, err := parseChannelModelMapping(&raw)
	if err != nil {
		t.Fatalf("parseChannelModelMapping returned error: %v", err)
	}
	if got := mapping["GPT-5-pro"]; got != "Vendor2/GPT-5-pro" {
		t.Fatalf("expected trimmed mapping target, got %q", got)
	}
	if _, ok := mapping[""]; ok {
		t.Fatal("empty mapping key should be ignored")
	}
}

func TestAppendChannelModel(t *testing.T) {
	channel := &model.Channel{Models: "gpt-4,GPT-5-pro"}
	added, models := appendChannelModel(channel, "GPT-5-pro")
	if added {
		t.Fatal("existing model should not be added twice")
	}
	if models != "gpt-4,GPT-5-pro" {
		t.Fatalf("unexpected model list: %q", models)
	}

	added, models = appendChannelModel(channel, "Claude-4")
	if !added {
		t.Fatal("new model should be added")
	}
	if models != "gpt-4,GPT-5-pro,Claude-4" {
		t.Fatalf("unexpected model list after append: %q", models)
	}
}

func TestMarshalChannelModelMapping(t *testing.T) {
	mapping := map[string]string{
		"GPT-5-pro": "Vendor2/GPT-5-pro",
	}
	raw, err := marshalChannelModelMapping(mapping)
	if err != nil {
		t.Fatalf("marshalChannelModelMapping returned error: %v", err)
	}
	parsed, err := parseChannelModelMapping(&raw)
	if err != nil {
		t.Fatalf("round trip parse returned error: %v", err)
	}
	if parsed["GPT-5-pro"] != "Vendor2/GPT-5-pro" {
		t.Fatalf("unexpected round trip target: %q", parsed["GPT-5-pro"])
	}
}

func TestResolveChannelModelMappingPricingModel(t *testing.T) {
	mapping := map[string]string{
		"public-model":       "vendor/model-alias",
		"vendor/model-alias": "vendor/model-priced",
	}
	pricingModel, err := resolveChannelModelMappingPricingModel("public-model", "vendor/model-alias", mapping)
	if err != nil {
		t.Fatalf("resolveChannelModelMappingPricingModel returned error: %v", err)
	}
	if pricingModel != "vendor/model-priced" {
		t.Fatalf("unexpected pricing model: %q", pricingModel)
	}
}

func TestGetChannelModelMappingPriceStatus(t *testing.T) {
	original := ratio_setting.ModelRatio2JSONString()
	defer func() {
		if err := ratio_setting.UpdateModelRatioByJSONString(original); err != nil {
			t.Fatalf("restore model ratio failed: %v", err)
		}
	}()
	if err := ratio_setting.UpdateModelRatioByJSONString(`{"vendor/model-priced":1}`); err != nil {
		t.Fatalf("UpdateModelRatioByJSONString returned error: %v", err)
	}

	pricingModel, configured, err := getChannelModelMappingPriceStatus(
		"public-model",
		"vendor/model-priced",
		map[string]string{},
	)
	if err != nil {
		t.Fatalf("getChannelModelMappingPriceStatus returned error: %v", err)
	}
	if pricingModel != "vendor/model-priced" || !configured {
		t.Fatalf("expected configured vendor/model-priced, got model=%q configured=%v", pricingModel, configured)
	}

	pricingModel, configured, err = getChannelModelMappingPriceStatus(
		"public-model",
		"vendor/model-missing",
		map[string]string{},
	)
	if err != nil {
		t.Fatalf("getChannelModelMappingPriceStatus returned error for missing model: %v", err)
	}
	if pricingModel != "vendor/model-missing" || configured {
		t.Fatalf("expected missing vendor/model-missing, got model=%q configured=%v", pricingModel, configured)
	}
}
