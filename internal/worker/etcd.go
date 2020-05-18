package worker

import (
	"github.com/cenkalti/backoff/v4"
	"github.com/jkuri/abstruse/internal/pkg/etcd"
	"go.etcd.io/etcd/clientv3"
	"go.uber.org/zap"
)

func (app *App) connLoop(logger *zap.SugaredLogger) {
	conn := func() (*clientv3.Client, <-chan *clientv3.LeaseKeepAliveResponse, error) {
		cli, err := etcd.NewClient(app.opts.ServerAddr)
		if err != nil {
			app.logger.Infof("connection to abstruse etcd server %s failed, will retry...", app.opts.ServerAddr)
			return nil, nil, err
		}

		kch, err := etcd.Register(cli, app.opts.GRPC.Addr, 5)
		if err != nil {
			return nil, nil, err
		}
		return cli, kch, nil
	}

retry:
	dch := make(chan struct{})
	ticker := backoff.NewTicker(backoff.NewExponentialBackOff())
	for range ticker.C {
		cli, kch, err := conn()
		if err != nil {
			continue
		}
		app.logger.Infof("connected to abstruse etcd server %s", app.opts.ServerAddr)

		go func() {
			for {
				select {
				case <-cli.Ctx().Done():
					dch <- struct{}{}
					app.logger.Infof("lost connection to abstruse etcd server %s", app.opts.ServerAddr)
					return
				case _, ok := <-kch:
					if !ok {
						dch <- struct{}{}
						app.logger.Infof("lost connection to abstruse etcd server %s", app.opts.ServerAddr)
						return
					}
				}
			}
		}()

		ticker.Stop()
		break
	}

	for {
		<-dch
		goto retry
	}
}
