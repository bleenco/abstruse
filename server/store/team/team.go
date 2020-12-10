package team

import (
	"github.com/bleenco/abstruse/server/core"
	"github.com/jinzhu/gorm"
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
	err := s.db.Model(team).Where("id = ?", id).Preload("Users").First(team).Error
	return team, err
}

func (s teamStore) List() ([]*core.Team, error) {
	var teams []*core.Team
	err := s.db.Model(&core.Team{}).Preload("Users").Find(teams).Error
	return teams, err
}

func (s teamStore) Create(team *core.Team) error {
	return s.db.Create(team).Error
}

func (s teamStore) Update(team *core.Team) error {
	return s.db.Model(team).Updates(team).Error
}

func (s teamStore) Delete(team *core.Team) error {
	return s.db.Delete(team).Error
}
