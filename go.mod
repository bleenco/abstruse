module github.com/jkuri/abstruse

go 1.14

require (
	github.com/cenkalti/backoff/v4 v4.0.2
	github.com/dgrijalva/jwt-go v3.2.0+incompatible
	github.com/dustin/go-humanize v1.0.0
	github.com/fatih/color v1.9.0
	github.com/felixge/httpsnoop v1.0.1
	github.com/go-ole/go-ole v1.2.4 // indirect
	github.com/go-sql-driver/mysql v1.5.0 // indirect
	github.com/gobwas/httphead v0.0.0-20180130184737-2c6c146eadee
	github.com/gobwas/pool v0.2.0 // indirect
	github.com/gobwas/ws v1.0.3
	github.com/golang/protobuf v1.4.1
	github.com/jinzhu/gorm v1.9.12
	github.com/jkuri/statik v0.3.0
	github.com/json-iterator/go v1.1.7
	github.com/julienschmidt/httprouter v1.3.0
	github.com/mitchellh/go-homedir v1.1.0
	github.com/shirou/gopsutil v2.20.4+incompatible
	go.etcd.io/etcd v0.0.0-00010101000000-000000000000
	go.uber.org/zap v1.15.0
	golang.org/x/crypto v0.0.0-20191205180655-e7c4368fe9dd
	golang.org/x/net v0.0.0-20200513185701-a91f0712d120
	google.golang.org/grpc v1.29.1
	google.golang.org/protobuf v1.22.0
)

replace (
	github.com/coreos/bbolt => go.etcd.io/bbolt v1.3.4
	github.com/coreos/etcd => go.etcd.io/etcd v3.3.20+incompatible
	go.etcd.io/etcd => go.etcd.io/etcd v0.5.0-alpha.5.0.20200329194405-dd816f0735f8
)
