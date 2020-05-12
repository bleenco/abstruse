package grpclb

import (
	"context"
	"fmt"
	"strings"

	"go.etcd.io/etcd/clientv3"
	"go.etcd.io/etcd/mvcc/mvccpb"
	"google.golang.org/grpc/resolver"
)

const schema = "etcdv3_resolver"

// Resolver is implementation of grpc.resolve.Builder instance.
type Resolver struct {
	target  string
	service string
	cli     *clientv3.Client
	cc      resolver.ClientConn
}

// NewResolver returns resolver builder.
func NewResolver(target, service string) resolver.Builder {
	return &Resolver{target: target, service: service}
}

// Scheme returns etcd schema.
func (r *Resolver) Scheme() string {
	return schema
}

// ResolveNow impl
func (r *Resolver) ResolveNow(rn resolver.ResolveNowOptions) {}

// Close impl
func (r *Resolver) Close() {}

// Build to resolver.Resolver
func (r *Resolver) Build(target resolver.Target, cc resolver.ClientConn, opts resolver.BuildOptions) (resolver.Resolver, error) {
	var err error

	r.cli, err = clientv3.New(clientv3.Config{
		Endpoints: strings.Split(r.target, ","),
	})
	if err != nil {
		return nil, fmt.Errorf("grpclb: create clientv3 client failed: %v", err)
	}
	r.cc = cc
	go r.watch(fmt.Sprintf("/%s/%s", schema, r.service))

	return r, nil
}

func (r *Resolver) watch(prefix string) {
	addrDict := make(map[string]resolver.Address)

	update := func() {
		addrList := make([]resolver.Address, 0, len(addrDict))
		for _, v := range addrDict {
			addrList = append(addrList, v)
		}
		r.cc.NewAddress(addrList)
	}

	resp, err := r.cli.Get(context.Background(), prefix, clientv3.WithPrefix())
	if err == nil {
		for i := range resp.Kvs {
			addrDict[string(resp.Kvs[i].Value)] = resolver.Address{Addr: string(resp.Kvs[i].Value)}
		}
	}

	update()

	rch := r.cli.Watch(context.Background(), prefix, clientv3.WithPrefix(), clientv3.WithPrevKV())
	for n := range rch {
		for _, ev := range n.Events {
			switch ev.Type {
			case mvccpb.PUT:
				addrDict[string(ev.Kv.Key)] = resolver.Address{Addr: string(ev.Kv.Value)}
			case mvccpb.DELETE:
				delete(addrDict, string(ev.PrevKv.Key))
			}
		}
		update()
	}
}
