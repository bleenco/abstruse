package repo

import (
	"context"
	"fmt"
	"net/url"
	"strings"

	"github.com/bleenco/abstruse/pkg/gitscm"
	"github.com/bleenco/abstruse/server/core"
	"github.com/drone/go-scm/scm"
	"github.com/jinzhu/gorm"
)

// New returns a new RepositoryStore.
func New(db *gorm.DB) core.RepositoryStore {
	return repositoryStore{db}
}

type repositoryStore struct {
	db *gorm.DB
}

func (s repositoryStore) Find(id uint) (core.Repository, error) {
	var repo core.Repository
	err := s.db.Model(&repo).Where("id = ?", id).Preload("Provider").First(&repo).Error
	return repo, err
}

func (s repositoryStore) FindUID(uid string) (core.Repository, error) {
	var repo core.Repository
	err := s.db.Model(&repo).Where("uid = ?", uid).Preload("Provider").First(&repo).Error
	return repo, err
}

func (s repositoryStore) FindClone(clone string) (core.Repository, error) {
	var repo core.Repository
	err := s.db.Model(&repo).Where("clone = ?", clone).Preload("Provider").First(&repo).Error
	return repo, err
}

func (s repositoryStore) List(filters core.RepositoryFilter) ([]core.Repository, int, error) {
	var repos []core.Repository
	var count int
	var err error
	keyword := fmt.Sprintf("%%%s%%", filters.Keyword)

	db := s.db.Preload("Provider")

	db = db.
		Joins("LEFT JOIN permissions ON permissions.repository_id = repositories.id").
		Joins("LEFT JOIN teams ON teams.id = permissions.team_id").
		Joins("LEFT JOIN team_users ON team_users.team_id = teams.id")

	if filters.UserID != 0 {
		db = db.Where("repositories.user_id = ? AND repositories.full_name LIKE ?", filters.UserID, keyword).
			Or("team_users.user_id = ? AND permissions.read = ? AND repositories.full_name LIKE ?", filters.UserID, true, keyword)
	}

	if filters.Limit != 0 && filters.Offset != 0 {
		db = db.Limit(filters.Limit).Offset(filters.Offset)
	}

	err = db.Order("active desc, name asc").Group("repositories.id").Find(&repos).Count(&count).Error
	return repos, count, err
}

func (s repositoryStore) Create(repo core.Repository) error {
	return s.db.Create(&repo).Error
}

func (s repositoryStore) Update(repo core.Repository) error {
	return s.db.Model(&repo).Updates(&repo).Error
}

func (s repositoryStore) CreateOrUpdate(repo core.Repository) error {
	if s.db.Where("uid = ? AND clone = ?", repo.UID, repo.Clone).First(&repo).RecordNotFound() {
		return s.db.Create(&repo).Error
	}

	return s.db.Model(&repo).Where("uid = ? AND clone = ?", repo.UID, repo.Clone).Updates(&repo).Error
}

func (s repositoryStore) Delete(repo core.Repository) error {
	return s.db.Delete(&repo).Error
}

func (s repositoryStore) SetActive(id uint, active bool) error {
	var repo core.Repository
	if s.db.Where("id = ?", id).First(&repo).RecordNotFound() {
		return fmt.Errorf("repository not found")
	}

	return s.db.Model(&repo).Update("active", active).Error
}

func (s repositoryStore) ListHooks(id uint) ([]*scm.Hook, error) {
	repo, err := s.Find(id)
	if err != nil {
		return nil, err
	}

	gitscm, err := gitscm.New(context.Background(), repo.Provider.Name, repo.Provider.URL, repo.Provider.AccessToken)
	if err != nil {
		return nil, err
	}

	hooks, err := gitscm.ListHooks(repo.FullName)
	if err != nil {
		return nil, err
	}

	return filterHooks(hooks, repo.Provider), nil
}

func (s repositoryStore) CreateHook(id uint, data gitscm.HookForm) error {
	if err := s.DeleteHooks(id); err != nil {
		return err
	}

	repo, err := s.Find(id)
	if err != nil {
		return err
	}

	gitscm, err := gitscm.New(context.Background(), repo.Provider.Name, repo.Provider.URL, repo.Provider.AccessToken)
	if err != nil {
		return err
	}

	if !data.Branch && !data.PullRequest && !data.Push && !data.Tag {
		return nil
	}

	target := fmt.Sprintf("%s/webhooks/%s", repo.Provider.Host, repo.Provider.Name)
	_, err = gitscm.CreateHook(repo.FullName, target, repo.Provider.Name, repo.Provider.Secret, data)
	return err
}

func (s repositoryStore) DeleteHooks(id uint) error {
	repo, err := s.Find(id)
	if err != nil {
		return err
	}

	gitscm, err := gitscm.New(context.Background(), repo.Provider.Name, repo.Provider.URL, repo.Provider.AccessToken)
	if err != nil {
		return err
	}

	hooks, err := gitscm.ListHooks(repo.FullName)
	if err != nil {
		return err
	}

	webhooks := filterHooks(hooks, repo.Provider)

	for _, webhook := range webhooks {
		if err := gitscm.DeleteHook(repo.FullName, webhook.ID); err != nil {
			return err
		}
	}

	return nil
}

func filterHooks(hooks []*scm.Hook, provider core.Provider) []*scm.Hook {
	var webhooks []*scm.Hook

	for _, hook := range hooks {
		url, _ := url.Parse(hook.Target)
		if strings.HasPrefix(hook.Target, provider.Host) && strings.HasSuffix(url.Path, fmt.Sprintf("/webhooks/%s", provider.Name)) {
			webhooks = append(webhooks, hook)
		}
	}

	return webhooks
}
