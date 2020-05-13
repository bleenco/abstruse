package app

import (
	"context"
	"fmt"
	"path"

	"github.com/jkuri/abstruse/master/etcdserver"
	"github.com/jkuri/abstruse/master/rpc"
	"github.com/jkuri/abstruse/pkg/etcdutil"
	"github.com/jkuri/abstruse/pkg/logger"
	"go.etcd.io/etcd/clientv3"
	"go.etcd.io/etcd/mvcc/mvccpb"
)

// App represents main master application instance.
type App struct {
	Etcd    *etcdserver.EtcdServer
	Workers map[string]*rpc.Client
	config  Config
	etcdcli *clientv3.Client
	done    chan struct{}
}

// NewApp returns instance of main master application.
func NewApp(config Config) (*App, error) {
	etcd, err := etcdserver.NewEtcdServer(context.Background(), config.Etcd, logger.NewLogger("etcd", config.LogLevel))
	if err != nil {
		return nil, err
	}
	etcdcli := etcd.Client()

	return &App{
		Etcd:    etcd,
		Workers: make(map[string]*rpc.Client),
		etcdcli: etcdcli,
		config:  config,
		done:    make(chan struct{}),
	}, nil
}

// Run starts master applicaton instance.
func (app *App) Run() error {
	go func() {
		prefix := path.Join(etcdutil.ServicePrefix, etcdutil.WorkerService)
		rch := app.etcdcli.Watch(context.Background(), prefix, clientv3.WithPrefix())
		for n := range rch {
			for _, ev := range n.Events {
				switch ev.Type {
				case mvccpb.PUT:
					// addrDict[string(ev.Kv.Key)] = resolver.Address{Addr: string(ev.Kv.Value)}
					client, err := rpc.NewClient(string(ev.Kv.Value), app.config.GRPC, app.config.LogLevel)
					if err != nil {
						fmt.Printf("error: %v\n", err)
						continue
					}
					app.Workers[string(ev.Kv.Key)] = client
					go client.Run()
				case mvccpb.DELETE:
					// delete(addrDict, string(ev.PrevKv.Key))
					delete(app.Workers, string(ev.Kv.Key))
				}
			}
		}

	}()

	return nil
}

// Wait returns done channel.
func (app *App) Wait() {
	<-app.done
}
