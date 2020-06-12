package app

import (
	"time"

	"github.com/jkuri/abstruse/internal/pkg/etcdutil"
	"github.com/jpillora/backoff"
	"go.etcd.io/etcd/clientv3"
)

func (app *App) connectLoop() *clientv3.Client {
	b := &backoff.Backoff{
		Min:    time.Second,
		Factor: 1,
		Max:    5 * time.Second,
		Jitter: false,
	}

	for {
		client, err := app.getClient()
		if err != nil {
			app.logger.Errorf("connection to abstruse server %s failed, reconnecting...", app.opts.Etcd.Addr)
			time.Sleep(b.Duration())
			continue
		}
		b.Reset()
		app.logger.Infof("connected to abstruse server %s", app.opts.Etcd.Addr)
		if err := app.register(client); err != nil {
			continue
		}
		return client
	}
}

func (app *App) register(client *clientv3.Client) error {
	rs := etcdutil.NewRegisterService(client, app.id, app.addr, 5)
	return rs.Register()
}

func (app *App) getClient() (*clientv3.Client, error) {
	config := etcdutil.ClientConfig{
		Target:      app.opts.Etcd.Addr,
		DialTimeout: 3 * time.Second,
	}
	if app.opts.Etcd.Username != "" && app.opts.Etcd.Password != "" {
		config.Username, config.Password = app.opts.Etcd.Username, app.opts.Etcd.Password
	}
	if app.opts.TLS.Cert != "" && app.opts.TLS.Key != "" {
		config.Cert, config.Key = app.opts.TLS.Cert, app.opts.TLS.Key
	}

	return etcdutil.NewClient(config)
}
