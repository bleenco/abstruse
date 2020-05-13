package etcdserver

import (
	"context"
	"fmt"
	"log"
	"net/url"

	"github.com/jkuri/abstruse/pkg/config"
	"go.etcd.io/etcd/clientv3"
	"go.etcd.io/etcd/embed"
	"go.etcd.io/etcd/etcdserver/api/v3client"
	"go.etcd.io/etcd/etcdserver/api/v3compactor"
)

type EtcdServer struct {
	server *embed.Etcd
	cli    *clientv3.Client
}

func NewEtcdServer(ctx context.Context, config config.EtcdConfig) (*EtcdServer, error) {
	cfg := embed.NewConfig()

	cfg.Name = config.Name
	cfg.Dir = config.DataDir

	cfg.LogLevel = "error"

	curl := url.URL{Scheme: "http", Host: fmt.Sprintf("%s:%d", config.Host, config.ClientPort)}
	cfg.ACUrls, cfg.LCUrls = []url.URL{curl}, []url.URL{curl}

	purl := url.URL{Scheme: "http", Host: fmt.Sprintf("%s:%d", config.Host, config.PeerPort)}
	cfg.APUrls, cfg.LPUrls = []url.URL{purl}, []url.URL{purl}

	cfg.InitialCluster = fmt.Sprintf("%s=%s", cfg.Name, cfg.APUrls[0].String())

	cfg.AutoCompactionMode = v3compactor.ModePeriodic
	cfg.AutoCompactionRetention = "1h" // every hour

	log.Printf("starting %q with endpoint %q", cfg.Name, curl.String())
	server, err := embed.StartEtcd(cfg)
	if err != nil {
		return nil, err
	}
	select {
	case <-server.Server.ReadyNotify():
		err = nil
	case err = <-server.Err():
	case <-server.Server.StopNotify():
		err = fmt.Errorf("received from etcdserver.Server.StopNotify")
	case <-ctx.Done():
		err = ctx.Err()
	}
	if err != nil {
		return nil, err
	}
	log.Printf("started %q with endpoint %q", cfg.Name, curl.String())

	cli := v3client.New(server.Server)
	return &EtcdServer{server, cli}, nil
}

func (es *EtcdServer) Stop() {
	log.Printf("stopping an embedded etcd server")
	es.server.Close()
	log.Printf("stopped an embedded etcd server")
}

func (es *EtcdServer) Client() *clientv3.Client {
	return es.cli
}
