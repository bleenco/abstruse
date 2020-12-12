package provider

import (
	"context"
	"fmt"

	"github.com/bleenco/abstruse/pkg/gitscm"
	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/server/core"
	"github.com/drone/go-scm/scm"
	"github.com/jinzhu/gorm"
)

// New returns a new ProviderStore.
func New(db *gorm.DB, repos core.RepositoryStore) core.ProviderStore {
	return providerStore{db, repos}
}

type providerStore struct {
	db    *gorm.DB
	repos core.RepositoryStore
}

func (s providerStore) Find(id uint) (core.Provider, error) {
	var provider core.Provider
	err := s.db.Model(&provider).Where("id = ?", id).First(&provider).Error
	return provider, err
}

func (s providerStore) List() ([]*core.Provider, error) {
	var providers []*core.Provider
	err := s.db.Find(&providers).Error
	return providers, err
}

func (s providerStore) ListUser(userID uint) ([]core.Provider, error) {
	var providers []core.Provider
	err := s.db.Where("user_id = ?", userID).Find(&providers).Error
	return providers, err
}

func (s providerStore) Create(provider core.Provider) error {
	return s.db.Create(&provider).Error
}

func (s providerStore) Update(provider core.Provider) error {
	return s.db.Model(&provider).Updates(&provider).Error
}

func (s providerStore) Delete(provider core.Provider) error {
	return s.db.Delete(&provider).Error
}

func (s providerStore) Sync(id uint) error {
	page, size := 1, 30

	provider, err := s.Find(id)
	if err != nil {
		return err
	}

	for {
		repos, err := s.findRepos(id, page, size)
		if err != nil {
			break
		}

		for _, repo := range repos {
			data, permission := convertRepo(repo)
			data.ProviderName = provider.Name
			data.ProviderID = provider.ID
			data.UserID = provider.UserID
			if permission.Admin {
				if err := s.repos.CreateOrUpdate(data); err != nil {
					return err
				}
			}
		}

		if len(repos) == size {
			page++
		} else {
			break
		}
	}

	provider.LastSync = lib.TimeNow()
	return s.Update(provider)
}

// findRepos finds SCM providers repositories.
func (s providerStore) findRepos(id uint, page, size int) ([]*scm.Repository, error) {
	var repos []*scm.Repository
	var err error

	provider, err := s.Find(id)
	if err != nil {
		return repos, err
	}
	gitscm, err := gitscm.New(context.Background(), provider.Name, provider.URL, provider.AccessToken)
	if err != nil {
		return repos, err
	}
	repos, err = gitscm.ListRepos(page, size)
	return repos, err
}

func convertRepo(repo *scm.Repository) (core.Repository, Permission) {
	r := core.Repository{
		UID:           repo.ID,
		Namespace:     repo.Namespace,
		Name:          repo.Name,
		FullName:      fmt.Sprintf("%s/%s", repo.Namespace, repo.Name),
		Private:       repo.Private,
		URL:           repo.Link,
		Clone:         repo.Clone,
		CloneSSH:      repo.CloneSSH,
		DefaultBranch: repo.Branch,
	}
	perm := Permission{
		Pull:  repo.Perm.Pull,
		Push:  repo.Perm.Push,
		Admin: repo.Perm.Admin,
	}

	return r, perm
}

// Permission SCM Repository permissions.
type Permission struct {
	Pull  bool `json:"pull"`
	Push  bool `json:"push"`
	Admin bool `json:"admin"`
}
