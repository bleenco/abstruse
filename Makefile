ABSTRUSE_UI_VERSION=$(shell cat web/abstruse/package.json | grep version | head -1 | awk -F: '{ print $$2 }' | sed 's/[\",]//g' | tr -d '[[:space:]]')
ABSTRUSE_VERSION_PATH=github.com/bleenco/abstruse/internal/version
ifndef GIT_COMMIT
	GIT_COMMIT=$(shell git rev-list -1 HEAD)
endif
BUILD_DATE=$(shell date +%FT%T%z)
UNAME=$(shell uname -s)
CGO_ENABLED=0

ifeq ($(UNAME),Darwin)
	CGO_ENABLED=1
endif

all: build

build: build_ui statik wire protoc server worker

release:
	@CGO_ENABLED=${CGO_ENABLED} gox -osarch="darwin/amd64 linux/amd64 linux/arm linux/386" -ldflags "-X ${ABSTRUSE_VERSION_PATH}.GitCommit=${GIT_COMMIT} -X ${ABSTRUSE_VERSION_PATH}.UIVersion=${ABSTRUSE_UI_VERSION} -X ${ABSTRUSE_VERSION_PATH}.BuildDate=${BUILD_DATE}" -output build/{{.Dir}}_{{.OS}}_{{.Arch}} ./cmd/abstruse-server
	@CGO_ENABLED=${CGO_ENABLED} gox -osarch="darwin/amd64 linux/amd64 linux/arm linux/386" -ldflags "-X ${ABSTRUSE_VERSION_PATH}.GitCommit=${GIT_COMMIT} -X ${ABSTRUSE_VERSION_PATH}.UIVersion=${ABSTRUSE_UI_VERSION} -X ${ABSTRUSE_VERSION_PATH}.BuildDate=${BUILD_DATE}" -output build/{{.Dir}}_{{.OS}}_{{.Arch}} ./cmd/abstruse-worker

server:
	@CGO_ENABLED=${CGO_ENABLED} go build -ldflags "-X ${ABSTRUSE_VERSION_PATH}.GitCommit=${GIT_COMMIT} -X ${ABSTRUSE_VERSION_PATH}.UIVersion=${ABSTRUSE_UI_VERSION} -X ${ABSTRUSE_VERSION_PATH}.BuildDate=${BUILD_DATE}" -o build/abstruse-server ./cmd/abstruse-server

worker:
	@CGO_ENABLED=${CGO_ENABLED} go build -ldflags "-X ${ABSTRUSE_VERSION_PATH}.GitCommit=${GIT_COMMIT} -X ${ABSTRUSE_VERSION_PATH}.UIVersion=${ABSTRUSE_UI_VERSION} -X ${ABSTRUSE_VERSION_PATH}.BuildDate=${BUILD_DATE}" -o build/abstruse-worker ./cmd/abstruse-worker

build_ui:
	@if [ ! -d "web/abstruse/dist" ]; then cd web/abstruse && npm run build; fi

statik:
	@if [ ! -r "server/ui/statik.go" ]; then statik -dest ./server -p ui -src ./web/abstruse/dist; fi

wire:
	@wire ./server/cmd/... ./worker/cmd/...

install_dependencies:
	@cd /tmp && go get github.com/golang/protobuf/protoc-gen-go github.com/jkuri/statik github.com/cespare/reflex github.com/google/wire/... && cd -
	@cd web/abstruse && npm install

clean:
	@rm -rf build/ web/abstruse/dist server/ui/ server/cmd/wire_gen.go worker/cmd/wire_gen.go

dev:
	@reflex -sr '\.go$$' -R '^web/' -R '^server/ui' -R '^worker/' -R '^configs/' -R '^tests/' -- sh -c 'make server && ./build/abstruse-server --logger-level debug'

dev_worker:
	@reflex -sr '\.go$$' -R '^web/' -R '^server/' -R '^configs/' -R '^tests/' -- sh -c 'make worker && ./build/abstruse-worker --logger-level debug'

protoc:
	@protoc ./pb/api.proto --go_out=plugins=grpc:./pb/

docker: docker_server docker_worker

docker_server:
	@docker build --rm --force-rm --compress --build-arg GIT_COMMIT=${GIT_COMMIT} -t abstruse/abstruse-server -f Dockerfile .

docker_worker:
	@docker build --rm --force-rm --compress --build-arg GIT_COMMIT=${GIT_COMMIT} -t abstruse/abstruse-worker -f Dockerfile.worker .

docker_push:
	@docker push abstruse/abstruse-server
	@docker push abstruse/abstruse-worker

test:
	go test -v ./...

test-unit:
	cd web/abstruse && npm run test:ci

test-e2e:
	go run ./tests/e2e

.PHONY: build server worker build_ui statik wire install_dependencies clean dev dev_worker protoc docker docker_server docker_worker docker_push test test-unit test-e2e release
