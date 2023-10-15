package config

type (
	// Config holds configuration data,
	Config struct {
		DB        *DB        `json:"db"`
		HTTP      *HTTP      `json:"http"`
		TLS       *TLS       `json:"tls"`
		Logger    *Logger    `json:"logger"`
		Auth      *Auth      `json:"auth"`
		Websocket *WebSocket `json:"websocket"`
		DataDir   string     `json:"datadir"`
	}

	// DB database config.
	DB struct {
		Charset  string `json:"charset" valid:"ascii,optional"`
		Driver   string `json:"driver" valid:"in(mysql|sqlserver|postgres|sqlite|clickhouse),required"`
		Host     string `json:"host" valid:"host,optional"`
		Name     string `json:"name" valid:"ascii,required"`
		Password string `json:"password" valid:"ascii,optional"`
		Port     int    `json:"port" valid:"port,optional"`
		User     string `json:"user" valid:"ascii,optional"`
	}

	// HTTP server config.
	HTTP struct {
		Addr      string `json:"addr" valid:"host,required"`
		TLS       bool   `json:"tls"`
		UploadDir string `json:"uploadDir"`
		Compress  bool   `json:"compress"`
	}

	// TLS config.
	TLS struct {
		Cert string `json:"cert"`
		Key  string `json:"key"`
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

	// Auth config.
	Auth struct {
		JWTSecret string `json:"jwtSecret"`
	}

	// WebSocket server config.
	WebSocket struct {
		Addr string `json:"addr"`
	}
)
