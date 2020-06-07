package app

import (
	"time"

	"github.com/cenkalti/backoff/v4"
	"github.com/jkuri/abstruse/internal/pkg/etcdutil"
	"go.etcd.io/etcd/clientv3"
)

func (app *App) connect() error {
	c := func() error {
		app.logger.Sugar().Infof("connecting to abstruse etcd server %s...", app.opts.Etcd.Addr)
		var err error
		if app.client, err = app.getClient(); err != nil {
			app.logger.Sugar().Errorf(
				"could not connect to abstruse server %s (%s), retrying...",
				app.opts.Etcd.Addr, err.Error(),
			)
			return err
		}
		app.ready <- struct{}{}
		rs := etcdutil.NewRegisterService(app.client, app.id, app.addr, 5, app.logger)
		if err := rs.Register(); err != nil {
			app.logger.Sugar().Errorf("error registering service on abstruse server")
			return err
		}
		return nil
	}
	err := backoff.Retry(c, backoff.NewConstantBackOff(5*time.Second))
	return err
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
