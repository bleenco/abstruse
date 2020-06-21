package controller

import (
	"net/http"
	"time"

	"github.com/julienschmidt/httprouter"
)

// SyncController struct
type SyncController struct{}

// NewSyncController returns new instance of SyncController.
func NewSyncController() *SyncController {
	return &SyncController{}
}

// Time method is used to synchronize server time in browser.
func (c *SyncController) Time(resp http.ResponseWriter, req *http.Request, _ httprouter.Params) {
	JSONResponse(resp, http.StatusOK, Response{time.Now()})
}
