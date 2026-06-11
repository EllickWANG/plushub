package controller

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"strconv"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	relayconstant "github.com/QuantumNous/new-api/relay/constant"
	"github.com/QuantumNous/new-api/relay/helper"
	"github.com/QuantumNous/new-api/setting/ratio_setting"

	"github.com/gin-gonic/gin"
)

type channelModelMappingSearchItem struct {
	ChannelID       int    `json:"channel_id"`
	ChannelName     string `json:"channel_name"`
	ChannelType     int    `json:"channel_type"`
	ChannelStatus   int    `json:"channel_status"`
	UpstreamModel   string `json:"upstream_model"`
	Source          string `json:"source"`
	HasUnifiedModel bool   `json:"has_unified_model"`
	MappedTo        string `json:"mapped_to"`
	PricingModel    string `json:"pricing_model"`
	PriceConfigured bool   `json:"price_configured"`
	FetchError      string `json:"fetch_error,omitempty"`
}

type channelModelMappingSummaryItem struct {
	ChannelID       int    `json:"channel_id"`
	ChannelName     string `json:"channel_name"`
	ChannelType     int    `json:"channel_type"`
	ChannelStatus   int    `json:"channel_status"`
	HasUnifiedModel bool   `json:"has_unified_model"`
	MappedTo        string `json:"mapped_to"`
}

type channelModelMappingListItem struct {
	ChannelID       int    `json:"channel_id"`
	ChannelName     string `json:"channel_name"`
	ChannelType     int    `json:"channel_type"`
	ChannelStatus   int    `json:"channel_status"`
	UnifiedModel    string `json:"unified_model"`
	UpstreamModel   string `json:"upstream_model"`
	HasUnifiedModel bool   `json:"has_unified_model"`
	PricingModel    string `json:"pricing_model"`
	PriceConfigured bool   `json:"price_configured"`
}

type channelModelMappingApplyItem struct {
	ChannelID     int    `json:"channel_id"`
	UpstreamModel string `json:"upstream_model"`
}

type channelModelMappingApplyRequest struct {
	UnifiedModel string                         `json:"unified_model"`
	Overwrite    bool                           `json:"overwrite"`
	Items        []channelModelMappingApplyItem `json:"items"`
}

type channelModelMappingDeleteRequest struct {
	ChannelID    int    `json:"channel_id"`
	UnifiedModel string `json:"unified_model"`
	RemoveModel  *bool  `json:"remove_model"`
}

type channelModelMappingConflict struct {
	ChannelID      int    `json:"channel_id"`
	ChannelName    string `json:"channel_name"`
	ExistingTarget string `json:"existing_target"`
	NextTarget     string `json:"next_target"`
}

type channelModelMappingApplyResult struct {
	ChannelID       int    `json:"channel_id"`
	ChannelName     string `json:"channel_name"`
	AddedModel      bool   `json:"added_model"`
	AddedMapping    bool   `json:"added_mapping"`
	UpdatedMapping  bool   `json:"updated_mapping"`
	SkippedNoChange bool   `json:"skipped_no_change"`
}

func normalizeChannelModelMappingName(name string) string {
	return strings.TrimSpace(name)
}

func parseChannelModelMapping(raw *string) (map[string]string, error) {
	mapping := make(map[string]string)
	if raw == nil || strings.TrimSpace(*raw) == "" {
		return mapping, nil
	}
	if err := json.Unmarshal([]byte(*raw), &mapping); err != nil {
		return nil, err
	}
	cleaned := make(map[string]string, len(mapping))
	for source, target := range mapping {
		source = normalizeChannelModelMappingName(source)
		target = normalizeChannelModelMappingName(target)
		if source == "" || target == "" {
			continue
		}
		cleaned[source] = target
	}
	return cleaned, nil
}

func marshalChannelModelMapping(mapping map[string]string) (string, error) {
	if len(mapping) == 0 {
		return "", nil
	}
	data, err := json.Marshal(mapping)
	if err != nil {
		return "", err
	}
	return string(data), nil
}

func channelModelSet(channel *model.Channel) map[string]struct{} {
	set := make(map[string]struct{})
	if channel == nil {
		return set
	}
	for _, modelName := range channel.GetModels() {
		modelName = normalizeChannelModelMappingName(modelName)
		if modelName != "" {
			set[modelName] = struct{}{}
		}
	}
	return set
}

