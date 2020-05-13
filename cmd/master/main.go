package main

import (
	"context"
	"flag"
	"fmt"
	"log"

	"github.com/jkuri/abstruse/pkg/config"
	"github.com/jkuri/abstruse/pkg/core"
	"go.etcd.io/etcd/clientv3"
	"go.etcd.io/etcd/mvcc/mvccpb"
)

var (
	etcdname    = flag.String("etcd-name", "abstruse", "Etcd cluster name")
	etcdhost    = flag.String("etcd-host", "0.0.0.0", "Etcd listen host")
	etcdcport   = flag.Int("etcd-cport", 2379, "Etcd client listen port")
	etcdpport   = flag.Int("etcd-pport", 2380, "Etcd peer listen port")
	etcddatadir = flag.String("etcd-data-dir", "/var/tmp/etcd-data", "Etcd data directory")
)

func main() {
	flag.Parse()

	cfg := config.AppConfig{
		Etcd: config.EtcdConfig{
			Name:       *etcdname,
			Host:       *etcdhost,
			ClientPort: *etcdcport,
			PeerPort:   *etcdpport,
			DataDir:    *etcddatadir,
		},
	}

	app, err := core.NewApp(cfg)
	if err != nil {
		log.Fatal(err)
	}

	go func() {
		prefix := fmt.Sprintf("/%s/%s", "etcdv3_resolver", "abstruse_service")
		cli := app.Etcd.Client()

		addrDict := make(map[string]string)

		printWorkers := func() {
			for _, addr := range addrDict {
				fmt.Printf("worker: %s\n", addr)
			}
		}

		resp, err := cli.Get(context.Background(), prefix, clientv3.WithPrefix())
		if err == nil {
			for i := range resp.Kvs {
				addrDict[string(resp.Kvs[i].Value)] = string(resp.Kvs[i].Value)
			}
		}

		printWorkers()

		rch := cli.Watch(context.Background(), prefix, clientv3.WithPrefix(), clientv3.WithPrevKV())
		for n := range rch {
			for _, ev := range n.Events {
				switch ev.Type {
				case mvccpb.PUT:
					addrDict[string(ev.Kv.Key)] = string(ev.Kv.Value)
				case mvccpb.DELETE:
					delete(addrDict, string(ev.PrevKv.Key))
				}
			}
			printWorkers()
		}
	}()

	app.Wait()
}

// import (
// 	"context"
// 	"flag"
// 	"strconv"
// 	"time"

// 	grpclb "github.com/jkuri/abstruse/pkg/grpclb"
// 	pb "github.com/jkuri/abstruse/proto"
// 	"github.com/sirupsen/logrus"
// 	"google.golang.org/grpc"
// 	"google.golang.org/grpc/balancer/roundrobin"
// 	"google.golang.org/grpc/resolver"
// )

// var (
// 	svc = flag.String("service", "abstruse_service", "service name")
// 	reg = flag.String("reg", "http://localhost:2379", "register etcd address")
// )

// func main() {
// 	flag.Parse()
// 	r := grpclb.NewResolver(*reg, *svc)
// 	resolver.Register(r)

// 	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
// 	// https://github.com/grpc/grpc/blob/master/doc/naming.md
// 	// The gRPC client library will use the specified scheme to pick the right resolver plugin and pass it the fully qualified name string.
// 	conn, err := grpc.DialContext(ctx, r.Scheme()+"://authority/"+*svc, grpc.WithInsecure(), grpc.WithBalancerName(roundrobin.Name), grpc.WithBlock())
// 	cancel()
// 	if err != nil {
// 		panic(err)
// 	}

// 	ticker := time.NewTicker(1000 * time.Millisecond)
// 	for t := range ticker.C {
// 		client := pb.NewGreeterClient(conn)
// 		resp, err := client.SayHello(context.Background(), &pb.HelloRequest{Name: "world " + strconv.Itoa(t.Second())})
// 		if err == nil {
// 			logrus.Infof("%v: Reply is %s\n", t, resp.Message)
// 		}
// 	}
// }
