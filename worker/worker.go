package worker

import (
	"crypto/tls"
	"path"

	"github.com/bleenco/abstruse/fs"
	"github.com/bleenco/abstruse/id"
	"github.com/bleenco/abstruse/logger"
	"github.com/bleenco/abstruse/security"
)

// Worker defines worker instance.
type Worker struct {
	Client     *GRPCClient
	Identifier id.ID
	JWT        string

	ConfigDir string
	Config    *Config
	Logger    *logger.Logger
}

// NewWorker returns new worker instance.
func NewWorker(logger *logger.Logger) (*Worker, error) {
	homeDir, err := fs.GetHomeDir()
	if err != nil {
		return nil, err
	}
	configDir := path.Join(homeDir, "abstruse-worker")
	configPath := path.Join(configDir, "config.json")

	if !fs.Exists(configDir) {
		if err := fs.MakeDir(configDir); err != nil {
			return nil, err
		}
	}

	config, err := readAndParseConfig(configPath)
	if err != nil {
		return nil, err
	}

	cert := path.Join(configDir, config.Cert)
	key := path.Join(configDir, config.Key)

	security.CheckAndGenerateCert(cert, key)
	certificate, err := tls.LoadX509KeyPair(cert, key)
	if err != nil {
		return nil, err
	}
	identifier := id.New(certificate.Certificate[0])

	jwt, err := GenerateWorkerJWT(identifier, config.ServerSecret)
	if err != nil {
		return nil, err
	}

	gRPCClient, err := NewGRPCClient(identifier, jwt, config.ServerAddress, cert, key, logger)
	if err != nil {
		return nil, err
	}

	return &Worker{
		Identifier: identifier,
		JWT:        jwt,
		Client:     gRPCClient,
		ConfigDir:  configDir,
		Config:     config,
		Logger:     logger,
	}, nil
}

// Run starts the worker process.
func (w *Worker) Run() error {
	ch := make(chan error)

	go func() {
		if err := w.Client.Run(); err != nil {
			ch <- err
		}
	}()

	queue := NewQueue(5)
	go queue.Run()

	for i := 0; i < 10; i++ {
		queue.job <- i
	}

	return <-ch
}
