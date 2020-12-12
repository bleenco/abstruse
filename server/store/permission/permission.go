package permission

import (
	"github.com/bleenco/abstruse/server/core"
	"github.com/jinzhu/gorm"
)

// New returns new PermissionStore.
func New(db *gorm.DB) core.PermissionStore {
	return permissionStore{db}
}

type permissionStore struct {
	db *gorm.DB
}

func (s permissionStore) Find(teamID, repoID uint) (*core.Permission, error) {
	perm := &core.Permission{}
	err := s.db.Model(perm).Where("team_id = ? AND repository_id = ?", teamID, repoID).First(&perm).Error
	return perm, err
}

func (s permissionStore) List(teamID uint) ([]*core.Permission, error) {
	var perms []*core.Permission
	err := s.db.Model(perms).Where("team_id = ?", teamID).Find(&perms).Error
	return perms, err
}

func (s permissionStore) Create(perm *core.Permission) error {
	return s.db.Model(perm).Create(&perm).Error
}

func (s permissionStore) Update(perm *core.Permission) error {
	return s.db.Model(perm).Updates(map[string]interface{}{
		"read":  perm.Read,
		"write": perm.Write,
		"exec":  perm.Exec,
	}).Error
}

func (s permissionStore) Delete(perm *core.Permission) error {
	return s.db.Model(perm).Delete(&perm).Error
}
