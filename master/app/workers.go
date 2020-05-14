package app

import (
	"context"
	"path"

	"github.com/jkuri/abstruse/master/rpc"
	"github.com/jkuri/abstruse/pkg/etcdutil"
	"go.etcd.io/etcd/clientv3"
	"go.etcd.io/etcd/mvcc/mvccpb"
)

func (app *App) watchWorkers() error {
	prefix := path.Join(etcdutil.ServicePrefix, etcdutil.WorkerService)
	rch := app.etcdcli.Watch(context.Background(), prefix, clientv3.WithPrefix())
	for n := range rch {
		for _, ev := range n.Events {
			switch ev.Type {
			case mvccpb.PUT:
				client, err := rpc.NewClient(string(ev.Kv.Value), app.config.GRPC, app.config.LogLevel)
				if err != nil {
					return err
				}
				app.workers[string(ev.Kv.Key)] = client
				go client.Run()
			case mvccpb.DELETE:
				delete(app.workers, string(ev.Kv.Key))
			}
		}
	}
	return nil
}
