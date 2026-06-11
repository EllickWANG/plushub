package controller

import (
	"net/http"
	"strconv"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"

	"github.com/gin-gonic/gin"
)

func buildAlertLogFilters(c *gin.Context) model.AlertLogFilters {
	startTimestamp, _ := strconv.ParseInt(c.Query("start_timestamp"), 10, 64)
	endTimestamp, _ := strconv.ParseInt(c.Query("end_timestamp"), 10, 64)
	channelId, _ := strconv.Atoi(c.Query("channel_id"))
	statusCode, _ := strconv.Atoi(c.Query("status_code"))
	return model.AlertLogFilters{
		Level:          c.Query("level"),
		Source:         c.Query("source"),
		Category:       c.Query("category"),
		Username:       c.Query("username"),
		TokenName:      c.Query("token_name"),
		ModelName:      c.Query("model_name"),
		RequestId:      c.Query("request_id"),
		ErrorCode:      c.Query("error_code"),
		ChannelId:      channelId,
		StatusCode:     statusCode,
		ResolvedFilter: c.Query("resolved"),
		StartTimestamp: startTimestamp,
		EndTimestamp:   endTimestamp,
	}
}

func GetAlertLogs(c *gin.Context) {
	pageInfo := common.GetPageQuery(c)
	filters := buildAlertLogFilters(c)
	filters.StartIdx = pageInfo.GetStartIdx()
	filters.Num = pageInfo.GetPageSize()
	logs, total, err := model.GetAlertLogs(filters)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	pageInfo.SetTotal(int(total))
	pageInfo.SetItems(logs)
	common.ApiSuccess(c, pageInfo)
}

func GetAlertLogStats(c *gin.Context) {
	stats, err := model.GetAlertLogStats(buildAlertLogFilters(c))
	if err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, stats)
}

func ResolveAlertLog(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if id <= 0 {
		common.ApiErrorMsg(c, "invalid alert log id")
		return
	}
	var req struct {
		Resolved bool `json:"resolved"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ApiError(c, err)
		return
	}
	if err := model.ResolveAlertLog(id, req.Resolved); err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, nil)
}

func DeleteHistoryAlertLogs(c *gin.Context) {
	targetTimestamp, _ := strconv.ParseInt(c.Query("target_timestamp"), 10, 64)
	if targetTimestamp == 0 {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "target timestamp is required",
		})
		return
	}
	count, err := model.DeleteOldAlertLogs(targetTimestamp, 100)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, count)
}
