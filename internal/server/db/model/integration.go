package model

// Integration represents `integrations` db table.
type Integration struct {
	ID          uint   `gorm:"PRIMARY_KEY;AUTO_INCREMENT;NOT NULL" json:"id"`
	Provider    string `gorm:"not null" json:"provider"`
	URL         string `gorm:"column:url" json:"url"`
	APIURL      string `gorm:"column:api_url" json:"api_url"`
	Username    string `gorm:"column:username" json:"-"`
	Password    string `gorm:"column:password" json:"-"`
	AccessToken string `gorm:"column:access_token" json:"-"`
	UserID      uint   `gorm:"not null" json:"-"`
	User        User   `json:"-"`
	TimestampModel
}
