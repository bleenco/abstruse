package etcd

import (
	"context"

	"go.etcd.io/etcd/clientv3"
	recipe "go.etcd.io/etcd/contrib/recipes"
)

// RemoteKV is a key/revision pair created by the client and stored on etcd
type RemoteKV struct {
	kv  clientv3.KV
	key string
	rev int64
	val string
}

func newUniqueKV(kv clientv3.KV, key string, val string) (*RemoteKV, error) {
	for {
		rev, err := putNewKV(kv, key, val, clientv3.NoLease)
		if err == nil {
			return &RemoteKV{kv, key, rev, val}, nil
		}
		if err != recipe.ErrKeyExists {
			return nil, err
		}
	}
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
		return 0, recipe.ErrKeyExists
	}
	return txnresp.Header.Revision, nil
}
