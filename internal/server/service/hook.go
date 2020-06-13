package service

import (
	"io/ioutil"
	"net/http"

	"github.com/jkuri/abstruse/internal/pkg/scm"
)

// HookService interface
type HookService interface {
	DetectWebhook(req *http.Request) (*scm.SCM, error)
}

// DefaultHookService struct
type DefaultHookService struct{}

// NewHookService returns new instance of HookService
func NewHookService() HookService {
	return &DefaultHookService{}
}

// DetectWebhook tries to detect provider based on webhook payload and headers.
func (s *DefaultHookService) DetectWebhook(req *http.Request) (*scm.SCM, error) {
	body, err := req.GetBody()
	if err != nil {
		return nil, err
	}
	_, err = ioutil.ReadAll(body)
	if err != nil {
		return nil, err
	}

	return nil, err
}