func channelHasModel(channel *model.Channel, modelName string) bool {
	_, ok := channelModelSet(channel)[normalizeChannelModelMappingName(modelName)]
	return ok
}

func appendChannelModel(channel *model.Channel, modelName string) (bool, string) {
	modelName = normalizeChannelModelMappingName(modelName)
	models := normalizeModelNames(channel.GetModels())
	for _, existing := range models {
		if existing == modelName {
			return false, strings.Join(models, ",")
		}
	}
	models = append(models, modelName)
	return true, strings.Join(models, ",")
}

func removeChannelModel(channel *model.Channel, modelName string) (bool, string) {
	modelName = normalizeChannelModelMappingName(modelName)
	models := normalizeModelNames(channel.GetModels())
	nextModels := make([]string, 0, len(models))
	removed := false
	for _, existing := range models {
		if existing == modelName {
			removed = true
			continue
		}
		nextModels = append(nextModels, existing)
	}
	return removed, strings.Join(nextModels, ",")
}

func getChannelsForModelMapping(statusFilter int) ([]*model.Channel, error) {
	query := model.DB.Model(&model.Channel{})
	if statusFilter == common.ChannelStatusEnabled {
		query = query.Where("status = ?", common.ChannelStatusEnabled)
	} else if statusFilter == 0 {
		query = query.Where("status != ?", common.ChannelStatusEnabled)
	}
	var channels []*model.Channel
	err := query.Order("priority desc").Find(&channels).Error
	return channels, err
}

func shouldMatchModelMappingKeyword(modelName string, keyword string) bool {
	if keyword == "" {
		return true
	}
	return strings.Contains(strings.ToLower(modelName), strings.ToLower(keyword))
}

func shouldMatchMappingListKeyword(item channelModelMappingListItem, keyword string) bool {
	if keyword == "" {
		return true
	}
	keyword = strings.ToLower(keyword)
	values := []string{
		item.ChannelName,
		strconv.Itoa(item.ChannelID),
		item.UnifiedModel,
		item.UpstreamModel,
	}
	for _, value := range values {
		if strings.Contains(strings.ToLower(value), keyword) {
			return true
		}
	}
	return false
}

func resolveChannelModelMappingPricingModel(unifiedModel string, upstreamModel string, mapping map[string]string) (string, error) {
	nextMapping := make(map[string]string, len(mapping)+1)
	for source, target := range mapping {
		nextMapping[source] = target
	}
	nextMapping[unifiedModel] = upstreamModel
	rawMapping, err := marshalChannelModelMapping(nextMapping)
	if err != nil {
		return "", err
	}
	_, pricingModel, _, err := helper.ResolveModelMappingNames(
		unifiedModel,
		rawMapping,
		relayconstant.RelayModeUnknown,
	)
	if err != nil {
		return "", err
	}
	return pricingModel, nil
}

func hasUsableModelPrice(modelName string) bool {
	_, _, exists := ratio_setting.GetModelRatioOrPrice(modelName)
	return exists
}

func getChannelModelMappingPriceStatus(unifiedModel string, upstreamModel string, mapping map[string]string) (pricingModel string, priceConfigured bool, err error) {
	pricingModel, err = resolveChannelModelMappingPricingModel(unifiedModel, upstreamModel, mapping)
	if err != nil {
		return "", false, err
	}
	return pricingModel, hasUsableModelPrice(pricingModel), nil
}

func addModelMappingSearchCandidate(
	items *[]channelModelMappingSearchItem,
	seen map[string]struct{},
	channel *model.Channel,
	unifiedModel string,
	upstreamModel string,
	source string,
	mappedTo string,
	fetchError string,
) {
	upstreamModel = normalizeChannelModelMappingName(upstreamModel)
	if upstreamModel == "" {
		return
	}
	key := fmt.Sprintf("%d:%s", channel.Id, upstreamModel)
	if _, ok := seen[key]; ok {
		return
	}
	seen[key] = struct{}{}
	pricingModel, priceConfigured, err := getChannelModelMappingPriceStatus(unifiedModel, upstreamModel, mappingOrEmpty(channel.ModelMapping))
	if err != nil {
		pricingModel = upstreamModel
		priceConfigured = false
	}
	*items = append(*items, channelModelMappingSearchItem{
		ChannelID:       channel.Id,
		ChannelName:     channel.Name,
		ChannelType:     channel.Type,
		ChannelStatus:   channel.Status,
		UpstreamModel:   upstreamModel,
		Source:          source,
		HasUnifiedModel: channelHasModel(channel, unifiedModel),
		MappedTo:        mappedTo,
		PricingModel:    pricingModel,
		PriceConfigured: priceConfigured,
		FetchError:      fetchError,
	})
}

