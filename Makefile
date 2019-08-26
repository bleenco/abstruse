ABSTRUSE_UI_VERSION=$(shell cat web/abstruse/package.json | grep version | head -1 | awk -F: '{ print $$2 }' | sed 's/[\",]//g' | tr -d '[[:space:]]')
ABSTRUSE_VERSION_PATH=github.com/bleenco/abstruse/server
GIT_COMMIT=$(shell git rev-list -1 HEAD)
BUILD_DATE=$(shell date +%FT%T%z)
UNAME=$(shell uname -s)
CGO_ENABLED=0

ifeq ($(UNAME),Darwin)
	CGO_ENABLED=1
endif

all: build

build:
	@make build_ui
	@make bindata
	@CGO_ENABLED=0 go build -ldflags "-X ${ABSTRUSE_VERSION_PATH}.GitCommit=${GIT_COMMIT} -X ${ABSTRUSE_VERSION_PATH}.UIVersion=${ABSTRUSE_UI_VERSION} -X ${ABSTRUSE_VERSION_PATH}.BuildDate=${BUILD_DATE}" -o build/abstruse cmd/abstruse/abstruse.go

build_ui:
	@if [ ! -d "web/abstruse/dist" ]; then cd web/abstruse && npm run build; fi

bindata:
	@if [ ! -r "server/ui/statik.go" ]; then statik -dest ./server -p ui -src ./web/abstruse/dist; fi

install_dependencies:
	@go get github.com/jkuri/statik github.com/golang/protobuf/protoc-gen-go github.com/cespare/reflex
	@cd web/abstruse && npm install

dev:
	@reflex -sr '\.go$$' -R '^web/' -R '^server/ui' -R '^worker/' -- sh -c 'make && ./build/abstruse'

dev_worker:
	@reflex -sr '\.go$$' -R '^web/' -R '^server/' -- sh -c 'make worker && ./build/abstruse-worker'

bindata_worker:
	@if [ ! -r "worker/data/statik.go" ]; then statik -dest ./worker -p data -src ./files/base_images; fi

worker:
	@make pty
	@make bindata_worker
	@CGO_ENABLED=$(CGO_ENABLED) go build -o build/abstruse-worker cmd/abstruse-worker/worker.go

grpc:
	@protoc ./proto/abstruse.proto --go_out=plugins=grpc:.

image:
	@docker build -t abstruse .

image_worker:
	@docker build -t abstruse-worker -f Dockerfile.worker .

pty:
	@GOOS=linux GOARCH=amd64 go build -o ./files/src/abstruse-pty ./files/src/abstruse-pty.go
	@if [ -f ./files/src/abstruse-pty ]; then find files/base_images/* -prune -type d -exec cp ./files/src/abstruse-pty {} \;; fi

clean:
	@rm -rf build/ server/ui worker/data web/abstruse/dist
	@find files/ -type f -name "abstruse-pty" -exec rm {} \;

.PHONY: clean build worker
