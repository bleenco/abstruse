package cmd

import (
	"fmt"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"

	"github.com/ractol/ractol/pkg/fs"
	"github.com/ractol/ractol/pkg/lib"
	"github.com/ractol/ractol/pkg/logger"
	"github.com/ractol/ractol/pkg/tlsutil"
	"github.com/ractol/ractol/server/api"
	"github.com/ractol/ractol/server/auth"
	"github.com/ractol/ractol/server/config"
	"github.com/ractol/ractol/server/db"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"go.uber.org/zap"
)

var (
	cfgFile string
	cfg     config.Config
	log     *zap.Logger
	rootCmd = &cobra.Command{
		Use:   "ractol-server",
		Short: "Ractol CI server",
		Run: func(cmd *cobra.Command, args []string) {
			if err := run(); err != nil {
				fatal(err)
			}
			os.Exit(0)
		},
	}
)

// Execute exetuces the root command.
func Execute() error {
	return rootCmd.Execute()
}

func run() error {
	server := api.NewServer(cfg, log)
	errch := make(chan error, 1)
	sigch := make(chan os.Signal, 1)

	go func() {
		if err := server.Run(); err != nil {
			errch <- err
		}
	}()

	go db.Connect(cfg, log)

	go func() {
		signal.Notify(sigch, syscall.SIGINT, syscall.SIGTERM)
		<-sigch
		errch <- server.Close()
	}()

	return <-errch
}

func init() {
	cobra.OnInitialize(initConfig, initTLS, initAuthentication)

	rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file (default is $HOME/ractol/ractol-server.json)")
	rootCmd.PersistentFlags().String("http-addr", "0.0.0.0:80", "HTTP server listen address")
	rootCmd.PersistentFlags().Bool("http-tls", false, "run HTTP server in TLS mode")
	rootCmd.PersistentFlags().String("tls-cert", "cert.pem", "path to SSL certificate file")
	rootCmd.PersistentFlags().String("tls-key", "key.pem", "path to SSL private key file")
	rootCmd.PersistentFlags().String("db-client", "mysql", "database client (available options: mysql, postgres, sqlite, mssql)")
	rootCmd.PersistentFlags().String("db-host", "localhost", "database server host address")
	rootCmd.PersistentFlags().Int("db-port", 3306, "database server port")
	rootCmd.PersistentFlags().String("db-user", "root", "database username")
	rootCmd.PersistentFlags().String("db-password", "", "database password")
	rootCmd.PersistentFlags().String("db-name", "ractol", "database name (file name when sqlite client used)")
	rootCmd.PersistentFlags().String("db-charset", "utf8", "database charset")
	rootCmd.PersistentFlags().String("etcd-addr", "localhost:2379", "etcd server address")
	rootCmd.PersistentFlags().String("etcd-username", "ractol", "etcd username")
	rootCmd.PersistentFlags().String("etcd-password", "ractol", "etcd password")
	rootCmd.PersistentFlags().String("auth-jwtsecret", lib.RandomString(), "JWT authentication secret key")
	rootCmd.PersistentFlags().String("auth-jwtexpiry", "15m", "JWT access token expiry time")
	rootCmd.PersistentFlags().String("auth-jwtrefreshexpiry", "1h", "JWT refresh token expiry time")
	rootCmd.PersistentFlags().String("log-level", "info", "logging level (available options: debug, info, warn, error, panic, fatal)")
	rootCmd.PersistentFlags().Bool("log-stdout", true, "print logs to stdout")
	rootCmd.PersistentFlags().String("log-filename", "ractol-server.log", "log filename")
	rootCmd.PersistentFlags().Int("log-max-size", 500, "maximum log file size (in MB)")
	rootCmd.PersistentFlags().Int("log-max-backups", 3, "maximum log file backups")
	rootCmd.PersistentFlags().Int("log-max-age", 3, "maximum log age")

	viper.BindPFlag("http.addr", rootCmd.PersistentFlags().Lookup("http-addr"))
	viper.BindPFlag("http.tls", rootCmd.PersistentFlags().Lookup("http-tls"))
	viper.BindPFlag("tls.cert", rootCmd.PersistentFlags().Lookup("tls-cert"))
	viper.BindPFlag("tls.key", rootCmd.PersistentFlags().Lookup("tls-key"))
	viper.BindPFlag("db.client", rootCmd.PersistentFlags().Lookup("db-client"))
	viper.BindPFlag("db.host", rootCmd.PersistentFlags().Lookup("db-host"))
	viper.BindPFlag("db.port", rootCmd.PersistentFlags().Lookup("db-port"))
	viper.BindPFlag("db.user", rootCmd.PersistentFlags().Lookup("db-user"))
	viper.BindPFlag("db.password", rootCmd.PersistentFlags().Lookup("db-password"))
	viper.BindPFlag("db.name", rootCmd.PersistentFlags().Lookup("db-name"))
	viper.BindPFlag("db.charset", rootCmd.PersistentFlags().Lookup("db-charset"))
	viper.BindPFlag("etcd.addr", rootCmd.PersistentFlags().Lookup("etcd-addr"))
	viper.BindPFlag("etcd.username", rootCmd.PersistentFlags().Lookup("etcd-username"))
	viper.BindPFlag("etcd.password", rootCmd.PersistentFlags().Lookup("etcd-password"))
	viper.BindPFlag("auth.jwtsecret", rootCmd.PersistentFlags().Lookup("auth-jwtsecret"))
	viper.BindPFlag("auth.jwtexpiry", rootCmd.PersistentFlags().Lookup("auth-jwtexpiry"))
	viper.BindPFlag("auth.jwtrefreshexpiry", rootCmd.PersistentFlags().Lookup("auth-jwtrefreshexpiry"))
	viper.BindPFlag("log.level", rootCmd.PersistentFlags().Lookup("log-level"))
	viper.BindPFlag("log.stdout", rootCmd.PersistentFlags().Lookup("log-stdout"))
	viper.BindPFlag("log.filename", rootCmd.PersistentFlags().Lookup("log-filename"))
	viper.BindPFlag("log.maxsize", rootCmd.PersistentFlags().Lookup("log-max-size"))
	viper.BindPFlag("log.maxbackups", rootCmd.PersistentFlags().Lookup("log-max-backups"))
	viper.BindPFlag("log.maxage", rootCmd.PersistentFlags().Lookup("log-max-age"))
}

