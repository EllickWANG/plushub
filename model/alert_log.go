package model

import (
	"fmt"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/logger"
	"github.com/QuantumNous/new-api/types"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

const (
	AlertLevelWarning = "warning"
	AlertLevelError   = "error"

	AlertSourceRelay = "relay"
)

type AlertLog struct {
	Id          int    `json:"id" gorm:"index:idx_alert_created_at_id,priority:2"`
	CreatedAt   int64  `json:"created_at" gorm:"bigint;index:idx_alert_created_at_id,priority:1"`
	Level       string `json:"level" gorm:"index;size:16;default:error"`
	Source      string `json:"source" gorm:"index;size:64;default:system"`
	Category    string `json:"category" gorm:"index;size:64;default:general"`
	Title       string `json:"title" gorm:"size:255;default:''"`
	Message     string `json:"message" gorm:"type:text"`
	Detail      string `json:"detail" gorm:"type:text"`
	RequestId   string `json:"request_id" gorm:"type:varchar(64);index;default:''"`
	UserId      int    `json:"user_id" gorm:"index;default:0"`
	Username    string `json:"username" gorm:"index;size:64;default:''"`
	TokenId     int    `json:"token_id" gorm:"index;default:0"`
	TokenName   string `json:"token_name" gorm:"size:128;default:''"`
	ModelName   string `json:"model_name" gorm:"index;size:255;default:''"`
	ChannelId   int    `json:"channel_id" gorm:"index;default:0"`
	ChannelName string `json:"channel_name" gorm:"size:255;default:''"`
	StatusCode  int    `json:"status_code" gorm:"index;default:0"`
	ErrorType   string `json:"error_type" gorm:"index;size:128;default:''"`
	ErrorCode   string `json:"error_code" gorm:"index;size:128;default:''"`
	Method      string `json:"method" gorm:"size:16;default:''"`
	Path        string `json:"path" gorm:"index;size:255;default:''"`
	Metadata    string `json:"metadata" gorm:"type:text"`
	Resolved    bool   `json:"resolved" gorm:"index;default:false"`
	ResolvedAt  int64  `json:"resolved_at" gorm:"bigint;default:0"`
}

type AlertLogFilters struct {
	Level          string
	Source         string
	Category       string
	Username       string
	TokenName      string
	ModelName      string
	RequestId      string
	ErrorCode      string
	ChannelId      int
	StatusCode     int
	ResolvedFilter string
	StartTimestamp int64
	EndTimestamp   int64
	StartIdx       int
	Num            int
}

type AlertLogStats struct {
	Total      int64 `json:"total"`
	Error      int64 `json:"error"`
	Warning    int64 `json:"warning"`
	Unresolved int64 `json:"unresolved"`
}

func normalizeAlertLevel(level string) string {
	if level == AlertLevelWarning {
		return AlertLevelWarning
	}
	return AlertLevelError
}

func RecordAlertLog(alert *AlertLog) {
	if alert == nil {
		return
	}
	if alert.CreatedAt == 0 {
		alert.CreatedAt = common.GetTimestamp()
	}
	alert.Level = normalizeAlertLevel(alert.Level)
	if alert.Source == "" {
		alert.Source = "system"
	}
	if alert.Category == "" {
		alert.Category = "general"
	}
	if err := LOG_DB.Create(alert).Error; err != nil {
		common.SysLog("failed to record alert log: " + err.Error())
	}
}

func RecordRelayErrorAlertLog(c *gin.Context, err *types.NewAPIError, other map[string]interface{}, useTimeSeconds int) {
	if c == nil || err == nil {
		return
	}
	path := ""
	method := ""
	if c.Request != nil {
		method = c.Request.Method
		if c.Request.URL != nil {
			path = c.Request.URL.Path
		}
	}
	channelId := c.GetInt("channel_id")
	modelName := c.GetString("original_model")
	alert := &AlertLog{
		Level:       AlertLevelError,
		Source:      AlertSourceRelay,
		Category:    "upstream",
		Title:       fmt.Sprintf("模型调用失败: %s", modelName),
		Message:     err.MaskSensitiveErrorWithStatusCode(),
		Detail:      err.MaskSensitiveErrorWithStatusCode(),
		RequestId:   c.GetString(common.RequestIdKey),
		UserId:      c.GetInt("id"),
		Username:    c.GetString("username"),
		TokenId:     c.GetInt("token_id"),
		TokenName:   c.GetString("token_name"),
		ModelName:   modelName,
		ChannelId:   channelId,
		ChannelName: c.GetString("channel_name"),
		StatusCode:  err.StatusCode,
		ErrorType:   string(err.GetErrorType()),
		ErrorCode:   string(err.GetErrorCode()),
		Method:      method,
		Path:        path,
		Metadata: common.MapToJsonStr(map[string]interface{}{
			"use_time_seconds": useTimeSeconds,
			"context":          other,
		}),
	}
	RecordAlertLog(alert)
	logger.LogInfo(c, fmt.Sprintf("record alert log: channelId=%d, modelName=%s, errorCode=%s", channelId, modelName, alert.ErrorCode))
}

func queryAlertLogs(filters AlertLogFilters) *gorm.DB {
	tx := LOG_DB.Model(&AlertLog{})
	if filters.Level != "" {
		tx = tx.Where("level = ?", filters.Level)
	}
	if filters.Source != "" {
		tx = tx.Where("source = ?", filters.Source)
	}
	if filters.Category != "" {
		tx = tx.Where("category = ?", filters.Category)
	}
	if filters.Username != "" {
		tx = tx.Where("username = ?", filters.Username)
	}
	if filters.TokenName != "" {
		tx = tx.Where("token_name = ?", filters.TokenName)
	}
	if filters.ModelName != "" {
		tx = tx.Where("model_name LIKE ?", "%"+filters.ModelName+"%")
	}
	if filters.RequestId != "" {
		tx = tx.Where("request_id = ?", filters.RequestId)
	}
	if filters.ErrorCode != "" {
		tx = tx.Where("error_code LIKE ?", "%"+filters.ErrorCode+"%")
	}
	if filters.ChannelId > 0 {
		tx = tx.Where("channel_id = ?", filters.ChannelId)
	}
	if filters.StatusCode > 0 {
		tx = tx.Where("status_code = ?", filters.StatusCode)
	}
	if filters.ResolvedFilter == "true" {
		tx = tx.Where("resolved = ?", true)
	} else if filters.ResolvedFilter == "false" {
		tx = tx.Where("resolved = ?", false)
	}
	if filters.StartTimestamp > 0 {
		tx = tx.Where("created_at >= ?", filters.StartTimestamp)
	}
	if filters.EndTimestamp > 0 {
		tx = tx.Where("created_at <= ?", filters.EndTimestamp)
	}
	return tx
}

func GetAlertLogs(filters AlertLogFilters) (logs []*AlertLog, total int64, err error) {
	tx := queryAlertLogs(filters)
	err = tx.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}
	if filters.Num <= 0 {
		filters.Num = common.ItemsPerPage
	}
	err = tx.Order("created_at desc, id desc").Limit(filters.Num).Offset(filters.StartIdx).Find(&logs).Error
	return logs, total, err
}

