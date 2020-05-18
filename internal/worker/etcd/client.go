package etcd

import (
	"strings"
	"time"

	"go.etcd.io/etcd/clientv3"
	"go.etcd.io/etcd/pkg/logutil"
	"go.uber.org/zap"
	"google.golang.org/grpc"
)

// NewClient returns new etcd client.
func NewClient(target string) (*clientv3.Client, error) {
	lcfg := logutil.DefaultZapLoggerConfig
	lcfg.Level = zap.NewAtomicLevelAt(zap.ErrorLevel)

	return clientv3.New(clientv3.Config{
		Endpoints:   strings.Split(target, ","),
		DialTimeout: 3 * time.Second,
		DialOptions: []grpc.DialOption{grpc.WithBlock()},
		LogConfig:   &lcfg,
	})
}
