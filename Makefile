all: build

build: grpc master worker

master:
	@go build -o build/abstruse-master cmd/master/main.go

worker:
	@go build -o build/abstruse-worker cmd/worker/main.go

clean:
	@rm -rf build/

grpc:
	@protoc ./proto/abstruse.proto --go_out=plugins=grpc:.

.PHONY: clean grpc build master worker
