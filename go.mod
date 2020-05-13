module github.com/jkuri/abstruse

go 1.14

require (
	github.com/coreos/etcd v0.0.0-00010101000000-000000000000 // indirect
	github.com/coreos/go-semver v0.3.0 // indirect
	github.com/coreos/pkg v0.0.0-20180928190104-399ea9e2e55f // indirect
	github.com/fatih/color v1.7.0
	github.com/gogo/protobuf v1.3.1 // indirect
	github.com/golang/protobuf v1.4.1
	github.com/google/uuid v1.1.1 // indirect
	github.com/mitchellh/go-homedir v1.1.0
	github.com/sirupsen/logrus v1.6.0
	go.etcd.io/etcd v3.3.20+incompatible
	go.uber.org/zap v1.15.0
	google.golang.org/grpc v1.29.1
	google.golang.org/protobuf v1.22.0
)

replace (
	github.com/coreos/bbolt => go.etcd.io/bbolt v1.3.4
	github.com/coreos/etcd => go.etcd.io/etcd v3.3.20+incompatible
	go.etcd.io/etcd => go.etcd.io/etcd v0.5.0-alpha.5.0.20200329194405-dd816f0735f8
)
