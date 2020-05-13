package etcdutil

import (
	"context"

	"go.etcd.io/etcd/clientv3"
	"go.etcd.io/etcd/mvcc/mvccpb"
)

// WaitEvents waits on a key until it observes the given events and returns the final one.
func WaitEvents(c *clientv3.Client, key string, rev int64, evs []mvccpb.Event_EventType) (*clientv3.Event, error) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	wc := c.Watch(ctx, key, clientv3.WithRev(rev))
	if wc == nil {
		return nil, ErrNoWatcher
	}
	return waitEvents(wc, evs), nil
}

// WaitPrefixEvents waits on a prefix until it observes the given events and returns the final one.
func WaitPrefixEvents(c *clientv3.Client, prefix string, rev int64, evs []mvccpb.Event_EventType) (*clientv3.Event, error) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	wc := c.Watch(ctx, prefix, clientv3.WithPrefix(), clientv3.WithRev(rev))
	if wc == nil {
		return nil, ErrNoWatcher
	}
	return waitEvents(wc, evs), nil
}

func waitEvents(wc clientv3.WatchChan, evs []mvccpb.Event_EventType) *clientv3.Event {
	i := 0
	for wresp := range wc {
		for _, ev := range wresp.Events {
			if ev.Type == evs[i] {
				i++
				if i == len(evs) {
					return ev
				}
			}
		}
	}
	return nil
}
