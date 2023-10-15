package envvariable

import (
	"github.com/bleenco/abstruse/server/core"
	"gorm.io/gorm"
)

// New returns a new EnvVariableStore.
func New(db *gorm.DB) core.EnvVariableStore {
	return envVariableStore{db}
}

type envVariableStore struct {
	db *gorm.DB
}

func (s envVariableStore) Find(id uint) (*core.EnvVariable, error) {
	env := &core.EnvVariable{}
	err := s.db.Where("id = ?", id).First(&env).Error
	return env, err
}

func (s envVariableStore) List(id uint) ([]*core.EnvVariable, error) {
	var envs []*core.EnvVariable
	err := s.db.Where("repository_id = ?", id).Find(&envs).Error
	return envs, err
}

func (s envVariableStore) Create(env *core.EnvVariable) error {
	return s.db.Create(&env).Error
}

func (s envVariableStore) Update(env *core.EnvVariable) error {
	return s.db.Model(env).Updates(&env).Error
}

func (s envVariableStore) Delete(env *core.EnvVariable) error {
	return s.db.Delete(&env).Error
}
