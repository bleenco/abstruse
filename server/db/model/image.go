package model

// Image defines `ìmages` database table and represents
// images stored in Docker registry.
type Image struct {
	ID   uint        `gorm:"primary_key;auto_increment;not null" json:"id"`
	Name string      `gorm:"not null;size:100;unique_index" json:"name"`
	Tags []*ImageTag `gorm:"preload:true" json:"tags"`
	TimestampModel
}
