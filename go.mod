module github.com/jkuri/abstruse

go 1.14

require (
	github.com/cespare/reflex v0.2.0 // indirect
	github.com/coreos/etcd v3.3.20+incompatible // indirect
	github.com/dgrijalva/jwt-go v3.2.0+incompatible
	github.com/gobwas/httphead v0.0.0-20180130184737-2c6c146eadee
	github.com/gobwas/pool v0.2.0 // indirect
	github.com/gobwas/ws v1.0.3
	github.com/golang/protobuf v1.4.2
	github.com/google/uuid v1.1.1 // indirect
	github.com/google/wire v0.4.0
	github.com/jinzhu/gorm v1.9.12
	github.com/jkuri/statik v0.3.0
	github.com/julienschmidt/httprouter v1.3.0
	github.com/kballard/go-shellquote v0.0.0-20180428030007-95032a82bc51 // indirect
	github.com/ogier/pflag v0.0.1 // indirect
	github.com/spf13/viper v1.7.0
	go.etcd.io/etcd v3.3.20+incompatible
	go.uber.org/zap v1.15.0
	golang.org/x/crypto v0.0.0-20191205180655-e7c4368fe9dd
	google.golang.org/grpc v1.26.0
	google.golang.org/protobuf v1.23.0
	gopkg.in/natefinch/lumberjack.v2 v2.0.0
	sigs.k8s.io/yaml v1.2.0 // indirect
)

replace (
	github.com/coreos/etcd => go.etcd.io/etcd v3.3.20+incompatible
	go.etcd.io/etcd => go.etcd.io/etcd v0.5.0-alpha.5.0.20200329194405-dd816f0735f8
)
