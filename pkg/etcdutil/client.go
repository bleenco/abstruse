package etcdutil

import (
	"strings"
	"time"

	"go.etcd.io/etcd/clientv3"
	"go.etcd.io/etcd/pkg/logutil"
	"go.uber.org/zap"
)

// NewClient returns new etcd client.
func NewClient(target string) (*clientv3.Client, error) {
	lcfg := logutil.DefaultZapLoggerConfig
	lcfg.Level = zap.NewAtomicLevelAt(zap.ErrorLevel)

	return clientv3.New(clientv3.Config{
		Endpoints:   strings.Split(target, ","),
		DialTimeout: 5 * time.Second,
		LogConfig:   &lcfg,
	})
}
