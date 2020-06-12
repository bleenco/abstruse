package etcdutil

import (
	"context"
	"fmt"
	"net"
	"path"
	"time"

	"github.com/jkuri/abstruse/internal/pkg/shared"
	"github.com/jkuri/abstruse/internal/pkg/util"
	"go.etcd.io/etcd/clientv3"
)

// RegService worker register service.
type RegService struct {
	key     string
	val     string
	client  *clientv3.Client
	ttl     int64
	leaseid clientv3.LeaseID
	stopch  chan error
}

// NewRegisterService returns new RegService instance.
func NewRegisterService(client *clientv3.Client, id, addr string, ttl int64) *RegService {
	val := getAddress(addr)
	key := path.Clean(path.Join(shared.WorkerService, id))
	return &RegService{
		key:    key,
		val:    val,
		client: client,
		ttl:    ttl,
		stopch: make(chan error),
	}
}

// Register tries to register worker service on remote etcd server.
func (rs *RegService) Register() error {
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
func (rs *RegService) Stop() {
	rs.stopch <- nil
}

func (rs *RegService) keepAlive() (<-chan *clientv3.LeaseKeepAliveResponse, error) {
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

func (rs *RegService) revoke() error {
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
	ip, _ := util.GetExternalIP()
	return fmt.Sprintf("%s:%s", ip, port)
}
