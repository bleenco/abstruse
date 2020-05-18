package grpc

import (
	"strings"
	"time"

	"go.etcd.io/etcd/clientv3"
	"go.etcd.io/etcd/pkg/logutil"
	"go.uber.org/zap"
	"google.golang.org/grpc"
)

type Client clientv3.Client

// NewClient initializes and returns new gRPC client.
func NewClient(target string) (*clientv3.Client, error) {
	lcfg := logutil.DefaultZapLoggerConfig
	lcfg.Level = zap.NewAtomicLevelAt(zap.ErrorLevel)

	return clientv3.New(clientv3.Config{
		Endpoints:   strings.Split(target, ","),
		DialTimeout: 5 * time.Second,
		DialOptions: []grpc.DialOption{grpc.WithBlock()},
		LogConfig:   &lcfg,
	})
}