func GetAlertLogStats(filters AlertLogFilters) (stats AlertLogStats, err error) {
	tx := queryAlertLogs(filters)
	err = tx.Count(&stats.Total).Error
	if err != nil {
		return stats, err
	}
	err = queryAlertLogs(filters).Where("level = ?", AlertLevelError).Count(&stats.Error).Error
	if err != nil {
		return stats, err
	}
	err = queryAlertLogs(filters).Where("level = ?", AlertLevelWarning).Count(&stats.Warning).Error
	if err != nil {
		return stats, err
	}
	err = queryAlertLogs(filters).Where("resolved = ?", false).Count(&stats.Unresolved).Error
	return stats, err
}

func ResolveAlertLog(id int, resolved bool) error {
	updates := map[string]interface{}{
		"resolved":    resolved,
		"resolved_at": int64(0),
	}
	if resolved {
		updates["resolved_at"] = common.GetTimestamp()
	}
	return LOG_DB.Model(&AlertLog{}).Where("id = ?", id).Updates(updates).Error
}

func DeleteOldAlertLogs(targetTimestamp int64, batchSize int) (int64, error) {
	if targetTimestamp <= 0 {
		return 0, nil
	}
	if batchSize <= 0 {
		batchSize = 100
	}
	result := LOG_DB.Where("created_at < ?", targetTimestamp).Limit(batchSize).Delete(&AlertLog{})
	return result.RowsAffected, result.Error
}