func mappingOrEmpty(raw *string) map[string]string {
	mapping, err := parseChannelModelMapping(raw)
	if err != nil {
		return map[string]string{}
	}
	return mapping
}

func SearchChannelModelMappings(c *gin.Context) {
	keyword := strings.TrimSpace(c.Query("keyword"))
	unifiedModel := normalizeChannelModelMappingName(c.Query("unified_model"))
	includeUpstream, _ := strconv.ParseBool(c.DefaultQuery("include_upstream", "true"))
	statusFilter := parseStatusFilter(c.DefaultQuery("status", "enabled"))

	channels, err := getChannelsForModelMapping(statusFilter)
	if err != nil {
		common.ApiError(c, err)
		return
	}

	items := make([]channelModelMappingSearchItem, 0)
	seen := make(map[string]struct{})
	for _, channel := range channels {
		mapping, err := parseChannelModelMapping(channel.ModelMapping)
		if err != nil {
			continue
		}
		mappedTo := mapping[unifiedModel]
		for _, modelName := range channel.GetModels() {
			if shouldMatchModelMappingKeyword(modelName, keyword) {
				addModelMappingSearchCandidate(&items, seen, channel, unifiedModel, modelName, "channel", mappedTo, "")
			}
		}
		for _, target := range mapping {
			if shouldMatchModelMappingKeyword(target, keyword) {
				addModelMappingSearchCandidate(&items, seen, channel, unifiedModel, target, "mapping", mappedTo, "")
			}
		}
		if includeUpstream {
			upstreamModels, fetchErr := fetchChannelUpstreamModelIDs(channel)
			if fetchErr != nil {
				if keyword == "" {
					addModelMappingSearchCandidate(&items, seen, channel, unifiedModel, "", "upstream", mappedTo, fetchErr.Error())
				}
				continue
			}
			for _, upstreamModel := range upstreamModels {
				if shouldMatchModelMappingKeyword(upstreamModel, keyword) {
					addModelMappingSearchCandidate(&items, seen, channel, unifiedModel, upstreamModel, "upstream", mappedTo, "")
				}
			}
		}
	}

	sort.SliceStable(items, func(i, j int) bool {
		if items[i].ChannelID == items[j].ChannelID {
			return items[i].UpstreamModel < items[j].UpstreamModel
		}
		return items[i].ChannelID < items[j].ChannelID
	})

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    items,
	})
}

func GetChannelModelMappingSummary(c *gin.Context) {
	unifiedModel := normalizeChannelModelMappingName(c.Query("model"))
	if unifiedModel == "" {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "统一模型名不能为空"})
		return
	}
	statusFilter := parseStatusFilter(c.DefaultQuery("status", "all"))
	channels, err := getChannelsForModelMapping(statusFilter)
	if err != nil {
		common.ApiError(c, err)
		return
	}

	items := make([]channelModelMappingSummaryItem, 0)
	for _, channel := range channels {
		mapping, err := parseChannelModelMapping(channel.ModelMapping)
		if err != nil {
			continue
		}
		hasUnifiedModel := channelHasModel(channel, unifiedModel)
		mappedTo := mapping[unifiedModel]
		if !hasUnifiedModel && mappedTo == "" {
			continue
		}
		items = append(items, channelModelMappingSummaryItem{
			ChannelID:       channel.Id,
			ChannelName:     channel.Name,
			ChannelType:     channel.Type,
			ChannelStatus:   channel.Status,
			HasUnifiedModel: hasUnifiedModel,
			MappedTo:        mappedTo,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    items,
	})
}

