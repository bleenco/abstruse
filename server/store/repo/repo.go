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

func (s repositoryStore) Find(id, userID uint) (core.Repository, error) {
	var repo core.Repository

	db := s.db.Preload("Provider")
	db = db.Joins("LEFT JOIN permissions ON permissions.repository_id = repositories.id").
		Joins("LEFT JOIN teams ON teams.id = permissions.team_id").
		Joins("LEFT JOIN team_users ON team_users.team_id = teams.id")
	db = db.Where("repositories.id = ? AND repositories.user_id = ?", id, userID).
		Or("repositories.id = ? AND team_users.user_id = ? AND permissions.read = ?", id, userID, true)

	err := db.First(&repo).Error
	if err != nil {
		return repo, err
	}
	repo.Perms = s.GetPermissions(repo.ID, userID)

	return repo, err
}

func (s repositoryStore) FindUID(uid string) (core.Repository, error) {
	var repo core.Repository
	err := s.db.Where("uid = ?", uid).Preload("Provider").First(&repo).Error
	return repo, err
}

func (s repositoryStore) FindClone(clone string) (core.Repository, error) {
	var repo core.Repository
	err := s.db.Where("clone = ?", clone).Preload("Provider").First(&repo).Error
	return repo, err
}

func (s repositoryStore) FindToken(token string) (*core.Repository, error) {
	var repo core.Repository
	err := s.db.Where("token = ?", token).First(&repo).Error
	return &repo, err
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

	if filters.Limit != 0 {
		db = db.Limit(filters.Limit)
	}

	if filters.Offset != 0 {
		db = db.Offset(filters.Offset)
	}

	err = db.Order("active desc, name asc").Group("repositories.id").Find(&repos).Limit(-1).Offset(-1).Count(&count).Error
	if err != nil || count == 0 {
		return repos, count, err
	}

	for i, repo := range repos {
		repos[i].Perms = s.GetPermissions(repo.ID, filters.UserID)
	}

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

func (s repositoryStore) GetPermissions(id, userID uint) core.Perms {
	perms := core.Perms{Read: false, Write: false, Exec: false}

	var user core.User
	err := s.db.Model(&user).Where("id = ?", userID).First(&user).Error
	if err != nil {
		return perms
	}
	if user.Role == "admin" {
		return core.Perms{Read: true, Write: true, Exec: true}
	}

	var repo core.Repository
	if err := s.db.Where("id = ?", id).First(&repo).Error; err == nil {
		if repo.UserID == userID {
			perms.Read = true
			perms.Write = true
			perms.Exec = true
			return perms
		}
	}

	db := s.db

	db = db.
		Joins("LEFT JOIN team_users ON team_users.team_id = permissions.team_id").
		Where("team_users.user_id = ? AND permissions.repository_id = ?", userID, id)

	var permissions []*core.Permission
	err = db.Find(&permissions).Error
	if err != nil {
		return perms
	}

	r, w, x := false, false, false

	for _, p := range permissions {
		if p.Read {
			r = true
		}
		if p.Write {
			w = true
		}
		if p.Exec {
			x = true
		}
	}

	return core.Perms{Read: r, Write: w, Exec: x}
}

func (s repositoryStore) ListHooks(id, userID uint) ([]*scm.Hook, error) {
	repo, err := s.Find(id, userID)
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

func (s repositoryStore) CreateHook(id, userID uint, data gitscm.HookForm) error {
	if err := s.DeleteHooks(id, userID); err != nil {
		return err
	}

	repo, err := s.Find(id, userID)
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

	target := fmt.Sprintf("%s/webhooks", repo.Provider.Host)
	_, err = gitscm.CreateHook(repo.FullName, target, repo.Provider.Name, repo.Provider.Secret, data)
	return err
}

func (s repositoryStore) DeleteHooks(id, userID uint) error {
	repo, err := s.Find(id, userID)
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
		if strings.HasPrefix(hook.Target, provider.Host) && strings.HasSuffix(url.Path, "/webhooks") {
			webhooks = append(webhooks, hook)
		}
	}

	return webhooks
}
