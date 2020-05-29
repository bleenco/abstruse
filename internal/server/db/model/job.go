package model

import "time"

// Job defines `jobs` database table.
type Job struct {
	ID        uint       `gorm:"PRIMARY_KEY;AUTO_INCREMENT;NOT NULL" json:"id"`
	Commands  string     `sql:"type:text" json:"commands"`
	Image     string     `json:"image"`
	Env       string     `json:"env"`
	StartTime *time.Time `json:"start_time"`
	EndTime   *time.Time `json:"end_time"`
	Status    string     `gorm:"not null;varchar(20);default:'queued'" json:"status"` // queued | running | passing | failing
	Log       string     `sql:"type:text" json:"log"`
	TimestampModel
	Build   *Build `gorm:"PRELOAD:false" json:"build,omitempty"`
	BuildID uint   `json:"build_id"`
}
