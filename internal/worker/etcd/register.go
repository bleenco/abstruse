package etcd

import (
	"context"
	"fmt"
	"net"
	"path"

	"github.com/jkuri/abstruse/internal/pkg/shared"
	"github.com/jkuri/abstruse/internal/pkg/util"
	"go.etcd.io/etcd/clientv3"
)

// Register etcd service registration.
func Register(cli *clientv3.Client, addr string, ttl int64) (<-chan *clientv3.LeaseKeepAliveResponse, error) {
	_, port, err := net.SplitHostPort(addr)
	if err != nil {
		return nil, err
	}

	serviceValue := fmt.Sprintf("%s:%s", util.GetLocalIP4(), port)
	serviceKey := path.Join(shared.ServicePrefix, shared.WorkerService, serviceValue)

	resp, err := cli.Grant(context.TODO(), ttl)
	if err != nil {
		return nil, fmt.Errorf("grpclb: create clientv3 lease failed: %v", err)
	}

	if _, err := cli.Put(context.TODO(), serviceKey, serviceValue, clientv3.WithLease(resp.ID)); err != nil {
		return nil, fmt.Errorf("grpclb: set service '%s' with ttl to clientv3 failed: %s", shared.WorkerService, err.Error())
	}

	kch, err := cli.KeepAlive(context.TODO(), resp.ID)
	if err != nil {
		return nil, fmt.Errorf("grpclb: refresh service '%s' with ttl to clientv3 failed: %s", shared.WorkerService, err.Error())
	}

	return kch, nil
}
