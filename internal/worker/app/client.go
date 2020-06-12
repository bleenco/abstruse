package app

import (
	"time"

	"github.com/jkuri/abstruse/internal/pkg/etcdutil"
	"github.com/jpillora/backoff"
	"go.etcd.io/etcd/clientv3"
)

func (app *App) connectLoop() {
	b := &backoff.Backoff{
		Min:    time.Second,
		Factor: 1,
		Max:    5 * time.Second,
		Jitter: false,
	}

	for {
		var err error
		app.client, err = app.getClient()
		if err != nil {
			app.logger.Errorf("connection to abstruse server %s failed, reconnecting...", app.opts.Etcd.Addr)
			time.Sleep(b.Duration())
			continue
		}
		b.Reset()
		if err := app.register(); err != nil {
			continue
		}
		app.logger.Infof("connected to abstruse server %s", app.opts.Etcd.Addr)
		break
	}
}

func (app *App) register() error {
	rs := etcdutil.NewRegisterService(app.client, app.id, app.addr, 5)
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
