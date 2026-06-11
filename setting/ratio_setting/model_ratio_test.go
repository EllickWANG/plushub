package ratio_setting

import "testing"

func TestCompletionRatioConfigOverridesDefaultForPreviouslyLockedModel(t *testing.T) {
	original := CompletionRatio2JSONString()
	t.Cleanup(func() {
		if err := UpdateCompletionRatioByJSONString(original); err != nil {
			t.Fatalf("restore completion ratio: %v", err)
		}
	})

	if err := UpdateCompletionRatioByJSONString(`{"gpt-5.5":4.25}`); err != nil {
		t.Fatalf("update completion ratio: %v", err)
	}

	if got := GetCompletionRatio("gpt-5.5"); got != 4.25 {
		t.Fatalf("expected configured completion ratio 4.25, got %v", got)
	}

	info := GetCompletionRatioInfo("gpt-5.5")
	if info.Locked {
		t.Fatalf("expected completion ratio info to be editable")
	}
	if info.Ratio != 4.25 {
		t.Fatalf("expected configured completion ratio info 4.25, got %v", info.Ratio)
	}
}

func TestCompletionRatioDefaultIsEditableMeta(t *testing.T) {
	original := CompletionRatio2JSONString()
	t.Cleanup(func() {
		if err := UpdateCompletionRatioByJSONString(original); err != nil {
			t.Fatalf("restore completion ratio: %v", err)
		}
	})

	if err := UpdateCompletionRatioByJSONString(`{}`); err != nil {
		t.Fatalf("clear completion ratio: %v", err)
	}

	if got := GetCompletionRatio("gpt-5.5"); got != 8 {
		t.Fatalf("expected default completion ratio 8, got %v", got)
	}

	info := GetCompletionRatioInfo("gpt-5.5")
	if info.Locked {
		t.Fatalf("expected default completion ratio info to be editable")
	}
	if info.Ratio != 8 {
		t.Fatalf("expected default completion ratio info 8, got %v", info.Ratio)
	}
}
