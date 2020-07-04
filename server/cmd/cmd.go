package cmd

import (
	"fmt"
	"os"
	"path"
	"strings"

	"github.com/ractol/ractol/pkg/fs"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var (
	cfgFile string
	rootCmd = &cobra.Command{
		Use:   "ractol-server",
		Short: "Ractol CI server",
		Run: func(cmd *cobra.Command, args []string) {

		},
	}
)

// Execute exetuces the root command.
func Execute() error {
	return rootCmd.Execute()
}

func init() {
	cobra.OnInitialize(initConfig)

	rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file (default is $HOME/ractol/ractol-server.yaml)")
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
	rootCmd.PersistentFlags().String("auth-secret", "sfd919bUYxQ", "authentication secret key (change that)")
	rootCmd.PersistentFlags().String("log-level", "info", "logging level (available options: debug, info, warn, error, panic, fatal)")
	rootCmd.PersistentFlags().Bool("log-stdout", true, "print logs to stdout")
	rootCmd.PersistentFlags().String("log-filename", "ractol-server.log", "log filename")
	rootCmd.PersistentFlags().Int("log-max-size", 500, "maximum log file size (in MB)")
	rootCmd.PersistentFlags().Int("log-max-backups", 3, "maximum log file backups")
	rootCmd.PersistentFlags().Int("log-max-age", 3, "maximum log age")

	viper.BindPFlag("httpAddr", rootCmd.PersistentFlags().Lookup("http-addr"))
	viper.BindPFlag("httpTLS", rootCmd.PersistentFlags().Lookup("http-tls"))
	viper.BindPFlag("tlsCert", rootCmd.PersistentFlags().Lookup("tls-cert"))
	viper.BindPFlag("tlsKey", rootCmd.PersistentFlags().Lookup("tls-key"))
	viper.BindPFlag("dbClient", rootCmd.PersistentFlags().Lookup("db-client"))
	viper.BindPFlag("dbHost", rootCmd.PersistentFlags().Lookup("db-host"))
	viper.BindPFlag("dbPort", rootCmd.PersistentFlags().Lookup("db-port"))
	viper.BindPFlag("dbUser", rootCmd.PersistentFlags().Lookup("db-user"))
	viper.BindPFlag("dbPassword", rootCmd.PersistentFlags().Lookup("db-password"))
	viper.BindPFlag("dbName", rootCmd.PersistentFlags().Lookup("db-name"))
	viper.BindPFlag("dbCharset", rootCmd.PersistentFlags().Lookup("db-charset"))
	viper.BindPFlag("etcdAddr", rootCmd.PersistentFlags().Lookup("etcd-addr"))
	viper.BindPFlag("etcdUsername", rootCmd.PersistentFlags().Lookup("etcd-username"))
	viper.BindPFlag("etcdPassword", rootCmd.PersistentFlags().Lookup("etcd-password"))
	viper.BindPFlag("authSecret", rootCmd.PersistentFlags().Lookup("auth-secret"))
	viper.BindPFlag("logLevel", rootCmd.PersistentFlags().Lookup("log-level"))
	viper.BindPFlag("logStdout", rootCmd.PersistentFlags().Lookup("log-stdout"))
	viper.BindPFlag("logFilename", rootCmd.PersistentFlags().Lookup("log-filename"))
	viper.BindPFlag("logMaxsize", rootCmd.PersistentFlags().Lookup("log-max-size"))
	viper.BindPFlag("logMaxbackups", rootCmd.PersistentFlags().Lookup("log-max-backups"))
	viper.BindPFlag("logMaxage", rootCmd.PersistentFlags().Lookup("log-max-age"))

	if !fs.Exists(viper.ConfigFileUsed()) {
		if err := viper.SafeWriteConfigAs(viper.ConfigFileUsed()); err != nil {
			fmt.Printf("Failed to write default config file on %s: %v", viper.ConfigFileUsed(), err)
		}
	}
}

func initConfig() {
	if cfgFile != "" {
		viper.SetConfigFile(cfgFile)
	} else {
		home, err := fs.GetHomeDir()
		if err != nil {
			fatal(err)
		}

		viper.AddConfigPath(path.Join(home, "ractol"))
		viper.SetConfigName("ractol-server")
	}

	viper.SetConfigType("yaml")
	viper.SetEnvPrefix("ractol")
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	viper.AutomaticEnv()

	if err := viper.ReadInConfig(); err == nil {
		fmt.Println("Using config file:", viper.ConfigFileUsed())
	}
}

func fatal(msg interface{}) {
	fmt.Println(msg)
	os.Exit(1)
}
