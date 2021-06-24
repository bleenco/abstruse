package core

type (
	// Mount defines `mounts` db table.
	Mount struct {
		ID           uint       `gorm:"primary_key;auto_increment;not null" json:"id"`
		Host         string     `gorm:"not null" json:"host"`
		Container    string     `gorm:"not null" json:"container"`
		RepositoryID uint       `gorm:"not null" json:"repositoryID"`
		Repository   Repository `json:"repository"`
		Timestamp
	}

	// MountsStore defines operations on mounts in datastore
	MountsStore interface {
		// Find returns mounts from datastore.
		Find(uint) (*Mount, error)

		// List returns list of mounts from the datastore.
		List(uint) ([]*Mount, error)

		// Create persists a new mount to the datastore.
		Create(*Mount) error

		// Update persists updated mounts to the datastore.
		Update(*Mount) error

		// Delete deletes mounts from the datastore.
		Delete(*Mount) error
	}
)
