package mount

import (
	"github.com/bleenco/abstruse/server/core"
	"gorm.io/gorm"
)

// New returns a new MountsStore.
func New(db *gorm.DB) core.MountsStore {
	return mountsStore{db}
}

type mountsStore struct {
	db *gorm.DB
}

func (s mountsStore) Find(id uint) (*core.Mount, error) {
	mnt := &core.Mount{}
	err := s.db.Where("id = ?", id).First(&mnt).Error
	return mnt, err
}

func (s mountsStore) List(id uint) ([]*core.Mount, error) {
	var mnts []*core.Mount
	err := s.db.Where("repository_id = ?", id).Find(&mnts).Error
	return mnts, err
}

func (s mountsStore) Create(mnt *core.Mount) error {
	return s.db.Create(&mnt).Error
}

func (s mountsStore) Update(mnt *core.Mount) error {
	return s.db.Model(mnt).Updates(&mnt).Error
}

func (s mountsStore) Delete(mnt *core.Mount) error {
	return s.db.Delete(&mnt).Error
}
