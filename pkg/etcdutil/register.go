package etcdutil

import (
	"context"
	"fmt"
	"log"
	"net"
	"path"

	"github.com/jkuri/abstruse/pkg/logger"
	"go.etcd.io/etcd/clientv3"
)

// Register etcd service registration.
func Register(cli *clientv3.Client, addr string, ttl int64, log *logger.Logger) (<-chan *clientv3.LeaseKeepAliveResponse, error) {
	host, port, err := net.SplitHostPort(addr)
	if err != nil {
		return nil, err
	}

	serviceValue := fmt.Sprintf("%s:%s", host, port)
	serviceKey := path.Join(ServicePrefix, WorkerService, serviceValue)

	resp, err := cli.Grant(context.TODO(), ttl)
	if err != nil {
		return nil, fmt.Errorf("grpclb: create clientv3 lease failed: %v", err)
	}

	if _, err := cli.Put(context.TODO(), serviceKey, serviceValue, clientv3.WithLease(resp.ID)); err != nil {
		return nil, fmt.Errorf("grpclb: set service '%s' with ttl to clientv3 failed: %s", WorkerService, err.Error())
	}

	kch, err := cli.KeepAlive(context.TODO(), resp.ID)
	if err != nil {
		return nil, fmt.Errorf("grpclb: refresh service '%s' with ttl to clientv3 failed: %s", WorkerService, err.Error())
	}

	return kch, nil
}

func getOutboundIP() string {
	conn, err := net.Dial("udp", "8.8.8.8:80")
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close()

	localAddr := conn.LocalAddr().(*net.UDPAddr)
	return localAddr.IP.String()
}
