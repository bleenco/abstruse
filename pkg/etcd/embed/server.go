package embed

import (
	"context"
	"fmt"
	"net"
	"net/url"
	"path"
	"strings"
	"time"

	"github.com/jkuri/abstruse/pkg/core"
	"github.com/jkuri/abstruse/pkg/etcd/client"
	"github.com/jkuri/abstruse/pkg/server/options"
	"go.etcd.io/etcd/clientv3"
	"go.etcd.io/etcd/embed"
	"go.etcd.io/etcd/etcdserver/api/v3compactor"
	"go.etcd.io/etcd/pkg/transport"
	"go.uber.org/zap"
)

// Server represents etcd embedded server.
type Server struct {
	opts   *options.Options
	logger *zap.SugaredLogger
	server *embed.Etcd
	cli    *clientv3.Client
	ready  chan bool
}

// NewServer returns new etcd server instance.
func NewServer(opts *options.Options, logger *zap.Logger) *Server {
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
	scheme := "https"

	cfg.Name = s.opts.Etcd.Name
	cfg.Dir = s.opts.Etcd.DataDir
	cfg.LogLevel = "error"
	curl := url.URL{Scheme: scheme, Host: fmt.Sprintf("%s:%d", s.opts.Etcd.Host, s.opts.Etcd.ClientPort)}
	cfg.ACUrls, cfg.LCUrls = []url.URL{curl}, []url.URL{curl}

	purl := url.URL{Scheme: scheme, Host: fmt.Sprintf("%s:%d", s.opts.Etcd.Host, s.opts.Etcd.PeerPort)}
	cfg.APUrls, cfg.LPUrls = []url.URL{purl}, []url.URL{purl}

	cfg.InitialCluster = fmt.Sprintf("%s=%s", cfg.Name, cfg.APUrls[0].String())

	cfg.AutoCompactionMode = v3compactor.ModePeriodic
	cfg.AutoCompactionRetention = "1h" // every hour

	// cfg.ClientAutoTLS = true
	// cfg.PeerAutoTLS = true

	tlsInfo := transport.TLSInfo{
		CertFile:           s.opts.TLS.Cert,
		KeyFile:            s.opts.TLS.Key,
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
	// s.cli.Username = s.opts.Etcd.Username
	// s.cli.Password = s.opts.Etcd.Password

	if err := s.authEnable(); err != nil {
		return err
	}
	if s.cli, err = s.getClient(); err != nil {
		return err
	}

	// s.cleanup()
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
	workersPrefix := path.Clean(core.WorkerService)
	s.cli.Delete(context.TODO(), workersPrefix, clientv3.WithFromKey())
}

func (s *Server) getClient() (*clientv3.Client, error) {
	target := net.JoinHostPort(s.opts.Etcd.Host, fmt.Sprintf("%d", s.opts.Etcd.ClientPort))
	cfg := client.ClientConfig{
		Target:   target,
		Username: "root",
		Password: s.opts.Etcd.RootPassword,
		Cert:     s.opts.TLS.Cert,
		Key:      s.opts.TLS.Key,
	}
	return client.NewClient(cfg)
}

// this is required since s.Client.Auth make etcd embed server crash.
func (s *Server) authEnable() error {
	client, err := s.getClient()
	if err != nil {
		return err
	}
	defer client.Close()

	if _, err := client.RoleAdd(context.TODO(), "root"); err != nil {
		if strings.HasSuffix(err.Error(), "already exists") {
			goto user
		}
	}
	if _, err := client.UserAdd(context.TODO(), "root", s.opts.Etcd.RootPassword); err != nil {
		if strings.HasSuffix(err.Error(), "already exists") {
			goto user
		}
	}
	if _, err = client.UserGrantRole(context.TODO(), "root", "root"); err != nil {
		return err
	}
user:
	_, err = client.RoleAdd(context.TODO(), s.opts.Etcd.Username)
	if err != nil {
		if strings.HasSuffix(err.Error(), "role name already exists") {
			goto enable
		}
		return err
	}
	if _, err := client.RoleGrantPermission(
		context.TODO(),
		s.opts.Etcd.Username,
		"/abstruse/",
		"\x00",
		clientv3.PermissionType(clientv3.PermReadWrite),
	); err != nil {
		return err
	}
	if _, err = client.UserAdd(context.TODO(), s.opts.Etcd.Username, s.opts.Etcd.Password); err != nil {
		if strings.HasSuffix(err.Error(), "already exists") {
			goto enable
		}
	}
	if _, err = client.UserGrantRole(context.TODO(), s.opts.Etcd.Username, s.opts.Etcd.Username); err != nil {
		return err
	}
enable:
	resp, err := client.AuthStatus(context.TODO())
	if err != nil {
		return err
	}
	if !resp.Enabled {
		_, err = client.AuthEnable(context.TODO())
		if err != nil {
			return err
		}
	}
	return nil
}
