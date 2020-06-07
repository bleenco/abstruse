package etcd

import (
	"context"
	"fmt"
	"net/url"
	"path"
	"time"

	"github.com/jkuri/abstruse/internal/pkg/shared"
	"go.etcd.io/etcd/clientv3"
	"go.etcd.io/etcd/embed"
	"go.etcd.io/etcd/etcdserver/api/v3client"
	"go.etcd.io/etcd/etcdserver/api/v3compactor"
	"go.etcd.io/etcd/pkg/transport"
	"go.uber.org/zap"
)

// Server represents etcd embedded server.
type Server struct {
	opts   *Options
	logger *zap.SugaredLogger
	server *embed.Etcd
	cli    *clientv3.Client
	ready  chan bool
}

// NewServer returns new etcd server instance.
func NewServer(opts *Options, logger *zap.Logger) *Server {
	return &Server{
		opts:   opts,
		logger: logger.With(zap.String("type", "etcd")).Sugar(),
		ready:  make(chan bool),
	}
}

// Start starts the etcd server.
func (s *Server) Start() error {
	var err error
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*time.Duration(5))
	defer cancel()

	cfg := embed.NewConfig()

	cfg.Name = s.opts.Name
	cfg.Dir = s.opts.DataDir
	cfg.LogLevel = "error"
	curl := url.URL{Scheme: "https", Host: fmt.Sprintf("%s:%d", s.opts.Host, s.opts.ClientPort)}
	cfg.ACUrls, cfg.LCUrls = []url.URL{curl}, []url.URL{curl}

	purl := url.URL{Scheme: "https", Host: fmt.Sprintf("%s:%d", s.opts.Host, s.opts.PeerPort)}
	cfg.APUrls, cfg.LPUrls = []url.URL{purl}, []url.URL{purl}

	cfg.InitialCluster = fmt.Sprintf("%s=%s", cfg.Name, cfg.APUrls[0].String())

	cfg.AutoCompactionMode = v3compactor.ModePeriodic
	cfg.AutoCompactionRetention = "1h" // every hour

	// cfg.ClientAutoTLS = true
	// cfg.PeerAutoTLS = true

	tlsInfo := transport.TLSInfo{
		CertFile:           s.opts.Cert,
		KeyFile:            s.opts.Key,
		InsecureSkipVerify: true,
	}
	cfg.ClientTLSInfo = tlsInfo
	cfg.PeerTLSInfo = tlsInfo

	s.server, err = embed.StartEtcd(cfg)
	if err != nil {
		return err
	}
	select {
	case <-s.server.Server.ReadyNotify():
		err = nil
	case err = <-s.server.Err():
	case <-s.server.Server.StopNotify():
		err = fmt.Errorf("received from etcdserver.Server.StopNotify")
	case <-ctx.Done():
		err = ctx.Err()
	}
	if err != nil {
		return err
	}
	s.logger.Infof("started etcd server %s on %s", cfg.Name, curl.String())

	s.cli = v3client.New(s.server.Server)
	// target := net.JoinHostPort(s.opts.Host, fmt.Sprintf("%d", s.opts.ClientPort))
	// s.cli, err = etcdutil.NewClient(
	// 	target,
	// 	s.opts.Username,
	// 	s.opts.Password,
	// 	s.opts.Cert,
	// 	s.opts.Key,
	// )
	// if err != nil {
	// 	return err
	// }

	// if err := s.authEnable(); err != nil {
	// 	s.logger.Errorf("%v\n", err)
	// 	return err
	// }
	s.ready <- true
	return nil
}

// Client returns etcd client.
func (s *Server) Client() *clientv3.Client {
	if s.cli == nil {
		<-s.ready
	}
	return s.cli
}

func (s *Server) cleanup() {
	workersPrefix := path.Join(shared.ServicePrefix, shared.WorkerService)
	s.cli.Delete(context.TODO(), workersPrefix, clientv3.WithFromKey())
}

// this is required since s.Client.Auth make etcd embed server crash.
// func (s *Server) authEnable() error {
// 	target := net.JoinHostPort(s.opts.Host, fmt.Sprintf("%d", s.opts.ClientPort))
// 	client, err := etcdutil.NewClient(target, s.opts.Username, s.opts.Password, s.opts.Cert, s.opts.Key)
// 	if err != nil {
// 		return err
// 	}
// 	_, err = client.RoleAdd(context.TODO(), s.opts.Username)
// 	if err != nil {
// 		if strings.HasSuffix(err.Error(), "role name already exists") {
// 			goto enable
// 		}
// 		return err
// 	}
// 	if _, err = client.UserAdd(context.TODO(), s.opts.Username, s.opts.Password); err != nil {
// 		return err
// 	}
// 	if _, err = client.UserGrantRole(context.TODO(), s.opts.Username, s.opts.Username); err != nil {
// 		return err
// 	}
// enable:
// 	resp, err := client.AuthStatus(context.TODO())
// 	if err != nil {
// 		return err
// 	}
// 	if !resp.Enabled {
// 		_, err = client.AuthEnable(context.TODO())
// 		if err != nil {
// 			return err
// 		}
// 	}
// 	return nil
// }
