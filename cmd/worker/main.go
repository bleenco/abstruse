package main

import (
	"flag"
	"log"
	"os"

	"github.com/jkuri/abstruse/worker/core"
)

var (
	configPath = flag.String("config", "docs/config/worker.json", "config path")
)

func main() {
	flag.Parse()

	config, err := core.ReadAndParseConfig(*configPath)
	if err != nil {
		log.Fatal(err)
	}

	app, err := core.NewApp(config)
	if err != nil {
		log.Fatal(err)
	}

	if err := app.Run(); err != nil {
		log.Fatal(err)
	}

	os.Exit(0)
}

// package main

// import (
// 	"context"
// 	"flag"
// 	"net"
// 	"os"
// 	"os/signal"
// 	"syscall"
// 	"time"

// 	"github.com/jkuri/abstruse/pkg/grpclb"
// 	pb "github.com/jkuri/abstruse/proto"
// 	"github.com/sirupsen/logrus"
// 	"google.golang.org/grpc"
// )

// var (
// 	service  = flag.String("service", "abstruse_service", "service name")
// 	host     = flag.String("host", "0.0.0.0", "listening host")
// 	port     = flag.String("port", "50001", "listening port")
// 	register = flag.String("register", "http://0.0.0.0:2379", "register etcd addr")
// )

// func main() {
// 	flag.Parse()

// 	lis, err := net.Listen("tcp", net.JoinHostPort(*host, *port))
// 	if err != nil {
// 		panic(err)
// 	}

// 	err = grpclb.Register(*register, *service, *host, *port, time.Second*10, 15)
// 	if err != nil {
// 		panic(err)
// 	}

// 	ch := make(chan os.Signal, 1)
// 	signal.Notify(ch, syscall.SIGTERM, syscall.SIGINT, syscall.SIGKILL, syscall.SIGHUP, syscall.SIGQUIT)
// 	go func() {
// 		s := <-ch
// 		logrus.Infof("receive signal '%v'", s)
// 		grpclb.Unregister()
// 		os.Exit(1)
// 	}()

// 	logrus.Infof("starting hello service at %s", *port)
// 	s := grpc.NewServer()
// 	pb.RegisterGreeterServer(s, &server{})
// 	s.Serve(lis)
// }

// type server struct{}

// // SayHello implements absrtuse.api.v1.GreeterServer
// func (s *server) SayHello(ctx context.Context, in *pb.HelloRequest) (*pb.HelloReply, error) {
// 	logrus.Infof("%v: Receive is %s\n", time.Now(), in.Name)
// 	return &pb.HelloReply{Message: "Hello " + in.Name + " from " + net.JoinHostPort(*host, *port)}, nil
// }
