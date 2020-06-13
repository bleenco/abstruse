package controller

import (
	"io/ioutil"
	"net/http"

	"github.com/drone/go-scm/scm"
	"github.com/jkuri/abstruse/internal/server/service"
	jsoniter "github.com/json-iterator/go"
	"github.com/julienschmidt/httprouter"
)

// HookController struct.
type HookController struct {
	repoService service.RepositoryService
}

// NewHookController returns HookController instance.
func NewHookController(repoService service.RepositoryService) *HookController {
	return &HookController{repoService}
}

func (c *HookController) secret(webhook scm.Webhook) (secret string, err error) {
	repo := webhook.Repository()
	r, err := c.repoService.FindByURL(repo.Clone)
	if err != nil {
		return
	}
	return r.Provider.Secret, nil
}

// Hook for providers webhook trigger.
func (c *HookController) Hook(resp http.ResponseWriter, req *http.Request, _ httprouter.Params) {
	var payload interface{}
	err := jsoniter.NewDecoder(req.Body).Decode(&payload)
	if err != nil {
		JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{err.Error()})
		return
	}
	defer req.Body.Close()
	file, _ := jsoniter.MarshalIndent(payload, "", "  ")
	_ = ioutil.WriteFile("/Users/jan/Desktop/webhook.json", file, 0644)

	JSONResponse(resp, http.StatusOK, BoolResponse{true})
}
