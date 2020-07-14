ABSTRUSE_UI_VERSION=$(shell cat web/abstruse/package.json | grep version | head -1 | awk -F: '{ print $$2 }' | sed 's/[\",]//g' | tr -d '[[:space:]]')
ABSTRUSE_VERSION_PATH=github.com/bleenco/abstruse/internal/version
GIT_COMMIT=$(shell git rev-list -1 HEAD)
BUILD_DATE=$(shell date +%FT%T%z)
UNAME=$(shell uname -s)
CGO_ENABLED=0

ifeq ($(UNAME),Darwin)
	CGO_ENABLED=1
endif

all: build

build: build_ui statik statik_worker protoc server worker

server:
	@CGO_ENABLED=${CGO_ENABLED} go build -i -ldflags "-X ${ABSTRUSE_VERSION_PATH}.GitCommit=${GIT_COMMIT} -X ${ABSTRUSE_VERSION_PATH}.UIVersion=${ABSTRUSE_UI_VERSION} -X ${ABSTRUSE_VERSION_PATH}.BuildDate=${BUILD_DATE}" -o build/abstruse-server ./cmd/abstruse-server

worker:
	@CGO_ENABLED=${CGO_ENABLED} go build -ldflags "-X ${ABSTRUSE_VERSION_PATH}.GitCommit=${GIT_COMMIT} -X ${ABSTRUSE_VERSION_PATH}.UIVersion=${ABSTRUSE_UI_VERSION} -X ${ABSTRUSE_VERSION_PATH}.BuildDate=${BUILD_DATE}" -o build/abstruse-worker ./cmd/abstruse-worker

build_ui:
	@if [ ! -d "web/abstruse/dist" ]; then cd web/abstruse && yarn build; fi

build_pty:
	@if [ ! -r "worker/worker-data/abstruse-pty" ]; then GOOS=linux GOARCH=amd64 go build -o build/worker-data/abstruse-pty ./cmd/abstruse-pty; fi

statik:
	@if [ ! -r "server/ui/statik.go" ]; then statik -dest ./server -p ui -src ./web/abstruse/dist; fi

statik_worker: build_pty
	@if [ ! -r "worker/data/statik.go" ]; then statik -dest ./worker -p data -src ./build/worker-data; fi

install_dependencies:
	@go get github.com/jkuri/statik github.com/golang/protobuf/protoc-gen-go@v1.3 github.com/cespare/reflex
	@cd web/abstruse && yarn install

clean:
	@rm -rf build/ web/abstruse/dist server/ui/ worker/data pb/api.pb.go

dev:
	@reflex -sr '\.go$$' -R '^web/' -R '^server/ui' -R '^worker/' -R '^configs/' -- sh -c 'make server && ./build/abstruse-server --log-level debug'

dev_worker:
	@reflex -sr '\.go$$' -R '^web/' -R '^server/' -R '^configs/' -- sh -c 'make worker && ./build/abstruse-worker --log-level debug'

protoc:
	@protoc ./pb/api.proto --go_out=plugins=grpc:./pb/

test:
	go test -v ./...

test-unit:
	cd web/abstruse && npm run test:ci

test-e2e:
	go run ./tests/e2e

.PHONY: build server build_ui statik install_dependencies clean protoc dev test test-unit test-e2e statik_worker build_pty worker dev_worker
