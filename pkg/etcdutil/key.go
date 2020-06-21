package etcdutil

import (
	"context"
	"fmt"

	"go.etcd.io/etcd/clientv3"
)

// RemoteKV is a key/revision pair created by the client and stored on etcd
type RemoteKV struct {
	KV  clientv3.KV
	Key string
	Rev int64
	Val string
}

// NewRemoteKV tries to put new key/value and returns RemoteKV instnce.
func NewRemoteKV(kv clientv3.KV, key, val string, leaseID clientv3.LeaseID) (*RemoteKV, error) {
	rev, err := putNewKV(kv, key, val, leaseID)
	if err != nil {
		return nil, err
	}
	return &RemoteKV{kv, key, rev, val}, nil
}

// putNewKV attempts to create the given key, only succeeding if the key did
// not yet exist.
func putNewKV(kv clientv3.KV, key, val string, leaseID clientv3.LeaseID) (int64, error) {
	cmp := clientv3.Compare(clientv3.Version(key), "=", 0)
	req := clientv3.OpPut(key, val, clientv3.WithLease(leaseID))
	txnresp, err := kv.Txn(context.TODO()).If(cmp).Then(req).Commit()
	if err != nil {
		return 0, err
	}
	if !txnresp.Succeeded {
		return 0, fmt.Errorf("key already exists")
	}
	return txnresp.Header.Revision, nil
}

// Delete tries to delete kev, returns error if fail.
func (rk *RemoteKV) Delete() error {
	if rk.KV == nil {
		return nil
	}
	_, err := rk.KV.Delete(context.TODO(), rk.Key)
	rk.KV = nil
	return err
}

// Put puts new value.
func (rk *RemoteKV) Put(val string) error {
	_, err := rk.KV.Put(context.TODO(), rk.Key, val)
	rk.Val = val
	return err
}
