package controller

import (
	"context"
	"encoding/json"
	"fmt"
	"html"
	"io"
	"math"
	"net/http"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/setting/ratio_setting"
	"github.com/gin-gonic/gin"
)

const gpuGeekPriceFetchTimeout = 12 * time.Second
const gpuGeekPriceDocURL = "https://gpugeek.com/docs/product/model/price/"

type gpuGeekPricePreviewItem struct {
	Source                string   `json:"source"`
	SourceModel           string   `json:"source_model"`
	TargetModel           string   `json:"target_model"`
	SimilarModel          string   `json:"similar_model,omitempty"`
	InputPricePerMillion  *float64 `json:"input_price_per_million,omitempty"`
	OutputPricePerMillion *float64 `json:"output_price_per_million,omitempty"`
	ModelRatio            *float64 `json:"model_ratio,omitempty"`
	CompletionRatio       *float64 `json:"completion_ratio,omitempty"`
	CacheRatio            *float64 `json:"cache_ratio,omitempty"`
	LocalModelRatio       *float64 `json:"local_model_ratio,omitempty"`
	LocalCompletionRatio  *float64 `json:"local_completion_ratio,omitempty"`
	LocalCacheRatio       *float64 `json:"local_cache_ratio,omitempty"`
	Status                string   `json:"status"`
	Note                  string   `json:"note,omitempty"`
	Selectable            bool     `json:"selectable"`
}

type gpuGeekPriceApplyItem struct {
	TargetModel     string   `json:"target_model"`
	ModelRatio      *float64 `json:"model_ratio"`
	CompletionRatio *float64 `json:"completion_ratio"`
	CacheRatio      *float64 `json:"cache_ratio"`
}

type gpuGeekPriceApplyRequest struct {
	Items []gpuGeekPriceApplyItem `json:"items"`
}

func parseChannelModels(raw string) []string {
	parts := strings.Split(raw, ",")
	models := make([]string, 0, len(parts))
	seen := make(map[string]struct{}, len(parts))
	for _, part := range parts {
		modelName := strings.TrimSpace(part)
		if modelName == "" {
			continue
		}
		if _, ok := seen[modelName]; ok {
			continue
		}
		seen[modelName] = struct{}{}
		models = append(models, modelName)
	}
	return models
}

func parseMappedAliasModels(raw string) map[string]struct{} {
	mappedAliasModels := make(map[string]struct{})
	if strings.TrimSpace(raw) == "" || strings.TrimSpace(raw) == "{}" {
		return mappedAliasModels
	}
	modelMapping := make(map[string]string)
	if err := common.Unmarshal([]byte(raw), &modelMapping); err != nil {
		return mappedAliasModels
	}
	for aliasModel, upstreamModel := range modelMapping {
		aliasModel = strings.TrimSpace(aliasModel)
		upstreamModel = strings.TrimSpace(upstreamModel)
		if aliasModel == "" || upstreamModel == "" || aliasModel == upstreamModel {
			continue
		}
		mappedAliasModels[aliasModel] = struct{}{}
	}
	return mappedAliasModels
}

func ptrFloat64(v float64) *float64 {
	return &v
}

func valuePtrFromMap(values map[string]float64, modelName string) *float64 {
	if values == nil {
		return nil
	}
	if value, ok := values[modelName]; ok {
		return ptrFloat64(value)
	}
	return nil
}

func gpuGeekModelAliases(modelName string) []string {
	modelName = strings.TrimSpace(modelName)
	aliases := []string{modelName}
	lower := strings.ToLower(modelName)
	if lower != modelName {
		aliases = append(aliases, lower)
	}
	if idx := strings.LastIndex(modelName, "/"); idx >= 0 && idx+1 < len(modelName) {
		last := modelName[idx+1:]
		aliases = append(aliases, last)
		lastLower := strings.ToLower(last)
		if lastLower != last {
			aliases = append(aliases, lastLower)
		}
	}
	seen := make(map[string]struct{}, len(aliases))
	unique := make([]string, 0, len(aliases))
	for _, alias := range aliases {
		if alias == "" {
			continue
		}
		if _, ok := seen[alias]; ok {
			continue
		}
		seen[alias] = struct{}{}
		unique = append(unique, alias)
	}
	return unique
}

