RACTOL_UI_VERSION=$(shell cat web/ractol/package.json | grep version | head -1 | awk -F: '{ print $$2 }' | sed 's/[\",]//g' | tr -d '[[:space:]]')
RACTOL_VERSION_PATH=github.com/ractol/ractol/internal/version
GIT_COMMIT=$(shell git rev-list -1 HEAD)
BUILD_DATE=$(shell date +%FT%T%z)
UNAME=$(shell uname -s)
CGO_ENABLED=0

ifeq ($(UNAME),Darwin)
	CGO_ENABLED=1
endif

all: build

build: build_ui statik protoc server

server:
	@CGO_ENABLED=${CGO_ENABLED} go build -ldflags "-X ${RACTOL_VERSION_PATH}.GitCommit=${GIT_COMMIT} -X ${RACTOL_VERSION_PATH}.UIVersion=${RACTOL_UI_VERSION} -X ${RACTOL_VERSION_PATH}.BuildDate=${BUILD_DATE}" -o build/ractol-server ./cmd/ractol-server

build_ui:
	@if [ ! -d "web/ractol/dist" ]; then cd web/ractol && yarn build; fi

statik:
	@if [ ! -r "internal/ui/statik.go" ]; then statik -dest ./internal -p ui -src ./web/ractol/dist; fi

install_dependencies:
	@go get github.com/jkuri/statik github.com/golang/protobuf/protoc-gen-go@v1.3 github.com/cespare/reflex
	@cd web/ractol && yarn install

clean:
	@rm -rf build/ web/raqctol/dist internal/ui/ pb/api.pb.go

dev:
	@reflex -sr '\.go$$' -R '^web/' -R '^internal/ui' -R '^worker/' -R '^configs/' -- sh -c 'make server && ./build/ractol-server'

protoc:
	@protoc ./pb/api.proto --go_out=plugins=grpc:./pb/

.PHONY: build server build_ui statik install_dependencies clean protoc dev
