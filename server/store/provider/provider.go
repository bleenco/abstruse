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

func (s providerStore) Find(id uint) (*core.Provider, error) {
	provider := &core.Provider{}
	err := s.db.Model(&core.Provider{}).Where("id = ?", id).First(&provider).Error
	return provider, err
}

func (s providerStore) List() ([]*core.Provider, error) {
	var providers []*core.Provider
	err := s.db.Find(&providers).Error
	return providers, err
}

func (s providerStore) ListUser(userID uint) ([]*core.Provider, error) {
	var providers []*core.Provider
	err := s.db.Where("user_id = ?", userID).Find(&providers).Error
	return providers, err
}

func (s providerStore) Create(provider *core.Provider) error {
	return s.db.Create(provider).Error
}

func (s providerStore) Update(provider *core.Provider) error {
	updateHttp := make(map[string]interface{})
	updateHttp["HttpUser"] = provider.HttpUser
	updateHttp["HttpPass"] = provider.HttpPass
	return s.db.Model(provider).Updates(updateHttp).Updates(&provider).Error
}

func (s providerStore) Delete(provider *core.Provider) error {
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

	// git-scm does not work correctly with Stash pagination.
	// Opened issue https://github.com/drone/go-scm/issues/166
	// See https://docs.atlassian.com/bitbucket-server/rest/5.16.0/bitbucket-rest.html
	//> Identifiers of adjacent objects in a page may not be contiguous,
	//> so the start of the next page is not necessarily the start of the last page plus the last page's size.
	//> A client should always use nextPageStart to avoid unexpected results from a paged API.
	if provider.Name == "stash" {
		size = 1000
	}
	repos, err = gitscm.ListRepos(page, size)

	// Some providers like Stash don't return perms in ListRepos response
	for _, repo := range repos {
		if repo.Perm == nil {
			repo.Perm, err = gitscm.FindPerms(repo)
			if err != nil {
				repo.Perm = &scm.Perm{}
			}
		}
	}

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