func findSimilarLocalRatios(modelName string, allowSelf bool, modelRatioMap, completionRatioMap, cacheRatioMap map[string]float64) (string, *float64, *float64, *float64) {
	normalizedModelName := strings.ToLower(strings.TrimSpace(modelName))
	for _, alias := range gpuGeekModelAliases(modelName) {
		if !allowSelf && strings.ToLower(strings.TrimSpace(alias)) == normalizedModelName {
			continue
		}
		modelRatio := valuePtrFromMap(modelRatioMap, alias)
		completionRatio := valuePtrFromMap(completionRatioMap, alias)
		cacheRatio := valuePtrFromMap(cacheRatioMap, alias)
		if modelRatio != nil || completionRatio != nil || cacheRatio != nil {
			return alias, modelRatio, completionRatio, cacheRatio
		}
	}
	return "", nil, nil, nil
}

func ratioPtrEqual(left, right *float64) bool {
	if left == nil || right == nil {
		return left == nil && right == nil
	}
	return roundRatioValue(*left) == roundRatioValue(*right)
}

func ratioPtrsEqual(modelRatio, completionRatio, cacheRatio, localModelRatio, localCompletionRatio, localCacheRatio *float64) bool {
	return ratioPtrEqual(modelRatio, localModelRatio) &&
		ratioPtrEqual(completionRatio, localCompletionRatio) &&
		ratioPtrEqual(cacheRatio, localCacheRatio)
}

func fetchGpuGeekPriceDoc(ctx context.Context) ([]byte, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, gpuGeekPriceDocURL, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Accept", "text/html,application/xhtml+xml")
	req.Header.Set("User-Agent", "CosmicAI-GpuGeekPriceSync/1.0")
	client := &http.Client{Timeout: gpuGeekPriceFetchTimeout}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(io.LimitReader(resp.Body, 1024))
		return nil, fmt.Errorf("%s: %s", resp.Status, strings.TrimSpace(string(body)))
	}
	return io.ReadAll(io.LimitReader(resp.Body, maxRatioConfigBytes))
}

var (
	gpuGeekTableRowPattern  = regexp.MustCompile(`(?is)<tr[^>]*>(.*?)</tr>`)
	gpuGeekTableCellPattern = regexp.MustCompile(`(?is)<td[^>]*>(.*?)</td>`)
	gpuGeekHTMLTagPattern   = regexp.MustCompile(`(?is)<[^>]+>`)
)

func cleanGpuGeekPriceDocCell(raw string) string {
	withoutTags := gpuGeekHTMLTagPattern.ReplaceAllString(raw, "")
	return strings.TrimSpace(html.UnescapeString(withoutTags))
}

func convertGpuGeekDocPricesToRatios(inputPricePerMillion, outputPricePerMillion float64) (*float64, *float64) {
	if inputPricePerMillion < 0 || outputPricePerMillion < 0 {
		return nil, nil
	}
	if inputPricePerMillion == 0 && outputPricePerMillion == 0 {
		return ptrFloat64(0), nil
	}
	if inputPricePerMillion <= 0 {
		return nil, nil
	}

	modelRatio := roundRatioValue(inputPricePerMillion / (2 * ratio_setting.USD2RMB))
	completionRatio := roundRatioValue(outputPricePerMillion / inputPricePerMillion)
	return ptrFloat64(modelRatio), ptrFloat64(completionRatio)
}

func gpuGeekPriceDocModelNames(modelName string) []string {
	modelName = strings.TrimSpace(modelName)
	if modelName == "" {
		return nil
	}
	names := []string{modelName}
	const gpuGeekPrefix = "GpuGeek/"
	if strings.HasPrefix(modelName, gpuGeekPrefix) {
		withoutPrefix := strings.TrimSpace(strings.TrimPrefix(modelName, gpuGeekPrefix))
		if withoutPrefix != "" {
			names = append(names, withoutPrefix)
		}
	}
	seen := make(map[string]struct{}, len(names))
	unique := make([]string, 0, len(names))
	for _, name := range names {
		if _, ok := seen[name]; ok {
			continue
		}
		seen[name] = struct{}{}
		unique = append(unique, name)
	}
	return unique
}

