ABSTRUSE_UI_VERSION=$(shell cat web/abstruse/package.json | grep version | head -1 | awk -F: '{ print $$2 }' | sed 's/[\",]//g' | tr -d '[[:space:]]')
ABSTRUSE_VERSION_PATH=github.com/jkuri/abstruse/internal/pkg/version
GIT_COMMIT=$(shell git rev-list -1 HEAD)
BUILD_DATE=$(shell date +%FT%T%z)
UNAME=$(shell uname -s)
CGO_ENABLED=0

ifeq ($(UNAME),Darwin)
	CGO_ENABLED=1
endif

all: build

build: build_ui statik statik_worker protoc wire server worker

server:
	@CGO_ENABLED=${CGO_ENABLED} go build -ldflags "-X ${ABSTRUSE_VERSION_PATH}.GitCommit=${GIT_COMMIT} -X ${ABSTRUSE_VERSION_PATH}.UIVersion=${ABSTRUSE_UI_VERSION} -X ${ABSTRUSE_VERSION_PATH}.BuildDate=${BUILD_DATE}" -o build/abstruse-server ./cmd/abstruse-server

worker:
	@CGO_ENABLED=${CGO_ENABLED} go build -ldflags "-X ${ABSTRUSE_VERSION_PATH}.GitCommit=${GIT_COMMIT} -X ${ABSTRUSE_VERSION_PATH}.UIVersion=${ABSTRUSE_UI_VERSION} -X ${ABSTRUSE_VERSION_PATH}.BuildDate=${BUILD_DATE}" -o build/abstruse-worker ./cmd/abstruse-worker

build_ui:
	@if [ ! -d "web/abstruse/dist" ]; then cd web/abstruse && yarn build; fi

build_pty:
	@if [ ! -r "build/worker-data/abstruse-pty" ]; then GOOS=linux GOARCH=amd64 go build -o build/worker-data/abstruse-pty ./cmd/abstruse-pty; fi

statik:
	@if [ ! -r "internal/server/ui/statik.go" ]; then statik -dest ./internal/server -p ui -src ./web/abstruse/dist; fi

statik_worker: build_pty
	@if [ ! -r "internal/worker/data/statik.go" ]; then statik -dest ./internal/worker -p data -src ./build/worker-data; fi

wire:
	@wire ./cmd/...

install_dependencies:
	@go get github.com/jkuri/statik github.com/golang/protobuf/protoc-gen-go@v1.3 github.com/cespare/reflex github.com/google/wire/cmd/...
	@cd web/abstruse && yarn install

clean:
	@rm -rf build/ web/abstruse/dist internal/server/ui/ internal/worker/data proto/api.pb.go

dev:
	@reflex -sr '\.go$$' -R '^web/' -R '^internal/server/ui' -R '^internal/worker/' -- sh -c 'make server && ./build/abstruse-server'

dev_worker:
	@reflex -sr '\.go$$' -R '^web/' -R '^internal/server' -- sh -c 'make worker && ./build/abstruse-worker'

protoc:
	@protoc ./proto/api.proto --go_out=plugins=grpc:./proto/

.PHONY: clean grpc build server worker build_ui build_pty statik statik_worker wire install_dependencies
