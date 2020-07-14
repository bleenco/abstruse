package cmd

import (
	"fmt"
	"os"

	"github.com/bleenco/abstruse/internal/version"
	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/worker/core"
	"github.com/spf13/cobra"
)

var (
	cfgFile string
	rootCmd = &cobra.Command{
		Use:   "abstruse-worker",
		Short: "Abstruse CI worker node",
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

// Execute executes the root command.
func Execute() error {
	return rootCmd.Execute()
}

func run() error {
	return nil
}

func init() {
	rootCmd.AddCommand(versionCmd)
	cobra.OnInitialize(core.InitConfig, core.InitTLS, core.InitAuthentication)

	rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file (default is $HOME/abstruse/abstruse-worker.json)")
	rootCmd.PersistentFlags().String("grpc-listenaddr", "0.0.0.0:3330", "gRPC server listen address")
	rootCmd.PersistentFlags().String("tls-cert", "cert.pem", "path to SSL certificate file")
	rootCmd.PersistentFlags().String("tls-key", "key.pem", "path to SSL private key file")
	rootCmd.PersistentFlags().String("etcd-addr", "127.0.0.1:2379", "etcd server address to connect")
	rootCmd.PersistentFlags().String("etcd-username", "abstruse", "etcd server username")
	rootCmd.PersistentFlags().String("etcd-password", "abstruse", "etcd server password")
	rootCmd.PersistentFlags().Int("scheduler-maxparallel", 5, "scheduler max parallel option defines how many jobs can run in parallel")
	rootCmd.PersistentFlags().String("auth-jwtsecret", lib.RandomString(), "JWT authentication secret key")
	rootCmd.PersistentFlags().String("log-level", "info", "logging level (available options: debug, info, warn, error, panic, fatal)")
	rootCmd.PersistentFlags().Bool("log-stdout", true, "print logs to stdout")
	rootCmd.PersistentFlags().String("log-filename", "abstruse-server.log", "log filename")
	rootCmd.PersistentFlags().Int("log-max-size", 500, "maximum log file size (in MB)")
	rootCmd.PersistentFlags().Int("log-max-backups", 3, "maximum log file backups")
	rootCmd.PersistentFlags().Int("log-max-age", 3, "maximum log age")

	core.InitDefaults(rootCmd, cfgFile)
}

func fatal(msg interface{}) {
	fmt.Println(msg)
	os.Exit(1)
}
