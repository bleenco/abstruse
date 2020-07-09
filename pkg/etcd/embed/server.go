package embed

import (
	"github.com/bleenco/abstruse/server/config"
	"go.etcd.io/etcd/clientv3"
	"go.etcd.io/etcd/embed"
	"go.uber.org/zap"
)

// Server represents embedded etcd server.
type Server struct {
	cfg    config.Config
	logger *zap.SugaredLogger
	server *embed.Etcd
	cli    *clientv3.Client
	ready  chan bool
}

// NewServer returns new etcd server instance.
func NewServer(cfg config.Config, logger *zap.Logger) *Server {
	return &Server{
		cfg:    cfg,
		logger: logger.With(zap.String("type", "etcd")).Sugar(),
		ready:  make(chan bool),
	}
}

// Start starts the embedded etcd server.
func (s *Server) Start() error {
	// var err error
	// ctx, cancel := context.WithTimeout(context.Background(), time.Second*time.Duration(5))
	// defer cancel()

	// cfg := embed.NewConfig()
	// scheme := "https"

	// cfg.Name = s.opts.Etcd.Name
	// cfg.Dir = s.opts.Etcd.DataDir
	// cfg.LogLevel = "error"
	// curl := url.URL{Scheme: scheme, Host: fmt.Sprintf("%s:%d", s.opts.Etcd.Host, s.opts.Etcd.ClientPort)}
	// cfg.ACUrls, cfg.LCUrls = []url.URL{curl}, []url.URL{curl}

	// purl := url.URL{Scheme: scheme, Host: fmt.Sprintf("%s:%d", s.opts.Etcd.Host, s.opts.Etcd.PeerPort)}
	// cfg.APUrls, cfg.LPUrls = []url.URL{purl}, []url.URL{purl}

	// cfg.InitialCluster = fmt.Sprintf("%s=%s", cfg.Name, cfg.APUrls[0].String())

	// cfg.AutoCompactionMode = v3compactor.ModePeriodic
	// cfg.AutoCompactionRetention = "1h" // every hour

	// // cfg.ClientAutoTLS = true
	// // cfg.PeerAutoTLS = true

	// tlsInfo := transport.TLSInfo{
	// 	CertFile:           s.opts.TLS.Cert,
	// 	KeyFile:            s.opts.TLS.Key,
	// 	InsecureSkipVerify: true,
	// }
	// cfg.ClientTLSInfo = tlsInfo
	// cfg.PeerTLSInfo = tlsInfo

	// s.server, err = embed.StartEtcd(cfg)
	// if err != nil {
	// 	return err
	// }
	// select {
	// case <-s.server.Server.ReadyNotify():
	// 	err = nil
	// case err = <-s.server.Err():
	// case <-s.server.Server.StopNotify():
	// 	err = fmt.Errorf("received from etcdserver.Server.StopNotify")
	// case <-ctx.Done():
	// 	err = ctx.Err()
	// }
	// if err != nil {
	// 	return err
	// }
	// s.logger.Infof("started etcd server %s on %s", cfg.Name, curl.String())

	// // s.cli = v3client.New(s.server.Server)
	// // s.cli.Username = s.opts.Etcd.Username
	// // s.cli.Password = s.opts.Etcd.Password

	// if err := s.authEnable(); err != nil {
	// 	return err
	// }
	// if s.cli, err = s.getClient(); err != nil {
	// 	return err
	// }

	// // s.cleanup()
	// s.ready <- true
	return nil
}
