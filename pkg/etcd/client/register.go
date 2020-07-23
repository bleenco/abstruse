package client

import (
	"context"
	"fmt"
	"path"
	"time"

	"github.com/bleenco/abstruse/internal/common"
	"go.etcd.io/etcd/clientv3"
)

// RegisterService worker register service.
type RegisterService struct {
	key     string
	val     string
	client  *clientv3.Client
	ttl     int64
	leaseid clientv3.LeaseID
	stopch  chan error
}

// NewRegisterService returns new RegisterService instance.
func NewRegisterService(client *clientv3.Client, id, addr string, ttl int64) *RegisterService {
	key := path.Clean(path.Join(common.WorkerService, id))
	return &RegisterService{
		key:    key,
		val:    addr,
		client: client,
		ttl:    ttl,
		stopch: make(chan error),
	}
}

// Register tries to register worker service on remote etcd server.
func (rs *RegisterService) Register() error {
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
				return fmt.Errorf("lost connection")
			}
			return nil
		}
	}
}

// Stop deregister from remote worker etcd service.
func (rs *RegisterService) Stop() {
	rs.stopch <- nil
}

func (rs *RegisterService) keepAlive() (<-chan *clientv3.LeaseKeepAliveResponse, error) {
	resp, err := rs.client.Grant(context.TODO(), rs.ttl)
	if err != nil {
		return nil, err
	}
	_, err = rs.client.Put(context.TODO(), rs.key, rs.val, clientv3.WithLease(resp.ID))
	if err != nil {
		return nil, err
	}
	rs.leaseid = resp.ID
	return rs.client.KeepAlive(context.TODO(), resp.ID)
}

func (rs *RegisterService) revoke() error {
	ctx, cancel := context.WithTimeout(context.TODO(), time.Second)
	defer cancel()
	_, err := rs.client.Revoke(ctx, rs.leaseid)
	return err
}
