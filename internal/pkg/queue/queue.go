package queue

import (
	"path"

	"github.com/jkuri/abstruse/internal/pkg/shared"
	jsoniter "github.com/json-iterator/go"
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
func (q *Queue) Enqueue(i *Item) error {
	q.logger.Debugf("adding job %d to queue", i.ID)
	return q.pq.Enqueue(i.Data, shared.DefaultQueuePriority)
}

// Dequeue shortcut.
func (q *Queue) Dequeue() (*Item, error) {
	data, err := q.pq.Dequeue()
	var i *Item
	err = jsoniter.Unmarshal([]byte(data), i)
	if err != nil {
		return nil, err
	}
	q.logger.Debugf("got job %d from queue", i.ID)
	return i, nil
}
