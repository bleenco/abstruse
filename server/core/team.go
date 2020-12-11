package core

type (
	// Team represents `teams` database table.
	Team struct {
		ID    uint    `gorm:"primary_key;auto_increment;not null" json:"id"`
		Name  string  `gorm:"not null,unique_index" json:"name"`
		About string  `gorm:"type:text" json:"about"`
		Color string  `gorm:"not null" json:"color"`
		Users []*User `gorm:"many2many:team_users;" json:"users"`
		Timestamp
	}

	// TeamStore defines operations on teams database table.
	TeamStore interface {
		// Find returns a team from the datastore.
		Find(uint) (*Team, error)

		// List returns a list of teams from the datastore.
		List() ([]*Team, error)

		// Create persists a new team to the datastore.
		Create(*Team) error

		// Update persists updated team to the datastore.
		Update(*Team) error

		// Delete deletes a team from the datastore.
		Delete(*Team) error

		// AddUsers appends users to team.
		AddUsers(uint, []*User) error

		// DeleteUsers removes users from team.
		DeleteUsers(uint, []*User) error

		// UpdateUsers updates users for team.
		UpdateUsers(uint, []*User) error
	}
)
