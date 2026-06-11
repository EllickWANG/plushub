package helper

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"strings"

	rootcommon "github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/dto"
	"github.com/QuantumNous/new-api/relay/common"
	relayconstant "github.com/QuantumNous/new-api/relay/constant"
	"github.com/QuantumNous/new-api/setting/ratio_setting"
	"github.com/gin-gonic/gin"
)

func ModelMappedHelper(c *gin.Context, info *common.RelayInfo, request dto.Request) error {
	if info.ChannelMeta == nil {
		info.ChannelMeta = &common.ChannelMeta{}
	}

	isResponsesCompact := info.RelayMode == relayconstant.RelayModeResponsesCompact
	upstreamModelName, pricingModelName, isModelMapped, err := ResolveModelMappingNames(
		info.OriginModelName,
		c.GetString("model_mapping"),
		info.RelayMode,
	)
	if err != nil {
		return err
	}
	info.IsModelMapped = isModelMapped
	if info.IsModelMapped {
		info.UpstreamModelName = upstreamModelName
		info.OriginModelName = pricingModelName
	}
	if isResponsesCompact {
		info.UpstreamModelName = upstreamModelName
		info.OriginModelName = pricingModelName
	}
	if request != nil {
		request.SetModelName(info.UpstreamModelName)
		if info.IsModelMapped {
			if err := refreshMappedJSONBody(c, request); err != nil {
				return err
			}
		}
	}
	return nil
}

func refreshMappedJSONBody(c *gin.Context, request dto.Request) error {
	contentType := c.Request.Header.Get("Content-Type")
	if !strings.HasPrefix(contentType, "application/json") {
		return nil
	}
	jsonData, err := rootcommon.Marshal(request)
	if err != nil {
		return fmt.Errorf("marshal_mapped_request_failed: %w", err)
	}
	storage, err := rootcommon.CreateBodyStorage(jsonData)
	if err != nil {
		return fmt.Errorf("create_mapped_body_storage_failed: %w", err)
	}
	if oldStorage, exists := c.Get(rootcommon.KeyBodyStorage); exists && oldStorage != nil {
		if bodyStorage, ok := oldStorage.(rootcommon.BodyStorage); ok {
			_ = bodyStorage.Close()
		}
	}
	c.Set(rootcommon.KeyBodyStorage, storage)
	c.Request.Body = io.NopCloser(bytes.NewReader(jsonData))
	c.Request.ContentLength = int64(len(jsonData))
	return nil
}

func ResolveModelMappingNames(originModelName string, modelMapping string, relayMode int) (upstreamModelName string, pricingModelName string, isModelMapped bool, err error) {
	isResponsesCompact := relayMode == relayconstant.RelayModeResponsesCompact
	mappingModelName := originModelName
	if isResponsesCompact && strings.HasSuffix(originModelName, ratio_setting.CompactModelSuffix) {
		mappingModelName = strings.TrimSuffix(originModelName, ratio_setting.CompactModelSuffix)
	}

	currentModel := mappingModelName
	if modelMapping != "" && modelMapping != "{}" {
		modelMap := make(map[string]string)
		if err := json.Unmarshal([]byte(modelMapping), &modelMap); err != nil {
			return "", "", false, fmt.Errorf("unmarshal_model_mapping_failed")
		}

		visitedModels := map[string]bool{
			currentModel: true,
		}
		for {
			mappedModel, exists := modelMap[currentModel]
			if !exists || mappedModel == "" {
				break
			}
			if mappedModel == currentModel {
				break
			}
			if visitedModels[mappedModel] {
				return "", "", false, errors.New("model_mapping_contains_cycle")
			}
			visitedModels[mappedModel] = true
			currentModel = mappedModel
			isModelMapped = true
		}
	}

	upstreamModelName = currentModel
	pricingModelName = currentModel
	if isResponsesCompact {
		pricingModelName = ratio_setting.WithCompactModelSuffix(currentModel)
	}
	return upstreamModelName, pricingModelName, isModelMapped, nil
}