func parseGpuGeekPriceDoc(bodyBytes []byte) (map[string]any, error) {
	page := string(bodyBytes)
	textChatIndex := strings.Index(page, `id="文本对话"`)
	if textChatIndex < 0 {
		return nil, fmt.Errorf("未找到 GpuGeek 价格文档中的文本对话价格表")
	}
	tableStart := strings.Index(page[textChatIndex:], "<table")
	if tableStart < 0 {
		return nil, fmt.Errorf("未找到 GpuGeek 文本对话价格表")
	}
	tableStart += textChatIndex
	tableEnd := strings.Index(page[tableStart:], "</table>")
	if tableEnd < 0 {
		return nil, fmt.Errorf("GpuGeek 文本对话价格表格式不完整")
	}
	tableHTML := page[tableStart : tableStart+tableEnd]

	modelRatioMap := make(map[string]any)
	completionRatioMap := make(map[string]any)
	inputPriceMap := make(map[string]any)
	outputPriceMap := make(map[string]any)

	for _, rowMatch := range gpuGeekTableRowPattern.FindAllStringSubmatch(tableHTML, -1) {
		if len(rowMatch) < 2 {
			continue
		}
		cellMatches := gpuGeekTableCellPattern.FindAllStringSubmatch(rowMatch[1], -1)
		if len(cellMatches) < 4 {
			continue
		}
		modelName := cleanGpuGeekPriceDocCell(cellMatches[0][1])
		unit := cleanGpuGeekPriceDocCell(cellMatches[1][1])
		inputRaw := cleanGpuGeekPriceDocCell(cellMatches[2][1])
		outputRaw := cleanGpuGeekPriceDocCell(cellMatches[3][1])
		if modelName == "" || !strings.Contains(unit, "百万Tokens") {
			continue
		}
		inputPrice, inputErr := strconv.ParseFloat(inputRaw, 64)
		outputPrice, outputErr := strconv.ParseFloat(outputRaw, 64)
		if inputErr != nil || outputErr != nil {
			continue
		}
		modelRatio, completionRatio := convertGpuGeekDocPricesToRatios(inputPrice, outputPrice)
		if modelRatio == nil {
			continue
		}
		for _, priceModelName := range gpuGeekPriceDocModelNames(modelName) {
			modelRatioMap[priceModelName] = *modelRatio
			inputPriceMap[priceModelName] = inputPrice
			outputPriceMap[priceModelName] = outputPrice
			if completionRatio != nil {
				completionRatioMap[priceModelName] = *completionRatio
			}
		}
	}

	if len(modelRatioMap) == 0 {
		return nil, fmt.Errorf("GpuGeek 价格文档中未解析到文本对话模型价格")
	}

	converted := map[string]any{
		"model_ratio":               modelRatioMap,
		"completion_ratio":          completionRatioMap,
		"input_price_per_million":   inputPriceMap,
		"output_price_per_million":  outputPriceMap,
		"gpugeek_price_source_note": "GpuGeek 官方价格文档",
	}
	return converted, nil
}

func mergeRatioData(dst map[string]map[string]float64, source string, data map[string]any) {
	for _, ratioType := range []string{"model_ratio", "completion_ratio", "cache_ratio", "input_price_per_million", "output_price_per_million"} {
		rawMap, ok := data[ratioType].(map[string]any)
		if !ok {
			continue
		}
		if dst[ratioType] == nil {
			dst[ratioType] = make(map[string]float64)
		}
		for modelName, rawValue := range rawMap {
			value, ok := rawValue.(float64)
			if !ok || math.IsNaN(value) || math.IsInf(value, 0) {
				continue
			}
			dst[ratioType][modelName] = value
		}
	}
	_ = source
}

func fetchGpuGeekRatioData(ctx context.Context, channel *model.Channel) (map[string]map[string]float64, []string) {
	ratioData := map[string]map[string]float64{}
	errors := make([]string, 0, 1)

	if bodyBytes, err := fetchGpuGeekPriceDoc(ctx); err == nil {
		if parsed, parseErr := parseGpuGeekPriceDoc(bodyBytes); parseErr == nil {
			mergeRatioData(ratioData, "gpugeek_price_doc", parsed)
		} else {
			errors = append(errors, "GpuGeek 价格文档: "+parseErr.Error())
		}
	} else {
		errors = append(errors, "GpuGeek 价格文档: "+err.Error())
	}
	_ = channel

	return ratioData, errors
}

