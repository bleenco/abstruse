package service

import (
	"context"

	goscm "github.com/drone/go-scm/scm"
	"github.com/jkuri/abstruse/internal/pkg/scm"
	"github.com/jkuri/abstruse/internal/server/db/model"
	"github.com/jkuri/abstruse/internal/server/db/repository"
)

// ProviderService interface
type ProviderService interface {
	List(UserID uint) ([]model.Provider, error)
	Create(data repository.ProviderForm) (*model.Provider, error)
	Update(data repository.ProviderForm) (*model.Provider, error)
	ReposList(providerID, userID uint, page, size int) ([]repository.Repository, error)
	ReposFind(providerID, userID uint, keyword string) (repository.Repository, error)
}

// DefaultProviderService struct
type DefaultProviderService struct {
	repo repository.ProviderRepository
}

// NewProviderService returns new instance of ProviderService.
func NewProviderService(repo repository.ProviderRepository) ProviderService {
	return &DefaultProviderService{repo}
}

// List method.
func (s *DefaultProviderService) List(UserID uint) ([]model.Provider, error) {
	return s.repo.List(UserID)
}

// Create method.
func (s *DefaultProviderService) Create(data repository.ProviderForm) (*model.Provider, error) {
	return s.repo.Create(data)
}

// Update method.
func (s *DefaultProviderService) Update(data repository.ProviderForm) (*model.Provider, error) {
	return s.repo.Update(data)
}

// ReposList lists available repositories.
func (s *DefaultProviderService) ReposList(providerID, userID uint, page, size int) ([]repository.Repository, error) {
	var repos []repository.Repository
	provider, err := s.repo.Find(providerID, userID)
	if err != nil {
		return repos, err
	}
	scm, err := scm.NewSCM(context.Background(), provider.Name, provider.URL, provider.AccessToken)
	if err != nil {
		return repos, err
	}
	repositories, err := scm.ListRepos(page, size)
	if err != nil {
		return repos, err
	}
	for _, repo := range repositories {
		repos = append(repos, convertRepo(repo))
	}
	return repos, nil
}

// ReposFind finds repository by search term.
func (s *DefaultProviderService) ReposFind(providerID, userID uint, keyword string) (repository.Repository, error) {
	var r repository.Repository
	provider, err := s.repo.Find(providerID, userID)
	if err != nil {
		return r, err
	}
	scm, err := scm.NewSCM(context.Background(), provider.Name, provider.URL, provider.AccessToken)
	if err != nil {
		return r, err
	}
	repo, err := scm.FindRepo(keyword)
	return convertRepo(repo), err
}

func convertRepo(repo *goscm.Repository) repository.Repository {
	perm := &repository.Permission{
		Pull:  repo.Perm.Pull,
		Push:  repo.Perm.Push,
		Admin: repo.Perm.Admin,
	}
	return repository.Repository{
		ID:         repo.ID,
		Namespace:  repo.Namespace,
		Name:       repo.Name,
		Permission: perm,
		Branch:     repo.Branch,
		Private:    repo.Private,
		Clone:      repo.Clone,
		CloneSSH:   repo.CloneSSH,
		Link:       repo.Link,
		Created:    repo.Created,
		Updated:    repo.Updated,
	}
}
