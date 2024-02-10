package core

type (
	// EnvVariable defines `env_variables` db table.
	EnvVariable struct {
		ID           uint       `gorm:"primary_key;auto_increment;not null" json:"id"`
		Key          string     `gorm:"not null" json:"key"`
		Value        string     `gorm:"not null" sql:"type:longtext" json:"value"`
		Secret       bool       `gorm:"not null,default:false" json:"secret"`
		RepositoryID uint       `gorm:"not null" json:"repositoryID"`
		Repository   Repository `json:"repository"`
		Timestamp
	}

	// EnvVariableStore defines operations on environment variables
	// in datastore.
	EnvVariableStore interface {
		// Find returns env variable from datastore.
		Find(uint) (*EnvVariable, error)

		// List returns list of environment variables from the datastore.
		List(uint) ([]*EnvVariable, error)

		// Create persists a new env variable to the datastore.
		Create(*EnvVariable) error

		// Update persists updated env variable to the datastore.
		Update(*EnvVariable) error

		// Delete deletes env variable from the datastore.
		Delete(*EnvVariable) error
	}
)
