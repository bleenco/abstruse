package etcdutil

import (
	"strings"
	"time"

	"go.etcd.io/etcd/clientv3"
)

// NewClient returns new etcd client.
func NewClient(target string) (*clientv3.Client, error) {
	return clientv3.New(clientv3.Config{
		Endpoints:   strings.Split(target, ","),
		DialTimeout: 5 * time.Second,
	})
}
