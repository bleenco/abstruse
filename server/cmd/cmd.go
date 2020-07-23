package cmd

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/bleenco/abstruse/internal/version"
	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/server/api"
	"github.com/bleenco/abstruse/server/core"
	"github.com/spf13/cobra"
)

var (
	cfgFile string
	rootCmd = &cobra.Command{
		Use:   "abstruse-server",
		Short: "Abstruse CI server",
		Run: func(cmd *cobra.Command, args []string) {
			if err := run(); err != nil {
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

// Execute exetuces the root command.
func Execute() error {
	return rootCmd.Execute()
}

func run() error {
	app := core.NewApp()
	api := api.NewServer(core.Config, core.Log, app)
	errch := make(chan error, 1)
	sigch := make(chan os.Signal, 1)

	core.InitDB()

	go func() {
		if err := api.Run(); err != nil {
			errch <- err
		}
	}()

	go func() {
		if err := app.Run(); err != nil {
			errch <- err
		}
	}()

	go func() {
		signal.Notify(sigch, syscall.SIGINT, syscall.SIGTERM, syscall.SIGHUP, syscall.SIGQUIT)
		<-sigch
		errch <- api.Close()
	}()

	return <-errch
}

func init() {
	rootCmd.AddCommand(versionCmd)
	cobra.OnInitialize(initDefaults, core.InitConfig, core.InitTLS, core.InitAuthentication, core.InitRegistryAuthentication)

	rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file (default is $HOME/abstruse/abstruse-server.json)")
	rootCmd.PersistentFlags().String("http-addr", "0.0.0.0:80", "HTTP server listen address")
	rootCmd.PersistentFlags().String("http-uploaddir", "uploads/", "HTTP uploads directory")
	rootCmd.PersistentFlags().Bool("http-compress", false, "enable HTTP response gzip compression")
	rootCmd.PersistentFlags().String("websocket-addr", "127.0.0.1:2220", "WebSocket server listen address")
	rootCmd.PersistentFlags().Bool("http-tls", false, "run HTTP server in TLS mode")
	rootCmd.PersistentFlags().String("tls-cert", "cert.pem", "path to SSL certificate file")
	rootCmd.PersistentFlags().String("tls-key", "key.pem", "path to SSL private key file")
	rootCmd.PersistentFlags().String("db-driver", "mysql", "database client (available options: mysql, postgres, mssql)")
	rootCmd.PersistentFlags().String("db-host", "localhost", "database server host address")
	rootCmd.PersistentFlags().Int("db-port", 3306, "database server port")
	rootCmd.PersistentFlags().String("db-user", "root", "database username")
	rootCmd.PersistentFlags().String("db-password", "", "database password")
	rootCmd.PersistentFlags().String("db-name", "abstruse", "database name (file name when sqlite client used)")
	rootCmd.PersistentFlags().String("db-charset", "utf8", "database charset")
	rootCmd.PersistentFlags().String("etcd-name", "abstruse-node", "etcd server instance name")
	rootCmd.PersistentFlags().String("etcd-host", "localhost", "etcd listen hostname / ip")
	rootCmd.PersistentFlags().Int("etcd-clientport", 2379, "etcd client listen port")
	rootCmd.PersistentFlags().Int("etcd-peerport", 2380, "etcd peer listen port")
	rootCmd.PersistentFlags().String("etcd-datadir", "data/", "etcd datadir path")
	rootCmd.PersistentFlags().String("etcd-username", "abstruse", "etcd username")
	rootCmd.PersistentFlags().String("etcd-password", "abstruse", "etcd password")
	rootCmd.PersistentFlags().String("etcd-rootpassword", "abstruse", "etcd root password")
	rootCmd.PersistentFlags().String("registry-datadir", "registry/", "docker image registry storage directory path")
	rootCmd.PersistentFlags().String("registry-username", "abstruse", "docker image registry username")
	rootCmd.PersistentFlags().String("registry-password", lib.RandomString(), "docker image registry password")
	rootCmd.PersistentFlags().String("registry-htpasswd", "htpasswd", "docker image registry htpasswd file path")
	rootCmd.PersistentFlags().String("auth-jwtsecret", lib.RandomString(), "JWT authentication secret key")
	rootCmd.PersistentFlags().String("auth-jwtexpiry", "15m", "JWT access token expiry time")
	rootCmd.PersistentFlags().String("auth-jwtrefreshexpiry", "1h", "JWT refresh token expiry time")
	rootCmd.PersistentFlags().String("log-level", "info", "logging level (available options: debug, info, warn, error, panic, fatal)")
	rootCmd.PersistentFlags().Bool("log-stdout", true, "print logs to stdout")
	rootCmd.PersistentFlags().String("log-filename", "abstruse-server.log", "log filename")
	rootCmd.PersistentFlags().Int("log-max-size", 500, "maximum log file size (in MB)")
	rootCmd.PersistentFlags().Int("log-max-backups", 3, "maximum log file backups")
	rootCmd.PersistentFlags().Int("log-max-age", 3, "maximum log age")
}

func initDefaults() {
	core.InitDefaults(rootCmd, cfgFile)
}

func fatal(msg interface{}) {
	fmt.Println(msg)
	os.Exit(1)
}
