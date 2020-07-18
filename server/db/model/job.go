package model

import (
	"time"
)

// Job defines `jobs` database table.
type Job struct {
	ID        uint       `gorm:"primary_key;auto_increment;not null" json:"id"`
	Commands  string     `sql:"type:text" json:"commands"`
	Image     string     `json:"image"`
	Env       string     `json:"env"`
	StartTime *time.Time `json:"startTime"`
	EndTime   *time.Time `json:"endTime"`
	Status    string     `gorm:"not null;size:20;default:'queued'" json:"status"` // queued | running | passing | failing
	Log       string     `sql:"type:text" json:"-"`
	Build     *Build     `gorm:"preload:false" json:"build,omitempty"`
	BuildID   uint       `json:"buildID"`
	TimestampModel
}
