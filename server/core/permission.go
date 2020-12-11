package core

type (
	// Permission represents team repository permissions
	Permission struct {
		ID           uint        `gorm:"primary_key;auto_increment;not null" json:"id"`
		Team         *Team       `json:"team,omitempty"`
		TeamID       uint        `json:"teamID"`
		Repository   *Repository `json:"repository,omitempty"`
		RepositoryID uint        `json:"repositoryID"`
		Read         bool        `json:"read"`
		Write        bool        `json:"write"`
		Exec         bool        `json:"exec"`
	}

	// PermissionStore defines operations on permissions.
	PermissionStore interface {
		// Find returns permission based by team id and repository id.
		Find(uint, uint) (*Permission, error)

		// List returns permissions based by team id.
		List(uint) ([]*Permission, error)

		// Create persists new permission to the datastore.
		Create(*Permission) error

		// Update persists updated permission to the datastore.
		Update(*Permission) error

		// Delete deletes permission from the datastore.
		Delete(*Permission) error
	}
)
