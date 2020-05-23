package etcdutil

import (
	"strings"
	"time"

	"go.etcd.io/etcd/clientv3"
	"go.etcd.io/etcd/pkg/logutil"
	"go.uber.org/zap"
	"google.golang.org/grpc"
)

// NewClient returns new etcd client.
func NewClient(target, username, password, cert, key string) (*clientv3.Client, error) {
	lcfg := logutil.DefaultZapLoggerConfig
	lcfg.Level = zap.NewAtomicLevelAt(zap.ErrorLevel)
	// tlsInfo := transport.TLSInfo{
	// 	CertFile:       cert,
	// 	KeyFile:        key,
	// 	ClientCertAuth: true,
	// }
	// tlsConfig, err := tlsInfo.ClientConfig()
	// if err != nil {
	// 	return nil, err
	// }
	// tlsConfig.InsecureSkipVerify = true

	return clientv3.New(clientv3.Config{
		Endpoints:   strings.Split(target, ","),
		DialTimeout: 5 * time.Second,
		DialOptions: []grpc.DialOption{
			grpc.WithBlock(),
		},
		LogConfig: &lcfg,
		Username:  username,
		Password:  password,
		// TLS:       tlsConfig,
	})
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
