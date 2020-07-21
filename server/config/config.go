package config

import "github.com/bleenco/abstruse/pkg/logger"

// Config holds configuration data.
type Config struct {
	Auth      *Auth          `json:"auth"`
	Db        *Db            `json:"db"`
	Etcd      *Etcd          `json:"etcd"`
	HTTP      *HTTP          `json:"http"`
	Log       *logger.Config `json:"log"`
	TLS       *TLS           `json:"tls"`
	WebSocket *WebSocket     `json:"websocket"`
	Registry  *Registry      `json:"registry"`
}

// Auth authentication config.
type Auth struct {
	JWTSecret        string `json:"jwtSecret" valid:"stringlength(8|50),required"`
	JWTExpiry        string `json:"jwtExpiry" valid:"matches(^\\d+[mhdy]$),required"`
	JWTRefreshExpiry string `json:"jwtRefreshExpiry" valid:"matches(^\\d+[mhdy]$),required"`
}

// Db database config.
type Db struct {
	Charset  string `json:"charset" valid:"ascii,optional"`
	Driver   string `json:"driver" valid:"in(mysql|mssql|postgres),required"`
	Host     string `json:"host" valid:"host,required"`
	Name     string `json:"name" valid:"ascii,required"`
	Password string `json:"password" valid:"ascii,optional"`
	Port     int    `json:"port" valid:"port,required"`
	User     string `json:"user" valid:"ascii,required"`
}

// Etcd config.
type Etcd struct {
	Name         string `json:"name" valid:"stringlength(1|50),required"`
	Host         string `json:"host" valid:"host,required"`
	ClientPort   int    `json:"clientPort" valid:"port,required"`
	PeerPort     int    `json:"peerPort" valid:"port,required"`
	DataDir      string `json:"dataDir" valid:"stringlength(2|255),required"`
	Username     string `json:"username"`
	Password     string `json:"password"`
	RootPassword string `json:"rootPassword"`
}

// HTTP server config.
type HTTP struct {
	Addr      string `json:"addr" valid:"host,required"`
	TLS       bool   `json:"tls"`
	UploadDir string `json:"uploadDir"`
	Compress  bool   `json:"compress"`
}

// TLS config.
type TLS struct {
	Cert string `json:"cert"`
	Key  string `json:"key"`
}

// WebSocket server config.
type WebSocket struct {
	Addr string `json:"addr"`
}

// Registry docker image registry configuration.
type Registry struct {
	DataDir  string `json:"dataDir"`
	Username string `json:"username"`
	Password string `json:"password"`
	HTPasswd string `json:"htpasswd"`
}
