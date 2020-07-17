package core

import (
	"time"

	"github.com/bleenco/abstruse/pkg/etcd/client"
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
			app.logger.Errorf("connection to abstruse server %s failed: %v, reconnecting...", app.cfg.Etcd.Addr, err)
			time.Sleep(b.Duration())
			continue
		}
		b.Reset()
		if err := app.register(); err != nil {
			app.logger.Errorf("failed to register to abstruse server: %v", err)
			continue
		}
		app.logger.Infof("connected to abstruse server %s", app.cfg.Etcd.Addr)
		break
	}
}

func (app *App) register() error {
	rs := client.NewRegisterService(app.client, app.id, app.addr, 5)
	return rs.Register()
}

func (app *App) getClient() (*clientv3.Client, error) {
	config := client.ClientConfig{
		Target:      app.cfg.Etcd.Addr,
		DialTimeout: 3 * time.Second,
	}
	if app.cfg.Etcd.Username != "" && app.cfg.Etcd.Password != "" {
		config.Username, config.Password = app.cfg.Etcd.Username, app.cfg.Etcd.Password
	}
	if app.cfg.TLS.Cert != "" && app.cfg.TLS.Key != "" {
		config.Cert, config.Key = app.cfg.TLS.Cert, app.cfg.TLS.Key
	}

	return client.NewClient(config)
}