func initConfig() {
	var err error

	if cfgFile == "" {
		home, err := fs.GetHomeDir()
		if err != nil {
			fatal(err)
		}
		cfgFile = filepath.Join(home, "ractol", "ractol-server.json")
	}
	viper.SetConfigFile(cfgFile)

	viper.SetConfigType("json")
	viper.SetEnvPrefix("ractol")
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	viper.AutomaticEnv()

	if !fs.Exists(viper.ConfigFileUsed()) {
		if !fs.Exists(filepath.Dir(cfgFile)) {
			if err := fs.MakeDir(filepath.Dir(cfgFile)); err != nil {
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

	if err = viper.Unmarshal(&cfg); err != nil {
		fatal(err)
	}

	if !strings.HasPrefix(cfg.Log.Filename, "/") {
		cfg.Log.Filename = filepath.Join(filepath.Dir(viper.ConfigFileUsed()), cfg.Log.Filename)
	}

	log, err = logger.NewLogger(cfg.Log)
	if err != nil {
		fatal(err)
	}
}

func initTLS() {
	cert, key := cfg.TLS.Cert, cfg.TLS.Key
	if !strings.HasPrefix(cert, "/") {
		cert = filepath.Join(filepath.Dir(viper.ConfigFileUsed()), cert)
	}
	if !strings.HasPrefix(key, "/") {
		key = filepath.Join(filepath.Dir(viper.ConfigFileUsed()), key)
	}

	if !fs.Exists(cert) || !fs.Exists(key) {
		log.Sugar().Infof("generating SSL cert %s and key %s", cert, key)
	}

	if err := tlsutil.CheckAndGenerateCert(cert, key); err != nil {
		fatal(err)
	}
}

func initAuthentication() {
	secret := viper.GetString("auth.jwtsecret")
	expiry, refreshExpiry := viper.GetDuration("auth.jwtexpiry"), viper.GetDuration("auth.jwtrefreshexpiry")
	auth.Init(secret, expiry, refreshExpiry)
}

func fatal(msg interface{}) {
	fmt.Println(msg)
	os.Exit(1)
}
