package worker

import (
	"crypto/tls"
	"path"

	"github.com/bleenco/abstruse/fs"
	"github.com/bleenco/abstruse/logger"
	"github.com/bleenco/abstruse/security"
	"github.com/bleenco/abstruse/worker/id"
)

// WorkerProcess is main worker process instance.
var WorkerProcess *Worker

// Worker defines worker instance.
type Worker struct {
	Queue      *Queue
	Client     *GRPCClient
	Identifier id.ID
	JWT        string

	ConfigDir string
	Config    *Config
	Logger    *logger.Logger
}

// NewWorker returns new worker instance.
func NewWorker(log *logger.Logger) (*Worker, error) {
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

	gRPCClient, err := NewGRPCClient(identifier, jwt, config.ServerAddress, cert, key, log)
	if err != nil {
		return nil, err
	}

	queueLogger := logger.NewLogger("queue", log.Info, log.Debug)

	worker := &Worker{
		Identifier: identifier,
		JWT:        jwt,
		Client:     gRPCClient,
		ConfigDir:  configDir,
		Config:     config,
		Logger:     log,
		Queue:      NewQueue(config.Concurrency, queueLogger),
	}

	WorkerProcess = worker

	return worker, nil
}

// Run starts the worker process.
func (w *Worker) Run() error {
	w.Logger.Infof("starting abstruse worker")
	ch := make(chan error)

	go func() {
		if err := w.Client.Run(); err != nil {
			ch <- err
		}
	}()

	go w.Queue.Run()

	return <-ch
}
