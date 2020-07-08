package cmd

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/ractol/ractol/pkg/lib"
	"github.com/ractol/ractol/server/api"
	"github.com/ractol/ractol/server/core"
	"github.com/spf13/cobra"
)

var (
	cfgFile string
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
	server := api.NewServer(core.Config, core.Log)
	errch := make(chan error, 1)
	sigch := make(chan os.Signal, 1)

	core.InitDB()

	go func() {
		if err := server.Run(); err != nil {
			errch <- err
		}
	}()

	go func() {
		signal.Notify(sigch, syscall.SIGINT, syscall.SIGTERM)
		<-sigch
		errch <- server.Close()
	}()

	return <-errch
}

func init() {
	cobra.OnInitialize(core.InitConfig, core.InitTLS, core.InitAuthentication)

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

	core.InitDefaults(rootCmd, cfgFile)
}

func fatal(msg interface{}) {
	fmt.Println(msg)
	os.Exit(1)
}
