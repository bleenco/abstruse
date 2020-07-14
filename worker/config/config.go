package config

import "github.com/bleenco/abstruse/pkg/logger"

// Config is worker configuration.
type Config struct {
	TLS       *TLS
	Etcd      *Etcd
	GRPC      *GRPC
	Scheduler *Scheduler
	Auth      *Auth
	Log       *logger.Config
}

// TLS configuration.
type TLS struct {
	Cert string
	Key  string
}

// Etcd configuration.
type Etcd struct {
	Addr     string
	Username string
	Password string
}

// GRPC configuration.
type GRPC struct {
	ListenAddr string
}

// Scheduler configuration.
type Scheduler struct {
	MaxParallel int
}

// Auth authentication config.
type Auth struct {
	JWTSecret string `json:"jwtSecret"`
}
