package team

import (
	"github.com/bleenco/abstruse/server/core"
	"gorm.io/gorm"
)

// New returns new TeamStore.
func New(db *gorm.DB) core.TeamStore {
	return teamStore{db}
}

type teamStore struct {
	db *gorm.DB
}

func (s teamStore) Find(id uint) (*core.Team, error) {
	team := &core.Team{}
	err := s.db.Model(team).Where("id = ?", id).Preload("Users").Preload("Permissions.Repository").First(team).Error
	return team, err
}

func (s teamStore) List() ([]*core.Team, error) {
	var teams []*core.Team
	err := s.db.Model(teams).Preload("Users").Preload("Permissions.Repository").Find(&teams).Error
	return teams, err
}

func (s teamStore) Create(team *core.Team) error {
	return s.db.Create(&team).Error
}

func (s teamStore) Update(team *core.Team) error {
	return s.db.Model(team).Updates(&team).Error
}

func (s teamStore) Delete(team *core.Team) error {
	return s.db.Delete(&team).Error
}

func (s teamStore) AddUsers(id uint, users []*core.User) error {
	team, err := s.Find(id)
	if err != nil {
		return err
	}
	return s.db.Model(&team).Association("Users").Append(users)
}

func (s teamStore) DeleteUsers(id uint, users []*core.User) error {
	team, err := s.Find(id)
	if err != nil {
		return err
	}
	return s.db.Model(&team).Association("Users").Delete(users)
}

func (s teamStore) UpdateUsers(id uint, users []*core.User) error {
	team, err := s.Find(id)
	if err != nil {
		return err
	}
	err = s.db.Model(&team).Association("Users").Clear()
	if err != nil {
		return err
	}
	return s.db.Model(&team).Association("Users").Append(users)
}
