package service

import (
	"fmt"
	"strconv"

	"github.com/dgrijalva/jwt-go"
	"github.com/jkuri/abstruse/internal/pkg/auth"
	"github.com/jkuri/abstruse/internal/server/db/model"
	"github.com/jkuri/abstruse/internal/server/db/repository"
	"go.uber.org/zap"
)

// UserService interface
type UserService interface {
	Find(ID uint64) (*model.User, error)
	FindByEmail(email string) (*model.User, error)
	Login(email, password string) (string, error)
	CheckPassword(user *model.User, password string) bool
	GenerateJWT(user *model.User) (string, error)
	CheckUserJWT(tokenString string) bool
}

// DefaultUserService struct
type DefaultUserService struct {
	logger     *zap.SugaredLogger
	repository repository.UserRepository
}

// NewUserService returns new instance of a user service.
func NewUserService(logger *zap.Logger, repository repository.UserRepository) UserService {
	return &DefaultUserService{
		logger:     logger.With(zap.String("type", "UserService")).Sugar(),
		repository: repository,
	}
}

// Find method
func (s *DefaultUserService) Find(ID uint64) (*model.User, error) {
	return s.repository.Find(ID)
}

// FindByEmail method
func (s *DefaultUserService) FindByEmail(email string) (*model.User, error) {
	return s.repository.FindByEmail(email)
}

// Login method
func (s *DefaultUserService) Login(email, password string) (string, error) {
	return s.repository.Login(email, password)
}

// CheckPassword method
func (s *DefaultUserService) CheckPassword(user *model.User, password string) bool {
	return auth.CheckPasswordHash(password, user.Password)
}

// GenerateJWT method
func (s *DefaultUserService) GenerateJWT(user *model.User) (string, error) {
	u := auth.UserJWT{
		ID:       strconv.Itoa(int(user.ID)),
		Email:    user.Email,
		Fullname: user.Fullname,
		Avatar:   user.Avatar,
	}
	return auth.GenerateJWT(u)
}

// CheckUserJWT method
func (s *DefaultUserService) CheckUserJWT(tokenString string) bool {
	if tokenString == "" {
		return false
	}
	token, _ := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(auth.JWTSecret), nil
	})
	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		id, _ := strconv.Atoi(claims["id"].(string))
		if _, err := s.Find(uint64(id)); err != nil {
			return false
		}
		return true
	}
	return false
}
