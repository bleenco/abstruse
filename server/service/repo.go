package service

import (
	"context"
	"fmt"
	"strings"

	"github.com/bleenco/abstruse/pkg/scm"
	"github.com/bleenco/abstruse/server/db/repository"
	goscm "github.com/drone/go-scm/scm"
	"go.uber.org/zap"
)

// RepoService is repository service.
type RepoService struct {
	logger *zap.SugaredLogger
	repo   repository.RepoRepository
}

// NewRepoService returns new instance of RepoService.
func NewRepoService(logger *zap.Logger) RepoService {
	return RepoService{
		logger: logger.With(zap.String("service", "repo")).Sugar(),
		repo:   repository.NewRepoRepository(),
	}
}

// ListHooks returns webhooks for specified repository
func (s *RepoService) ListHooks(repoID, userID uint) ([]*goscm.Hook, error) {
	repo, err := s.repo.FindByID(repoID, userID)
	if err != nil {
		return nil, err
	}

	scm, err := scm.NewSCM(context.Background(), repo.Provider.Name, repo.Provider.URL, repo.Provider.AccessToken)
	if err != nil {
		return nil, err
	}

	hooks, err := scm.ListHooks(repo.FullName)
	if err != nil {
		return nil, err
	}

	var webhooks []*goscm.Hook
	for _, hook := range hooks {
		if strings.HasPrefix(hook.Target, repo.Provider.Host) && strings.HasSuffix(hook.Target, fmt.Sprintf("/webhooks/%s", repo.Provider.Name)) {
			webhooks = append(webhooks, hook)
		}
	}

	return webhooks, nil
}
