package embed

import (
	"context"
	"fmt"
	"net"
	"net/url"
	"strings"
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

	if err := s.authEnable(); err != nil {
		return err
	}

	if s.cli, err = s.GetClient(); err != nil {
		return err
	}

	return nil
}

// Stop stops the etcd server.
func (s *Server) Stop() {
	if s.cli != nil {
		defer s.cli.Close()
	}

	s.server.Close()
}

// GetClient returns etcd client.
func (s *Server) GetClient() (*clientv3.Client, error) {
	target := net.JoinHostPort(s.cfg.Etcd.Host, fmt.Sprintf("%d", s.cfg.Etcd.ClientPort))
	cfg := client.ClientConfig{
		Target:   target,
		Username: s.cfg.Etcd.Username,
		Password: s.cfg.Etcd.Password,
		Cert:     s.cfg.TLS.Cert,
		Key:      s.cfg.TLS.Key,
	}
	return client.NewClient(cfg)
}

func (s *Server) authEnable() error {
	client, err := s.authClient()
	if err != nil {
		return err
	}
	defer client.Close()

	if _, err := client.RoleAdd(context.TODO(), "root"); err != nil {
		if strings.HasSuffix(err.Error(), "already exists") {
			goto user
		}
	}
	if _, err := client.UserAdd(context.TODO(), "root", s.cfg.Etcd.RootPassword); err != nil {
		if strings.HasSuffix(err.Error(), "already exists") {
			goto user
		}
	}
	if _, err = client.UserGrantRole(context.TODO(), "root", "root"); err != nil {
		return err
	}
user:
	_, err = client.RoleAdd(context.TODO(), s.cfg.Etcd.Username)
	if err != nil {
		if strings.HasSuffix(err.Error(), "role name already exists") {
			goto enable
		}
		return err
	}
	if _, err := client.RoleGrantPermission(
		context.TODO(),
		s.cfg.Etcd.Username,
		"/abstruse/",
		"\x00",
		clientv3.PermissionType(clientv3.PermReadWrite),
	); err != nil {
		return err
	}
	if _, err = client.UserAdd(context.TODO(), s.cfg.Etcd.Username, s.cfg.Etcd.Password); err != nil {
		if strings.HasSuffix(err.Error(), "already exists") {
			goto enable
		}
	}
	if _, err = client.UserGrantRole(context.TODO(), s.cfg.Etcd.Username, s.cfg.Etcd.Username); err != nil {
		return err
	}
enable:
	_, err = client.AuthEnable(context.TODO())
	return err
}

func (s *Server) authClient() (*clientv3.Client, error) {
	target := net.JoinHostPort(s.cfg.Etcd.Host, fmt.Sprintf("%d", s.cfg.Etcd.ClientPort))
	cfg := client.ClientConfig{
		Target: target,
		Cert:   s.cfg.TLS.Cert,
		Key:    s.cfg.TLS.Key,
	}
	return client.NewClient(cfg)
}
