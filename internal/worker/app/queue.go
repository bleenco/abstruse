package app

import (
	"context"
	"fmt"
	"path"
	"sync"

	"github.com/jkuri/abstruse/internal/pkg/job"
	"github.com/jkuri/abstruse/internal/pkg/shared"
	jsoniter "github.com/json-iterator/go"
	"go.etcd.io/etcd/clientv3"
)

type queue struct {
	mu     sync.Mutex
	key    string
	client *clientv3.Client
	ctx    context.Context
	jobs   map[uint64]*job.Job
	c      concurrency
}

type concurrency struct {
	mu      sync.Mutex
	key     string
	client  *clientv3.Client
	Max     int `json:"max"`
	Current int `json:"current"`
	Free    int `json:"free"`
}

func newQueue(client *clientv3.Client, id string, max int) queue {
	return queue{
		key:    path.Join(shared.ServicePrefix, "jobs", "running", id),
		client: client,
		ctx:    context.TODO(),
		jobs:   make(map[uint64]*job.Job),
		c: concurrency{
			key:     path.Join(shared.ServicePrefix, "concurrency", id),
			client:  client,
			Max:     max,
			Current: 0,
			Free:    max,
		},
	}
}

func (q *queue) init() error {
	// return q.c.save()
	return nil
}

func (q *queue) add(j *job.Job) error {
	q.mu.Lock()
	defer q.mu.Unlock()
	key := path.Join(q.key, j.Key())
	q.jobs[j.ID] = j
	_, err := q.client.Put(context.TODO(), key, j.Value())
	if err != nil {
		return err
	}
	if err := q.c.increment(); err != nil {
		return err
	}
	return nil
}

func (q *queue) delete(j *job.Job) error {
	q.mu.Lock()
	defer q.mu.Unlock()
	key := path.Join(q.key, j.Key())
	delete(q.jobs, j.ID)
	_, err := q.client.Delete(context.TODO(), key)
	if err != nil {
		return err
	}
	if err := q.c.decrement(); err != nil {
		return err
	}
	return nil
}

func (q *queue) find(id uint64) (*job.Job, error) {
	q.mu.Lock()
	defer q.mu.Unlock()
	if j, ok := q.jobs[id]; ok {
		return j, nil
	}
	return nil, fmt.Errorf("job %d not found", id)
}

func (c *concurrency) increment() error {
	c.mu.Lock()
	defer c.mu.Unlock()
	if c.Max < c.Current+1 {
		return fmt.Errorf("tried to exceed max concurrency limit")
	}
	c.Current++
	c.Free--
	// if err := c.save(); err != nil {
	// 	c.Current--
	// 	c.Free++
	// 	return err
	// }
	return nil
}

func (c *concurrency) decrement() error {
	c.mu.Lock()
	defer c.mu.Unlock()
	if c.Current-1 < 0 || c.Free+1 > c.Max {
		return fmt.Errorf("tried to set current with negative value")
	}
	c.Current--
	c.Free++
	// if err := c.save(); err != nil {
	// 	c.Current++
	// 	c.Free--
	// 	return err
	// }
	return nil
}

func (c *concurrency) value() string {
	value, _ := jsoniter.MarshalToString(c)
	return value
}

func (c *concurrency) save() error {
	_, err := c.client.Put(context.TODO(), c.key, c.value())
	return err
}
