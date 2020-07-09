package config

import "github.com/bleenco/abstruse/pkg/logger"

// Config holds configuration data.
type Config struct {
	Auth *Auth          `json:"auth"`
	Db   *Db            `json:"db"`
	Etcd *Etcd          `json:"etcd"`
	HTTP *HTTP          `json:"http"`
	Log  *logger.Config `json:"log"`
	TLS  *TLS           `json:"tls"`
}

// Auth authentication config.
type Auth struct {
	JWTSecret        string `json:"jwtSecret"`
	JWTExpiry        string `json:"jwtExpiry"`
	JWTRefreshExpiry string `json:"jwtRefreshExpiry"`
}

// Db database config.
type Db struct {
	Charset  string `json:"charset"`
	Driver   string `json:"driver"`
	Host     string `json:"host"`
	Name     string `json:"name"`
	Password string `json:"password"`
	Port     int    `json:"port"`
	User     string `json:"user"`
}

// Etcd config.
type Etcd struct {
	Name         string `json:"name"`
	Host         string `json:"host"`
	ClientPort   int    `json:"clientPort"`
	PeerPort     int    `json:"peerPort"`
	DataDir      string `json:"dataDir"`
	Username     string `json:"username"`
	Password     string `json:"password"`
	RootPassword string `json:"rootPassword"`
}

// HTTP server config.
type HTTP struct {
	Addr string `json:"addr"`
	TLS  bool   `json:"tls"`
}

// TLS config.
type TLS struct {
	Cert string `json:"cert"`
	Key  string `json:"key"`
}
