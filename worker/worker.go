package worker

import (
	"crypto/tls"
	"path"

	"github.com/bleenco/abstruse/pkg/fs"
	"github.com/bleenco/abstruse/pkg/logger"
	"github.com/bleenco/abstruse/pkg/security"
	"github.com/bleenco/abstruse/worker/id"
	"github.com/cenkalti/backoff"
)

// WorkerProcess is main worker process instance.
var WorkerProcess *Worker

// Worker defines worker instance.
type Worker struct {
	Queue      *Queue
	Client     *GRPCClient
	Identifier id.ID
	JWT        string

	Config *Config
	Logger *logger.Logger
}

// NewWorker returns new worker instance.
func NewWorker(log *logger.Logger, configFile string) (*Worker, error) {
	var configPath string
	if configFile == "" {
		homeDir, err := fs.GetHomeDir()
		if err != nil {
			return nil, err
		}
		configDir := path.Join(homeDir, "abstruse-worker")
		configPath = path.Join(configDir, "config.json")

		if !fs.Exists(configDir) {
			if err := fs.MakeDir(configDir); err != nil {
				return nil, err
			}
		}
	} else {
		configPath = configFile
	}

	config, err := readAndParseConfig(configPath)
	if err != nil {
		return nil, err
	}

	configDir := path.Dir(configPath)
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

	defer w.Client.Close()
	go w.Queue.Run()

	// go func() {
	// 	if err := docker.BuildImage([]string{"ubuntu_18_04:latest"}, "/Users/jan/Desktop/ubuntu_18_04"); err != nil {
	// 		fmt.Println(err)
	// 	}
	// }()

	ticker := backoff.NewTicker(backoff.NewExponentialBackOff())
	var err error

	for range ticker.C {
		if err = w.Client.Run(); err != nil {
			w.Logger.Infof("%s, retrying...", err.Error())
			continue
		}

		ticker.Stop()
		break
	}

	return err
}
