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
	"github.com/bleenco/abstruse/worker/app"
	"github.com/bleenco/abstruse/worker/config"
	"github.com/bleenco/abstruse/worker/docker"
	"github.com/mitchellh/go-homedir"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"go.uber.org/zap"
)

var (
	cfgFile string
	rootCmd = &cobra.Command{
		Use:   "abstruse-worker",
		Short: "Abstruse CI Worker Node",
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

type application struct {
	config *config.Config
	logger *zap.Logger
	app    *app.App
}

func newApplication(
	config *config.Config,
	logger *zap.Logger,
	app *app.App,
) *application {
	return &application{config, logger, app}
}

func (a application) run() error {
	errch := make(chan error, 1)

	go func() {
		if err := a.app.Run(); err != nil {
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

	rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file (default is $HOME/abstruse/abstruse-worker.json)")
	rootCmd.PersistentFlags().String("id", lib.RandomString(), "worker node ID")
	rootCmd.PersistentFlags().String("server-addr", "http://localhost", "abstruse server API address")
	rootCmd.PersistentFlags().String("grpc-addr", "0.0.0.0:3330", "gRPC server listen address")
	rootCmd.PersistentFlags().String("tls-cert", "cert-worker.pem", "path to SSL certificate file")
	rootCmd.PersistentFlags().String("tls-key", "key-worker.pem", "path to SSL private key file")
	rootCmd.PersistentFlags().Int("scheduler-maxparallel", 5, "scheduler max parallel option defines how many jobs can run in parallel")
	rootCmd.PersistentFlags().String("auth-jwtsecret", lib.RandomString(), "JWT authentication secret key")
	rootCmd.PersistentFlags().String("registry-addr", "https://registry-1.docker.io", "docker image registry server addr")
	rootCmd.PersistentFlags().String("registry-username", "", "docker image registry username")
	rootCmd.PersistentFlags().String("registry-password", "", "docker image registry password")
	rootCmd.PersistentFlags().String("logger-level", "info", "logging level (available options: debug, info, warn, error, panic, fatal)")
	rootCmd.PersistentFlags().Bool("logger-stdout", true, "print logs to stdout")
	rootCmd.PersistentFlags().String("logger-filename", "abstruse-worker.log", "log filename")
	rootCmd.PersistentFlags().Int("logger-max-size", 500, "maximum log file size (in MB)")
	rootCmd.PersistentFlags().Int("logger-max-backups", 3, "maximum log file backups")
	rootCmd.PersistentFlags().Int("logger-max-age", 3, "maximum log age")
	rootCmd.PersistentFlags().StringSlice("docker-mounts", []string{}, "Global mount points, colon separated")
	rootCmd.PersistentFlags().StringSlice("docker-devices", []string{}, "Device redirection, colon separated")
	rootCmd.PersistentFlags().Bool("docker-privileged", false, "Run build container in privileged mode")
	rootCmd.PersistentFlags().StringSlice("docker-addcaps", []string{}, "Add Linux capabilities")
}

func initDefaults() {
	viper.BindPFlag("grpc.addr", rootCmd.PersistentFlags().Lookup("grpc-addr"))
	viper.BindPFlag("id", rootCmd.PersistentFlags().Lookup("id"))
	viper.BindPFlag("server.addr", rootCmd.PersistentFlags().Lookup("server-addr"))
	viper.BindPFlag("tls.cert", rootCmd.PersistentFlags().Lookup("tls-cert"))
	viper.BindPFlag("tls.key", rootCmd.PersistentFlags().Lookup("tls-key"))
	viper.BindPFlag("scheduler.maxparallel", rootCmd.PersistentFlags().Lookup("scheduler-maxparallel"))
	viper.BindPFlag("auth.jwtsecret", rootCmd.PersistentFlags().Lookup("auth-jwtsecret"))
	viper.BindPFlag("registry.addr", rootCmd.PersistentFlags().Lookup("registry-addr"))
	viper.BindPFlag("registry.username", rootCmd.PersistentFlags().Lookup("registry-username"))
	viper.BindPFlag("registry.password", rootCmd.PersistentFlags().Lookup("registry-password"))
	viper.BindPFlag("logger.level", rootCmd.PersistentFlags().Lookup("logger-level"))
	viper.BindPFlag("logger.stdout", rootCmd.PersistentFlags().Lookup("logger-stdout"))
	viper.BindPFlag("logger.filename", rootCmd.PersistentFlags().Lookup("logger-filename"))
	viper.BindPFlag("logger.maxsize", rootCmd.PersistentFlags().Lookup("logger-max-size"))
	viper.BindPFlag("logger.maxbackups", rootCmd.PersistentFlags().Lookup("logger-max-backups"))
	viper.BindPFlag("logger.maxage", rootCmd.PersistentFlags().Lookup("logger-max-age"))
	viper.BindPFlag("docker.mounts", rootCmd.PersistentFlags().Lookup("docker-mounts"))
	viper.BindPFlag("docker.devices", rootCmd.PersistentFlags().Lookup("docker-devices"))
	viper.BindPFlag("docker.privileged", rootCmd.PersistentFlags().Lookup("docker-privileged"))
	viper.BindPFlag("docker.addcaps", rootCmd.PersistentFlags().Lookup("docker-addcaps"))
}

func newConfig() *config.Config {
	var cfg *config.Config

	if cfgFile == "" {
		home, err := homedir.Dir()
		if err != nil {
			fatal(err)
		}
		cfgFile = filepath.Join(home, "abstruse", "abstruse-worker.json")
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

	docker.Init(cfg)

	return cfg
}

func fatal(msg interface{}) {
	fmt.Println(msg)
	os.Exit(1)
}
