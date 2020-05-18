package etcd

import (
	"context"
	"fmt"
	"net"
	"path"
	"time"

	"go.uber.org/zap"

	"github.com/jkuri/abstruse/internal/pkg/shared"
	"github.com/jkuri/abstruse/internal/pkg/util"
	"go.etcd.io/etcd/clientv3"
)

type regService struct {
	key     string
	val     string
	client  *clientv3.Client
	ttl     int64
	leaseid clientv3.LeaseID
	logger  *zap.SugaredLogger
	stopch  chan error
}

func newRegisterService(client *clientv3.Client, addr string, ttl int64, logger *zap.SugaredLogger) *regService {
	val := getAddress(addr)
	key := path.Join(shared.ServicePrefix, shared.WorkerService, val)
	return &regService{
		key:    key,
		val:    val,
		client: client,
		ttl:    ttl,
		logger: logger,
		stopch: make(chan error),
	}
}

func (rs *regService) register() error {
	ch, err := rs.keepAlive()
	if err != nil {
		return err
	}

	for {
		select {
		case err := <-rs.stopch:
			rs.revoke()
			return err
		case <-rs.client.Ctx().Done():
			return fmt.Errorf("server closed")
		case _, ok := <-ch:
			if !ok {
				rs.revoke()
				return fmt.Errorf("keep-alive channel closed")
			}
		}
	}
}

func (rs *regService) stop() {
	rs.stopch <- nil
}

func (rs *regService) keepAlive() (<-chan *clientv3.LeaseKeepAliveResponse, error) {
	resp, err := rs.client.Grant(context.TODO(), rs.ttl)
	if err != nil {
		return nil, err
	}
	_, err = rs.client.Put(context.TODO(), rs.key, rs.val, clientv3.WithLease(resp.ID))
	if err != nil {
		return nil, err
	}
	rs.logger.Infof("connection to abstruse etcd server successful")
	rs.leaseid = resp.ID
	return rs.client.KeepAlive(context.TODO(), resp.ID)
}

func (rs *regService) revoke() error {
	ctx, cancel := context.WithTimeout(context.TODO(), time.Second)
	defer cancel()
	_, err := rs.client.Revoke(ctx, rs.leaseid)
	return err
}

func getAddress(addr string) string {
	_, port, err := net.SplitHostPort(addr)
	if err != nil {
		return addr
	}
	return fmt.Sprintf("%s:%s", util.GetLocalIP4(), port)
}
