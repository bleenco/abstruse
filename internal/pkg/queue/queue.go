package queue

import (
	"path"

	jsoniter "github.com/json-iterator/go"

	"github.com/jkuri/abstruse/internal/pkg/shared"
	"go.etcd.io/etcd/clientv3"
	recipe "go.etcd.io/etcd/contrib/recipes"
	"go.uber.org/zap"
)

// Queue is task/job priority queue backed by etcd.
type Queue struct {
	pq     *recipe.PriorityQueue
	logger *zap.SugaredLogger
}

// NewQueue returns new intsance of Queue.
func NewQueue(client *clientv3.Client, logger *zap.Logger) *Queue {
	log := logger.With(zap.String("type", "queue")).Sugar()
	keyPrefix := path.Join(shared.ServicePrefix, shared.QueueService)
	return &Queue{
		pq:     recipe.NewPriorityQueue(client, keyPrefix),
		logger: log,
	}
}

// Enqueue shortcut.
func (q *Queue) Enqueue(t Task) error {
	return q.pq.Enqueue(t.GetData(), shared.DefaultQueuePriority)
}

// Dequeue shortcut.
func (q *Queue) Dequeue() (*Task, error) {
	data, err := q.pq.Dequeue()
	var t *Task
	err = jsoniter.Unmarshal([]byte(data), t)
	if err != nil {
		return nil, err
	}
	return t, nil
}
