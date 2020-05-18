package etcd

import (
	"context"
	"fmt"
	"net"
	"path"

	"github.com/jkuri/abstruse/internal/pkg/shared"
	"github.com/jkuri/abstruse/internal/pkg/util"
	"go.etcd.io/etcd/clientv3"
	recipe "go.etcd.io/etcd/contrib/recipes"
)

// Register etcd service registration.
func register(cli *clientv3.Client, addr string, ttl int64) (<-chan *clientv3.LeaseKeepAliveResponse, error) {
	serviceValue := getAddress(addr)
	serviceKey := path.Join(shared.ServicePrefix, shared.WorkerService, serviceValue)

	resp, err := cli.Grant(context.TODO(), ttl)
	if err != nil {
		return nil, fmt.Errorf("grpclb: create clientv3 lease failed: %v", err)
	}

	_, err = putNewKV(cli.KV, serviceKey, serviceValue, resp.ID)
	if err != nil && err == recipe.ErrKeyExists {
		uerr := unregister(cli, addr)
		if uerr == nil {
			return register(cli, addr, ttl)
		} else {
			return nil, fmt.Errorf("could not unregister")
		}
	}

	// if _, err := cli.Put(context.TODO(), serviceKey, serviceValue, clientv3.WithLease(resp.ID)); err != nil {
	// 	return nil, fmt.Errorf("grpclb: set service '%s' with ttl to clientv3 failed: %s", shared.WorkerService, err.Error())
	// }

	kch, err := cli.KeepAlive(context.TODO(), resp.ID)
	if err != nil {
		return nil, fmt.Errorf("grpclb: refresh service '%s' with ttl to clientv3 failed: %s", shared.WorkerService, err.Error())
	}

	return kch, nil
}

func unregister(cli *clientv3.Client, addr string) error {
	if cli != nil {
		serviceValue := getAddress(addr)
		serviceKey := path.Join(shared.ServicePrefix, shared.WorkerService, serviceValue)
		_, err := cli.Delete(context.Background(), serviceKey)
		return err
	}
	return fmt.Errorf("invalid client connection")
}

func getAddress(addr string) string {
	_, port, err := net.SplitHostPort(addr)
	if err != nil {
		return addr
	}
	return fmt.Sprintf("%s:%s", util.GetLocalIP4(), port)
}
