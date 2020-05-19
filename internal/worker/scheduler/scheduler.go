package scheduler

import (
	"path"

	"github.com/google/wire"
	"github.com/jkuri/abstruse/internal/pkg/etcdutil"
	"github.com/jkuri/abstruse/internal/pkg/shared"
	"github.com/jkuri/abstruse/internal/worker/etcd"
	"github.com/jkuri/abstruse/internal/worker/grpc"
	jsoniter "github.com/json-iterator/go"
	"go.etcd.io/etcd/clientv3"
	"go.uber.org/zap"
)

// Scheduler service maintains and updates status of worker and its
// occupancy with job tasks.
type Scheduler struct {
	opts      *Options
	etcd      *etcd.App
	grpc      *grpc.Server
	logger    *zap.SugaredLogger
	keyPrefix string
	rkv       *etcdutil.RemoteKV
	Current   int `json:"current"`
	Max       int `json:"max"`
}

// NewScheduler returns new instance of a Scheduler.
func NewScheduler(opts *Options, logger *zap.Logger, etcd *etcd.App, grpc *grpc.Server) *Scheduler {
	return &Scheduler{
		opts:      opts,
		etcd:      etcd,
		grpc:      grpc,
		logger:    logger.With(zap.String("type", "scheduler")).Sugar(),
		keyPrefix: path.Join(shared.ServicePrefix, shared.WorkerCapacity, etcd.ID()),
		Current:   0,
		Max:       opts.Max,
	}
}

// Init initializes info on etcd server.
func (s *Scheduler) Init() {
	client := s.etcd.Client()
	value := s.toJSON()
init:
	rkv, err := etcdutil.NewRemoteKV(
		client.KV,
		s.keyPrefix,
		value,
		clientv3.NoLease,
	)
	if err != nil {
		rkv = &etcdutil.RemoteKV{KV: client.KV, Key: s.keyPrefix, Val: value}
		rkv.Delete()
		goto init
	}
	s.logger.Infof("scheduler initialized")
}

// UpdateCapacity updates capacity on etcd server.
func (s *Scheduler) UpdateCapacity(current int) error {
	s.Current = current
	value := s.toJSON()
	return s.rkv.Put(value)
}

func (s *Scheduler) toJSON() string {
	value, _ := jsoniter.MarshalToString(s)
	return value
}

// ProviderSet exports for wire.
var ProviderSet = wire.NewSet(NewOptions, NewScheduler)
