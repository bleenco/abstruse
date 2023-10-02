package core

import "time"

type (
	// Job defines `jobs` database table.
	Job struct {
		ID        uint       `gorm:"primary_key;auto_increment;not null" json:"id"`
		Commands  string     `sql:"type:text" json:"commands"`
		Image     string     `json:"image"`
		Env       string     `json:"env"`
		Mount     string     `json:"mount"`
		Platform  string     `json:"platform"`
		StartTime *time.Time `json:"startTime"`
		EndTime   *time.Time `json:"endTime"`
		Status    string     `gorm:"not null;size:20;default:'queued'" json:"status"` // queued | running | passing | failing
		Log       string     `gorm:"size:16777216" json:"-"`
		Stage     string     `json:"stage"`
		Cache     string     `json:"cache"`
		Build     *Build     `gorm:"preload:false" json:"build,omitempty"`
		BuildID   uint       `json:"buildID"`
		Timestamp
	}

	// JobStore defines operations for working with jobs database table.
	JobStore interface {
		// Find returns job by id from datastore.
		Find(uint) (*Job, error)

		// FindUser returns job by id and user id.
		FindUser(uint, uint) (*Job, error)

		// List returns jobs based bu from and to dates.
		List(time.Time, time.Time) ([]*Job, error)

		// Create persists job to the datastore.
		Create(*Job) error

		// Update persist updated job to the datastore.
		Update(*Job) error

		// Delete deletes job from the datastore.
		Delete(*Job) error
	}
)
