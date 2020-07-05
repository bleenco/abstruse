package model

import "time"

// Token represents `tokens` database table and holds
// information about jwt refresh tokens.
type Token struct {
	ID        uint      `gorm:"primary_key;auto_increment;not null" json:"id"`
	Token     string    `gorm:"not null" json:"token"`
	ExpiresAt time.Time `gorm:"not null" json:"expiresAt"`
	UserID    uint      `gorm:"not null" json:"userID"`
	User      User      `json:"-"`
	TimestampModel
}
