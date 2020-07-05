package repository

import (
	"time"

	"github.com/ractol/ractol/pkg/lib"
	"github.com/ractol/ractol/server/auth"
	"github.com/ractol/ractol/server/db"
	"github.com/ractol/ractol/server/db/model"
)

// TokenRepo repository.
type TokenRepo struct{}

// NewTokenRepo returns new TokenRepo instance.
func NewTokenRepo() TokenRepo {
	return TokenRepo{}
}

// FindByToken finds and returns token by refresh token value.
func (r TokenRepo) FindByToken(token string) (model.Token, error) {
	var data model.Token
	db, err := db.Instance()
	if err != nil {
		return data, err
	}
	err = db.Model(&data).Where("token = ?", token).First(&data).Error
	return data, err
}

// CreateOrUpdate creates token if no ID is specified or update it otherwise.
func (r TokenRepo) CreateOrUpdate(data model.Token) (model.Token, error) {
	db, err := db.Instance()
	if err != nil {
		return data, err
	}
	data.Token = lib.ID()
	data.ExpiresAt = time.Now().Add(auth.JWTRefreshExpiry)

	if db.NewRecord(data) {
		err = db.Create(&data).Error
		return data, err
	}

	err = db.Model(&data).Updates(&data).Error
	return data, err
}

// Delete deletes the token from the database.
func (r TokenRepo) Delete(data model.Token) error {
	db, err := db.Instance()
	if err != nil {
		return err
	}

	return db.Delete(&data).Error
}

// DeleteExpired deletes all refresh tokens that has expired.
func (r TokenRepo) DeleteExpired() error {
	db, err := db.Instance()
	if err != nil {
		return err
	}
	return db.Delete(model.Token{}, "expires_at <= ?", time.Now()).Error
}
