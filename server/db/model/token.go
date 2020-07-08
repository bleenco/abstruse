package model

import (
	"time"

	"github.com/bleenco/abstruse/server/auth"
)

// Token represents `tokens` database table and holds
// information about jwt refresh tokens.
type Token struct {
	ID        uint      `gorm:"primary_key;auto_increment;not null" json:"id"`
	Token     string    `gorm:"not null" json:"token"`
	ExpiresAt time.Time `gorm:"not null" json:"expiresAt"`
	OS        string    `json:"os"`
	Platform  string    `json:"platform"`
	Browser   string    `json:"browser"`
	Engine    string    `json:"engine"`
	Mobile    bool      `json:"mobile"`
	IP        string    `json:"ip"`
	UserID    uint      `gorm:"not null" json:"userID"`
	User      User      `json:"-"`
	TimestampModel
}

// Claims returns the token claims to be signed.
func (t *Token) Claims() auth.RefreshClaims {
	return auth.RefreshClaims{
		ID:    t.ID,
		Token: t.Token,
	}
}
