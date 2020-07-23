package service

import (
	"context"
	"fmt"
	"net/url"
	"strings"

	"github.com/bleenco/abstruse/pkg/scm"
	"github.com/bleenco/abstruse/server/db/model"
	"github.com/bleenco/abstruse/server/db/repository"
	goscm "github.com/drone/go-scm/scm"
)

// RepoService is repository service.
type RepoService struct {
	repo repository.RepoRepository
}

// NewRepoService returns new instance of RepoService.
func NewRepoService() RepoService {
	return RepoService{
		repo: repository.NewRepoRepository(),
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

	return filterHooks(hooks, repo.Provider), nil
}

// CreateHook creates webhook for specified repository.
func (s *RepoService) CreateHook(repoID, userID uint, data scm.HookForm) error {
	if err := s.DeleteHooks(repoID, userID); err != nil {
		return err
	}

	repo, err := s.repo.FindByID(repoID, userID)
	if err != nil {
		return err
	}

	scm, err := scm.NewSCM(context.Background(), repo.Provider.Name, repo.Provider.URL, repo.Provider.AccessToken)
	if err != nil {
		return err
	}

	if !data.Branch && !data.PullRequest && !data.Push && !data.Tag {
		return nil
	}

	target := fmt.Sprintf("%s/webhooks/%s", repo.Provider.Host, repo.Provider.Name)
	_, err = scm.CreateHook(repo.FullName, target, repo.Provider.Name, repo.Provider.Secret, data)
	return err
}

// DeleteHooks deletes all related webhooks for specified repository.
func (s *RepoService) DeleteHooks(repoID, userID uint) error {
	repo, err := s.repo.FindByID(repoID, userID)
	if err != nil {
		return err
	}

	scm, err := scm.NewSCM(context.Background(), repo.Provider.Name, repo.Provider.URL, repo.Provider.AccessToken)
	if err != nil {
		return err
	}

	hooks, err := scm.ListHooks(repo.FullName)
	if err != nil {
		return err
	}

	webhooks := filterHooks(hooks, repo.Provider)

	for _, webhook := range webhooks {
		if err := scm.DeleteHook(repo.FullName, webhook.ID); err != nil {
			return err
		}
	}

	return nil
}

func filterHooks(hooks []*goscm.Hook, provider model.Provider) []*goscm.Hook {
	var webhooks []*goscm.Hook

	for _, hook := range hooks {
		url, _ := url.Parse(hook.Target)
		if strings.HasPrefix(hook.Target, provider.Host) && strings.HasSuffix(url.Path, fmt.Sprintf("/webhooks/%s", provider.Name)) {
			webhooks = append(webhooks, hook)
		}
	}

	return webhooks
}
