package cmd

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/bleenco/abstruse/internal/auth"
	"github.com/bleenco/abstruse/internal/version"
	"github.com/bleenco/abstruse/pkg/fs"
	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/pkg/tlsutil"
	"github.com/bleenco/abstruse/server/config"
	"github.com/bleenco/abstruse/server/http"
	"github.com/bleenco/abstruse/server/ws"
	"github.com/mitchellh/go-homedir"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

var (
	cfgFile string
	rootCmd = &cobra.Command{
		Use:   "abstruse",
		Short: "Abstruse CI",
		Run: func(cmd *cobra.Command, args []string) {
			app, err := CreateApp()
			if err != nil {
				fatal(err)
			}

			if err := app.run(); err != nil {
				fatal(err)
			}
			os.Exit(0)
		},
	}
	versionCmd = &cobra.Command{
		Use:   "version",
		Short: "Print the version number and build info",
		Run: func(cmd *cobra.Command, args []string) {
			fmt.Println(version.GenerateBuildVersionString())
			os.Exit(0)
		},
	}
)

type app struct {
	config *config.Config
	db     *gorm.DB
	logger *zap.Logger
	http   *http.Server
	ws     *ws.Server
}

func newApp(
	config *config.Config,
	db *gorm.DB,
	logger *zap.Logger,
	http *http.Server,
	ws *ws.Server,
) *app {
	return &app{config, db, logger, http, ws}
}

func (a app) run() error {
	errch := make(chan error, 1)

	go func() {
		if err := a.http.Run(); err != nil {
			errch <- err
		}
	}()

	go func() {
		if err := a.ws.Run(); err != nil {
			errch <- err
		}
	}()

	return <-errch
}

// Execute executes the root command.
func Execute() error {
	return rootCmd.Execute()
}

func init() {
	rootCmd.AddCommand(versionCmd)
	cobra.OnInitialize(initDefaults)

	rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file (default is $HOME/abstruse/abstruse.json)")
	rootCmd.PersistentFlags().String("http-addr", "0.0.0.0:80", "HTTP server listen address")
	rootCmd.PersistentFlags().String("http-uploaddir", "uploads/", "HTTP uploads directory")
	rootCmd.PersistentFlags().Bool("http-compress", false, "enable HTTP response gzip compression")
	rootCmd.PersistentFlags().Bool("http-tls", false, "run HTTP server in TLS mode")
	rootCmd.PersistentFlags().String("websocket-addr", "127.0.0.1:2220", "WebSocket server listen address")
	rootCmd.PersistentFlags().String("tls-cert", "cert.pem", "path to SSL certificate file")
	rootCmd.PersistentFlags().String("tls-key", "key.pem", "path to SSL private key file")
	rootCmd.PersistentFlags().String("db-driver", "mysql", "database client (available options: mysql, postgres, mssql)")
	rootCmd.PersistentFlags().String("db-host", "localhost", "database server host address")
	rootCmd.PersistentFlags().Int("db-port", 3306, "database server port")
	rootCmd.PersistentFlags().String("db-user", "root", "database username")
	rootCmd.PersistentFlags().String("db-password", "", "database password")
	rootCmd.PersistentFlags().String("db-name", "abstruse", "database name (file name when sqlite client used)")
	rootCmd.PersistentFlags().String("db-charset", "utf8", "database charset")
	rootCmd.PersistentFlags().String("logger-level", "info", "logging level (available options: debug, info, warn, error, panic, fatal)")
	rootCmd.PersistentFlags().Bool("logger-stdout", true, "print logs to stdout")
	rootCmd.PersistentFlags().String("logger-filename", "abstruse.log", "log filename")
	rootCmd.PersistentFlags().Int("logger-max-size", 500, "maximum log file size (in MB)")
	rootCmd.PersistentFlags().Int("logger-max-backups", 3, "maximum log file backups")
	rootCmd.PersistentFlags().Int("logger-max-age", 3, "maximum log age")
	rootCmd.PersistentFlags().String("auth-jwtsecret", lib.RandomString(), "JWT authentication secret key")
	rootCmd.PersistentFlags().String("datadir", "data/", "Directory to store build cache and build artifacts")
}

