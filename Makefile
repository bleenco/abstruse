all: build

ABSTRUSE_UI_VERSION=$(shell cat web/abstruse/package.json | grep version | head -1 | awk -F: '{ print $$2 }' | sed 's/[\",]//g' | tr -d '[[:space:]]')
ABSTRUSE_VERSION_PATH=github.com/bleenco/abstruse/server
GIT_COMMIT=$(shell git rev-list -1 HEAD)
BUILD_DATE=$(shell date +%FT%T%z)

build:
	@make build_ui
	@make statik
	@CGO_ENABLED=0 go build -ldflags "-X ${ABSTRUSE_VERSION_PATH}.GitCommit=${GIT_COMMIT} -X ${ABSTRUSE_VERSION_PATH}.UIVersion=${ABSTRUSE_UI_VERSION} -X ${ABSTRUSE_VERSION_PATH}.BuildDate=${BUILD_DATE}" -o build/abstruse cmd/abstruse/abstruse.go

build_ui:
	@if [ ! -d "web/abstruse/dist" ]; then cd web/abstruse && npm run build; fi

statik:
	@statik -src=./web/abstruse/dist

install_dependencies:
	@go get -u github.com/rakyll/statik github.com/golang/protobuf/protoc-gen-go github.com/cespare/reflex
	@cd web/abstruse && npm install

dev:
	@reflex -sr '\.go$$' -R '^web/' -R '^statik/statik.go' -- sh -c 'make && ./build/abstruse'

worker:
	@CGO_ENABLED=0 go build -o build/abstruse-worker cmd/abstruse-worker/worker.go

grpc:
	@protoc ./proto/abstruse.proto --go_out=plugins=grpc:.

clean:
	@rm -rf build/ statik/ web/abstruse/dist

.PHONY: clean build worker statik
