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

const WorkerService = "workers"

// Register etcd service registration.
func Register(target, addr string, ttl int64, log *logger.Logger) error {
	_, port, err := net.SplitHostPort(addr)
	if err != nil {
		return err
	}

	serviceValue := fmt.Sprintf("%s:%s", getOutboundIP(), port)
	serviceKey := path.Join(ServicePrefix, WorkerService, serviceValue)

	cli, err := NewClient(target)
	if err != nil {
		return err
	}

	resp, err := cli.Grant(context.TODO(), ttl)
	if err != nil {
		return fmt.Errorf("grpclb: create clientv3 lease failed: %v", err)
	}

	if _, err := cli.Put(context.TODO(), serviceKey, serviceValue, clientv3.WithLease(resp.ID)); err != nil {
		return fmt.Errorf("grpclb: set service '%s' with ttl to clientv3 failed: %s", WorkerService, err.Error())
	}

	if _, err := cli.KeepAlive(context.TODO(), resp.ID); err != nil {
		return fmt.Errorf("grpclb: refresh service '%s' with ttl to clientv3 failed: %s", WorkerService, err.Error())
	}

	return nil
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
