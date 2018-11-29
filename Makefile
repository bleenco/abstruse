all: build

build:
	@make build_ui
	@make statik
	@CGO_ENABLED=0 go build -o build/abstruse cmd/abstruse/abstruse.go

build_ui:
	@if [ ! -d "web/abstruse/dist" ]; then cd web/abstruse && npm run build; fi

statik:
	@statik -src=./web/abstruse/dist

install_dependencies:
	@go get -u github.com/rakyll/statik github.com/golang/protobuf/protoc-gen-go github.com/cespare/reflex
	@cd web/abstruse && npm install

dev:
	reflex -sr '\.go$$' -R '^web/' -- sh -c 'make && ./build/abstruse'

clean:
	@rm -rf build/ statik/ web/abstruse/dist

.PHONY: clean build
