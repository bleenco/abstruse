all: build

ABSTRUSE_UI_VERSION=$(shell cat web/abstruse/package.json | grep version | head -1 | awk -F: '{ print $$2 }' | sed 's/[\",]//g' | tr -d '[[:space:]]')
ABSTRUSE_VERSION_PATH=github.com/bleenco/abstruse/server
GIT_COMMIT=$(shell git rev-list -1 HEAD)
BUILD_DATE=$(shell date +%FT%T%z)
UNAME=$(shell uname -s)
CGO_ENABLED=0

ifeq ($(UNAME),Darwin)
	CGO_ENABLED=1
endif

build:
	@make build_ui
	@make bindata
	@CGO_ENABLED=0 go build -ldflags "-X ${ABSTRUSE_VERSION_PATH}.GitCommit=${GIT_COMMIT} -X ${ABSTRUSE_VERSION_PATH}.UIVersion=${ABSTRUSE_UI_VERSION} -X ${ABSTRUSE_VERSION_PATH}.BuildDate=${BUILD_DATE}" -o build/abstruse cmd/abstruse/abstruse.go

build_ui:
	@if [ ! -d "web/abstruse/dist" ]; then cd web/abstruse && npm run build; fi

bindata:
	@if [ ! -r "server/bindata.go" ]; then go-bindata -o server/bindata.go -pkg server web/abstruse/dist/...; fi

install_dependencies:
	@go get github.com/jteeuwen/go-bindata/... github.com/golang/protobuf/protoc-gen-go github.com/cespare/reflex
	@cd web/abstruse && npm install

dev:
	@reflex -sr '\.go$$' -R '^web/' -R '^server/bindata.go' -R '^worker/' -- sh -c 'make && ./build/abstruse'

dev_worker:
	@reflex -sr '\.go$$' -R '^web/' -R '^server/' -- sh -c 'make worker && ./build/abstruse-worker'

worker:
	@CGO_ENABLED=$(CGO_ENABLED) go build -o build/abstruse-worker cmd/abstruse-worker/worker.go

grpc:
	@protoc ./proto/abstruse.proto --go_out=plugins=grpc:.

clean:
	@rm -rf build/ server/bindata.go web/abstruse/dist

.PHONY: clean build worker statik
