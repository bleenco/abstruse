package model

import "time"

// ImageTag defines `image_tags` database table.
type ImageTag struct {
	ID         uint      `gorm:"primary_key;auto_increment;not null" json:"id"`
	Tag        string    `gorm:"size:100,not null" json:"tag"`
	Dockerfile string    `gorm:"type:text" json:"dockerfile"`
	Digest     string    `gorm:"size:255,not null" json:"digest"`
	BuildTime  time.Time `json:"buildTime"`
	Image      *Image    `gorm:"preload:false" json:"image,omitempty"`
	ImageID    uint      `json:"imageID"`
	TimestampModel
}
