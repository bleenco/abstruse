package options

import (
	"fmt"
	"path"
	"strings"

	"github.com/jkuri/abstruse/pkg/auth"
	"github.com/jkuri/abstruse/pkg/certgen"
	"github.com/jkuri/abstruse/pkg/fs"
	"github.com/jkuri/abstruse/pkg/log"
	"github.com/mitchellh/go-homedir"
	"github.com/spf13/viper"
)

// Options is worker configuration.
type Options struct {
	TLS struct {
		Cert string
		Key  string
	}
	Etcd struct {
		Addr     string
		Username string
		Password string
	}
	GRPC struct {
		ListenAddr string
	}
	Scheduler struct {
		MaxConcurrency int
	}
	Auth *auth.Options
	Log  *log.Options
}

// NewConfig returns viper config.
func NewConfig(configPath string) (*viper.Viper, error) {
	v := viper.New()
	dir := getConfigDir()

	v.AddConfigPath(dir)
	v.SetConfigName("worker")
	v.SetConfigType("yaml")

	v.SetDefault("tls.cert", path.Join(dir, "certs/worker-cert.pem"))
	v.SetDefault("tls.key", path.Join(dir, "certs/worker-key.pem"))
	v.SetDefault("etcd.addr", "127.0.0.1:2379")
	v.SetDefault("etcd.username", "abstruse")
	v.SetDefault("etcd.password", "abstrusepasswd")
	v.SetDefault("grpc.listenaddr", "0.0.0.0:3330")
	v.SetDefault("scheduler.maxconcurrency", 5)
	v.SetDefault("auth.jwtsecret", "sfd919bUYxQ")
	v.SetDefault("log.level", "debug")
	v.SetDefault("log.stdout", true)
	v.SetDefault("log.filename", path.Join(dir, "abstruse-worker.log"))
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

// NewOptions returns configuration.
func NewOptions(v *viper.Viper) (*Options, error) {
	if err := v.ReadInConfig(); err != nil {
		return nil, err
	}

	opts := &Options{}
	err := v.Unmarshal(opts)
	if err != nil {
		return nil, err
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
	return fmt.Sprintf("%s/abstruse-worker", home)
}