func ListChannelModelMappings(c *gin.Context) {
	unifiedModel := normalizeChannelModelMappingName(c.Query("model"))
	keyword := strings.TrimSpace(c.Query("keyword"))
	statusFilter := parseStatusFilter(c.DefaultQuery("status", "all"))

	channels, err := getChannelsForModelMapping(statusFilter)
	if err != nil {
		common.ApiError(c, err)
		return
	}

	items := make([]channelModelMappingListItem, 0)
	for _, channel := range channels {
		mapping, err := parseChannelModelMapping(channel.ModelMapping)
		if err != nil {
			continue
		}
		keys := make([]string, 0, len(mapping))
		for source := range mapping {
			source = normalizeChannelModelMappingName(source)
			if source == "" {
				continue
			}
			if unifiedModel != "" && source != unifiedModel {
				continue
			}
			keys = append(keys, source)
		}
		sort.Strings(keys)
		for _, source := range keys {
			pricingModel, priceConfigured, _ := getChannelModelMappingPriceStatus(source, mapping[source], mapping)
			item := channelModelMappingListItem{
				ChannelID:       channel.Id,
				ChannelName:     channel.Name,
				ChannelType:     channel.Type,
				ChannelStatus:   channel.Status,
				UnifiedModel:    source,
				UpstreamModel:   mapping[source],
				HasUnifiedModel: channelHasModel(channel, source),
				PricingModel:    pricingModel,
				PriceConfigured: priceConfigured,
			}
			if shouldMatchMappingListKeyword(item, keyword) {
				items = append(items, item)
			}
		}
	}

	sort.SliceStable(items, func(i, j int) bool {
		if items[i].UnifiedModel == items[j].UnifiedModel {
			if items[i].ChannelID == items[j].ChannelID {
				return items[i].UpstreamModel < items[j].UpstreamModel
			}
			return items[i].ChannelID < items[j].ChannelID
		}
		return items[i].UnifiedModel < items[j].UnifiedModel
	})

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    items,
	})
}

func ApplyChannelModelMappings(c *gin.Context) {
	var req channelModelMappingApplyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ApiError(c, err)
		return
	}
	req.UnifiedModel = normalizeChannelModelMappingName(req.UnifiedModel)
	if req.UnifiedModel == "" {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "统一模型名不能为空"})
		return
	}
	if len(req.Items) == 0 {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "请选择至少一个上游模型"})
		return
	}

	byChannel := make(map[int]string)
	for _, item := range req.Items {
		upstreamModel := normalizeChannelModelMappingName(item.UpstreamModel)
		if item.ChannelID <= 0 || upstreamModel == "" {
			c.JSON(http.StatusOK, gin.H{"success": false, "message": "渠道和上游模型不能为空"})
			return
		}
		if existing, ok := byChannel[item.ChannelID]; ok && existing != upstreamModel {
			c.JSON(http.StatusOK, gin.H{"success": false, "message": fmt.Sprintf("渠道 %d 不能同时映射到多个上游模型", item.ChannelID)})
			return
		}
		byChannel[item.ChannelID] = upstreamModel
	}

	channelIDs := make([]int, 0, len(byChannel))
	for channelID := range byChannel {
		channelIDs = append(channelIDs, channelID)
	}
	channels, err := model.GetChannelsByIds(channelIDs)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	if len(channels) != len(channelIDs) {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "部分渠道不存在"})
		return
	}

	conflicts := make([]channelModelMappingConflict, 0)
	for _, channel := range channels {
		mapping, err := parseChannelModelMapping(channel.ModelMapping)
		if err != nil {
			c.JSON(http.StatusOK, gin.H{"success": false, "message": fmt.Sprintf("渠道 %s 的模型重定向不是合法 JSON", channel.Name)})
			return
		}
		nextTarget := byChannel[channel.Id]
		pricingModel, priceConfigured, err := getChannelModelMappingPriceStatus(req.UnifiedModel, nextTarget, mapping)
		if err != nil {
			c.JSON(http.StatusOK, gin.H{"success": false, "message": fmt.Sprintf("渠道 %s 的模型映射无效：%s", channel.Name, err.Error())})
			return
		}
		if !priceConfigured {
			c.JSON(http.StatusOK, gin.H{
				"success": false,
				"message": fmt.Sprintf("渠道 %s 的映射目标 %s 最终计费模型 %s 未配置价格，不能映射", channel.Name, nextTarget, pricingModel),
			})
			return
		}
		if existingTarget, ok := mapping[req.UnifiedModel]; ok && existingTarget != nextTarget && !req.Overwrite {
			conflicts = append(conflicts, channelModelMappingConflict{
				ChannelID:      channel.Id,
				ChannelName:    channel.Name,
				ExistingTarget: existingTarget,
				NextTarget:     nextTarget,
			})
		}
	}
	if len(conflicts) > 0 {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "存在已有映射冲突，请确认是否覆盖",
			"data": gin.H{
				"conflicts": conflicts,
			},
		})
		return
	}

	results := make([]channelModelMappingApplyResult, 0, len(channels))
	tx := model.DB.Begin()
	if tx.Error != nil {
		common.ApiError(c, tx.Error)
		return
	}
	for _, channel := range channels {
		nextTarget := byChannel[channel.Id]
		mapping, err := parseChannelModelMapping(channel.ModelMapping)
		if err != nil {
			tx.Rollback()
			common.ApiError(c, err)
			return
		}
		addedModel, nextModels := appendChannelModel(channel, req.UnifiedModel)
		existingTarget, existedMapping := mapping[req.UnifiedModel]
		addedMapping := !existedMapping
		updatedMapping := existedMapping && existingTarget != nextTarget
		mapping[req.UnifiedModel] = nextTarget
		nextMapping, err := marshalChannelModelMapping(mapping)
		if err != nil {
			tx.Rollback()
			common.ApiError(c, err)
			return
		}
		channel.Models = nextModels
		channel.ModelMapping = &nextMapping
		if err := tx.Model(&model.Channel{}).
			Where("id = ?", channel.Id).
			Select("models", "model_mapping").
			Updates(map[string]interface{}{
				"models":        nextModels,
				"model_mapping": nextMapping,
			}).Error; err != nil {
			tx.Rollback()
			common.ApiError(c, err)
			return
		}
		if err := channel.UpdateAbilities(tx); err != nil {
			tx.Rollback()
			common.ApiError(c, err)
			return
		}
		results = append(results, channelModelMappingApplyResult{
			ChannelID:       channel.Id,
			ChannelName:     channel.Name,
			AddedModel:      addedModel,
			AddedMapping:    addedMapping,
			UpdatedMapping:  updatedMapping,
			SkippedNoChange: !addedModel && !addedMapping && !updatedMapping,
		})
	}
	if err := tx.Commit().Error; err != nil {
		common.ApiError(c, err)
		return
	}
	model.InitChannelCache()
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data": gin.H{
			"results": results,
		},
	})
}

