ABSTRUSE_UI_VERSION=$(shell cat web/abstruse/package.json | grep version | head -1 | awk -F: '{ print $$2 }' | sed 's/[\",]//g' | tr -d '[[:space:]]')
ABSTRUSE_VERSION_PATH=github.com/jkuri/abstruse/pkg/version
GIT_COMMIT=$(shell git rev-list -1 HEAD)
BUILD_DATE=$(shell date +%FT%T%z)
UNAME=$(shell uname -s)
CGO_ENABLED=0

ifeq ($(UNAME),Darwin)
	CGO_ENABLED=1
endif

all: build

build: grpc master worker

master:
	@CGO_ENABLED=0 go build -ldflags "-X ${ABSTRUSE_VERSION_PATH}.GitCommit=${GIT_COMMIT} -X ${ABSTRUSE_VERSION_PATH}.UIVersion=${ABSTRUSE_UI_VERSION} -X ${ABSTRUSE_VERSION_PATH}.BuildDate=${BUILD_DATE}" -o build/abstruse-master cmd/master/main.go

worker:
	@CGO_ENABLED=0 go build -ldflags "-X ${ABSTRUSE_VERSION_PATH}.GitCommit=${GIT_COMMIT} -X ${ABSTRUSE_VERSION_PATH}.UIVersion=${ABSTRUSE_UI_VERSION} -X ${ABSTRUSE_VERSION_PATH}.BuildDate=${BUILD_DATE}" -o build/abstruse-worker cmd/worker/main.go

build_ui:
	@if [ ! -d "web/abstruse/dist" ]; then cd web/abstruse && yarn build; fi

install_dependencies:
	@go get github.com/jkuri/statik github.com/golang/protobuf/protoc-gen-go github.com/cespare/reflex
	@cd web/abstruse && yarn install

clean:
	@rm -rf build/

grpc:
	@protoc ./proto/abstruse.proto --go_out=plugins=grpc:.

.PHONY: clean grpc build master worker build_ui install_dependencies
