package service

import (
	"time"

	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/server/config"
	"github.com/bleenco/abstruse/server/db/model"
	"github.com/bleenco/abstruse/server/db/repository"
	"github.com/bleenco/abstruse/server/registry"
)

// ImageService is docker registry images service.
type ImageService struct {
	imageRepo repository.ImageRepo
	client    *registry.Client
}

// NewImageService returns new ImageService instance.
func NewImageService(cfg *config.Registry) (ImageService, error) {
	url := "http://localhost/registry/v2/"
	client, err := registry.NewClient(url, cfg.Username, cfg.Password)
	if err != nil {
		return ImageService{}, err
	}

	return ImageService{
		imageRepo: repository.NewImageRepo(),
		client:    client,
	}, nil
}

// Sync synchronizes images from registry with database.
func (s *ImageService) Sync() error {
	images, err := s.client.Find()
	if err != nil {
		return err
	}

	for _, image := range images {
		imageModel := model.Image{Name: image.Name}
		imageModel, err = s.imageRepo.CreateOrUpdate(imageModel)
		if err != nil {
			return err
		}

		var ids []uint
		for _, tag := range imageModel.Tags {
			ids = append(ids, tag.ID)
		}

		for _, tag := range image.Tags {
			var tt *model.ImageTag

			for _, t := range imageModel.Tags {
				if t.Tag == tag.Tag {
					tt = t

					i := lib.IndexUint(ids, tt.ID)
					if i != -1 {
						ids = append(ids[:i], ids[i+1:]...)
					}
				}
			}

			if tt == nil {
				tt = &model.ImageTag{
					Tag:       tag.Tag,
					Digest:    tag.Digest,
					Size:      tag.Size,
					BuildTime: time.Now(),
					ImageID:   imageModel.ID,
				}
				if _, err = s.imageRepo.CreateOrUpdateTag(tt); err != nil {
					return err
				}
			} else {
				if _, err = s.imageRepo.CreateOrUpdateTag(tt); err != nil {
					return err
				}
			}
		}

		for _, id := range ids {
			if err := s.imageRepo.DeleteTag(id); err != nil {
				return err
			}
		}
	}

	return nil
}
