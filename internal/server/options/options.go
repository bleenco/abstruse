package options

import (
	"fmt"
	"path"
	"strings"

	"github.com/jkuri/abstruse/internal/pkg/auth"
	"github.com/jkuri/abstruse/internal/pkg/certgen"
	"github.com/jkuri/abstruse/internal/pkg/fs"
	"github.com/jkuri/abstruse/internal/pkg/log"
	"github.com/mitchellh/go-homedir"
	"github.com/spf13/viper"
)

type (
	// Options are global config for the server app.
	Options struct {
		TLS       *TLS
		HTTP      *HTTP
		Websocket *WebSocket
		DB        *DB
		Etcd      *ETCD
		Auth      *auth.Options
		Log       *log.Options
	}

	// TLS configuration
	TLS struct {
		Cert string
		Key  string
	}

	// HTTP config for HTTP server.
	HTTP struct {
		Addr    string
		TLSAddr string
	}

	// ETCD configuration for etcd embedded server.
	ETCD struct {
		Name       string
		Host       string
		ClientPort int
		PeerPort   int
		DataDir    string
		Username   string
		Password   string
	}

	// DB database configuration
	DB struct {
		Client   string
		Hostname string
		Port     int
		User     string
		Password string
		Name     string
		Charset  string
	}

	// WebSocket configuration
	WebSocket struct {
		Addr string
	}
)

// NewConfig returns viper config.
func NewConfig(configPath string) (*viper.Viper, error) {
	v := viper.New()

	dir := getConfigDir()
	v.AddConfigPath(dir)
	v.SetConfigName("server")
	v.SetConfigType("yaml")

	v.SetDefault("tls.cert", path.Join(dir, "certs/server-cert.pem"))
	v.SetDefault("tls.key", path.Join(dir, "certs/server-key.pem"))
	v.SetDefault("http.addr", "0.0.0.0:80")
	v.SetDefault("http.tlsaddr", "0.0.0.0:443")
	v.SetDefault("websocket.addr", "127.0.0.1:7100")
	v.SetDefault("db.client", "mysql")
	v.SetDefault("db.hostname", "localhost")
	v.SetDefault("db.port", 3306)
	v.SetDefault("db.user", "root")
	v.SetDefault("db.password", "password")
	v.SetDefault("db.name", "abstruse")
	v.SetDefault("db.charset", "utf8")
	v.SetDefault("etcd.name", "abstruse")
	v.SetDefault("etcd.host", "0.0.0.0")
	v.SetDefault("etcd.clientPort", 2379)
	v.SetDefault("etcd.peerPort", 2380)
	v.SetDefault("etcd.dataDir", path.Join(dir, "abstruse-data"))
	v.SetDefault("etcd.username", "abstruse")
	v.SetDefault("etcd.password", "abstrusepasswd")
	v.SetDefault("auth.jwtsecret", "sfd919bUYxQ")
	v.SetDefault("log.level", "debug")
	v.SetDefault("log.stdout", true)
	v.SetDefault("log.filename", path.Join(dir, "abstruse-server.log"))
	v.SetDefault("log.max_size", 500)
	v.SetDefault("log.max_backups", 3)
	v.SetDefault("log.max_age", 3)

	v.SetEnvPrefix("abstruse")
	v.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	v.AutomaticEnv()

	if !fs.Exists(dir) {
		err := fs.MakeDir(dir)
		if err != nil {
			return nil, err
		}
	}

	if !strings.HasPrefix(configPath, "/") {
		configPath = path.Join(dir, configPath)
	}

	if fs.Exists(configPath) {
		v.SetConfigFile(configPath)
	} else {
		if err := v.SafeWriteConfigAs(configPath); err != nil {
			return nil, err
		}
	}
	return v, nil
}

// NewOptions returns server app config.
func NewOptions(v *viper.Viper) (*Options, error) {
	if err := v.ReadInConfig(); err != nil {
		return nil, err
	}

	opts := &Options{}
	err := v.Unmarshal(opts)
	if err != nil {
		return nil, err
	}

	if !fs.Exists(opts.Etcd.DataDir) {
		if err := fs.MakeDir(opts.Etcd.DataDir); err != nil {
			return nil, err
		}
	}

	if err := initCerts(opts); err != nil {
		return nil, err
	}

	return opts, nil
}

func initCerts(opts *Options) error {
	return certgen.CheckAndGenerateCert(opts.TLS.Cert, opts.TLS.Key)
}

func getConfigDir() string {
	home, err := homedir.Dir()
	if err != nil {
		panic(err)
	}
	return fmt.Sprintf("%s/abstruse", home)
}