func buildGpuGeekPricePreview(channel *model.Channel, ratioData map[string]map[string]float64, fetchErrors []string) []gpuGeekPricePreviewItem {
	modelRatioMap := ratio_setting.GetModelRatioCopy()
	completionRatioMap := ratio_setting.GetCompletionRatioCopy()
	cacheRatioMap := ratio_setting.GetCacheRatioCopy()
	channelModels := parseChannelModels(channel.Models)
	mappedAliasModels := parseMappedAliasModels(channel.GetModelMapping())
	items := make([]gpuGeekPricePreviewItem, 0, len(channelModels))

	for _, modelName := range channelModels {
		if _, isMappedAlias := mappedAliasModels[modelName]; isMappedAlias {
			continue
		}
		localModelRatio := valuePtrFromMap(modelRatioMap, modelName)
		localCompletionRatio := valuePtrFromMap(completionRatioMap, modelName)
		localCacheRatio := valuePtrFromMap(cacheRatioMap, modelName)
		upstreamSimilar, upstreamModelRatio, upstreamCompletionRatio, upstreamCacheRatio := findSimilarLocalRatios(modelName, true, ratioData["model_ratio"], ratioData["completion_ratio"], ratioData["cache_ratio"])

		var source string
		var similarModel string
		var nextModelRatio *float64
		var nextCompletionRatio *float64
		var nextCacheRatio *float64
		var note string
		selectable := false

		if upstreamSimilar != "" {
			source = "gpugeek_doc"
			similarModel = upstreamSimilar
			nextModelRatio = upstreamModelRatio
			nextCompletionRatio = upstreamCompletionRatio
			nextCacheRatio = upstreamCacheRatio
			nextInputPrice := valuePtrFromMap(ratioData["input_price_per_million"], upstreamSimilar)
			nextOutputPrice := valuePtrFromMap(ratioData["output_price_per_million"], upstreamSimilar)
			if nextInputPrice != nil {
				note = fmt.Sprintf("来自 GpuGeek 官方价格文档：输入 %.6g 元/百万 Tokens", *nextInputPrice)
				if nextOutputPrice != nil {
					note += fmt.Sprintf("，输出 %.6g 元/百万 Tokens", *nextOutputPrice)
				}
			}
		}

		if source == "" {
			similar, modelRatio, completionRatio, cacheRatio := findSimilarLocalRatios(modelName, false, modelRatioMap, completionRatioMap, cacheRatioMap)
			if similar != "" {
				source = "similar_local"
				similarModel = similar
				nextModelRatio = modelRatio
				nextCompletionRatio = completionRatio
				nextCacheRatio = cacheRatio
				note = "GpuGeek 价格文档未覆盖该模型，建议复制本地相似模型价格"
			}
		}

		status := "missing"
		hasLocalPrice := localModelRatio != nil || localCompletionRatio != nil || localCacheRatio != nil
		hasNextPrice := nextModelRatio != nil || nextCompletionRatio != nil || nextCacheRatio != nil
		if hasLocalPrice {
			status = "configured"
		}
		if hasNextPrice {
			if hasLocalPrice {
				selectable = !ratioPtrsEqual(nextModelRatio, nextCompletionRatio, nextCacheRatio, localModelRatio, localCompletionRatio, localCacheRatio)
				status = "update_available"
				if !selectable {
					status = "configured"
				}
			} else {
				selectable = true
				status = "new"
			}
		}
		if source == "" {
			source = "none"
			if note == "" {
				note = "GpuGeek 价格文档未覆盖该模型，也没有找到本地相似模型价格"
			}
		}

		items = append(items, gpuGeekPricePreviewItem{
			Source:               source,
			SourceModel:          modelName,
			TargetModel:          modelName,
			SimilarModel:         similarModel,
			ModelRatio:           nextModelRatio,
			CompletionRatio:      nextCompletionRatio,
			CacheRatio:           nextCacheRatio,
			LocalModelRatio:      localModelRatio,
			LocalCompletionRatio: localCompletionRatio,
			LocalCacheRatio:      localCacheRatio,
			Status:               status,
			Note:                 note,
			Selectable:           selectable,
		})
	}

	sort.SliceStable(items, func(i, j int) bool {
		if items[i].Selectable != items[j].Selectable {
			return items[i].Selectable
		}
		return items[i].SourceModel < items[j].SourceModel
	})
	_ = fetchErrors
	return items
}

