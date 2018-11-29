package db

import (
	"time"
)

// BaseModel defines gorm.Model fields.
type BaseModel struct {
	ID        uint       `gorm:"PRIMARY_KEY;AUTO_INCREMENT;NOT NULL" json:"id"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `json:"deleted_at"`
}
