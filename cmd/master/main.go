package main

import (
	"flag"
	"fmt"
	"log"
	"os"

	"github.com/jkuri/abstruse/master/core"
	"github.com/jkuri/abstruse/master/etcdserver"
	"github.com/jkuri/abstruse/master/httpserver"
	"github.com/jkuri/abstruse/master/rpc"
	"github.com/jkuri/abstruse/pkg/version"
)

var (
	configPath  = flag.String("config", "docs/config/master.json", "config path")
	etcdname    = flag.String("etcd-name", "abstruse", "Etcd cluster name")
	etcdhost    = flag.String("etcd-host", "0.0.0.0", "Etcd listen host")
	etcdcport   = flag.Int("etcd-cport", 2379, "Etcd client listen port")
	etcdpport   = flag.Int("etcd-pport", 2380, "Etcd peer listen port")
	etcddatadir = flag.String("etcd-data-dir", "/var/tmp/etcd-data", "Etcd data directory")
	versionflag = flag.Bool("version", false, "version")
)

func main() {
	flag.Parse()

	if *versionflag {
		fmt.Printf("%s\n", version.GenerateBuildVersionString())
		os.Exit(0)
	}

	cfg, err := core.ReadAndParseConfig(*configPath)
	if err != nil {
		cfg = core.Config{
			HTTP: httpserver.Config{
				Host:      "0.0.0.0",
				HTTPPort:  "80",
				HTTPSPort: "443",
				Cert:      "/var/tmp/abstruse-master/cert.pem",
				Key:       "/var/tmp/abstruse-master/key.pem",
			},
			Etcd: etcdserver.Config{
				Name:       *etcdname,
				Host:       *etcdhost,
				ClientPort: *etcdcport,
				PeerPort:   *etcdpport,
				DataDir:    *etcddatadir,
				Cert:       "/var/tmp/abstruse-master/cert.pem",
				Key:        "/var/tmp/abstruse-master/key.pem",
			},
			GRPC: rpc.Config{
				Cert: "/var/tmp/abstruse-master/cert.pem",
				Key:  "/var/tmp/abstruse-master/key.pem",
			},
			LogLevel: "debug",
		}
	}

	app, err := core.NewApp(cfg)
	if err != nil {
		log.Fatal(err)
	}

	if err := app.Run(); err != nil {
		log.Fatal(err)
	}
}
