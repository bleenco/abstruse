package client

import (
	"strings"
	"time"

	"go.etcd.io/etcd/clientv3"
	"go.etcd.io/etcd/pkg/logutil"
	"go.etcd.io/etcd/pkg/transport"
	"go.uber.org/zap"
	"google.golang.org/grpc"
)

// ClientConfig options.
type ClientConfig struct {
	Target      string
	Username    string
	Password    string
	Cert        string
	Key         string
	DialTimeout time.Duration
}

// NewClient returns new etcd client.
func NewClient(c ClientConfig) (*clientv3.Client, error) {
	lcfg := logutil.DefaultZapLoggerConfig
	lcfg.Level = zap.NewAtomicLevelAt(zap.ErrorLevel)
	cfg := clientv3.Config{
		Endpoints:   strings.Split(c.Target, ","),
		DialTimeout: c.DialTimeout,
		DialOptions: []grpc.DialOption{grpc.WithBlock()},
		LogConfig:   &lcfg,
	}
	if c.Username != "" && c.Password != "" {
		cfg.Username, cfg.Password = c.Username, c.Password
	}
	if c.Cert != "" && c.Key != "" {
		tlsInfo := transport.TLSInfo{
			CertFile:       c.Cert,
			KeyFile:        c.Key,
			ClientCertAuth: false,
		}
		tlsConfig, err := tlsInfo.ClientConfig()
		if err != nil {
			return nil, err
		}
		tlsConfig.InsecureSkipVerify = true
		cfg.TLS = tlsConfig
	}

	return clientv3.New(cfg)
}

// type credentials struct {
// 	Username, Password string
// }

// func (c *credentials) GetRequestMetadata(context.Context, ...string) (map[string]string, error) {
// 	return map[string]string{
// 		"username": c.Username,
// 		"password": c.Password,
// 	}, nil
// }

// func (c *credentials) RequireTransportSecurity() bool {
// 	return true
// }
