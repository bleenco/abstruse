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

build: build_ui statik protoc wire server worker

server:
	@CGO_ENABLED=${CGO_ENABLED} go build -ldflags "-X ${ABSTRUSE_VERSION_PATH}.GitCommit=${GIT_COMMIT} -X ${ABSTRUSE_VERSION_PATH}.UIVersion=${ABSTRUSE_UI_VERSION} -X ${ABSTRUSE_VERSION_PATH}.BuildDate=${BUILD_DATE}" -o build/abstruse-server ./cmd/abstruse-server

worker:
	@CGO_ENABLED=${CGO_ENABLED} go build -ldflags "-X ${ABSTRUSE_VERSION_PATH}.GitCommit=${GIT_COMMIT} -X ${ABSTRUSE_VERSION_PATH}.UIVersion=${ABSTRUSE_UI_VERSION} -X ${ABSTRUSE_VERSION_PATH}.BuildDate=${BUILD_DATE}" -o build/abstruse-worker ./cmd/abstruse-worker

build_ui:
	@if [ ! -d "web/abstruse/dist" ]; then cd web/abstruse && yarn build; fi

statik:
	@if [ ! -r "internal/server/ui/statik.go" ]; then statik -dest ./internal/server -p ui -src ./web/abstruse/dist; fi

wire:
	@wire ./cmd/...

install_dependencies:
	@go get github.com/jkuri/statik github.com/golang/protobuf/protoc-gen-go github.com/cespare/reflex github.com/google/wire/cmd/...
	@cd web/abstruse && yarn install

clean:
	@rm -rf build/ web/abstruse/dist internal/server/ui/ proto/api.pb.go

dev:
	@reflex -sr '\.go$$' -R '^web/' -R '^internal/server/ui' -R '^internal/worker/' -- sh -c 'make server && ./build/abstruse-server'

protoc:
	@protoc ./proto/api.proto --go_out=plugins=grpc:./proto/

.PHONY: clean grpc build server worker build_ui statik wire install_dependencies
