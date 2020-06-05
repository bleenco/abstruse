package controller

import (
	"net/http"
	"strconv"

	"github.com/jkuri/abstruse/internal/pkg/auth"
	"github.com/jkuri/abstruse/internal/server/db/repository"
	"github.com/jkuri/abstruse/internal/server/service"
	jsoniter "github.com/json-iterator/go"
	"github.com/julienschmidt/httprouter"
)

// ProviderController struct
type ProviderController struct {
	service     service.ProviderService
	repoService service.RepositoryService
}

// NewProviderController returns new instance of ProviderController.
func NewProviderController(service service.ProviderService, repoService service.RepositoryService) *ProviderController {
	return &ProviderController{service, repoService}
}

// List controller => GET /api/providers
func (c *ProviderController) List(resp http.ResponseWriter, req *http.Request, _ httprouter.Params) {
	token := req.Header.Get("Authorization")
	userID, err := auth.GetUserIDFromJWT(token)
	if err != nil {
		JSONResponse(resp, http.StatusUnauthorized, ErrorResponse{Data: err.Error()})
		return
	}
	data, err := c.service.List(uint(userID))
	if err != nil {
		JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{Data: err.Error()})
		return
	}
	JSONResponse(resp, http.StatusOK, Response{Data: data})
}

// Find controller => GET /api/providers/:id
func (c ProviderController) Find(resp http.ResponseWriter, req *http.Request, params httprouter.Params) {
	token := req.Header.Get("Authorization")
	userID, err := auth.GetUserIDFromJWT(token)
	if err != nil {
		JSONResponse(resp, http.StatusUnauthorized, ErrorResponse{Data: err.Error()})
		return
	}
	providerID, err := strconv.Atoi(params.ByName("id"))
	if err != nil {
		JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{Data: err.Error()})
		return
	}
	data, err := c.service.Find(uint(providerID), uint(userID))
	if err != nil {
		JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{Data: err.Error()})
		return
	}
	JSONResponse(resp, http.StatusOK, Response{data})
}

// Create controller => PUT /api/providers
func (c *ProviderController) Create(resp http.ResponseWriter, req *http.Request, _ httprouter.Params) {
	token := req.Header.Get("Authorization")
	userID, err := auth.GetUserIDFromJWT(token)
	if err != nil {
		JSONResponse(resp, http.StatusUnauthorized, ErrorResponse{Data: err.Error()})
		return
	}
	var form repository.ProviderForm
	decoder := jsoniter.NewDecoder(req.Body)
	if err := decoder.Decode(&form); err != nil {
		JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{Data: err.Error()})
		return
	}
	defer req.Body.Close()
	form.UserID = userID
	if _, err := c.service.Create(form); err != nil {
		JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{Data: err.Error()})
		return
	}
	JSONResponse(resp, http.StatusOK, BoolResponse{Data: true})
}

// Update controller => POST /api/providers
func (c *ProviderController) Update(resp http.ResponseWriter, req *http.Request, _ httprouter.Params) {
	token := req.Header.Get("Authorization")
	userID, err := auth.GetUserIDFromJWT(token)
	if err != nil {
		JSONResponse(resp, http.StatusUnauthorized, ErrorResponse{Data: err.Error()})
		return
	}
	var form repository.ProviderForm
	decoder := jsoniter.NewDecoder(req.Body)
	if err := decoder.Decode(&form); err != nil {
		JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{Data: err.Error()})
		return
	}
	defer req.Body.Close()
	form.UserID = uint(userID)
	if _, err := c.service.Update(form); err != nil {
		JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{Data: err.Error()})
		return
	}
	JSONResponse(resp, http.StatusOK, BoolResponse{Data: true})
}

// ReposList controller => GET /api/providers/:id/repos/:page/:size
func (c *ProviderController) ReposList(resp http.ResponseWriter, req *http.Request, params httprouter.Params) {
	token := req.Header.Get("Authorization")
	userID, err := auth.GetUserIDFromJWT(token)
	if err != nil {
		JSONResponse(resp, http.StatusUnauthorized, ErrorResponse{Data: err.Error()})
		return
	}
	providerID, _ := strconv.Atoi(params.ByName("id"))
	page, _ := strconv.Atoi(params.ByName("page"))
	size, _ := strconv.Atoi(params.ByName("size"))
	data, err := c.service.ReposList(uint(providerID), userID, page, size)
	if err != nil {
		JSONResponse(resp, http.StatusUnauthorized, ErrorResponse{Data: err.Error()})
		return
	}
	JSONResponse(resp, http.StatusOK, Response{Data: data})
}

// ReposFind controller => POST /api/providers/:id/repos
func (c *ProviderController) ReposFind(resp http.ResponseWriter, req *http.Request, params httprouter.Params) {
	token := req.Header.Get("Authorization")
	userID, err := auth.GetUserIDFromJWT(token)
	if err != nil {
		JSONResponse(resp, http.StatusUnauthorized, ErrorResponse{Data: err.Error()})
		return
	}
	providerID, _ := strconv.Atoi(params.ByName("id"))
	var form searchForm
	decoder := jsoniter.NewDecoder(req.Body)
	if err := decoder.Decode(&form); err != nil {
		JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{Data: err.Error()})
		return
	}
	defer req.Body.Close()
	data, err := c.service.ReposFind(uint(providerID), userID, form.Keyword)
	if err != nil {
		JSONResponse(resp, http.StatusNotFound, ErrorResponse{Data: err.Error()})
		return
	}
	JSONResponse(resp, http.StatusOK, Response{Data: data})
}

// ReposImport controller => PUT /api/providers/:id/repos/import
func (c *ProviderController) ReposImport(resp http.ResponseWriter, req *http.Request, params httprouter.Params) {
	token := req.Header.Get("Authorization")
	userID, err := auth.GetUserIDFromJWT(token)
	if err != nil {
		JSONResponse(resp, http.StatusUnauthorized, ErrorResponse{Data: err.Error()})
		return
	}
	providerID, _ := strconv.Atoi(params.ByName("id"))
	provider, err := c.service.Find(uint(providerID), userID)
	if err != nil {
		JSONResponse(resp, http.StatusNotFound, ErrorResponse{Data: err.Error()})
		return
	}
	var form repository.SCMRepository
	decoder := jsoniter.NewDecoder(req.Body)
	if err := decoder.Decode(&form); err != nil {
		JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{Data: err.Error()})
		return
	}
	defer req.Body.Close()
	repo, err := c.repoService.Create(form, provider)
	if err != nil {
		JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{Data: err.Error()})
		return
	}
	JSONResponse(resp, http.StatusOK, Response{Data: repo})
}
