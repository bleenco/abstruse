package stats

import (
	"net/http"

	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/core"
)

// HandleStats returns an http.HandlerFunc that writes JSON encoded
// server stats to the http response body.
func HandleStats(stats core.StatsService) http.HandlerFunc {
	type resp struct {
		Usage []core.Usage          `json:"usage"`
		Stats []core.SchedulerStats `json:"stats"`
	}

	return func(w http.ResponseWriter, r *http.Request) {
		usage, statistics := stats.GetHistory()
		render.JSON(w, http.StatusOK, resp{usage, statistics})
	}
}
