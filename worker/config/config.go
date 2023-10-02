package config

type (
	// Config holds data about worker configuration.
	Config struct {
		ID        string     `json:"id"`
		Server    *Server    `json:"server"`
		TLS       *TLS       `json:"tls"`
		GRPC      *GRPC      `json:"grpc"`
		Scheduler *Scheduler `json:"scheduler"`
		Auth      *Auth      `json:"auth"`
		Registry  *Registry  `json:"registry"`
		Logger    *Logger    `json:"logger"`
		Docker    *Docker    `json:"docker"`
	}

	// Server configuration.
	Server struct {
		Addr string `json:"addr"`
	}

	// TLS configuration.
	TLS struct {
		Cert string `json:"cert"`
		Key  string `json:"key"`
	}

	// GRPC configuration.
	GRPC struct {
		Addr string `json:"addr"`
	}

	// Scheduler configuration.
	Scheduler struct {
		MaxParallel int `json:"maxparallel"`
	}

	// Auth authentication config.
	Auth struct {
		JWTSecret string `json:"jwtsecret"`
	}

	// Registry docker image registry configuration.
	Registry struct {
		Addr     string `json:"addr"`
		Username string `json:"username"`
		Password string `json:"password"`
	}

	// Logger config.
	Logger struct {
		Filename   string `json:"filename"`
		MaxSize    int    `json:"maxsize"`
		MaxBackups int    `json:"maxbackups"`
		MaxAge     int    `json:"maxage"`
		Level      string `json:"level"`
		Stdout     bool   `json:"stdout"`
	}

	// Docker Additional host configuration.
	Docker struct {
		Mounts     []string `json:"mounts"`
		Devices    []string `json:"devices"`
		Privileged bool     `json:"privileged"`
		AddCaps    []string `json:"addcaps"`
	}
)
