package repository

import (
	"github.com/ractol/ractol/server/db"
	"github.com/ractol/ractol/server/db/model"
)

// TokenRepo repository.
type TokenRepo struct{}

// NewTokenRepo returns new TokenRepo instance.
func NewTokenRepo() TokenRepo {
	return TokenRepo{}
}

// Create creates new refresh token and returns that model.
func (r TokenRepo) Create(data model.Token) (model.Token, error) {
	db, err := db.Instance()
	if err != nil {
		return data, err
	}
	err = db.Create(&data).Error
	return data, err
}