func DeleteChannelModelMapping(c *gin.Context) {
	var req channelModelMappingDeleteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ApiError(c, err)
		return
	}
	req.UnifiedModel = normalizeChannelModelMappingName(req.UnifiedModel)
	if req.ChannelID <= 0 || req.UnifiedModel == "" {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "渠道和统一模型名不能为空"})
		return
	}
	removeModel := true
	if req.RemoveModel != nil {
		removeModel = *req.RemoveModel
	}

	channel, err := model.GetChannelById(req.ChannelID, true)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	mapping, err := parseChannelModelMapping(channel.ModelMapping)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": fmt.Sprintf("渠道 %s 的模型重定向不是合法 JSON", channel.Name)})
		return
	}
	if _, ok := mapping[req.UnifiedModel]; !ok {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "映射不存在"})
		return
	}
	delete(mapping, req.UnifiedModel)
	nextMapping, err := marshalChannelModelMapping(mapping)
	if err != nil {
		common.ApiError(c, err)
		return
	}

	nextModels := channel.Models
	removedModel := false
	if removeModel {
		removedModel, nextModels = removeChannelModel(channel, req.UnifiedModel)
	}

	tx := model.DB.Begin()
	if tx.Error != nil {
		common.ApiError(c, tx.Error)
		return
	}
	channel.Models = nextModels
	channel.ModelMapping = &nextMapping
	if err := tx.Model(&model.Channel{}).
		Where("id = ?", channel.Id).
		Select("models", "model_mapping").
		Updates(map[string]interface{}{
			"models":        nextModels,
			"model_mapping": nextMapping,
		}).Error; err != nil {
		tx.Rollback()
		common.ApiError(c, err)
		return
	}
	if err := channel.UpdateAbilities(tx); err != nil {
		tx.Rollback()
		common.ApiError(c, err)
		return
	}
	if err := tx.Commit().Error; err != nil {
		common.ApiError(c, err)
		return
	}
	model.InitChannelCache()

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data": gin.H{
			"removed_model": removedModel,
		},
	})
}
