package app

import (
	"time"

	"github.com/jkuri/abstruse/pkg/etcd/client"
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
			app.logger.Errorf("connection to abstruse server %s failed: %v, reconnecting...", app.opts.Etcd.Addr, err)
			time.Sleep(b.Duration())
			continue
		}
		b.Reset()
		if err := app.register(); err != nil {
			app.logger.Errorf("failed to register to abstruse server: %v", err)
			continue
		}
		app.logger.Infof("connected to abstruse server %s", app.opts.Etcd.Addr)
		break
	}
}

func (app *App) register() error {
	rs := client.NewRegisterService(app.client, app.id, app.addr, 5)
	return rs.Register()
}

func (app *App) getClient() (*clientv3.Client, error) {
	config := client.ClientConfig{
		Target:      app.opts.Etcd.Addr,
		DialTimeout: 3 * time.Second,
	}
	if app.opts.Etcd.Username != "" && app.opts.Etcd.Password != "" {
		config.Username, config.Password = app.opts.Etcd.Username, app.opts.Etcd.Password
	}
	if app.opts.TLS.Cert != "" && app.opts.TLS.Key != "" {
		config.Cert, config.Key = app.opts.TLS.Cert, app.opts.TLS.Key
	}

	return client.NewClient(config)
}