func initDefaults() {
	viper.BindPFlag("http.addr", rootCmd.PersistentFlags().Lookup("http-addr"))
	viper.BindPFlag("http.tls", rootCmd.PersistentFlags().Lookup("http-tls"))
	viper.BindPFlag("http.uploaddir", rootCmd.PersistentFlags().Lookup("http-uploaddir"))
	viper.BindPFlag("http.compress", rootCmd.PersistentFlags().Lookup("http-compress"))
	viper.BindPFlag("websocket.addr", rootCmd.PersistentFlags().Lookup("websocket-addr"))
	viper.BindPFlag("tls.cert", rootCmd.PersistentFlags().Lookup("tls-cert"))
	viper.BindPFlag("tls.key", rootCmd.PersistentFlags().Lookup("tls-key"))
	viper.BindPFlag("db.driver", rootCmd.PersistentFlags().Lookup("db-driver"))
	viper.BindPFlag("db.host", rootCmd.PersistentFlags().Lookup("db-host"))
	viper.BindPFlag("db.port", rootCmd.PersistentFlags().Lookup("db-port"))
	viper.BindPFlag("db.user", rootCmd.PersistentFlags().Lookup("db-user"))
	viper.BindPFlag("db.password", rootCmd.PersistentFlags().Lookup("db-password"))
	viper.BindPFlag("db.name", rootCmd.PersistentFlags().Lookup("db-name"))
	viper.BindPFlag("db.charset", rootCmd.PersistentFlags().Lookup("db-charset"))
	viper.BindPFlag("logger.level", rootCmd.PersistentFlags().Lookup("logger-level"))
	viper.BindPFlag("logger.stdout", rootCmd.PersistentFlags().Lookup("logger-stdout"))
	viper.BindPFlag("logger.filename", rootCmd.PersistentFlags().Lookup("logger-filename"))
	viper.BindPFlag("logger.maxsize", rootCmd.PersistentFlags().Lookup("logger-max-size"))
	viper.BindPFlag("logger.maxbackups", rootCmd.PersistentFlags().Lookup("logger-max-backups"))
	viper.BindPFlag("logger.maxage", rootCmd.PersistentFlags().Lookup("logger-max-age"))
	viper.BindPFlag("auth.jwtsecret", rootCmd.PersistentFlags().Lookup("auth-jwtsecret"))
	viper.BindPFlag("datadir", rootCmd.PersistentFlags().Lookup("datadir"))
}

func newConfig() *config.Config {
	var cfg *config.Config

	if cfgFile == "" {
		home, err := homedir.Dir()
		if err != nil {
			fatal(err)
		}
		cfgFile = filepath.Join(home, "abstruse", "abstruse.json")
	}

	viper.SetConfigFile(cfgFile)
	viper.SetConfigType("json")
	viper.SetEnvPrefix("abstruse")
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	viper.AutomaticEnv()

	cfgFileUsed := viper.ConfigFileUsed()

	if !fs.Exists(cfgFileUsed) {
		if !fs.Exists(filepath.Dir(cfgFileUsed)) {
			if err := fs.MakeDir(filepath.Dir(cfgFileUsed)); err != nil {
				fatal(err)
			}
		}

		if err := viper.SafeWriteConfigAs(cfgFileUsed); err != nil {
			fatal(err)
		}
	}

	if err := viper.ReadInConfig(); err != nil {
		fatal(err)
	}

	if err := viper.Unmarshal(&cfg); err != nil {
		fatal(err)
	}

	if !strings.HasPrefix(cfg.HTTP.UploadDir, "/") {
		cfg.HTTP.UploadDir = filepath.Join(filepath.Dir(viper.ConfigFileUsed()), cfg.HTTP.UploadDir)
	}

	if !fs.Exists(cfg.HTTP.UploadDir) {
		if err := fs.MakeDir(cfg.HTTP.UploadDir); err != nil {
			fatal(err)
		}

		if err := fs.MakeDir(filepath.Join(cfg.HTTP.UploadDir, "avatars")); err != nil {
			fatal(err)
		}
	}

	if cfg.DB.Driver == "sqlite3" && !strings.HasPrefix(cfg.DB.Name, "/") {
		cfg.DB.Name = filepath.Join(filepath.Dir(viper.ConfigFileUsed()), cfg.DB.Name)
	}

	if !strings.HasPrefix(cfg.DataDir, "/") {
		cfg.DataDir = filepath.Join(filepath.Dir(viper.ConfigFileUsed()), cfg.DataDir)
	}

	if err := fs.MakeDir(cfg.DataDir); err != nil {
		fatal(err)
	}

	if err := fs.MakeDir(filepath.Join(cfg.DataDir, "cache")); err != nil {
		fatal(err)
	}

	if err := fs.MakeDir(filepath.Join(cfg.DataDir, "store")); err != nil {
		fatal(err)
	}

	if !strings.HasPrefix(cfg.Logger.Filename, "/") {
		cfg.Logger.Filename = filepath.Join(filepath.Dir(viper.ConfigFileUsed()), cfg.Logger.Filename)
	}

	if !strings.HasPrefix(cfg.TLS.Cert, "/") {
		cfg.TLS.Cert = filepath.Join(filepath.Dir(cfgFileUsed), cfg.TLS.Cert)
	}

	if !strings.HasPrefix(cfg.TLS.Key, "/") {
		cfg.TLS.Key = filepath.Join(filepath.Dir(cfgFileUsed), cfg.TLS.Key)
	}

	auth.Init(viper.GetString("auth.jwtsecret"))

	cert, key := cfg.TLS.Cert, cfg.TLS.Key
	if !strings.HasPrefix(cert, "/") {
		cert = filepath.Join(filepath.Dir(viper.ConfigFileUsed()), cert)
	}
	if !strings.HasPrefix(key, "/") {
		key = filepath.Join(filepath.Dir(viper.ConfigFileUsed()), key)
	}

	if err := tlsutil.CheckAndGenerateCert(cert, key); err != nil {
		fatal(err)
	}

	return cfg
}

func fatal(msg interface{}) {
	fmt.Println(msg)
	os.Exit(1)
}
