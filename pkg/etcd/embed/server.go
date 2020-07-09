package embed

import (
	"context"
	"fmt"
	"net"
	"net/url"
	"time"

	"github.com/bleenco/abstruse/pkg/etcd/client"
	"github.com/bleenco/abstruse/server/config"
	"go.etcd.io/etcd/clientv3"
	"go.etcd.io/etcd/embed"
	"go.etcd.io/etcd/etcdserver/api/v3compactor"
	"go.etcd.io/etcd/pkg/transport"
	"go.uber.org/zap"
)

// Server represents embedded etcd server.
type Server struct {
	cfg    *config.Config
	logger *zap.SugaredLogger
	server *embed.Etcd
	cli    *clientv3.Client
}

// NewServer returns new etcd server instance.
func NewServer(cfg *config.Config, logger *zap.Logger) *Server {
	return &Server{
		cfg:    cfg,
		logger: logger.With(zap.String("type", "etcd")).Sugar(),
	}
}

// Run starts the embedded etcd server.
func (s *Server) Run() error {
	var err error
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*time.Duration(5))
	defer cancel()

	cfg := embed.NewConfig()
	scheme := "https"

	cfg.Name = s.cfg.Etcd.Name
	cfg.Dir = s.cfg.Etcd.DataDir
	cfg.Logger = "zap"
	cfg.LogLevel = "error"
	curl := url.URL{Scheme: scheme, Host: fmt.Sprintf("%s:%d", s.cfg.Etcd.Host, s.cfg.Etcd.ClientPort)}
	cfg.ACUrls, cfg.LCUrls = []url.URL{curl}, []url.URL{curl}

	purl := url.URL{Scheme: scheme, Host: fmt.Sprintf("%s:%d", s.cfg.Etcd.Host, s.cfg.Etcd.PeerPort)}
	cfg.APUrls, cfg.LPUrls = []url.URL{purl}, []url.URL{purl}

	cfg.InitialCluster = fmt.Sprintf("%s=%s", cfg.Name, cfg.APUrls[0].String())

	cfg.AutoCompactionMode = v3compactor.ModePeriodic
	cfg.AutoCompactionRetention = "1h" // every hour

	// cfg.ClientAutoTLS = true
	// cfg.PeerAutoTLS = true

	tlsInfo := transport.TLSInfo{
		CertFile:           s.cfg.TLS.Cert,
		KeyFile:            s.cfg.TLS.Key,
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

	// s.cli = v3client.New(s.server.Server)
	// s.cli.Username = s.cfg.Etcd.Username
	// s.cli.Password = s.cfg.Etcd.Password

	// if err := s.authEnable(); err != nil {
	// 	return err
	// }
	if s.cli, err = s.GetClient(); err != nil {
		return err
	}

	// s.cleanup()
	return nil
}

// Stop stops the etcd server.
func (s *Server) Stop() {
	defer s.cli.Close()
	s.Stop()
}

// GetClient returns etcd client.
func (s *Server) GetClient() (*clientv3.Client, error) {
	target := net.JoinHostPort("127.0.0.1", fmt.Sprintf("%d", s.cfg.Etcd.ClientPort))
	cfg := client.ClientConfig{
		Target:   target,
		Username: "root",
		Password: s.cfg.Etcd.RootPassword,
		Cert:     s.cfg.TLS.Cert,
		Key:      s.cfg.TLS.Key,
	}
	return client.NewClient(cfg)
}
