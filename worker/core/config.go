package core

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/bleenco/abstruse/internal/auth"
	"github.com/bleenco/abstruse/pkg/fs"
	"github.com/bleenco/abstruse/pkg/logger"
	"github.com/bleenco/abstruse/pkg/tlsutil"
	"github.com/bleenco/abstruse/worker/config"
	"github.com/bleenco/abstruse/worker/id"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"go.uber.org/zap"
)

var (
	// ConfigFile is path to config file.
	ConfigFile string
	// Config is global export of configuration.
	Config *config.Config
	// Log is application logger.
	Log *zap.Logger
)

// InitDefaults initializes default values for command flags.
func InitDefaults(cmd *cobra.Command, cfgFile string) {
	ConfigFile = cfgFile

	viper.BindPFlag("grpc.listenaddr", cmd.PersistentFlags().Lookup("grpc-listenaddr"))
	viper.BindPFlag("tls.cert", cmd.PersistentFlags().Lookup("tls-cert"))
	viper.BindPFlag("tls.key", cmd.PersistentFlags().Lookup("tls-key"))
	viper.BindPFlag("etcd.addr", cmd.PersistentFlags().Lookup("etcd-addr"))
	viper.BindPFlag("etcd.username", cmd.PersistentFlags().Lookup("etcd-username"))
	viper.BindPFlag("etcd.password", cmd.PersistentFlags().Lookup("etcd-password"))
	viper.BindPFlag("scheduler.maxparallel", cmd.PersistentFlags().Lookup("scheduler-maxparallel"))
	viper.BindPFlag("auth.jwtsecret", cmd.PersistentFlags().Lookup("auth-jwtsecret"))
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

	if ConfigFile == "" {
		home, err := fs.GetHomeDir()
		if err != nil {
			fatal(err)
		}
		ConfigFile = filepath.Join(home, "abstruse", "abstruse-worker.json")
	}
	viper.SetConfigFile(ConfigFile)

	viper.SetConfigType("json")
	viper.SetEnvPrefix("abstruse")
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	viper.AutomaticEnv()

	if !fs.Exists(viper.ConfigFileUsed()) {
		if !fs.Exists(filepath.Dir(ConfigFile)) {
			if err := fs.MakeDir(filepath.Dir(ConfigFile)); err != nil {
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

	if !strings.HasPrefix(Config.TLS.Cert, "/") {
		Config.TLS.Cert = filepath.Join(filepath.Dir(viper.ConfigFileUsed()), Config.TLS.Cert)
	}

	if !strings.HasPrefix(Config.TLS.Key, "/") {
		Config.TLS.Key = filepath.Join(filepath.Dir(viper.ConfigFileUsed()), Config.TLS.Key)
	}

	Log, err = logger.NewLogger(Config.Log)
	if err != nil {
		fatal(err)
	}

	if Config.ID == "" {
		Config.ID = id.GenerateID()
		Log.Sugar().Infof("generated worker node id: %s", Config.ID)
		viper.Set("id", Config.ID)
		if err := viper.WriteConfigAs(viper.ConfigFileUsed()); err != nil {
			fatal(err)
		}
		Log.Sugar().Infof("saved config file to %s", viper.ConfigFileUsed())
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

// InitAuthentication populates authentication global config variables.
func InitAuthentication() {
	secret := viper.GetString("auth.jwtsecret")
	auth.Init(secret, 0, 0)
}

func fatal(msg interface{}) {
	fmt.Println(msg)
	os.Exit(1)
}
