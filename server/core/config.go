package core

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/ractol/ractol/pkg/fs"
	"github.com/ractol/ractol/pkg/logger"
	"github.com/ractol/ractol/pkg/tlsutil"
	"github.com/ractol/ractol/server/auth"
	"github.com/ractol/ractol/server/config"
	"github.com/ractol/ractol/server/db"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"go.uber.org/zap"
)

var (
	// ConfigFile is path to config file.
	CfgFile string
	// Config is global export of configuration.
	Config config.Config
	// Log is application logger.
	Log *zap.Logger
)

// InitDefaults initializes default values for command flags.
func InitDefaults(cmd *cobra.Command, cfgFile string) {
	CfgFile = cfgFile

	viper.BindPFlag("http.addr", cmd.PersistentFlags().Lookup("http-addr"))
	viper.BindPFlag("http.tls", cmd.PersistentFlags().Lookup("http-tls"))
	viper.BindPFlag("tls.cert", cmd.PersistentFlags().Lookup("tls-cert"))
	viper.BindPFlag("tls.key", cmd.PersistentFlags().Lookup("tls-key"))
	viper.BindPFlag("db.client", cmd.PersistentFlags().Lookup("db-client"))
	viper.BindPFlag("db.host", cmd.PersistentFlags().Lookup("db-host"))
	viper.BindPFlag("db.port", cmd.PersistentFlags().Lookup("db-port"))
	viper.BindPFlag("db.user", cmd.PersistentFlags().Lookup("db-user"))
	viper.BindPFlag("db.password", cmd.PersistentFlags().Lookup("db-password"))
	viper.BindPFlag("db.name", cmd.PersistentFlags().Lookup("db-name"))
	viper.BindPFlag("db.charset", cmd.PersistentFlags().Lookup("db-charset"))
	viper.BindPFlag("etcd.addr", cmd.PersistentFlags().Lookup("etcd-addr"))
	viper.BindPFlag("etcd.username", cmd.PersistentFlags().Lookup("etcd-username"))
	viper.BindPFlag("etcd.password", cmd.PersistentFlags().Lookup("etcd-password"))
	viper.BindPFlag("auth.jwtsecret", cmd.PersistentFlags().Lookup("auth-jwtsecret"))
	viper.BindPFlag("auth.jwtexpiry", cmd.PersistentFlags().Lookup("auth-jwtexpiry"))
	viper.BindPFlag("auth.jwtrefreshexpiry", cmd.PersistentFlags().Lookup("auth-jwtrefreshexpiry"))
	viper.BindPFlag("log.level", cmd.PersistentFlags().Lookup("log-level"))
	viper.BindPFlag("log.stdout", cmd.PersistentFlags().Lookup("log-stdout"))
	viper.BindPFlag("log.filename", cmd.PersistentFlags().Lookup("log-filename"))
	viper.BindPFlag("log.maxsize", cmd.PersistentFlags().Lookup("log-max-size"))
	viper.BindPFlag("log.maxbackups", cmd.PersistentFlags().Lookup("log-max-backups"))
	viper.BindPFlag("log.maxage", cmd.PersistentFlags().Lookup("log-max-age"))
}

// InitConfig initializes configuration.
func InitConfig() {
	var err error

	if CfgFile == "" {
		home, err := fs.GetHomeDir()
		if err != nil {
			fatal(err)
		}
		CfgFile = filepath.Join(home, "ractol", "ractol-server.json")
	}
	viper.SetConfigFile(CfgFile)

	viper.SetConfigType("json")
	viper.SetEnvPrefix("ractol")
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	viper.AutomaticEnv()

	if !fs.Exists(viper.ConfigFileUsed()) {
		if !fs.Exists(filepath.Dir(CfgFile)) {
			if err := fs.MakeDir(filepath.Dir(CfgFile)); err != nil {
				fatal(err)
			}
		}
		if err = viper.SafeWriteConfigAs(viper.ConfigFileUsed()); err != nil {
			fatal(err)
		}
	}

	if err = viper.ReadInConfig(); err != nil {
		fatal(err)
	}

	if err = viper.Unmarshal(&Config); err != nil {
		fatal(err)
	}

	if !strings.HasPrefix(Config.Log.Filename, "/") {
		Config.Log.Filename = filepath.Join(filepath.Dir(viper.ConfigFileUsed()), Config.Log.Filename)
	}

	Log, err = logger.NewLogger(Config.Log)
	if err != nil {
		fatal(err)
	}
}

// InitTLS initializes and creates certificate with private key if not exists.
func InitTLS() {
	cert, key := Config.TLS.Cert, Config.TLS.Key
	if !strings.HasPrefix(cert, "/") {
		cert = filepath.Join(filepath.Dir(viper.ConfigFileUsed()), cert)
	}
	if !strings.HasPrefix(key, "/") {
		key = filepath.Join(filepath.Dir(viper.ConfigFileUsed()), key)
	}

	if !fs.Exists(cert) || !fs.Exists(key) {
		Log.Sugar().Infof("generating SSL cert %s and key %s", cert, key)
	}

	if err := tlsutil.CheckAndGenerateCert(cert, key); err != nil {
		fatal(err)
	}
}

// InitDB initializes database connection.
func InitDB() {
	db.Connect(Config, Log)
}

// InitAuthentication populates authentication global config variables.
func InitAuthentication() {
	secret := viper.GetString("auth.jwtsecret")
	expiry, refreshExpiry := viper.GetDuration("auth.jwtexpiry"), viper.GetDuration("auth.jwtrefreshexpiry")
	auth.Init(secret, expiry, refreshExpiry)
}

// SaveConfig saves new configuration and reinitializes services.
func SaveConfig(cfg config.Config) error {
	Config = cfg

	viper.Set("http.addr", Config.HTTP.Addr)
	viper.Set("http.tls", Config.HTTP.TLS)
	viper.Set("tls.cert", Config.TLS.Cert)
	viper.Set("tls.key", Config.TLS.Key)
	viper.Set("db.client", Config.Db.Client)
	viper.Set("db.host", Config.Db.Host)
	viper.Set("db.port", Config.Db.Port)
	viper.Set("db.user", Config.Db.User)
	viper.Set("db.password", Config.Db.Password)
	viper.Set("db.name", Config.Db.Name)
	viper.Set("db.charset", Config.Db.Charset)
	viper.Set("etcd.addr", Config.Etcd.Addr)
	viper.Set("etcd.username", Config.Etcd.Addr)
	viper.Set("etcd.password", Config.Etcd.Password)
	viper.Set("auth.jwtsecret", Config.Auth.JWTSecret)
	viper.Set("auth.jwtexpiry", Config.Auth.JWTExpiry)
	viper.Set("auth.jwtrefreshexpiry", Config.Auth.JWTRefreshExpiry)
	viper.Set("log.level", Config.Log.Level)
	viper.Set("log.stdout", Config.Log.Stdout)
	viper.Set("log.filename", Config.Log.Filename)
	viper.Set("log.maxsize", Config.Log.MaxSize)
	viper.Set("log.maxbackups", Config.Log.MaxBackups)
	viper.Set("log.maxage", Config.Log.MaxAge)

	InitAuthentication()
	InitDB()

	return viper.WriteConfigAs(viper.ConfigFileUsed())
}

func fatal(msg interface{}) {
	fmt.Println(msg)
	os.Exit(1)
}