func FetchGpuGeekPricePreview(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		common.ApiError(c, err)
		return
	}
	channel, err := model.GetChannelById(id, true)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	if channel.Type != constant.ChannelTypeGpuGeek {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "该渠道不是 GpuGeek 类型"})
		return
	}
	ctx, cancel := context.WithTimeout(c.Request.Context(), gpuGeekPriceFetchTimeout*3)
	defer cancel()
	ratioData, fetchErrors := fetchGpuGeekRatioData(ctx, channel)
	items := buildGpuGeekPricePreview(channel, ratioData, fetchErrors)
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data": gin.H{
			"items":        items,
			"fetch_errors": fetchErrors,
		},
	})
}

func jsonStringFromFloatMap(values map[string]float64) (string, error) {
	bytes, err := json.MarshalIndent(values, "", "  ")
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

func updateRatioOptionMap(key string, values map[string]float64) error {
	raw, err := jsonStringFromFloatMap(values)
	if err != nil {
		return err
	}
	if err := model.UpdateOption(key, raw); err != nil {
		return err
	}
	switch key {
	case "ModelRatio":
		return ratio_setting.UpdateModelRatioByJSONString(raw)
	case "CompletionRatio":
		return ratio_setting.UpdateCompletionRatioByJSONString(raw)
	case "CacheRatio":
		return ratio_setting.UpdateCacheRatioByJSONString(raw)
	case "ModelPrice":
		return ratio_setting.UpdateModelPriceByJSONString(raw)
	}
	return nil
}

func ApplyGpuGeekPrices(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		common.ApiError(c, err)
		return
	}
	channel, err := model.GetChannelById(id, false)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	if channel.Type != constant.ChannelTypeGpuGeek {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "该渠道不是 GpuGeek 类型"})
		return
	}

	var req gpuGeekPriceApplyRequest
	if err := common.DecodeJson(c.Request.Body, &req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "请求参数格式错误"})
		return
	}
	if len(req.Items) == 0 {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "请选择至少一个价格配置"})
		return
	}

	modelRatioMap := ratio_setting.GetModelRatioCopy()
	completionRatioMap := ratio_setting.GetCompletionRatioCopy()
	cacheRatioMap := ratio_setting.GetCacheRatioCopy()
	modelPriceMap := ratio_setting.GetModelPriceCopy()
	applied := make([]string, 0, len(req.Items))

	for _, item := range req.Items {
		targetModel := strings.TrimSpace(item.TargetModel)
		if targetModel == "" {
			c.JSON(http.StatusOK, gin.H{"success": false, "message": "写入模型名不能为空"})
			return
		}
		if item.ModelRatio == nil && item.CompletionRatio == nil && item.CacheRatio == nil {
			continue
		}
		delete(modelPriceMap, targetModel)
		if item.ModelRatio != nil {
			modelRatioMap[targetModel] = roundRatioValue(*item.ModelRatio)
		}
		if item.CompletionRatio != nil {
			completionRatioMap[targetModel] = roundRatioValue(*item.CompletionRatio)
		}
		if item.CacheRatio != nil {
			cacheRatioMap[targetModel] = roundRatioValue(*item.CacheRatio)
		}
		applied = append(applied, targetModel)
	}

	if len(applied) == 0 {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "没有可写入的价格配置"})
		return
	}

	if err := updateRatioOptionMap("ModelRatio", modelRatioMap); err != nil {
		common.ApiError(c, err)
		return
	}
	if err := updateRatioOptionMap("CompletionRatio", completionRatioMap); err != nil {
		common.ApiError(c, err)
		return
	}
	if err := updateRatioOptionMap("CacheRatio", cacheRatioMap); err != nil {
		common.ApiError(c, err)
		return
	}
	if err := updateRatioOptionMap("ModelPrice", modelPriceMap); err != nil {
		common.ApiError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data": gin.H{
			"applied": applied,
		},
	})
}
