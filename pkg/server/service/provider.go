package service

import (
	"context"

	goscm "github.com/drone/go-scm/scm"
	"github.com/jkuri/abstruse/pkg/scm"
	"github.com/jkuri/abstruse/pkg/server/db/model"
	"github.com/jkuri/abstruse/pkg/server/db/repository"
)

// ProviderService struct
type ProviderService struct {
	repo repository.ProviderRepository
}

// NewProviderService returns new instance of ProviderService.
func NewProviderService(repo repository.ProviderRepository) ProviderService {
	return ProviderService{repo}
}

// List method.
func (s *ProviderService) List(UserID uint) ([]model.Provider, error) {
	return s.repo.List(UserID)
}

// Create method.
func (s *ProviderService) Create(data repository.ProviderForm) (*model.Provider, error) {
	return s.repo.Create(data)
}

// Update method.
func (s *ProviderService) Update(data repository.ProviderForm) (*model.Provider, error) {
	return s.repo.Update(data)
}

// Find method.
func (s *ProviderService) Find(providerID, userID uint) (*model.Provider, error) {
	return s.repo.Find(providerID, userID)
}

// ReposList lists available repositories.
func (s *ProviderService) ReposList(providerID, userID uint, page, size int) ([]repository.SCMRepository, error) {
	var repos []repository.SCMRepository
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
func (s *ProviderService) ReposFind(providerID, userID uint, keyword string) (repository.SCMRepository, error) {
	var r repository.SCMRepository
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

func convertRepo(repo *goscm.Repository) repository.SCMRepository {
	perm := &repository.Permission{
		Pull:  repo.Perm.Pull,
		Push:  repo.Perm.Push,
		Admin: repo.Perm.Admin,
	}
	return repository.SCMRepository{
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
