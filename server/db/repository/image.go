package repository

import (
	"github.com/bleenco/abstruse/server/db"
	"github.com/bleenco/abstruse/server/db/model"
)

// ImageRepo struct.
type ImageRepo struct{}

// NewImageRepo returns new instance of ImageRepo.
func NewImageRepo() ImageRepo {
	return ImageRepo{}
}

// Find returns all images.
func (r *ImageRepo) Find() ([]model.Image, error) {
	var images []model.Image
	db, err := db.Instance()
	if err != nil {
		return images, err
	}
	err = db.Preload("Tags").Find(&images).Error
	return images, err
}

// CreateOrUpdate creates image if not exists or return existing one based by name.
func (r *ImageRepo) CreateOrUpdate(data model.Image) (model.Image, error) {
	db, err := db.Instance()
	if err != nil {
		return data, err
	}

	err = db.Model(&data).Where("name = ?", data.Name).First(&data).Error
	if err == nil {
		err = db.Model(&data).Updates(&data).Error
		return data, err
	}

	err = db.Create(&data).Error
	return data, err
}

// CreateOrUpdateTag creates image tag if not exists or updates existing tag.
func (r *ImageRepo) CreateOrUpdateTag(data *model.ImageTag) (*model.ImageTag, error) {
	db, err := db.Instance()
	if err != nil {
		return data, err
	}

	err = db.Model(&data).Where("digest = ?", data.Digest).First(&data).Error
	if err == nil {
		err = db.Model(&data).Updates(&data).Error
		return data, err
	}

	err = db.Create(&data).Error
	return data, err
}

// DeleteTag deletes existing image tag.
func (r *ImageRepo) DeleteTag(id uint) error {
	db, err := db.Instance()
	if err != nil {
		return err
	}

	return db.Unscoped().Delete(model.ImageTag{}, "id = ?", id).Error
}

// Sync scynchronizes images from registry with database.
func (r *ImageRepo) Sync() error {
	return nil
}
